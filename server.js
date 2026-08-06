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

const CLOUDINARY_CONFIG = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'oqj0unl4',
  api_key: process.env.CLOUDINARY_API_KEY || '392727691414539',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'lz4eGHf-j5Auu7__KTgNl2Ur6vg',
  folder: process.env.CLOUDINARY_FOLDER || 'unique_expressions'
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
