const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ALLOWED_ORIGINS = [
  'https://shop.uniqueexpressions.in',
  'https://uniqueexpressions.in',
  'https://www.uniqueexpressions.in',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

const {
  getLiveServerProducts,
  getLiveServerCoupons,
  calculateServerOrderTotal,
  atomicDecrementStock
} = require('./catalog-helper.js');

const {
  checkIdempotency,
  startIdempotency,
  completeIdempotency,
  clearIdempotency
} = require('./idempotency.js');

/**
 * Sync confirmed order to Supabase
 */
async function syncOrderToSupabase(orderRecord) {
  const sbUrl = process.env.SUPABASE_URL || 'https://sfcxpvvqxldhdkvfyhgj.supabase.co';
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!sbUrl || !sbKey || sbUrl.includes('your-supabase-project')) return false;

  try {
    const row = {
      order_id: orderRecord.orderId || ('UE-' + Date.now().toString().slice(-6)),
      customer_name: orderRecord.customerName || 'Customer',
      phone: orderRecord.phone || '',
      address: orderRecord.address || '',
      items: orderRecord.items || [],
      total_amount: orderRecord.totalAmount || 0,
      subtotal: orderRecord.subtotal || orderRecord.totalAmount || 0,
      discount_amount: orderRecord.discountAmount || 0,
      shipping_fee: orderRecord.shippingFee || 0,
      status: orderRecord.status || 'Order Confirmed',
      payment_method: orderRecord.paymentMethod || 'WhatsApp Direct Order Confirmation',
      gstin: '37BVTPG7761F1Z1',
      created_at: orderRecord.createdAt || new Date().toISOString()
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
      const sbReq = https.request(options, (res) => {
        resolve(res.statusCode >= 200 && res.statusCode < 300);
      });
      sbReq.on('error', (err) => {
        console.warn('[Supabase Sync Warning]', err.message);
        resolve(false);
      });
      sbReq.write(postData);
      sbReq.end();
    });
  } catch (e) {
    console.warn('[Supabase Sync Warning]', e.message);
    return false;
  }
}

/**
 * Serverless / Express handler for /api/orders
 */
module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const action = urlObj.searchParams.get('action');

  let body = '';
  if (req.body && typeof req.body === 'object') {
    body = JSON.stringify(req.body);
  } else {
    body = await new Promise((resolve) => {
      let b = '';
      req.on('data', chunk => b += chunk);
      req.on('end', () => resolve(b));
    });
  }

  let payload = {};
  if (body) {
    try { payload = JSON.parse(body); } catch (_) {}
  }

  // 1. Calculate / Validate Order Breakdown (Never trust client prices)
  if (req.method === 'POST' && (action === 'calculate' || urlObj.pathname.endsWith('/calculate'))) {
    try {
      const liveProducts = await getLiveServerProducts();
      const liveCoupons = await getLiveServerCoupons();
      const breakdown = calculateServerOrderTotal(payload.items, payload.couponCode, payload.giftWrap, liveCoupons, liveProducts);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, breakdown }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: err.message }));
    }
  }

  // 2. Authoritative Order Creation (WhatsApp / COD / Direct)
  if (req.method === 'POST' && (action === 'create' || urlObj.pathname.endsWith('/create') || urlObj.pathname === '/api/orders')) {
    const idemKey = req.headers['x-idempotency-key'] || payload.idempotencyKey;
    if (idemKey) {
      const cached = checkIdempotency(idemKey);
      if (cached) {
        if (cached.status === 'PENDING') {
          res.writeHead(409, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: false, error: 'Order creation in progress. Please wait.' }));
        }
        if (cached.status === 'COMPLETED' && cached.response) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ ...cached.response, idempotentReplay: true }));
        }
      }
      startIdempotency(idemKey);
    }

    try {
      if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
        if (idemKey) clearIdempotency(idemKey);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Order items are required' }));
      }

      const liveProducts = await getLiveServerProducts();
      const liveCoupons = await getLiveServerCoupons();
      // 🔒 Server-Side Price & Calculation Verification using live Supabase products
      const calcResult = calculateServerOrderTotal(payload.items, payload.couponCode, payload.giftWrap, liveCoupons, liveProducts);

      const orderRecord = {
        orderId: 'UE-' + Math.floor(100000 + Math.random() * 900000),
        customerName: payload.customerName || 'Customer',
        phone: payload.phone || '',
        address: payload.address || '',
        items: calcResult.verifiedItems,
        totalAmount: calcResult.grandTotal,
        subtotal: calcResult.subtotal,
        discountAmount: calcResult.discount,
        shippingFee: calcResult.shipping,
        couponCode: calcResult.appliedCoupon,
        status: payload.status || 'Order Confirmed',
        paymentMethod: payload.paymentMethod || 'WhatsApp Direct Order Confirmation',
        userId: payload.userId || null,
        createdAt: new Date().toISOString()
      };

      // 🔒 DATA-03: Atomic server-side stock decrement
      await atomicDecrementStock(calcResult.verifiedItems);

      // Non-blocking sync to Supabase
      syncOrderToSupabase(orderRecord).catch(() => {});

      const responsePayload = {
        success: true,
        order: orderRecord,
        breakdown: calcResult
      };

      if (idemKey) completeIdempotency(idemKey, responsePayload);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(responsePayload));
    } catch (err) {
      if (idemKey) clearIdempotency(idemKey);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: err.message }));
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
};

module.exports.calculateServerOrderTotal = calculateServerOrderTotal;
module.exports.getLiveServerCoupons = getLiveServerCoupons;
