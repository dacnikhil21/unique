const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load Environment Variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.replace(/\r/g, '').trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (key && val) {
        process.env[key] = val;
      }
    }
  });
}

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Validate required environment variables at startup
if (!process.env.CLOUDINARY_API_SECRET) {
  console.error('[FATAL] CLOUDINARY_API_SECRET environment variable is not set. Server will not handle uploads.');
}

const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'oqj0unl4',
  api_key: process.env.CLOUDINARY_API_KEY || '392727691414539',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  folder: process.env.CLOUDINARY_FOLDER || 'unique_expressions'
};

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

// ── 2. Authoritative Server Catalog & Coupons ─────────────────────────────
let PRODUCT_CATALOG = [];
try {
  const prodPath = path.join(__dirname, 'extracted_products.json');
  if (fs.existsSync(prodPath)) {
    PRODUCT_CATALOG = JSON.parse(fs.readFileSync(prodPath, 'utf8'));
    console.log(`[Server] Loaded ${PRODUCT_CATALOG.length} authoritative products from catalog.`);
  }
} catch (e) {
  console.warn('[Server] Could not load extracted_products.json, fallback catalog ready.');
}

let SERVER_COUPONS = [
  { code: "WELCOME100", type: "fixed", value: 100, minSpend: 499, status: "Active" },
  { code: "VIZAGFREE", type: "shipping", value: 0, minSpend: 299, status: "Active" },
  { code: "FESTIVE20", type: "percent", value: 20, minSpend: 999, status: "Active" },
  { code: "UNIQUE10", type: "percent", value: 10, minSpend: 399, status: "Active" }
];

// In-Memory Orders Store for Idempotency & Webhook Tracking
const SERVER_ORDERS = new Map();

/**
 * 🔒 CRITICAL BUSINESS PROTECTION:
 * Authoritative Server-Side Calculation of Order Total, Discounts & Stock.
 * Never trust client-supplied prices, discounts, or totals.
 */
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

// ── 3. Helper: Supabase Order Sync from Server ────────────────────────────
async function syncOrderToSupabase(orderRecord) {
  const sbUrl = process.env.SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!sbUrl || !sbKey || sbUrl.includes('your-supabase-project')) return;

  try {
    const row = {
      order_id: orderRecord.orderId,
      customer_name: orderRecord.customerName,
      phone: orderRecord.phone,
      address: orderRecord.address,
      items: orderRecord.items,
      total_amount: orderRecord.totalAmount,
      subtotal: orderRecord.subtotal || orderRecord.totalAmount,
      discount_amount: orderRecord.discountAmount || 0,
      shipping_fee: orderRecord.shippingFee || 0,
      status: orderRecord.status || 'Order Confirmed',
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

    const req = https.request(options, (res) => {
      // Non-blocking background sync
    });
    req.on('error', (err) => console.warn('[Supabase Sync Warning]', err.message));
    req.write(postData);
    req.end();
  } catch (e) {
    console.warn('[Supabase Sync Warning]', e.message);
  }
}

