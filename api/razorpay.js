const crypto = require('crypto');
const https = require('https');

const RAZORPAY_CONFIG = {
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
};

const ALLOWED_ORIGINS = [
  'https://uniqueexpressions.in',
  'https://www.uniqueexpressions.in',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

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
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (!RAZORPAY_CONFIG.key_id || !RAZORPAY_CONFIG.key_secret) {
    return res.status(503).json({ error: 'Razorpay payment gateway not configured.' });
  }

  // Handle action by query or url param: ?action=config, ?action=create-order, ?action=verify-payment
  const action = req.query?.action || (req.url.includes('/create-order') ? 'create-order' : (req.url.includes('/verify-payment') ? 'verify-payment' : (req.url.includes('/config') ? 'config' : '')));

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
      const amount = parseFloat(payload.amount);
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: 'Invalid order amount.' });
      }

      // Convert to paise (e.g. ₹100 = 10000 paise)
      const amountInPaise = Math.round(amount * 100);
      try {
        const order = await createRazorpayOrder(amountInPaise, payload.receipt, payload.notes || {});
        return res.status(200).json({
          success: true,
          order: order,
          keyId: RAZORPAY_CONFIG.key_id
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

    return res.status(400).json({ error: 'Unknown action specified.' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
