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

// Fallback Product Catalog
let PRODUCT_CATALOG = [];
try {
  const pPath = path.join(__dirname, '..', 'extracted_products.json');
  PRODUCT_CATALOG = JSON.parse(fs.readFileSync(pPath, 'utf8'));
} catch (e) {
  PRODUCT_CATALOG = [];
}

// Fallback Coupons
const DEFAULT_COUPONS = [
  { code: 'WELCOME100', type: 'fixed', value: 100, minSpend: 999, status: 'Active' },
  { code: 'FESTIVE20', type: 'percent', value: 20, minSpend: 1499, status: 'Active' },
  { code: 'FREESHIP', type: 'shipping', value: 0, minSpend: 499, status: 'Active' }
];

let liveCouponsCache = [...DEFAULT_COUPONS];
let lastCouponsFetch = 0;

/**
 * Fetch live coupons from Supabase
 */
async function getLiveServerCoupons() {
  const now = Date.now();
  if (now - lastCouponsFetch < 60000 && liveCouponsCache.length > 0) {
    return liveCouponsCache;
  }

  const sbUrl = process.env.SUPABASE_URL || 'https://sfcxpvvqxldhdkvfyhgj.supabase.co';
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
  if (!sbUrl || !sbKey || sbUrl.includes('your-supabase-project')) {
    return DEFAULT_COUPONS;
  }

  try {
    const urlObj = new URL(`${sbUrl}/rest/v1/coupons?select=code,discount_type,discount_value,min_order_amount,is_active`);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'apikey': sbKey,
        'Authorization': `Bearer ${sbKey}`
      }
    };

    const data = await new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try { resolve(JSON.parse(body)); } catch (_) { resolve(null); }
          } else {
            resolve(null);
          }
        });
      });
      req.on('error', () => resolve(null));
      req.end();
    });

    if (Array.isArray(data) && data.length > 0) {
      liveCouponsCache = data.map(c => ({
        code: String(c.code).trim().toUpperCase(),
        type: c.discount_type === 'percentage' ? 'percent' : c.discount_type,
        value: parseFloat(c.discount_value) || 0,
        minSpend: parseFloat(c.min_order_amount) || 0,
        status: c.is_active ? 'Active' : 'Disabled'
      }));
      lastCouponsFetch = now;
    }
  } catch (_) {}
  return liveCouponsCache;
}

function findServerProduct(id) {
  return PRODUCT_CATALOG.find(p => String(p.id) === String(id));
}

/**
 * 🔒 SEC-04: Authoritative Server-Side Calculation of Order Total, Discounts & Shipping.
 * Never trust client prices, discounts, shipping fees, or totals.
 */
function calculateServerOrderTotal(items, couponCode = null, giftWrap = false, activeCoupons = null) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order items cannot be empty.');
  }

  let subtotal = 0;
  const verifiedItems = [];

  for (const clientItem of items) {
    const product = findServerProduct(clientItem.id);
    if (!product) {
      throw new Error(`Product "${clientItem.title || clientItem.id}" not found in catalog.`);
    }

    if (product.inStock === false || product.isOutOfStock === true || (product.stockQty != null && product.stockQty <= 0)) {
      throw new Error(`Product "${product.title}" is currently out of stock.`);
    }

    const qty = Math.max(1, parseInt(clientItem.qty || clientItem.quantity, 10) || 1);
    const available = product.stockQty != null ? product.stockQty : 999;
    if (qty > available) {
      throw new Error(`Only ${available} units available for "${product.title}" (requested ${qty}).`);
    }

    const price = parseFloat(product.price) || 0;
    subtotal += price * qty;

    verifiedItems.push({
      id: product.id,
      title: product.title,
      price: price,
      originalPrice: product.originalPrice || price,
      qty: qty,
      image: product.image || clientItem.image || '',
      category: product.category || 'Toys',
      variant: clientItem.variant || 'Standard Pack'
    });
  }

  const wrapFee = giftWrap ? 30 * verifiedItems.length : 0;
  const itemsTotal = subtotal + wrapFee;

  let discount = 0;
  let shipping = itemsTotal >= 499 ? 0 : 50;
  let appliedCoupon = null;

  const couponsToUse = Array.isArray(activeCoupons) && activeCoupons.length > 0 ? activeCoupons : liveCouponsCache;
  if (couponCode) {
    const codeUpper = String(couponCode).trim().toUpperCase();
    const coupon = couponsToUse.find(c => c.code === codeUpper && c.status === 'Active');
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
      const liveCoupons = await getLiveServerCoupons();
      const breakdown = calculateServerOrderTotal(payload.items, payload.couponCode, payload.giftWrap, liveCoupons);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, breakdown }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: err.message }));
    }
  }

  // 2. Authoritative Order Creation (WhatsApp / COD / Direct)
  if (req.method === 'POST' && (action === 'create' || urlObj.pathname.endsWith('/create') || urlObj.pathname === '/api/orders')) {
    try {
      if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: 'Order items are required' }));
      }

      const liveCoupons = await getLiveServerCoupons();
      // 🔒 Server-Side Price & Calculation Verification
      const calcResult = calculateServerOrderTotal(payload.items, payload.couponCode, payload.giftWrap, liveCoupons);

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

      // Non-blocking sync to Supabase
      syncOrderToSupabase(orderRecord).catch(() => {});

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        success: true,
        order: orderRecord,
        breakdown: calcResult
      }));
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: err.message }));
    }
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
};

module.exports.calculateServerOrderTotal = calculateServerOrderTotal;
module.exports.getLiveServerCoupons = getLiveServerCoupons;
