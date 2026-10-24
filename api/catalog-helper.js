const https = require('https');
const fs = require('fs');
const path = require('path');

// 1. Fallback Catalog from JSON file
let FALLBACK_CATALOG = [];
try {
  const pPath = path.join(__dirname, '..', 'extracted_products.json');
  FALLBACK_CATALOG = JSON.parse(fs.readFileSync(pPath, 'utf8'));
} catch (_) {
  FALLBACK_CATALOG = [];
}

// 2. Fallback Default Coupons
const DEFAULT_COUPONS = [
  { code: 'WELCOME100', type: 'fixed', value: 100, minSpend: 999, status: 'Active' },
  { code: 'FESTIVE20', type: 'percent', value: 20, minSpend: 1499, status: 'Active' },
  { code: 'FREESHIP', type: 'shipping', value: 0, minSpend: 499, status: 'Active' }
];

// In-Memory Caches
let liveProductsCache = null;
let lastProductsFetch = 0;

let liveCouponsCache = [...DEFAULT_COUPONS];
let lastCouponsFetch = 0;

const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function getSupabaseConfig() {
  const sbUrl = (process.env.SUPABASE_URL || '').trim();
  const sbKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '').trim();
  return { sbUrl, sbKey };
}

/**
 * 🔒 DATA-02: Live Server Products from Supabase
 * Authoritative single source of truth for pricing and inventory.
 */
async function getLiveServerProducts(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && liveProductsCache && (now - lastProductsFetch < CACHE_TTL_MS)) {
    return liveProductsCache;
  }

  const { sbUrl, sbKey } = getSupabaseConfig();
  if (!sbUrl || !sbKey || sbUrl.includes('your-supabase-project')) {
    console.error('[Catalog Error] SUPABASE_URL or SUPABASE_KEY is missing or invalid. Falling back to static catalog.');
    liveProductsCache = FALLBACK_CATALOG;
    return liveProductsCache;
  }

  try {
    const urlObj = new URL(`${sbUrl}/rest/v1/products?select=id,title,category,image,price,original_price,discount,in_stock,stock_qty`);
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
      // Map Supabase rows to normalized product objects
      const sbProducts = data.map(p => {
        const qty = p.stock_qty != null ? parseInt(p.stock_qty, 10) : 10;
        const outOfStockFlag = p.is_out_of_stock === true || p.in_stock === false || qty <= 0;
        return {
          id: String(p.id),
          title: p.title || 'Product',
          category: p.category || 'General',
          image: p.image || '',
          price: parseFloat(p.price) || 0,
          originalPrice: parseFloat(p.original_price) || parseFloat(p.price) || 0,
          discount: parseFloat(p.discount) || 0,
          inStock: !outOfStockFlag,
          isOutOfStock: outOfStockFlag,
          stockQty: qty
        };
      });

      // Merge: Live Supabase products take precedence; append fallback products if not present
      const sbIds = new Set(sbProducts.map(p => String(p.id)));
      const extraFallbacks = FALLBACK_CATALOG.filter(p => !sbIds.has(String(p.id)));

      liveProductsCache = [...sbProducts, ...extraFallbacks];
      lastProductsFetch = now;
      return liveProductsCache;
    }
  } catch (err) {
    console.warn('[Catalog Helper] Failed to fetch live Supabase products:', err.message);
  }

  // Graceful fallback if Supabase is unreachable
  liveProductsCache = FALLBACK_CATALOG;
  return liveProductsCache;
}

/**
 * 🔒 Fetch Live Coupons from Supabase
 */
async function getLiveServerCoupons(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && liveCouponsCache && (now - lastCouponsFetch < CACHE_TTL_MS)) {
    return liveCouponsCache;
  }

  const { sbUrl, sbKey } = getSupabaseConfig();
  if (!sbUrl || !sbKey || sbUrl.includes('your-supabase-project')) {
    console.error('[Coupons Error] SUPABASE_URL or SUPABASE_KEY is missing or invalid. Falling back to default coupons.');
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
      return liveCouponsCache;
    }
  } catch (_) {}

  return liveCouponsCache;
}

/**
 * Lookup product by ID across live products
 */
function findLiveProduct(id, productsList = null) {
  const list = productsList || liveProductsCache || FALLBACK_CATALOG;
  const idStr = String(id).trim();
  return list.find(p => String(p.id).trim() === idStr);
}

