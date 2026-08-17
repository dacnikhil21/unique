const http = require('http');
const fs = require('fs');
const path = require('path');

// Load Environment Variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (key && val && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const PORT = process.env.PORT || 5000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Validate required environment variables at startup
if (!process.env.CLOUDINARY_API_SECRET) {
  console.error('[FATAL] CLOUDINARY_API_SECRET environment variable is not set. Server will not handle uploads.');
}

const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'oqj0unl4',
  api_key: process.env.CLOUDINARY_API_KEY || '392727691414539',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  folder: process.env.CLOUDINARY_FOLDER || 'unique_expressions'
};

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

const server = http.createServer((req, res) => {
  // CORS Headers — restricted to known origins only
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Security Headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Handle Cloudinary Upload API Endpoint
  if (req.method === 'POST' && req.url === '/api/upload') {
    let body = '';
    let isTooLarge = false;
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 10 * 1024 * 1024) {
        isTooLarge = true;
      }
    });
    req.on('end', () => {
      if (isTooLarge) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Payload too large. Maximum file size is 10MB.' }));
      }
      try {
        const payload = JSON.parse(body);
        if (!payload.file || (!payload.file.startsWith('http') && !/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(payload.file))) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid image payload. Only valid PNG, JPEG, WEBP, or GIF images are allowed.' }));
        }

        const timestamp = Math.floor(Date.now() / 1000);
        const crypto = require('crypto');
        const https = require('https');

        // Construct parameters to sign sorted alphabetically
        const stringToSign = `folder=${CLOUDINARY_CONFIG.folder}&timestamp=${timestamp}${CLOUDINARY_CONFIG.api_secret}`;
        const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

        const postData = new URLSearchParams({
          file: payload.file,
          api_key: CLOUDINARY_CONFIG.api_key,
          timestamp: timestamp.toString(),
          folder: CLOUDINARY_CONFIG.folder,
          signature: signature
        }).toString();

        const options = {
          hostname: 'api.cloudinary.com',
          path: `/v1_1/${CLOUDINARY_CONFIG.cloud_name}/image/upload`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const cReq = https.request(options, (cRes) => {
          let cData = '';
          cRes.on('data', chunk => { cData += chunk; });
          cRes.on('end', () => {
            try {
              const cloudRes = JSON.parse(cData);
              if (cRes.statusCode === 200 && cloudRes.secure_url) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, url: cloudRes.secure_url, public_id: cloudRes.public_id }));
              } else {
                res.writeHead(cRes.statusCode || 500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: cloudRes.error?.message || 'Cloudinary upload failed' }));
              }
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid response from Cloudinary API' }));
            }
          });
        });

        cReq.on('error', (err) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message || 'Network error reaching Cloudinary' }));
        });

        cReq.write(postData);
        cReq.end();
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON request body' }));
      }
    });
    return;
  }

  // Handle Razorpay Public Config Endpoint
  if (req.method === 'GET' && (req.url.startsWith('/api/razorpay/config') || req.url === '/api/razorpay?action=config')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      success: true,
      keyId: RAZORPAY_CONFIG.key_id
    }));
  }

  // Handle Razorpay Create Order Endpoint
  if (req.method === 'POST' && (req.url.startsWith('/api/razorpay/create-order') || req.url === '/api/razorpay?action=create-order')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const amount = parseFloat(payload.amount);
        if (isNaN(amount) || amount <= 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Invalid order amount' }));
        }

        if (!RAZORPAY_CONFIG.key_id || !RAZORPAY_CONFIG.key_secret) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Razorpay keys not configured' }));
        }

        const amountInPaise = Math.round(amount * 100);
        const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_CONFIG.key_id}:${RAZORPAY_CONFIG.key_secret}`).toString('base64');
        const postData = JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: payload.receipt || ('rcpt_' + Date.now()),
          notes: payload.notes || {}
        });

        const https = require('https');
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

        const rzpReq = https.request(options, (rzpRes) => {
          let rzpData = '';
          rzpRes.on('data', chunk => { rzpData += chunk; });
          rzpRes.on('end', () => {
            try {
              const parsed = JSON.parse(rzpData);
              if (rzpRes.statusCode >= 200 && rzpRes.statusCode < 300) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                  success: true,
                  order: parsed,
                  keyId: RAZORPAY_CONFIG.key_id
                }));
              } else {
                res.writeHead(rzpRes.statusCode || 500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: parsed.error?.description || 'Razorpay order creation failed' }));
              }
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Invalid response from Razorpay' }));
            }
          });
        });

        rzpReq.on('error', (err) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message || 'Network error reaching Razorpay' }));
        });

        rzpReq.write(postData);
        rzpReq.end();
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON request body' }));
      }
    });
    return;
  }

  // Handle Razorpay Verify Payment Endpoint
  if (req.method === 'POST' && (req.url.startsWith('/api/razorpay/verify-payment') || req.url === '/api/razorpay?action=verify-payment')) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Missing payment verification details' }));
        }

        const crypto = require('crypto');
        const expectedSignature = crypto
          .createHmac('sha256', RAZORPAY_CONFIG.key_secret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

        let isValid = false;
        try {
          isValid = crypto.timingSafeEqual(
            Buffer.from(expectedSignature, 'utf8'),
            Buffer.from(razorpay_signature, 'utf8')
          );
        } catch (e) {
          isValid = false;
        }

        if (isValid) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: true,
            verified: true,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id
          }));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            success: false,
            verified: false,
            error: 'Signature verification failed'
          }));
        }
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });
    return;
  }


  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  let filePath = path.join(PUBLIC_DIR, reqPath);

  // Fallback to index.html for SPA routes if file doesn't exist
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    } else {
      // Cache static assets aggressively (JS/CSS/images have version query strings)
      // HTML is always kept fresh for SPA routing
      const isHtml = ext === '.html' || ext === '';
      const cacheControl = isHtml
        ? 'no-store, no-cache, must-revalidate'
        : 'public, max-age=31536000, immutable';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': cacheControl
      });
      res.end(content);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
