const crypto = require('crypto');
const https = require('https');

const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'oqj0unl4',
  api_key: process.env.CLOUDINARY_API_KEY || '392727691414539',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  folder: process.env.CLOUDINARY_FOLDER || 'unique_expressions'
};

const ALLOWED_ORIGINS = [
  'https://shop.uniqueexpressions.in',
  'https://uniqueexpressions.in',
  'https://www.uniqueexpressions.in',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

function sendResponse(res, statusCode, data) {
  if (typeof res.status === 'function') {
    return res.status(statusCode).json(data);
  }
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function uploadToCloudinary(base64File) {
  return new Promise((resolve, reject) => {
    if (!CLOUDINARY_CONFIG.api_secret) {
      return reject(new Error('Cloudinary credentials (CLOUDINARY_API_SECRET) are not configured on server.'));
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `folder=${CLOUDINARY_CONFIG.folder}&timestamp=${timestamp}${CLOUDINARY_CONFIG.api_secret}`;
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

    const postData = new URLSearchParams({
      file: base64File,
      api_key: CLOUDINARY_CONFIG.api_key,
      timestamp: timestamp.toString(),
      folder: CLOUDINARY_CONFIG.folder,
      signature
    }).toString();

    const req = https.request({
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode === 200 && parsed.secure_url) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.error?.message || 'Cloudinary upload failed: ' + data));
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

async function parseBody(req) {
  if (req.body) {
    return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  }
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  const origin = req.headers?.origin || '';
  if (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') return res.status(204).end();
    res.writeHead(204);
    return res.end();
  }

  if (req.method !== 'POST') {
    return sendResponse(res, 405, { error: 'Method not allowed' });
  }

  // 🔒 SEC-03: Refuse execution if Cloudinary secret is unconfigured
  if (!CLOUDINARY_CONFIG.api_secret) {
    console.error('[Upload Security Alert] CLOUDINARY_API_SECRET is not configured on the server.');
    return sendResponse(res, 503, { error: 'Upload service unavailable: Cloudinary credentials not configured.' });
  }

  try {
    const payload = await parseBody(req);

    // 🔒 SEC-05: Authenticate admin user via Supabase JWT or machine secret
    const { verifyAdminRequest } = require('./auth-helper.js');
    const authCheck = await verifyAdminRequest(req, payload);
    if (!authCheck.authorized) {
      const statusCode = authCheck.statusCode || 401;
      return sendResponse(res, statusCode, { error: authCheck.error || 'Unauthorized admin access: login required to upload media.' });
    }

    const file = payload?.file;

    if (!file || (!file.startsWith('http') && !file.startsWith('data:'))) {
      return sendResponse(res, 400, { error: 'Invalid image payload' });
    }

    if (file.length > 12 * 1024 * 1024) {
      return sendResponse(res, 413, { error: 'Payload too large. Maximum file size is 12MB.' });
    }

    const result = await uploadToCloudinary(file);
    return sendResponse(res, 200, { success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    return sendResponse(res, 500, { error: err.message || 'Upload failed' });
  }
};
