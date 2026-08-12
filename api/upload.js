const crypto = require('crypto');
const https = require('https');

const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'oqj0unl4',
  api_key: process.env.CLOUDINARY_API_KEY || '392727691414539',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',  // Must be set via env var
  folder: process.env.CLOUDINARY_FOLDER || 'unique_expressions'
};

const ALLOWED_ORIGINS = [
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
            reject(new Error(parsed.error?.message || 'Cloudinary upload failed'));
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

module.exports = async (req, res) => {
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (!CLOUDINARY_CONFIG.api_secret) {
    return res.status(503).json({ error: 'Upload service not configured. Contact support.' });
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const file = payload?.file;

    if (!file || (!file.startsWith('http') && !/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(file))) {
      return res.status(400).json({ error: 'Invalid image payload' });
    }

    if (file.length > 10 * 1024 * 1024) {
      return res.status(413).json({ error: 'Payload too large. Maximum file size is 10MB.' });
    }

    const result = await uploadToCloudinary(file);
    return res.status(200).json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Upload failed' });
  }
};
