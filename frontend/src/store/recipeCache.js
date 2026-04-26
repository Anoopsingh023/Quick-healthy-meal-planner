/**
 * recipeCache.js
 *
 * Caches raw recipe data ONLY — never stores isSaved, isLiked, or any
 * user-specific state. This means cache is never invalidated by user actions.
 *
 * Storage layers (fastest → slowest):
 *   1. Memory  — Map<cacheKey, CacheEntry>  (lives as long as the tab is open)
 *   2. sessionStorage — survives navigation, cleared on tab close
 *
 * CacheEntry shape:
 *   { recipes: Recipe[], page: number, hasMore: boolean, ts: number }
 */

const CACHE_PREFIX = "rc:"; // "rc" = recipe cache
const TTL_MS = 5 * 60 * 1000; // 5 min — tweak as needed

// In-memory layer
const memCache = new Map();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isExpired(entry) {
  return Date.now() - entry.ts > TTL_MS;
}

function ssKey(key) {
  return CACHE_PREFIX + key;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Read from memory first, then sessionStorage.
 * Returns null on miss or expiry.
 *
 * @param {string} key
 * @returns {{ recipes: object[], page: number, hasMore: boolean } | null}
 */
export function getCache(key) {
  // 1. Memory
  const mem = memCache.get(key);
  if (mem) {
    if (isExpired(mem)) {
      memCache.delete(key);
    } else {
      return mem;
    }
  }

  // 2. sessionStorage
  try {
    const raw = sessionStorage.getItem(ssKey(key));
    if (!raw) return null;

    const entry = JSON.parse(raw);
    if (isExpired(entry)) {
      sessionStorage.removeItem(ssKey(key));
      return null;
    }

    // Promote back to memory
    memCache.set(key, entry);
    return entry;
  } catch {
    return null;
  }
}

/**
 * Write to both memory and sessionStorage.
 *
 * @param {string} key
 * @param {{ recipes: object[], page: number, hasMore: boolean }} value
 */
export function setCache(key, value) {
  const entry = { ...value, ts: Date.now() };
  memCache.set(key, entry);
  try {
    sessionStorage.setItem(ssKey(key), JSON.stringify(entry));
  } catch (e) {
    // sessionStorage quota exceeded — memory-only is fine
    console.warn("sessionStorage quota hit, memory-only cache", e);
  }
}

/**
 * Merge new page results into an existing cache entry (for infinite scroll).
 * Deduplicates by _id. Call this after every successful API response.
 *
 * @param {string} key
 * @param {object[]} newRecipes  — raw recipes from the latest page
 * @param {number}  page
 * @param {boolean} hasMore
 */
export function appendCache(key, newRecipes, page, hasMore) {
  const existing = getCache(key);
  const prev = existing?.recipes ?? [];

  const map = new Map();
  [...prev, ...newRecipes].forEach((r) => map.set(r._id, r));

  setCache(key, {
    recipes: Array.from(map.values()),
    page,
    hasMore,
  });
}

/**
 * Delete a single entry from both layers.
 * Useful if you want to force a refetch (e.g. after user changes diet filter).
 *
 * @param {string} key
 */
export function invalidateCache(key) {
  memCache.delete(key);
  try {
    sessionStorage.removeItem(ssKey(key));
  } catch {}
}

// Wipe ALL recipe cache entries (e.g. on logout).
export function clearAllCache() {
  memCache.clear();
  try {
    Object.keys(sessionStorage).forEach((k) => {
      if (k.startsWith(CACHE_PREFIX)) sessionStorage.removeItem(k);
    });
  } catch {}
}