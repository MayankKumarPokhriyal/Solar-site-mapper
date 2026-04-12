/**
 * In-flight deduplication plus TTL cache for identical NREL requests.
 * Survives React Strict Mode double-mounts and revisits without re-hitting upstream.
 */

const inFlight = new Map();
const entryCache = new Map();

/**
 * @param {string} key Stable cache key (include endpoint + rounded coords + param fingerprint).
 * @param {number} ttlMs Time-to-live for successful responses.
 * @param {number} maxEntries Cap; evicts oldest Map entries when exceeded.
 * @param {() => Promise<T>} fetcher Resolves to the value to cache (only on success).
 * @returns {Promise<T>}
 */
export async function withNrelCache(key, ttlMs, maxEntries, fetcher) {
  const now = Date.now();
  const hit = entryCache.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value;
  }

  const pending = inFlight.get(key);
  if (pending) {
    return pending;
  }

  const promise = (async () => {
    try {
      const value = await fetcher();
      while (entryCache.size >= maxEntries) {
        const oldest = entryCache.keys().next().value;
        entryCache.delete(oldest);
      }
      entryCache.set(key, { value, expiresAt: Date.now() + ttlMs });
      return value;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

/**
 * Rounds coordinates for stable cache keys (does not replace request lat/lon sent to NREL).
 */
export function roundCoord(value, decimals = 5) {
  const f = 10 ** decimals;
  return Math.round(Number(value) * f) / f;
}

export function nrelHttpErrorMessage(serviceLabel, status) {
  if (status === 429) {
    return "NREL rate limit—try again in a minute";
  }
  return `${serviceLabel} API returned status ${status}`;
}

export function sleepMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
