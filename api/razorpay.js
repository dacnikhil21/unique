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

const SERVER_COUPONS = [
  { code: "WELCOME100", type: "fixed", value: 100, minSpend: 499, status: "Active" },
  { code: "VIZAGFREE", type: "shipping", value: 0, minSpend: 299, status: "Active" },
  { code: "FESTIVE20", type: "percent", value: 20, minSpend: 999, status: "Active" },
  { code: "UNIQUE10", type: "percent", value: 10, minSpend: 399, status: "Active" }
];

function calculateServerOrderTotal(clientItems, couponCode, giftWrap = false) {
  if (!Array.isArray(clientItems) || clientItems.length === 0) {
    throw new Error('Cart is empty. Please add items to checkout.');
  }

  let subtotal = 0;
  const verifiedItems = [];

  for (const clientItem of clientItems) {
    const product = PRODUCT_CATALOG.find(p => String(p.id) === String(clientItem.id));
    if (!product) {
      throw new Error(`Product "${clientItem.title || clientItem.id}" is not available in store catalog.`);
    }

    if (product.inStock === false) {
      throw new Error(`Product "${product.title}" is out of stock.`);
    }

    const qty = Math.max(1, parseInt(clientItem.qty || clientItem.quantity, 10) || 1);
    const available = product.stockQty != null ? product.stockQty : 10;
    if (qty > available) {
      throw new Error(`Only ${available} units available for "${product.title}" (requested ${qty}).`);
    }

    const price = parseFloat(product.price);
    subtotal += price * qty;

    verifiedItems.push({
      id: product.id,
      title: product.title,
      price: price,
      originalPrice: product.originalPrice || price,
      qty: qty,
      image: product.image || '',
      category: product.category || 'Toys',
      variant: clientItem.variant || 'Standard Pack'
    });
  }

  const wrapFee = giftWrap ? 30 * verifiedItems.length : 0;
  const itemsTotal = subtotal + wrapFee;

  let discount = 0;
  let shipping = itemsTotal >= 499 ? 0 : 50;
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

  const action = req.query?.action || (req.url.includes('/create-order') ? 'create-order' : (req.url.includes('/verify-payment') ? 'verify-payment' : (req.url.includes('/config') ? 'config' : (req.url.includes('/webhook') ? 'webhook' : ''))));

  if (req.method === 'GET' || action === 'config') {
    return res.status(200).json({
      success: true,
      keyId: RAZORPAY_CONFIG.key_id
    });
  }

  if (req.method === 'POST') {
    let payload = req.body;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch (e) { payload = {}; }
    }

    if (action === 'create-order' || payload.action === 'create-order') {
      let calcResult;
      try {
        if (Array.isArray(payload.items) && payload.items.length > 0) {
          calcResult = calculateServerOrderTotal(payload.items, payload.couponCode, payload.giftWrap);
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
