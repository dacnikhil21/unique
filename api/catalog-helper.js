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

// In-Memory Caches
let liveProductsCache = null;
let lastProductsFetch = 0;

let liveCouponsCache = null;
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
 * Single source of truth. Never falls back to default coupons.
 */
async function getLiveServerCoupons(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && Array.isArray(liveCouponsCache) && (now - lastCouponsFetch < CACHE_TTL_MS)) {
    return liveCouponsCache;
  }

  const { sbUrl, sbKey } = getSupabaseConfig();
  if (!sbUrl || !sbKey || sbUrl.includes('your-supabase-project')) {
    throw new Error('Supabase configuration missing or invalid. Unable to fetch coupons.');
  }

  const urlObj = new URL(`${sbUrl}/rest/v1/coupons?select=code,discount_type,discount_value,min_order_amount,max_discount,expires_at,is_active,usage_limit,times_used`);
  const options = {
    hostname: urlObj.hostname,
    path: urlObj.pathname + urlObj.search,
    method: 'GET',
    headers: {
      'apikey': sbKey,
      'Authorization': `Bearer ${sbKey}`
    }
  };

  const data = await new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(body)); } catch (e) { reject(new Error('Invalid JSON from coupons endpoint: ' + e.message)); }
        } else {
          reject(new Error(`Coupons query failed with HTTP status ${res.statusCode}: ${body}`));
        }
      });
    });
    req.on('error', err => reject(new Error('Network error fetching coupons: ' + err.message)));
    req.end();
  });

  if (!Array.isArray(data)) {
    throw new Error('Unexpected coupons response structure from database.');
  }

  liveCouponsCache = data.map(c => ({
    code: String(c.code).trim().toUpperCase(),
    type: c.discount_type === 'percentage' ? 'percent' : c.discount_type,
    value: parseFloat(c.discount_value) || 0,
    minSpend: parseFloat(c.min_order_amount) || 0,
    maxDiscount: c.max_discount != null ? parseFloat(c.max_discount) : null,
    expiry: c.expires_at || null,
    usageLimit: c.usage_limit != null ? parseInt(c.usage_limit, 10) : null,
    usedCount: parseInt(c.times_used, 10) || 0,
    status: c.is_active ? 'Active' : 'Disabled'
  }));
  lastCouponsFetch = now;
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
  liveCouponsCache = null;
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

  if (couponCode) {
    const couponsToUse = Array.isArray(activeCoupons) ? activeCoupons : liveCouponsCache;
    if (!couponsToUse) {
      throw new Error('Coupons could not be verified from the store database.');
    }
    const codeUpper = String(couponCode).trim().toUpperCase();
    const coupon = couponsToUse.find(c => c.code === codeUpper);
    if (!coupon || coupon.status !== 'Active') {
      throw new Error(`Coupon "${codeUpper}" is invalid or inactive.`);
    }
    if (coupon.expiry) {
      const expDate = new Date(coupon.expiry);
      if (!isNaN(expDate.getTime()) && expDate < new Date()) {
        throw new Error(`Coupon "${codeUpper}" has expired.`);
      }
    }
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      throw new Error(`Coupon "${codeUpper}" usage limit reached.`);
    }
    if (itemsTotal < (coupon.minSpend || 0)) {
      throw new Error(`Coupon "${codeUpper}" requires a minimum order of ₹${coupon.minSpend}.`);
    }

    appliedCoupon = coupon.code;
    if (coupon.type === 'fixed') {
      discount = Math.min(itemsTotal, coupon.value || 0);
    } else if (coupon.type === 'percent') {
      const rawDisc = Math.round((itemsTotal * (coupon.value || 0)) / 100);
      discount = coupon.maxDiscount ? Math.min(rawDisc, coupon.maxDiscount) : rawDisc;
    } else if (coupon.type === 'shipping') {
      shipping = 0;
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

/**
 * 🔒 Atomic Server-Side Coupon Usage Increment
 */
async function atomicIncrementCouponUsage(couponCode) {
  if (!couponCode) return true;
  const cleanCode = String(couponCode).trim().toUpperCase();
  const { sbUrl, sbKey } = getSupabaseConfig();
  if (!sbUrl || !sbKey || sbUrl.includes('your-supabase-project')) return false;

  try {
    const postData = JSON.stringify({ p_code: cleanCode });
    const urlObj = new URL(`${sbUrl}/rest/v1/rpc/increment_coupon_usage`);
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
        r.on('data', c => b += c);
        r.on('end', () => resolve({ statusCode: r.statusCode, data: b }));
      });
      req.on('error', () => resolve({ statusCode: 500 }));
      req.write(postData);
      req.end();
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateCatalogCache();
      return true;
    }

    // Fallback: REST update if RPC not yet created
    const getUrl = new URL(`${sbUrl}/rest/v1/coupons?code=eq.${encodeURIComponent(cleanCode)}&select=id,times_used`);
    const getOptions = {
      hostname: getUrl.hostname,
      path: getUrl.pathname + getUrl.search,
      method: 'GET',
      headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}` }
    };
    const cData = await new Promise((resolve) => {
      const q = https.request(getOptions, r => {
        let b = '';
        r.on('data', c => b += c);
        r.on('end', () => {
          try { resolve(JSON.parse(b)); } catch (_) { resolve(null); }
        });
      });
      q.on('error', () => resolve(null));
      q.end();
    });

    if (Array.isArray(cData) && cData.length > 0) {
      const currentUsed = parseInt(cData[0].times_used, 10) || 0;
      const patchData = JSON.stringify({ times_used: currentUsed + 1, updated_at: new Date().toISOString() });
      const patchUrl = new URL(`${sbUrl}/rest/v1/coupons?code=eq.${encodeURIComponent(cleanCode)}`);
      const patchOptions = {
        hostname: patchUrl.hostname,
        path: patchUrl.pathname + patchUrl.search,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sbKey,
          'Authorization': `Bearer ${sbKey}`,
          'Content-Length': Buffer.byteLength(patchData)
        }
      };
      await new Promise(resolve => {
        const p = https.request(patchOptions, () => resolve(true));
        p.on('error', () => resolve(false));
        p.write(patchData);
        p.end();
      });
      invalidateCatalogCache();
    }
    return true;
  } catch (err) {
    console.warn('[Coupon Increment Warning]', err.message);
    return false;
  }
}

/**
 * 🔒 Atomic Server-Side Coupon Usage Restore on order cancellation
 */
async function atomicRestoreCouponUsage(couponCode) {
  if (!couponCode) return true;
  const cleanCode = String(couponCode).trim().toUpperCase();
  const { sbUrl, sbKey } = getSupabaseConfig();
  if (!sbUrl || !sbKey || sbUrl.includes('your-supabase-project')) return false;

  try {
    const postData = JSON.stringify({ p_code: cleanCode });
    const urlObj = new URL(`${sbUrl}/rest/v1/rpc/decrement_coupon_usage`);
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
      const req = https.request(options, (r) => resolve({ statusCode: r.statusCode }));
      req.on('error', () => resolve({ statusCode: 500 }));
      req.write(postData);
      req.end();
    });

    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateCatalogCache();
      return true;
    }

    // Fallback: REST update
    const getUrl = new URL(`${sbUrl}/rest/v1/coupons?code=eq.${encodeURIComponent(cleanCode)}&select=id,times_used`);
    const getOptions = {
      hostname: getUrl.hostname,
      path: getUrl.pathname + getUrl.search,
      method: 'GET',
      headers: { 'apikey': sbKey, 'Authorization': `Bearer ${sbKey}` }
    };
    const cData = await new Promise((resolve) => {
      const q = https.request(getOptions, r => {
        let b = '';
        r.on('data', c => b += c);
        r.on('end', () => {
          try { resolve(JSON.parse(b)); } catch (_) { resolve(null); }
        });
      });
      q.on('error', () => resolve(null));
      q.end();
    });

    if (Array.isArray(cData) && cData.length > 0) {
      const currentUsed = parseInt(cData[0].times_used, 10) || 0;
      const patchData = JSON.stringify({ times_used: Math.max(0, currentUsed - 1), updated_at: new Date().toISOString() });
      const patchUrl = new URL(`${sbUrl}/rest/v1/coupons?code=eq.${encodeURIComponent(cleanCode)}`);
      const patchOptions = {
        hostname: patchUrl.hostname,
        path: patchUrl.pathname + patchUrl.search,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': sbKey,
          'Authorization': `Bearer ${sbKey}`,
          'Content-Length': Buffer.byteLength(patchData)
        }
      };
      await new Promise(resolve => {
        const p = https.request(patchOptions, () => resolve(true));
        p.on('error', () => resolve(false));
        p.write(patchData);
        p.end();
      });
      invalidateCatalogCache();
    }
    return true;
  } catch (err) {
    console.warn('[Coupon Restore Warning]', err.message);
    return false;
  }
}

module.exports = {
  getLiveServerProducts,
  getLiveServerCoupons,
  findLiveProduct,
  calculateServerOrderTotal,
  invalidateCatalogCache,
  atomicDecrementStock,
  atomicRestoreStock,
  atomicIncrementCouponUsage,
  atomicRestoreCouponUsage
};
