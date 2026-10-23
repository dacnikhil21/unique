/**
 * 🔒 ORD-01: In-Memory Idempotency Manager
 * Prevents double order placement, duplicate charges, and race conditions.
 */
const IDEMPOTENCY_STORE = new Map();
const TTL_MS = 10 * 60 * 1000; // 10 minutes

function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of IDEMPOTENCY_STORE.entries()) {
    if (now - entry.timestamp > TTL_MS) {
      IDEMPOTENCY_STORE.delete(key);
    }
  }
}

/**
 * Check if a request with this idempotency key is already cached
 */
function checkIdempotency(key) {
  if (!key) return null;
  cleanupExpired();
  return IDEMPOTENCY_STORE.get(String(key).trim()) || null;
}

/**
 * Mark an idempotency key as PENDING
 */
function startIdempotency(key) {
  if (!key) return;
  cleanupExpired();
  IDEMPOTENCY_STORE.set(String(key).trim(), {
    status: 'PENDING',
    timestamp: Date.now()
  });
}

/**
 * Save completed response for an idempotency key
 */
function completeIdempotency(key, responseData) {
  if (!key) return;
  IDEMPOTENCY_STORE.set(String(key).trim(), {
    status: 'COMPLETED',
    response: responseData,
    timestamp: Date.now()
  });
}

/**
 * Clear idempotency key on failure to allow retry
 */
function clearIdempotency(key) {
  if (!key) return;
  IDEMPOTENCY_STORE.delete(String(key).trim());
}

module.exports = {
  checkIdempotency,
  startIdempotency,
  completeIdempotency,
  clearIdempotency
};
