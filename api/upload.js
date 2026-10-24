const crypto = require('crypto');
const https = require('https');

const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
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
    if (!CLOUDINARY_CONFIG.cloud_name || !CLOUDINARY_CONFIG.api_key || !CLOUDINARY_CONFIG.api_secret) {
      return reject(new Error('Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured on server.'));
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

  if (!CLOUDINARY_CONFIG.cloud_name || !CLOUDINARY_CONFIG.api_key || !CLOUDINARY_CONFIG.api_secret) {
    console.error('[Upload Alert] Cloudinary environment variables (CLOUD_NAME, API_KEY, API_SECRET) are not configured.');
    return sendResponse(res, 503, { error: 'Upload service unavailable: Cloudinary credentials not configured.' });
  }

  try {
    const payload = await parseBody(req);
    const file = payload?.file;

    if (!file || typeof file !== 'string') {
      return sendResponse(res, 400, { error: 'Invalid or missing image payload.' });
    }

    // Basic Safety: Accept images only (jpg, png, webp, gif)
    const isBase64Image = /^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(file);
    const isHttpImageUrl = /^https?:\/\/.*\.(jpeg|jpg|png|webp|gif)(\?.*)?$/i.test(file) ||
                           (file.startsWith('http') && (file.includes('cloudinary.com') || file.includes('unsplash.com')));

    if (!isBase64Image && !isHttpImageUrl) {
      return sendResponse(res, 400, { error: 'Invalid file format. Only JPG, PNG, WEBP, and GIF images are allowed.' });
    }

    // Basic Safety: Reject files larger than 5 MB
    if (file.startsWith('data:')) {
      const approxBytes = Math.ceil((file.length - file.indexOf(',') - 1) * 3 / 4);
      if (approxBytes > 5 * 1024 * 1024) {
        return sendResponse(res, 413, { error: 'Payload too large. Maximum file size is 5MB.' });
      }
    } else if (file.length > 7.5 * 1024 * 1024) {
      return sendResponse(res, 413, { error: 'Payload too large. Maximum file size is 5MB.' });
    }

    const result = await uploadToCloudinary(file);
    return sendResponse(res, 200, { success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    return sendResponse(res, 500, { error: err.message || 'Upload failed' });
  }
};
