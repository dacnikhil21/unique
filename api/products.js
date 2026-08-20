const rawUrl = process.env.SUPABASE_URL;
const SUPABASE_URL = (rawUrl && !rawUrl.includes('your-supabase-project')) ? rawUrl : 'https://sfcxpvvqxldhdkvfyhgj.supabase.co';

const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const SUPABASE_KEY = (rawKey && !rawKey.includes('your-anon-key') && rawKey.length > 30) ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmY3hwdnZxeGxkaGRrdmZ5aGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzU4MTQsImV4cCI6MjEwMTE1MTgxNH0.ZNWPL7xNiapsnOrvJ45uT6KpaFqcvzz4vv7R7WGx39c';

const ALLOWED_ORIGINS = [
  'https://shop.uniqueexpressions.in',
  'https://uniqueexpressions.in',
  'https://www.uniqueexpressions.in',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

function sbFetch(path, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(SUPABASE_URL + path);
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed?.message || parsed?.error || `Supabase HTTP ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
          else reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    req.end();
  });
}

async function parseBody(req) {
  if (req.body) return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { resolve({}); }
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const data = await sbFetch('/rest/v1/products?select=*&order=id.desc');
      return res.status(200).json({ success: true, data });
    }

    if (req.method === 'POST') {
      const payload = await parseBody(req);
      const action = payload.action || req.query.action || 'create';

      if (action === 'create') {
        const row = {
          title: payload.title,
          category: payload.category || 'General',
          image: payload.image || 'logo.png',
          price: parseInt(payload.price, 10) || 0,
          original_price: parseInt(payload.originalPrice || payload.original_price || payload.price, 10) || 0,
          discount: parseInt(payload.discount, 10) || 0,
          rating: parseFloat(payload.rating) || 4.8,
          reviews_count: parseInt(payload.reviewsCount || payload.reviews_count, 10) || 12,
          description: payload.description || '',
          in_stock: payload.inStock !== false && payload.in_stock !== false,
          stock_qty: Math.max(0, parseInt(payload.stockQty || payload.stock_qty, 10) || 10)
        };

        const result = await sbFetch('/rest/v1/products', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: row
        });

        const created = Array.isArray(result) ? result[0] : result;
        return res.status(200).json({ success: true, product: created });
      }

      if (action === 'update') {
        const id = payload.id;
        if (!id) return res.status(400).json({ error: 'Missing product ID' });

        const row = {
          title: payload.title,
          category: payload.category,
          image: payload.image,
          price: parseInt(payload.price, 10),
          original_price: parseInt(payload.originalPrice || payload.original_price || payload.price, 10),
          discount: parseInt(payload.discount, 10) || 0,
          rating: parseFloat(payload.rating) || 4.8,
          reviews_count: parseInt(payload.reviewsCount || payload.reviews_count, 10) || 12,
          description: payload.description || '',
          in_stock: payload.inStock !== false && payload.in_stock !== false,
          stock_qty: Math.max(0, parseInt(payload.stockQty || payload.stock_qty, 10) || 0)
        };

        const result = await sbFetch(`/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { 'Prefer': 'return=representation' },
          body: row
        });

        const updated = Array.isArray(result) ? result[0] : result;
        return res.status(200).json({ success: true, product: updated });
      }

      if (action === 'delete') {
        const id = payload.id;
        if (!id) return res.status(400).json({ error: 'Missing product ID' });

        await sbFetch(`/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
          method: 'DELETE'
        });

        return res.status(200).json({ success: true, message: `Product ${id} deleted` });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[API /api/products error]:', err.message);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
};
