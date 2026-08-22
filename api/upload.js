const crypto = require('crypto');
const https = require('https');

const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'oqj0unl4',
  api_key: process.env.CLOUDINARY_API_KEY || '392727691414539',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'lz4eGHf-j5Auu7__KTgNl2Ur6vg',
  folder: process.env.CLOUDINARY_FOLDER || 'unique_expressions'
};

const ALLOWED_ORIGINS = [
  'https://shop.uniqueexpressions.in',
  'https://uniqueexpressions.in',
  'https://www.uniqueexpressions.in',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

function uploadToCloudinary(base64File) {
  return new Promise((resolve, reject) => {
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
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = await parseBody(req);
    const file = payload?.file;

    if (!file || (!file.startsWith('http') && !file.startsWith('data:'))) {
      return res.status(400).json({ error: 'Invalid image payload' });
    }

    if (file.length > 12 * 1024 * 1024) {
      return res.status(413).json({ error: 'Payload too large. Maximum file size is 12MB.' });
    }

    const result = await uploadToCloudinary(file);
    return res.status(200).json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
};
