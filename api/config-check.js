/**
 * GET /api/config-check
 * Protected configuration healthcheck endpoint for Vercel and local server.
 * Requires: Authorization: Bearer <ADMIN_SECRET>
 * Never returns actual credential values.
 */
const fs = require('fs');
const path = require('path');

// Ensure local .env is loaded if running in Node/local dev
function loadEnvIfNeeded() {
  if (process.env.ADMIN_SECRET) return;
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.replace(/\r/g, '').trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=');
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
          if (key && val && !process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    } catch (_) {}
  }
}

const REQUIRED_VARIABLES = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_SECRET',
  'ADMIN_EMAILS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'SHIPROCKET_EMAIL',
  'SHIPROCKET_PASSWORD',
  'SHIPROCKET_PICKUP_LOCATION',
  'RESEND_API_KEY',
  'EMAIL_FROM'
];

function evaluateVariable(key, val) {
  if (!val || typeof val !== 'string' || val.trim() === '') {
    return 'MISSING';
  }

  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();

  const placeholderPatterns = [
    'your',
    'xxx',
    'example',
    'placeholder',
    'change_me',
    '<',
    '>'
  ];

  for (const pattern of placeholderPatterns) {
    if (lower.includes(pattern)) {
      return 'PLACEHOLDER';
    }
  }

  // SUPABASE_URL must end with .supabase.co (ignoring trailing slash)
  if (key === 'SUPABASE_URL') {
    const cleanUrl = trimmed.replace(/\/+$/, '');
    if (!cleanUrl.endsWith('.supabase.co')) {
      return 'PLACEHOLDER';
    }
  }

  // Supabase JWT keys must start with "eyJ"
  if (key === 'SUPABASE_ANON_KEY' || key === 'SUPABASE_SERVICE_ROLE_KEY') {
    if (!trimmed.startsWith('eyJ')) {
      return 'PLACEHOLDER';
    }
  }

  return 'OK';
}

function sendResponse(res, statusCode, data) {
  if (typeof res.status === 'function') {
    return res.status(statusCode).json(data);
  }
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendResponse(res, 405, { error: 'Method Not Allowed. Use GET.' });
  }

  loadEnvIfNeeded();

  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  const adminSecret = (process.env.ADMIN_SECRET || '').trim();

  if (!adminSecret) {
    return sendResponse(res, 500, {
      error: 'Server misconfiguration: ADMIN_SECRET is not configured on the server.'
    });
  }

  if (!token || token !== adminSecret) {
    return sendResponse(res, 401, {
      error: 'Unauthorized: Invalid or missing admin secret.'
    });
  }

  const configStatus = {};
  let allOk = true;

  for (const key of REQUIRED_VARIABLES) {
    const val = process.env[key];
    const status = evaluateVariable(key, val);
    configStatus[key] = status;
    if (status !== 'OK') {
      allOk = false;
    }
  }

  return sendResponse(res, 200, {
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    config: configStatus
  });
};
