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
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
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

// ── 2. Authoritative Server Catalog & Coupons (DATA-02 Live Supabase) ───────
const {
  getLiveServerProducts,
  getLiveServerCoupons,
  calculateServerOrderTotal,
  invalidateCatalogCache,
  atomicDecrementStock,
  atomicRestoreStock
} = require('./api/catalog-helper.js');

// In-Memory Orders Store for Idempotency & Webhook Tracking
const SERVER_ORDERS = new Map();

// ── 3. Helper: Supabase Order Sync from Server ────────────────────────────
async function syncOrderToSupabase(orderRecord) {
  const sbUrl = (process.env.SUPABASE_URL || '').trim();
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!sbUrl || !sbKey || sbUrl.includes('your-supabase-project')) {
    console.error('[Supabase Error] Cannot sync order to database: SUPABASE_URL or SUPABASE_KEY is missing or invalid.');
    return;
  }

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

  // ── Endpoint: Config Check Healthcheck ────────────────────────────────
  if (req.url === '/api/config-check') {
    const configCheckApi = require('./api/config-check.js');
    return configCheckApi(req, res);
  }

  // ── Endpoint: Cloudinary Image Upload ──────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/upload') {
    let body = '';
    let isTooLarge = false;
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 7.5 * 1024 * 1024) isTooLarge = true;
    });
    req.on('end', () => {
      if (isTooLarge) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Payload too large. Maximum file size is 5MB.' }));
      }
      try {
        if (!CLOUDINARY_CONFIG.cloud_name || !CLOUDINARY_CONFIG.api_key || !CLOUDINARY_CONFIG.api_secret) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Upload service unavailable: Cloudinary credentials not configured.' }));
        }

        const payload = JSON.parse(body || '{}');

        if (!payload.file || typeof payload.file !== 'string') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid or missing image payload.' }));
        }

        // Basic Safety: Accept images only (jpg, png, webp, gif)
        const isBase64Image = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(payload.file);
        const isHttpImageUrl = /^https?:\/\/.*\.(jpeg|jpg|png|webp|gif)(\?.*)?$/i.test(payload.file) ||
                               (payload.file.startsWith('http') && (payload.file.includes('cloudinary.com') || payload.file.includes('unsplash.com')));

        if (!isBase64Image && !isHttpImageUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid file format. Only JPG, PNG, WEBP, and GIF images are allowed.' }));
        }

        // Basic Safety: Reject files larger than 5 MB
        if (payload.file.startsWith('data:')) {
          const approxBytes = Math.ceil((payload.file.length - payload.file.indexOf(',') - 1) * 3 / 4);
          if (approxBytes > 5 * 1024 * 1024) {
            res.writeHead(413, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Payload too large. Maximum file size is 5MB.' }));
          }
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

  // ── Endpoint: Server-Validated Orders Calculation & Creation (SEC-04) ────
  if (req.url.startsWith('/api/orders')) {
    const ordersHandler = require('./api/orders.js');
    return ordersHandler(req, res);
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
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body || '{}');

        if (!RAZORPAY_CONFIG.key_id || !RAZORPAY_CONFIG.key_secret) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Razorpay payment gateway not configured' }));
        }

        // 🔒 Server-Side Price & Calculation Verification
        let calcResult;
        try {
          const liveProducts = await getLiveServerProducts();
          const liveCoupons = await getLiveServerCoupons();
          if (Array.isArray(payload.items) && payload.items.length > 0) {
            calcResult = calculateServerOrderTotal(payload.items, payload.couponCode, payload.giftWrap, liveCoupons, liveProducts);
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
            address: payload.notes?.address || payload.address || ''
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
                  address: payload.address || payload.notes?.address || '',
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
            address: payload.address || existingOrder?.address || '',
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
          atomicDecrementStock(finalRecord.items);
          try {
            const { sendOrderConfirmationEmail } = require('./api/email-helper.js');
            sendOrderConfirmationEmail(finalRecord).catch(() => {});
          } catch (_) {}

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

        // 🔒 SEC-01: Strict Admin Authentication
        const configuredSecret = (process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
        if (!configuredSecret) {
          console.error('[Admin Security Alert] ADMIN_SECRET and SUPABASE_SERVICE_ROLE_KEY are not configured.');
          res.writeHead(503, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Admin endpoint unavailable: admin credentials not configured on server.' }));
        }

        const providedSecret = token || payload.adminSecret || '';
        if (!providedSecret || providedSecret !== configuredSecret) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Unauthorized admin access: invalid credentials.' }));
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
      const isScriptOrStyle = ext === '.js' || ext === '.css';
      const cacheControl = (isHtml || isScriptOrStyle)
        ? 'no-cache, no-store, must-revalidate'
        : 'public, max-age=86400, stale-while-revalidate=604800';
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