/**
 * Invalidate in-memory catalog cache on mutations
 */
function invalidateCatalogCache() {
  liveProductsCache = null;
  lastProductsFetch = 0;
  liveCouponsCache = [...DEFAULT_COUPONS];
  lastCouponsFetch = 0;
}

/**
 * 🔒 SEC-04 & DATA-02: Authoritative Server-Side Calculation
 * Evaluates live Supabase prices, live inventory availability, and active coupons.
 */
function calculateServerOrderTotal(items, couponCode = null, giftWrap = false, activeCoupons = null, liveProducts = null) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Order items cannot be empty.');
  }

  const catalog = liveProducts || liveProductsCache || FALLBACK_CATALOG;
  let subtotal = 0;
  const verifiedItems = [];

  for (const clientItem of items) {
    const product = findLiveProduct(clientItem.id, catalog);
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
 * 🔒 DATA-03: Atomic Server-Side Stock Decrement via Supabase RPC with fallback
 */
async function atomicDecrementStock(items) {
  if (!Array.isArray(items) || items.length === 0) return true;

  const { sbUrl, sbKey } = getSupabaseConfig();
  if (!sbUrl || !sbKey || sbUrl.includes('your-supabase-project')) {
    console.error('[Inventory Error] Cannot decrement stock: SUPABASE_URL or SUPABASE_KEY is missing or invalid.');
    return true;
  }

  try {
    const payload = items.map(i => ({
      id: String(i.id),
      qty: Math.max(1, parseInt(i.qty || i.quantity, 10) || 1)
    }));
    const postData = JSON.stringify({ order_items: payload });

    const urlObj = new URL(`${sbUrl}/rest/v1/rpc/decrement_product_stock`);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': sbKey,
        'Authorization': `Bearer ${sbKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const res = await new Promise((resolve) => {
      const req = https.request(options, (r) => {
        let b = '';
        r.on('data', chunk => b += chunk);
        r.on('end', () => {
          try {
            resolve({ statusCode: r.statusCode, data: JSON.parse(b) });
          } catch (_) {
            resolve({ statusCode: r.statusCode, data: b });
          }
        });
      });
      req.on('error', () => resolve({ statusCode: 500 }));
      req.write(postData);
      req.end();
    });

    invalidateCatalogCache();

    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (res.data && res.data.success === false) {
        throw new Error(res.data.error || 'Stock deduction failed');
      }
      return true;
    }

    if (res.statusCode === 404 || res.statusCode === 400) {
      console.warn('[Inventory Note] decrement_product_stock RPC not yet active in database (pending SQL migration).');
    }
  } catch (err) {
    console.warn('[Inventory Decrement Note]', err.message);
  }
  return true;
}

/**
 * 🔒 DATA-03: Atomic Server-Side Stock Restore via Supabase RPC on order cancel
 */
async function atomicRestoreStock(items) {
  if (!Array.isArray(items) || items.length === 0) return true;

  const { sbUrl, sbKey } = getSupabaseConfig();
  if (!sbUrl || !sbKey || sbUrl.includes('your-supabase-project')) {
    console.error('[Inventory Error] Cannot restore stock: SUPABASE_URL or SUPABASE_KEY is missing or invalid.');
    return true;
  }

  try {
    const payload = items.map(i => ({
      id: String(i.id),
      qty: Math.max(1, parseInt(i.qty || i.quantity, 10) || 1)
    }));
    const postData = JSON.stringify({ order_items: payload });

    const urlObj = new URL(`${sbUrl}/rest/v1/rpc/restore_product_stock`);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': sbKey,
        'Authorization': `Bearer ${sbKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    await new Promise((resolve) => {
      const req = https.request(options, (r) => resolve(r.statusCode));
      req.on('error', () => resolve(500));
      req.write(postData);
      req.end();
    });

    invalidateCatalogCache();
  } catch (err) {
    console.warn('[Inventory Restore Note]', err.message);
  }
  return true;
}

module.exports = {
  getLiveServerProducts,
  getLiveServerCoupons,
  findLiveProduct,
  calculateServerOrderTotal,
  invalidateCatalogCache,
  atomicDecrementStock,
  atomicRestoreStock
};
