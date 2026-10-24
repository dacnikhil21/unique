/**
 * UNIQUE EXPRESSIONS - ENVIRONMENT CONFIGURATION VALIDATOR
 * Run locally via: npm run check-env
 * Never logs or exposes actual credential values.
 */
const fs = require('fs');
const path = require('path');

// Load .env if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.replace(/\r/g, '').trim();
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

const REQUIRED_VARIABLES = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_SECRET',
  'ADMIN_EMAILS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'SHIPROCKET_EMAIL',
  'SHIPROCKET_PASSWORD',
  'SHIPROCKET_PICKUP_LOCATION',
  'RESEND_API_KEY',
  'EMAIL_FROM'
];

function evaluateVariable(key, val) {
  if (!val || typeof val !== 'string' || val.trim() === '') {
    return 'MISSING';
  }

  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();

  const placeholderPatterns = [
    'your',
    'xxx',
    'example',
    'placeholder',
    'change_me',
    '<',
    '>'
  ];

  for (const pattern of placeholderPatterns) {
    if (lower.includes(pattern)) {
      return 'PLACEHOLDER';
    }
  }

  // SUPABASE_URL must end with .supabase.co (ignoring trailing slash)
  if (key === 'SUPABASE_URL') {
    const cleanUrl = trimmed.replace(/\/+$/, '');
    if (!cleanUrl.endsWith('.supabase.co')) {
      return 'PLACEHOLDER';
    }
  }

  // Supabase JWT keys must start with "eyJ"
  if (key === 'SUPABASE_ANON_KEY' || key === 'SUPABASE_SERVICE_ROLE_KEY') {
    if (!trimmed.startsWith('eyJ')) {
      return 'PLACEHOLDER';
    }
  }

  return 'OK';
}

function runCheck() {
  console.log('\n======================================================');
  console.log('       UNIQUE EXPRESSIONS - CONFIGURATION CHECK       ');
  console.log('======================================================\n');

  let hasErrors = false;
  const results = [];

  for (const key of REQUIRED_VARIABLES) {
    const val = process.env[key];
    const status = evaluateVariable(key, val);
    results.push({ Variable: key, Status: status });
    if (status !== 'OK') {
      hasErrors = true;
    }
  }

  // Format table output
  console.table(results);

  if (hasErrors) {
    console.log('\n❌ One or more environment variables are MISSING or contain PLACEHOLDERS.');
    console.log('Please configure them properly in your .env or host dashboard.\n');
    process.exit(1);
  } else {
    console.log('\n✅ All required environment variables are configured with valid formats.\n');
    process.exit(0);
  }
}

runCheck();
