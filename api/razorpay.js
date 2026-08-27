const crypto = require('crypto');
const https = require('https');
const fs = require('fs');
const path = require('path');

const RAZORPAY_CONFIG = {
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
  webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || ''
};

const ALLOWED_ORIGINS = [
  'https://shop.uniqueexpressions.in',
  'https://uniqueexpressions.in',
  'https://www.uniqueexpressions.in',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

let PRODUCT_CATALOG = [];
try {
  const prodPath = path.join(__dirname, '..', 'extracted_products.json');
  if (fs.existsSync(prodPath)) {
    PRODUCT_CATALOG = JSON.parse(fs.readFileSync(prodPath, 'utf8'));
  }
} catch (e) {}

if (PRODUCT_CATALOG.length === 0) {
  try {
    const rootPath = path.join(process.cwd(), 'extracted_products.json');
    if (fs.existsSync(rootPath)) {
      PRODUCT_CATALOG = JSON.parse(fs.readFileSync(rootPath, 'utf8'));
    }
  } catch (e) {}
}

const SERVER_COUPONS = [
  { code: "WELCOME100", type: "fixed", value: 100, minSpend: 499, status: "Active" },
  { code: "VIZAGFREE", type: "shipping", value: 0, minSpend: 299, status: "Active" },
  { code: "FESTIVE20", type: "percent", value: 20, minSpend: 999, status: "Active" },
  { code: "UNIQUE10", type: "percent", value: 10, minSpend: 399, status: "Active" }
];

function findServerProduct(id) {
  return PRODUCT_CATALOG.find(p => String(p.id) === String(id));
}

function calculateServerOrderTotal(items, couponCode = null, giftWrap = false, clientShipping = null) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order items cannot be empty.');
  }

  let subtotal = 0;
  const verifiedItems = [];

  for (const clientItem of items) {
    const product = findServerProduct(clientItem.id);
    const price = product ? product.price : (parseFloat(clientItem.price) || 0);
    const qty = Math.max(1, parseInt(clientItem.qty, 10) || 1);
    const title = product ? product.title : (clientItem.title || 'Product');

    subtotal += price * qty;

    verifiedItems.push({
      id: clientItem.id,
      title: title,
      price: price,
      originalPrice: product ? (product.originalPrice || price) : price,
      qty: qty,
      image: product ? (product.image || '') : (clientItem.image || ''),
      category: product ? (product.category || 'Toys') : (clientItem.category || 'General'),
      variant: clientItem.variant || 'Standard Pack'
    });
  }

  const wrapFee = giftWrap ? 30 * verifiedItems.length : 0;
  const itemsTotal = subtotal + wrapFee;

  let discount = 0;
  let shipping = (clientShipping === 0 || clientShipping === '0') ? 0 : (itemsTotal >= 499 ? 0 : (clientShipping != null ? parseFloat(clientShipping) : 50));
  let appliedCoupon = null;

  if (couponCode) {
    const codeUpper = String(couponCode).trim().toUpperCase();
    const coupon = SERVER_COUPONS.find(c => c.code === codeUpper && c.status === 'Active');
    if (coupon) {
      if (itemsTotal >= (coupon.minSpend || 0)) {
        appliedCoupon = coupon.code;
        if (coupon.type === 'fixed') {
          discount = Math.min(itemsTotal, coupon.value || 0);
        } else if (coupon.type === 'percent') {
          discount = Math.round((itemsTotal * (coupon.value || 0)) / 100);
        } else if (coupon.type === 'shipping') {
          shipping = 0;
        }
      }
    }
  }

  const grandTotal = Math.max(0, itemsTotal - discount + shipping);

  return {
    subtotal,
    giftWrapFee: wrapFee,
    itemsTotal,
    discount,
    shipping,
    grandTotal,
    appliedCoupon,
    verifiedItems
  };
}

