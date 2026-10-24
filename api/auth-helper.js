const https = require('https');
const fs = require('fs');
const path = require('path');

// Ensure local .env is loaded if running in Node/serverless without preloaded env
function loadEnvIfNeeded() {
  if (process.env.SUPABASE_URL && !process.env.SUPABASE_URL.includes('your-supabase-project')) {
    return;
  }
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
          if (key && val && (!process.env[key] || process.env[key].includes('your-supabase-project'))) {
            process.env[key] = val;
          }
        }
      });
    } catch (_) {}
  }
}

function getSupabaseConfig() {
  loadEnvIfNeeded();

  let rawUrl = (process.env.SUPABASE_URL || '').trim();
  let anonKey = (process.env.SUPABASE_ANON_KEY || '').trim();

  // If set to placeholder string 'your-supabase-project', strip it
  if (rawUrl.includes('your-supabase-project')) {
    rawUrl = '';
  }

  // Use the canonical production SUPABASE_URL matching the rest of the application
  const url = rawUrl || 'https://sfcxpvvqxldhdkvfyhgj.supabase.co';

  if (!anonKey || anonKey.includes('your-anon-key')) {
    anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmY3hwdnZxeGxkaGRrdmZ5aGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzU4MTQsImV4cCI6MjEwMTE1MTgxNH0.ZNWPL7xNiapsnOrvJ45uT6KpaFqcvzz4vv7R7WGx39c';
  }

  return { url, anonKey };
}

function getAdminEmails() {
  const envEmails = process.env.ADMIN_EMAILS || 'uestore.online@gmail.com,uniqueexpressions.in@gmail.com';
  return envEmails.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
}

/**
 * 🔒 SEC-05 & SEC-01 Helper:
 * Verifies if an incoming HTTP request is authenticated as an Administrator.
 * Supports:
 * 1. Machine-to-machine ADMIN_SECRET via Authorization: Bearer <secret>
 * 2. Authenticated Supabase user JWT via Authorization: Bearer <token>, verified with Supabase Auth
 *    and checked against ADMIN_EMAILS.
 */
async function verifyAdminRequest(req, payload = {}) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || (payload && payload.adminSecret);

  if (!token) {
    return { authorized: false, statusCode: 401, error: 'Missing authorization token.' };
  }

  // Check 1: Machine ADMIN_SECRET (Direct secret match)
  const configuredSecret = (process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (configuredSecret && token === configuredSecret) {
    return { authorized: true, user: { role: 'admin', type: 'service_secret' } };
  }

  // Check 2: Supabase URL Validation (never call a placeholder)
  const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();
  if (!supabaseUrl || supabaseUrl.includes('your-supabase-project')) {
    return {
      authorized: false,
      statusCode: 500,
      error: 'Server authentication service not configured. SUPABASE_URL environment variable is missing.'
    };
  }

  // Check 3: Verify Supabase User JWT with Supabase Auth API
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(`${supabaseUrl}/auth/v1/user`);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`
        }
      };

      const sbReq = https.request(options, (sbRes) => {
        let data = '';
        sbRes.on('data', chunk => data += chunk);
        sbRes.on('end', () => {
          try {
            if (sbRes.statusCode >= 200 && sbRes.statusCode < 300) {
              const user = JSON.parse(data);
              const userEmail = (user.email || '').toLowerCase().trim();
              const adminEmails = getAdminEmails();

              const isAdminEmail = adminEmails.includes(userEmail);

              if (isAdminEmail) {
                return resolve({ authorized: true, user });
              }

              return resolve({
                authorized: false,
                statusCode: 403,
                error: `Forbidden: Email "${userEmail || 'unknown'}" is not an authorized administrator email.`
              });
            }

            if (sbRes.statusCode === 401 || sbRes.statusCode === 403) {
              return resolve({ authorized: false, statusCode: 401, error: 'Invalid or expired authentication session.' });
            }

            resolve({
              authorized: false,
              statusCode: sbRes.statusCode || 500,
              error: 'Authentication service returned an unexpected response.'
            });
          } catch (e) {
            resolve({ authorized: false, statusCode: 500, error: 'Failed to parse authentication response.' });
          }
        });
      });

      sbReq.on('error', (err) => resolve({
        authorized: false,
        statusCode: 502,
        error: `Authentication service unavailable: ${err.message}`
      }));
      sbReq.end();
    } catch (err) {
      resolve({ authorized: false, statusCode: 500, error: `Internal auth error: ${err.message}` });
    }
  });
}

module.exports = {
  verifyAdminRequest,
  getAdminEmails
};
