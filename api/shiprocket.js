const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Shiprocket Configuration
const SHIPROCKET_CONFIG = {
  email: process.env.SHIPROCKET_EMAIL || '',
  password: process.env.SHIPROCKET_PASSWORD || '',
  pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || 'work',
  pickup_pincode: process.env.SHIPROCKET_PICKUP_PINCODE || '530041'
};

const ALLOWED_ORIGINS = [
  'https://shop.uniqueexpressions.in',
  'https://uniqueexpressions.in',
  'https://www.uniqueexpressions.in',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

// Token Cache
let cachedToken = null;
let tokenExpiresAt = 0; // Timestamp in ms

/**
 * Make HTTPS Request to Shiprocket API
 */
function makeShiprocketRequest(endpoint, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : null;
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: 'apiv2.shiprocket.in',
      path: endpoint,
      method: method,
      headers: headers
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => { responseBody += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody || '{}');
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            const errMsg = parsed.message || (parsed.errors ? JSON.stringify(parsed.errors) : `Shiprocket API Error (${res.statusCode})`);
            const err = new Error(errMsg);
            err.statusCode = res.statusCode;
            err.details = parsed;
            reject(err);
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ raw: responseBody });
          } else {
            reject(new Error(`Shiprocket API HTTP ${res.statusCode}: ${responseBody}`));
          }
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) req.write(postData);
    req.end();
  });
}

/**
 * Authenticate with Shiprocket and retrieve / cache JWT Bearer token
 */
async function getAuthToken(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedToken && tokenExpiresAt > now + 60000) {
    return cachedToken;
  }

  if (!SHIPROCKET_CONFIG.email || !SHIPROCKET_CONFIG.password) {
    throw new Error('Shiprocket credentials (SHIPROCKET_EMAIL / SHIPROCKET_PASSWORD) are not configured.');
  }

  const res = await makeShiprocketRequest('/v1/external/auth/login', 'POST', {
    email: SHIPROCKET_CONFIG.email,
    password: SHIPROCKET_CONFIG.password
  });

  if (res && res.token) {
    cachedToken = res.token;
    // JWT token is valid for 10 days (864,000,000 ms), cache for 9 days
    tokenExpiresAt = now + (9 * 24 * 60 * 60 * 1000);
    return cachedToken;
  }

  throw new Error('Failed to retrieve authentication token from Shiprocket.');
}

/**
 * Parse client address components into structured fields
 */
function parseAddress(rawAddress, defaultCity = 'Visakhapatnam', defaultState = 'Andhra Pradesh', defaultPin = '530041') {
  if (!rawAddress) {
    return {
      address: 'Madhurawada',
      city: defaultCity,
      state: defaultState,
      pincode: defaultPin
    };
  }

  let str = String(rawAddress).trim();
  let pincode = defaultPin;

  // Extract 6-digit Indian pincode
  const pinMatch = str.match(/\b([1-9][0-9]{5})\b/);
  if (pinMatch) {
    pincode = pinMatch[1];
  }

  // Common Indian states recognition
  const stateList = [
    'Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Maharashtra',
    'Kerala', 'Delhi', 'Gujarat', 'Uttar Pradesh', 'Rajasthan', 'West Bengal',
    'Madhya Pradesh', 'Punjab', 'Haryana', 'Odisha', 'Assam', 'Bihar'
  ];

  let foundState = defaultState;
  for (const s of stateList) {
    if (new RegExp(`\\b${s}\\b`, 'i').test(str)) {
      foundState = s;
      break;
    }
  }

  // Extract City if possible
  const parts = str.split(',').map(p => p.trim()).filter(Boolean);
  let city = defaultCity;
  if (parts.length >= 3) {
    city = parts[parts.length - 2].replace(/\b[0-9]{6}\b/g, '').trim() || defaultCity;
  } else if (parts.length === 2) {
    city = parts[1].replace(/\b[0-9]{6}\b/g, '').trim() || defaultCity;
  }

  const cleanAddress = parts.slice(0, Math.max(1, parts.length - 1)).join(', ') || str;

  return {
    address: cleanAddress.slice(0, 100) || 'Delivery Location',
    city: city || 'Visakhapatnam',
    state: foundState,
    pincode: pincode
  };
}

/**
 * Format order payload and push to Shiprocket Adhoc Order API
 */
