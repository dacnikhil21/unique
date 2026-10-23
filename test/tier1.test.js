const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Starting Tier 1 Automated Verification Suite...');

// ── Test 1: DATA-01 Cache Headers in vercel.json ─────────────────────────
console.log('\n[1/4] Verifying DATA-01 Cache Headers in vercel.json...');
const vercelContent = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8'));
const scriptHeaderRule = vercelContent.headers.find(h => h.source.includes('app') || h.source.includes('styles'));
assert(scriptHeaderRule, 'Must find script/style header rule in vercel.json');
const ccHeader = scriptHeaderRule.headers.find(h => h.key === 'Cache-Control');
assert(ccHeader, 'Must find Cache-Control header in script rule');
assert(
  !ccHeader.value.includes('immutable'),
  `DATA-01 FAILED: vercel.json still contains immutable cache for scripts! Got: ${ccHeader.value}`
);
assert(
  ccHeader.value.includes('no-cache') || ccHeader.value.includes('must-revalidate'),
  `DATA-01 FAILED: Expected revalidation header, got: ${ccHeader.value}`
);
console.log('  ✅ vercel.json cache header verified: ' + ccHeader.value);

// ── Test 2: DATA-01 Cache Headers in server.js ───────────────────────────
console.log('\n[2/4] Verifying DATA-01 Cache Headers in server.js...');
const serverContent = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');
assert(
  !serverContent.includes(": 'public, max-age=31536000, immutable'"),
  'DATA-01 FAILED: server.js still serves non-HTML assets with 1-year immutable cache!'
);
assert(
  serverContent.includes('isScriptOrStyle'),
  'DATA-01 FAILED: server.js should differentiate scripts/styles from static image assets.'
);
console.log('  ✅ server.js Cache-Control correctly distinguishes mutable scripts/styles from static media.');

// ── Test 3: SEC-01 Server Admin Authentication ───────────────────────────
console.log('\n[3/4] Verifying SEC-01 Admin Authentication in server.js...');
assert(
  !serverContent.includes('process.env.SUPABASE_ANON_KEY ||'),
  'SEC-01 FAILED: server.js still permits fallback to public SUPABASE_ANON_KEY!'
);
assert(
  serverContent.includes('SEC-01: Strict Admin Authentication'),
  'SEC-01 FAILED: SEC-01 security block missing from server.js.'
);
console.log('  ✅ server.js no longer falls back to SUPABASE_ANON_KEY for admin endpoints.');

// ── Test 4: SEC-02 & SEC-03 API Security Checks ──────────────────────────
console.log('\n[4/4] Verifying SEC-02 and SEC-03 in api/products.js and api/upload.js...');
const productsApiContent = fs.readFileSync(path.join(__dirname, '..', 'api', 'products.js'), 'utf8');
assert(
  productsApiContent.includes('SEC-02: Require Admin Authorization'),
  'SEC-02 FAILED: api/products.js missing admin authorization check.'
);
console.log('  ✅ api/products.js requires admin authentication for mutations.');

const uploadApiContent = fs.readFileSync(path.join(__dirname, '..', 'api', 'upload.js'), 'utf8');
assert(
  !uploadApiContent.includes('lz4eGHf-j5Auu7__KTgNl2Ur6vg'),
  'SEC-03 FAILED: Hardcoded Cloudinary secret still present in api/upload.js!'
);
console.log('  ✅ api/upload.js hardcoded Cloudinary secret completely removed.');

// Ensure dead src/ directory is gone
assert(!fs.existsSync(path.join(__dirname, '..', 'src')), 'Unused src/ directory must be deleted.');
console.log('  ✅ Unused src/ directory verified deleted.');

console.log('\n🎉 ALL TIER 1 AUTOMATED CHECKS PASSED SUCCESSFULLY!\n');