function createRazorpayOrder(amountInPaise, receipt, notes = {}) {
  return new Promise((resolve, reject) => {
    const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_CONFIG.key_id}:${RAZORPAY_CONFIG.key_secret}`).toString('base64');
    const postData = JSON.stringify({
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt || ('rcpt_' + Date.now()),
      notes: notes
    });

    const options = {
      hostname: 'api.razorpay.com',
      path: '/v1/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error?.description || 'Razorpay order creation failed'));
          }
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function verifyPaymentSignature(orderId, paymentId, signature) {
  if (!orderId || !paymentId || !signature || !RAZORPAY_CONFIG.key_secret) return false;
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_CONFIG.key_secret)
    .update(body)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(expectedSignature, 'utf8'), Buffer.from(signature, 'utf8'));
  } catch (e) {
    return false;
  }
}

async function syncOrderToSupabase(orderRecord) {
  const sbUrl = process.env.SUPABASE_URL || 'https://sfcxpvvqxldhdkvfyhgj.supabase.co';
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmY3hwdnZxeGxkaGRrdmZ5aGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzU4MTQsImV4cCI6MjEwMTE1MTgxNH0.ZNWPL7xNiapsnOrvJ45uT6KpaFqcvzz4vv7R7WGx39c';
  if (!sbUrl || !sbKey || sbUrl.includes('your-supabase-project')) return;

  try {
    const row = {
      order_id: orderRecord.orderId || ('UE-' + Date.now().toString().slice(-6)),
      customer_name: orderRecord.customerName || 'Customer',
      phone: orderRecord.phone || '',
      address: orderRecord.address || 'Visakhapatnam',
      items: orderRecord.items || [],
      total_amount: orderRecord.totalAmount || orderRecord.amount || 0,
      subtotal: orderRecord.subtotal || orderRecord.totalAmount || 0,
      discount_amount: orderRecord.discountAmount || 0,
      shipping_fee: orderRecord.shippingFee || 0,
      status: orderRecord.status || 'Paid & Confirmed',
      payment_method: orderRecord.paymentMethod || 'Razorpay Online',
      gstin: '37BVTPG7761F1Z1'
    };
    if (orderRecord.userId) row.user_id = orderRecord.userId;

    const postData = JSON.stringify(row);
    const urlObj = new URL(`${sbUrl}/rest/v1/orders`);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': sbKey,
        'Authorization': `Bearer ${sbKey}`,
        'Prefer': 'resolution=merge-duplicates',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve) => {
      const sbReq = https.request(options, () => resolve(true));
      sbReq.on('error', (err) => {
        console.warn('[Supabase Sync Warning]', err.message);
        resolve(false);
      });
      sbReq.write(postData);
      sbReq.end();
    });
  } catch (e) {
    console.warn('[Supabase Sync Warning]', e.message);
  }
}

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Razorpay-Signature');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (!RAZORPAY_CONFIG.key_id || !RAZORPAY_CONFIG.key_secret) {
    return res.status(503).json({ error: 'Razorpay payment gateway not configured.' });
  }

  const urlPath = (req.url || '').split('?')[0];
  const action = req.query?.action ||
    (urlPath.endsWith('/create-order') ? 'create-order' :
    (urlPath.endsWith('/verify-payment') ? 'verify-payment' :
    (urlPath.endsWith('/config') ? 'config' :
    (urlPath.endsWith('/webhook') ? 'webhook' :
    (urlPath.includes('create-order') ? 'create-order' :
    (urlPath.includes('verify-payment') ? 'verify-payment' : ''))))));

  if (req.method === 'GET' || action === 'config') {
    return res.status(200).json({
      success: true,
      keyId: RAZORPAY_CONFIG.key_id
    });
  }

  if (req.method === 'POST') {
    let payload = req.body;
    let rawBodyStr = '';
    if (!payload && typeof req.on === 'function') {
      try {
        payload = await new Promise((resolve) => {
          let data = '';
          req.on('data', chunk => { data += chunk; });
          req.on('end', () => {
            rawBodyStr = data;
            try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
          });
          req.on('error', () => resolve({}));
        });
      } catch (e) {
        payload = {};
      }
    } else if (typeof payload === 'string') {
      rawBodyStr = payload;
      try { payload = JSON.parse(payload); } catch (e) { payload = {}; }
    } else if (typeof payload === 'object') {
      rawBodyStr = JSON.stringify(payload);
    }
    payload = payload || {};

    if (action === 'webhook' || payload.action === 'webhook') {
      const webhookSignature = req.headers['x-razorpay-signature'];
      const secret = RAZORPAY_CONFIG.webhook_secret;

      if (secret && webhookSignature) {
        const expectedSig = crypto.createHmac('sha256', secret).update(rawBodyStr).digest('hex');
        let isValid = false;
        try {
          isValid = crypto.timingSafeEqual(Buffer.from(expectedSig, 'utf8'), Buffer.from(webhookSignature, 'utf8'));
        } catch (e) {
          isValid = false;
        }
        if (!isValid) {
          return res.status(400).json({ error: 'Invalid webhook signature' });
        }
      }

      const eventType = payload.event;
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const notes = paymentEntity?.notes || {};

      if (eventType === 'payment.captured' || eventType === 'order.paid') {
        const orderRecord = {
          orderId: notes.orderId || ('UE-' + (paymentEntity?.id ? paymentEntity.id.slice(-6) : Math.floor(100000 + Math.random() * 900000))),
          razorpayOrderId: orderId,
          paymentId: paymentEntity?.id,
          customerName: notes.customerName || notes.name || 'Customer',
          phone: notes.phone || paymentEntity?.contact || '',
          address: notes.address || 'Visakhapatnam',
          items: notes.items ? (typeof notes.items === 'string' ? JSON.parse(notes.items) : notes.items) : [],
          totalAmount: (paymentEntity?.amount ? paymentEntity.amount / 100 : 0),
          status: 'Paid & Confirmed',
          paymentMethod: 'Razorpay Online (' + (paymentEntity?.method || 'UPI') + ')',
          userId: notes.userId || null
        };
        await syncOrderToSupabase(orderRecord);
        console.log(`[Razorpay Webhook] Order confirmed and saved to Supabase: ${orderRecord.orderId}`);
      } else if (eventType === 'payment.failed') {
        console.log(`[Razorpay Webhook] Payment failed for order: ${orderId}`);
      }

      return res.status(200).json({ status: 'ok', received: true });
    }

    if (action === 'create-order' || payload.action === 'create-order') {
      let calcResult;
      try {
        if (Array.isArray(payload.items) && payload.items.length > 0) {
          calcResult = calculateServerOrderTotal(payload.items, payload.couponCode, payload.giftWrap, payload.shipping);
        } else if (payload.amount && !isNaN(parseFloat(payload.amount))) {
          const amt = parseFloat(payload.amount);
          calcResult = { grandTotal: amt, subtotal: amt, discount: 0, shipping: 0, verifiedItems: [] };
        } else {
          return res.status(400).json({ error: 'Missing items in order payload.' });
        }
      } catch (calcErr) {
        return res.status(400).json({ error: calcErr.message });
      }

      const amountInPaise = Math.round(calcResult.grandTotal * 100);
      try {
        const order = await createRazorpayOrder(amountInPaise, payload.receipt, payload.notes || {});
        return res.status(200).json({
          success: true,
          order: order,
          keyId: RAZORPAY_CONFIG.key_id,
          verifiedAmount: calcResult.grandTotal,
          breakdown: calcResult
        });
      } catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to create Razorpay order' });
      }
    }

    if (action === 'verify-payment' || payload.action === 'verify-payment') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ error: 'Missing required payment verification parameters.' });
      }

      const isValid = verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (isValid) {
        return res.status(200).json({
          success: true,
          verified: true,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id
        });
      } else {
        return res.status(400).json({
          success: false,
          verified: false,
          error: 'Invalid payment signature. Payment verification failed.'
        });
      }
    }

    if (action === 'dev-simulate' || payload.action === 'dev-simulate') {
      const orderId = payload.razorpay_order_id || ('order_dev_' + Date.now());
      const payId = 'pay_dev_' + Date.now();
      const validSig = crypto.createHmac('sha256', RAZORPAY_CONFIG.key_secret).update(`${orderId}|${payId}`).digest('hex');
      return res.status(200).json({
        success: true,
        simulated: true,
        razorpay_order_id: orderId,
        razorpay_payment_id: payId,
        razorpay_signature: validSig
      });
    }

    return res.status(400).json({ error: 'Unknown action specified.' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