async function createShiprocketOrder(orderData) {
  const token = await getAuthToken();

  const customerName = (orderData.customerName || orderData.name || 'Customer').trim();
  const nameParts = customerName.split(' ');
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || '.';

  const addrInfo = parseAddress(orderData.address);
  const pincode = orderData.pincode || addrInfo.pincode;

  const phone = (orderData.phone || '9999999999').replace(/\D/g, '').slice(-10);
  const email = orderData.email || 'orders@uniqueexpressions.in';

  // Format Items
  const items = Array.isArray(orderData.items) && orderData.items.length > 0 ? orderData.items : [{
    title: 'Product Package',
    id: 'UE-ITEM-1',
    qty: 1,
    price: orderData.totalAmount || 499
  }];

  const orderItems = items.map((item, idx) => {
    const qty = parseInt(item.qty || item.quantity, 10) || 1;
    const price = parseFloat(item.price) || 0;
    return {
      name: (item.title || `Item ${idx + 1}`).slice(0, 50),
      sku: String(item.id || `UE-SKU-${idx + 1}`).slice(0, 30),
      units: qty,
      selling_price: price,
      discount: 0,
      tax: 0,
      hsn: 9503 // Standard HSN code for Toys & Games
    };
  });

  const isCOD = String(orderData.paymentMethod || '').toLowerCase().includes('cash on delivery') ||
                String(orderData.paymentMethod || '').toLowerCase().includes('cod');

  const now = new Date();
  const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const payload = {
    order_id: orderData.orderId || ('UE-' + Date.now()),
    order_date: formattedDate,
    pickup_location: SHIPROCKET_CONFIG.pickup_location || 'Primary',
    channel_id: '',
    comment: orderData.notes || 'Express Order from Unique Expressions',
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: addrInfo.address,
    billing_address_2: '',
    billing_city: addrInfo.city,
    billing_pincode: pincode,
    billing_state: addrInfo.state,
    billing_country: 'India',
    billing_email: email,
    billing_phone: phone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: isCOD ? 'COD' : 'Prepaid',
    shipping_charges: parseFloat(orderData.shippingFee) || 0,
    giftwrap_charges: 0,
    transaction_charges: 0,
    total_discount: parseFloat(orderData.discountAmount) || 0,
    sub_total: parseFloat(orderData.totalAmount || orderData.grandTotal) || 499,
    length: 15,
    breadth: 15,
    height: 10,
    weight: 0.5 // Default 500g
  };

  try {
    const res = await makeShiprocketRequest('/v1/external/orders/create/adhoc', 'POST', payload, token);
    return res;
  } catch (err) {
    // If token expired, force refresh once and retry
    if (err.statusCode === 401) {
      const freshToken = await getAuthToken(true);
      return await makeShiprocketRequest('/v1/external/orders/create/adhoc', 'POST', payload, freshToken);
    }
    throw err;
  }
}

/**
 * Assign courier and generate AWB
 */
async function generateAwb(shipmentId, courierId = null) {
  const token = await getAuthToken();
  const payload = { shipment_id: shipmentId };
  if (courierId) payload.courier_id = courierId;

  try {
    const res = await makeShiprocketRequest('/v1/external/courier/assign/awb', 'POST', payload, token);
    return res;
  } catch (err) {
    if (err.statusCode === 401) {
      const freshToken = await getAuthToken(true);
      return await makeShiprocketRequest('/v1/external/courier/assign/awb', 'POST', payload, freshToken);
    }
    throw err;
  }
}

/**
 * Fetch Live Courier Tracking Information
 */
async function trackShipment(identifier, type = 'awb') {
  const token = await getAuthToken();
  const endpoint = type === 'awb'
    ? `/v1/external/courier/track/awb/${encodeURIComponent(identifier)}`
    : `/v1/external/courier/track/shipment/${encodeURIComponent(identifier)}`;

  try {
    const res = await makeShiprocketRequest(endpoint, 'GET', null, token);
    return res;
  } catch (err) {
    if (err.statusCode === 401) {
      const freshToken = await getAuthToken(true);
      return await makeShiprocketRequest(endpoint, 'GET', null, freshToken);
    }
    throw err;
  }
}

/**
 * Generate Shipping Label PDF
 */
async function generateLabel(shipmentIds) {
  const token = await getAuthToken();
  const ids = Array.isArray(shipmentIds) ? shipmentIds : [shipmentIds];
  const payload = { shipment_id: ids };

  try {
    const res = await makeShiprocketRequest('/v1/external/courier/generate/label', 'POST', payload, token);
    return res;
  } catch (err) {
    if (err.statusCode === 401) {
      const freshToken = await getAuthToken(true);
      return await makeShiprocketRequest('/v1/external/courier/generate/label', 'POST', payload, freshToken);
    }
    throw err;
  }
}

/**
 * Check Serviceability for Delivery Pincode
 */
async function checkServiceability(deliveryPincode, weight = 0.5, cod = 0) {
  const token = await getAuthToken();
  const pickupPincode = SHIPROCKET_CONFIG.pickup_pincode;
  const endpoint = `/v1/external/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${deliveryPincode}&weight=${weight}&cod=${cod}`;

  try {
    const res = await makeShiprocketRequest(endpoint, 'GET', null, token);
    return res;
  } catch (err) {
    if (err.statusCode === 401) {
      const freshToken = await getAuthToken(true);
      return await makeShiprocketRequest(endpoint, 'GET', null, freshToken);
    }
    throw err;
  }
}

