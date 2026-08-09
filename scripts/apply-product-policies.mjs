/**
 * Applies product RLS policies to Supabase.
 * Requires SUPABASE_DB_PASSWORD in .env (from Supabase Dashboard → Project Settings → Database).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

function loadEnv() {
  const envPath = path.join(root, '.env');
  if (!fs.existsSync(envPath)) return;
  fs.readFileSync(envPath, 'utf8').split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (key && val && !process.env[key]) process.env[key] = val;
  });
}

loadEnv();

const projectRef = (process.env.SUPABASE_URL || 'https://sfcxpvvqxldhdkvfyhgj.supabase.co')
  .replace(/^https?:\/\//, '')
  .replace('.supabase.co', '');

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error('\nMissing SUPABASE_DB_PASSWORD in .env');
  console.error('Get it from: Supabase Dashboard → Project Settings → Database → Database password\n');
  process.exit(1);
}

const connectionString =
  process.env.SUPABASE_DB_URL ||
  `postgresql://postgres.${projectRef}:${encodeURIComponent(password)}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres`;

const sql = fs.readFileSync(path.join(__dirname, 'apply-product-policies.sql'), 'utf8');

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log('Product policies applied successfully.');
} catch (err) {
  console.error('Failed to apply policies:', err.message);
  if (err.message.includes('Tenant or user not found')) {
    console.error('Tip: Your DB region may differ. Set SUPABASE_DB_URL in .env with the full connection string from the Supabase dashboard.');
  }
  process.exit(1);
} finally {
  await client.end();
}