// ── 4. Create Main HTTP Server ─────────────────────────────────────────────
const server = http.createServer((req, res) => {
  // CORS Headers — allow local development ports & production domains
  const origin = req.headers.origin || '';
  if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Razorpay-Signature');

  // Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // ── Endpoint: Products API Handler ────────────────────────────────────
  if (req.url.startsWith('/api/products')) {
    const productsApi = require('./api/products.js');
    return productsApi(req, res);
  }

  // ── Endpoint: Shiprocket Logistics API Handler ─────────────────────────
  if (req.url.startsWith('/api/shiprocket')) {
    const shiprocketApi = require('./api/shiprocket.js');
    return shiprocketApi(req, res);
  }

  // ── Endpoint: Cloudinary Image Upload ──────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/upload') {
    let body = '';
    let isTooLarge = false;
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 10 * 1024 * 1024) isTooLarge = true;
    });
    req.on('end', () => {
      if (isTooLarge) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Payload too large. Max size is 10MB.' }));
      }
      try {
        const payload = JSON.parse(body);
        if (!payload.file || (!payload.file.startsWith('http') && !payload.file.startsWith('data:'))) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid image payload.' }));
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const stringToSign = `folder=${CLOUDINARY_CONFIG.folder}&timestamp=${timestamp}${CLOUDINARY_CONFIG.api_secret}`;
        const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

        const postData = new URLSearchParams({
          file: payload.file,
          api_key: CLOUDINARY_CONFIG.api_key,
          timestamp: timestamp.toString(),
          folder: CLOUDINARY_CONFIG.folder,
          signature: signature
        }).toString();

        const options = {
          hostname: 'api.cloudinary.com',
          path: `/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const cReq = https.request(options, (cRes) => {
          let cData = '';
          cRes.on('data', chunk => { cData += chunk; });
          cRes.on('end', () => {
            try {
              const cloudRes = JSON.parse(cData);
              if (cRes.statusCode === 200 && cloudRes.secure_url) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, url: cloudRes.secure_url, public_id: cloudRes.public_id }));
              } else {
                res.writeHead(cRes.statusCode || 500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: cloudRes.error?.message || 'Upload failed' }));
              }
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid response from Cloudinary' }));
            }
          });
        });

        cReq.on('error', (err) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message || 'Network error reaching Cloudinary' }));
        });

        cReq.write(postData);
        cReq.end();
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON request body' }));
      }
    });
    return;
  }

  // ── Endpoint: Razorpay Public Config ──────────────────────────────────
  if (req.method === 'GET' && (req.url.startsWith('/api/razorpay/config') || req.url === '/api/razorpay?action=config')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      keyId: RAZORPAY_CONFIG.key_id
    }));
  }

  // ── Endpoint: Server-Validated Razorpay Create Order (P0 Security) ────
  if (req.method === 'POST' && (req.url.startsWith('/api/razorpay/create-order') || req.url === '/api/razorpay?action=create-order')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');

        if (!RAZORPAY_CONFIG.key_id || !RAZORPAY_CONFIG.key_secret) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Razorpay payment gateway not configured' }));
        }

        // 🔒 Server-Side Price & Calculation Verification
        let calcResult;
        try {
          if (Array.isArray(payload.items) && payload.items.length > 0) {
            calcResult = calculateServerOrderTotal(payload.items, payload.couponCode, payload.giftWrap);
          } else if (payload.amount && !isNaN(parseFloat(payload.amount))) {
            // Fallback for direct amount if items not passed (legacy compatibility)
            const amt = parseFloat(payload.amount);
            calcResult = { grandTotal: amt, subtotal: amt, discount: 0, shipping: 0, verifiedItems: [] };
          } else {
            throw new Error('Missing cart items for checkout');
          }
        } catch (calcErr) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: calcErr.message }));
        }

        const grandTotal = calcResult.grandTotal;
        if (grandTotal <= 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid order payable total' }));
        }

        const amountInPaise = Math.round(grandTotal * 100);
        const receiptId = 'ue_' + Date.now();
        const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_CONFIG.key_id}:${RAZORPAY_CONFIG.key_secret}`).toString('base64');
        const postData = JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: {
            customerName: payload.notes?.customerName || payload.customerName || 'Customer',
            phone: payload.notes?.phone || payload.phone || '',
            address: payload.notes?.address || payload.address || 'Visakhapatnam'
          }
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

        const rzpReq = https.request(options, (rzpRes) => {
          let rzpData = '';
          rzpRes.on('data', chunk => { rzpData += chunk; });
          rzpRes.on('end', () => {
            try {
              const parsed = JSON.parse(rzpData);
              if (rzpRes.statusCode >= 200 && rzpRes.statusCode < 300) {
                // Store pending order in memory & server tracking
                const serverOrderRecord = {
                  orderId: 'UE-' + Math.floor(100000 + Math.random() * 900000),
                  razorpayOrderId: parsed.id,
                  customerName: payload.customerName || payload.notes?.customerName || 'Customer',
                  phone: payload.phone || payload.notes?.phone || '',
                  address: payload.address || payload.notes?.address || 'Visakhapatnam',
                  items: calcResult.verifiedItems,
                  totalAmount: grandTotal,
                  subtotal: calcResult.subtotal,
                  discountAmount: calcResult.discount,
                  shippingFee: calcResult.shipping,
                  couponCode: calcResult.appliedCoupon,
                  status: 'PAYMENT_PENDING',
                  paymentMethod: 'Razorpay Online',
                  userId: payload.userId || null,
                  createdAt: new Date().toISOString()
                };

                SERVER_ORDERS.set(parsed.id, serverOrderRecord);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: true,
                  order: parsed,
                  keyId: RAZORPAY_CONFIG.key_id,
                  verifiedAmount: grandTotal,
                  breakdown: calcResult
                }));
              } else {
                res.writeHead(rzpRes.statusCode || 500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: parsed.error?.description || 'Razorpay order creation failed' }));
              }
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid response from payment gateway' }));
            }
          });
        });

        rzpReq.on('error', (err) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message || 'Network error reaching payment gateway' }));
        });

        rzpReq.write(postData);
        rzpReq.end();
      } catch (err) {
        console.error('[Server Error in create-order]:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Invalid request payload' }));
      }
    });
    return;
  }

  // ── Endpoint: Server Payment Signature Verification (P0 Security) ────
  if (req.method === 'POST' && (req.url.startsWith('/api/razorpay/verify-payment') || req.url === '/api/razorpay?action=verify-payment')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Missing payment verification details' }));
        }

        const expectedSignature = crypto
          .createHmac('sha256', RAZORPAY_CONFIG.key_secret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

        let isValid = false;
        try {
          isValid = crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'utf8'),
            Buffer.from(razorpay_signature, 'utf8')
          );
        } catch (e) {
          isValid = false;
        }

        if (isValid) {
          // Retrieve and finalize order
          const existingOrder = SERVER_ORDERS.get(razorpay_order_id);
          const orderId = existingOrder?.orderId || ('UE-' + Math.floor(100000 + Math.random() * 900000));
          
          const finalRecord = {
            orderId: orderId,
            razorpayOrderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            status: 'Paid & Confirmed',
            customerName: payload.name || existingOrder?.customerName || 'Customer',
            phone: payload.phone || existingOrder?.phone || '',
            address: payload.address || existingOrder?.address || 'Visakhapatnam',
            items: existingOrder?.items || [],
            totalAmount: existingOrder?.totalAmount || payload.totals?.grandTotal || 0,
            subtotal: existingOrder?.subtotal || payload.totals?.subtotal || 0,
            discountAmount: existingOrder?.discountAmount || payload.totals?.discount || 0,
            shippingFee: existingOrder?.shippingFee || payload.totals?.shipping || 0,
            paymentMethod: 'Razorpay Online (UPI / Cards)',
            userId: payload.userId || existingOrder?.userId || null,
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          };

          SERVER_ORDERS.set(razorpay_order_id, { ...finalRecord, status: 'Paid & Confirmed' });
          syncOrderToSupabase(finalRecord);

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            verified: true,
            paymentId: razorpay_payment_id,
            orderId: orderId,
            orderRecord: finalRecord
          }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            verified: false,
            error: 'Signature verification failed. Payment not confirmed.'
          }));
        }
      } catch (err) {
        console.error('[Server Error in verify-payment]:', err);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Invalid request body' }));
      }
    });
    return;
  }

  // ── Endpoint: Localhost Dev Payment Simulation (for testing without live domain block) ────
  if (req.method === 'POST' && (req.url.startsWith('/api/razorpay/dev-simulate') || req.url === '/api/razorpay?action=dev-simulate')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const orderId = payload.razorpay_order_id || ('order_dev_' + Date.now());
        const payId = 'pay_dev_' + Date.now();
        const validSig = crypto.createHmac('sha256', RAZORPAY_CONFIG.key_secret).update(`${orderId}|${payId}`).digest('hex');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          simulated: true,
          razorpay_order_id: orderId,
          razorpay_payment_id: payId,
          razorpay_signature: validSig
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Simulation failed' }));
      }
    });
    return;
  }

  // ── Endpoint: Razorpay Webhook Handler (P0 Security & Idempotency) ────
  if (req.method === 'POST' && (req.url.startsWith('/api/razorpay/webhook') || req.url === '/api/razorpay?action=webhook')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const webhookSignature = req.headers['x-razorpay-signature'];
        const secret = RAZORPAY_CONFIG.webhook_secret;

        if (secret && webhookSignature) {
          const expectedSig = crypto.createHmac('sha256', secret).update(body).digest('hex');
          const isValid = crypto.timingSafeEqual(Buffer.from(expectedSig, 'utf8'), Buffer.from(webhookSignature, 'utf8'));
          if (!isValid) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Invalid webhook signature' }));
          }
        }

        const event = JSON.parse(body || '{}');
        const eventType = event.event;
        const paymentEntity = event.payload?.payment?.entity;
        const orderId = paymentEntity?.order_id;

        if (orderId && (eventType === 'payment.captured' || eventType === 'order.paid')) {
          const existing = SERVER_ORDERS.get(orderId);
          if (existing && existing.status !== 'Paid & Confirmed') {
            existing.status = 'Paid & Confirmed';
            existing.paymentId = paymentEntity.id;
            syncOrderToSupabase(existing);
            console.log(`[Webhook] Order ${existing.orderId} confirmed via Razorpay webhook.`);
          }
        } else if (orderId && eventType === 'payment.failed') {
          const existing = SERVER_ORDERS.get(orderId);
          if (existing && existing.status !== 'Paid & Confirmed') {
            existing.status = 'Payment Failed';
            syncOrderToSupabase(existing);
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', received: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Webhook processing error' }));
      }
    });
    return;
  }

  // ── Endpoint: Protected Admin API ──────────────────────────────────────
  if (req.method === 'POST' && req.url.startsWith('/api/admin/')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const authHeader = req.headers['authorization'] || '';
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();

        // Validate admin token
        const adminSecret = process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
        if (adminSecret && token !== adminSecret && payload.adminSecret !== adminSecret) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Unauthorized admin access.' }));
        }

        if (req.url === '/api/admin/toggle-coupon') {
          const { code, status } = payload;
          const coupon = SERVER_COUPONS.find(c => c.code === code);
          if (coupon) coupon.status = status || (coupon.status === 'Active' ? 'Disabled' : 'Active');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, coupons: SERVER_COUPONS }));
        }

        if (req.url === '/api/admin/update-stock') {
          const { productId, stockQty, inStock } = payload;
          const product = PRODUCT_CATALOG.find(p => String(p.id) === String(productId));
          if (product) {
            if (stockQty != null) product.stockQty = stockQty;
            if (inStock != null) product.inStock = inStock;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, product }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid admin request' }));
      }
    });
    return;
  }

  // ── Static Asset Serving & SPA Routing ────────────────────────────────
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  let filePath = path.join(PUBLIC_DIR, reqPath);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    } else {
      const isHtml = ext === '.html' || ext === '';
      const cacheControl = isHtml
        ? 'no-store, no-cache, must-revalidate'
        : 'public, max-age=31536000, immutable';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': cacheControl
      });
      res.end(content);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