/**
 * Main API Handler for Serverless / Node.js
 */
module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status ? res.status(204).end() : (res.writeHead(204), res.end());
  }

  // Parse Body
  let payload = req.body;
  if (!payload && typeof req.on === 'function') {
    try {
      payload = await new Promise((resolve) => {
        let data = '';
        req.on('data', chunk => { data += chunk; });
        req.on('end', () => {
          try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
        });
        req.on('error', () => resolve({}));
      });
    } catch (e) {
      payload = {};
    }
  } else if (typeof payload === 'string') {
    try { payload = JSON.parse(payload); } catch (e) { payload = {}; }
  }
  payload = payload || {};

  const urlPath = (req.url || '').split('?')[0];
  const action = req.query?.action || payload.action ||
    (urlPath.endsWith('/create-order') ? 'create-order' :
    (urlPath.endsWith('/generate-awb') ? 'generate-awb' :
    (urlPath.endsWith('/track') ? 'track' :
    (urlPath.endsWith('/label') ? 'label' :
    (urlPath.endsWith('/serviceability') ? 'serviceability' :
    (urlPath.endsWith('/status') ? 'status' : ''))))));

  const sendJson = (status, data) => {
    if (res.status && typeof res.json === 'function') {
      return res.status(status).json(data);
    }
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  };

  try {
    // 1. Health / Config Check
    if (req.method === 'GET' && (!action || action === 'status')) {
      const isConfigured = !!(SHIPROCKET_CONFIG.email && SHIPROCKET_CONFIG.password);
      return sendJson(200, {
        success: true,
        configured: isConfigured,
        pickup_location: SHIPROCKET_CONFIG.pickup_location,
        pickup_pincode: SHIPROCKET_CONFIG.pickup_pincode
      });
    }

    // 2. Check Serviceability
    if (action === 'serviceability') {
      const pin = req.query?.pincode || payload.pincode;
      if (!pin || pin.length !== 6) {
        return sendJson(400, { error: 'Valid 6-digit pincode is required.' });
      }
      const data = await checkServiceability(pin, payload.weight || 0.5, payload.cod ? 1 : 0);
      return sendJson(200, { success: true, data });
    }

    // 3. Create Adhoc Order in Shiprocket
    if (action === 'create-order' && req.method === 'POST') {
      const orderRes = await createShiprocketOrder(payload);
      
      // If order created successfully, attempt automatic AWB generation if shipment_id present
      let awbData = null;
      if (orderRes && orderRes.shipment_id) {
        try {
          awbData = await generateAwb(orderRes.shipment_id);
        } catch (awbErr) {
          console.warn('[Shiprocket AWB Info]', awbErr.message);
        }
      }

      return sendJson(200, {
        success: true,
        shiprocket_order_id: orderRes.order_id,
        shipment_id: orderRes.shipment_id,
        status: orderRes.status,
        status_code: orderRes.status_code,
        awb: awbData?.response?.data?.awb_code || orderRes.awb_code || null,
        courier_name: awbData?.response?.data?.courier_name || orderRes.courier_name || null,
        raw: orderRes
      });
    }

    // 4. Generate AWB
    if (action === 'generate-awb' && req.method === 'POST') {
      if (!payload.shipment_id) {
        return sendJson(400, { error: 'shipment_id is required.' });
      }
      const awbRes = await generateAwb(payload.shipment_id, payload.courier_id);
      return sendJson(200, { success: true, data: awbRes });
    }

    // 5. Track Shipment
    if (action === 'track') {
      const awb = req.query?.awb || payload.awb;
      const shipmentId = req.query?.shipment_id || payload.shipment_id;
      if (!awb && !shipmentId) {
        return sendJson(400, { error: 'AWB number or shipment_id is required for tracking.' });
      }
      const trackData = await trackShipment(awb || shipmentId, awb ? 'awb' : 'shipment');
      return sendJson(200, { success: true, tracking: trackData });
    }

    // 6. Generate Shipping Label PDF
    if (action === 'label') {
      const shipmentId = req.query?.shipment_id || payload.shipment_id;
      if (!shipmentId) {
        return sendJson(400, { error: 'shipment_id is required to generate label.' });
      }
      const labelData = await generateLabel(shipmentId);
      return sendJson(200, { success: true, label: labelData });
    }

    // 7. Webhook Receiver for live status updates from Shiprocket
    if (action === 'webhook' && req.method === 'POST') {
      console.log('[Shiprocket Webhook Event]', JSON.stringify(payload));
      return sendJson(200, { success: true, message: 'Webhook received' });
    }

    return sendJson(400, { error: `Unknown Shiprocket action: ${action}` });
  } catch (err) {
    console.error('[Shiprocket API Error]', err.message, err.details || '');
    return sendJson(err.statusCode || 500, {
      success: false,
      error: err.message || 'Internal Shiprocket API Error',
      details: err.details || null
    });
  }
};
