const https = require('https');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://sfcxpvvqxldhdkvfyhgj.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmY3hwdnZxeGxkaGRrdmZ5aGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzU4MTQsImV4cCI6MjEwMTE1MTgxNH0.ZNWPL7xNiapsnOrvJ45uT6KpaFqcvzz4vv7R7WGx39c';

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
 *    and checked against ADMIN_EMAILS or role === 'admin'.
 */
async function verifyAdminRequest(req, payload = {}) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim() || (payload && payload.adminSecret);

  if (!token) {
    return { authorized: false, error: 'Missing authorization token.' };
  }

  // Check 1: Machine ADMIN_SECRET (Direct secret match)
  const configuredSecret = (process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (configuredSecret && token === configuredSecret) {
    return { authorized: true, user: { role: 'admin', type: 'service_secret' } };
  }

  // Check 2: Verify Supabase User JWT with Supabase Auth API
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(`${SUPABASE_URL}/auth/v1/user`);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'GET',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
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
                error: `Forbidden: Email "${userEmail || 'unknown'}" is not an authorized administrator email.`
              });
            }

            resolve({ authorized: false, error: 'Invalid or expired authentication session.' });
          } catch (e) {
            resolve({ authorized: false, error: 'Failed to parse authentication response.' });
          }
        });
      });

      sbReq.on('error', (err) => resolve({ authorized: false, error: err.message }));
      sbReq.end();
    } catch (err) {
      resolve({ authorized: false, error: err.message });
    }
  });
}

module.exports = {
  verifyAdminRequest,
  getAdminEmails
};
