/**
 * savedStore.js
 *
 * Single source of truth for ALL saved recipe IDs across the entire app.
 * Any page that needs isSaved state reads from here — no cache hunting needed.
 *
 * Pattern:
 *   - On app boot / user login → call initSavedStore(savedRecipeIds)
 *   - On toggle → call toggleSaved(recipeId) — updates store + notifies all listeners
 *   - Components subscribe via useSavedStore() hook
 */

// ─── Internal State ────────────────────────────────────────────────────────────

const savedIds = new Set(); // e.g. Set { "abc123", "def456" }
const listeners = new Set(); // Set of subscriber callbacks

// ─── Core API ─────────────────────────────────────────────────────────────────

/**
 * Call once when user data is available (login / app bootstrap).
 * @param {string[]} ids - array of saved recipe IDs from the server
 */
export function initSavedStore(ids = []) {
  savedIds.clear();
  ids.forEach((id) => savedIds.add(id.toString()));
  notifyAll();
}

/**
 * Toggle a recipe's saved state locally.
 * Call this BEFORE the API call (optimistic update).
 * Returns the new saved state so you know what to send to the server.
 *
 * @param {string} recipeId
 * @returns {boolean} new isSaved state
 */
export function toggleSaved(recipeId) {
  const id = recipeId.toString();
  if (savedIds.has(id)) {
    savedIds.delete(id);
  } else {
    savedIds.add(id);
  }
  notifyAll();
  return savedIds.has(id);
}

/**
 * Revert a toggle (call on API failure).
 * @param {string} recipeId
 */
export function revertToggle(recipeId) {
  toggleSaved(recipeId); // just toggle back
}

/**
 * Check if a recipe is saved.
 * @param {string} recipeId
 * @returns {boolean}
 */
export function isSaved(recipeId) {
  return savedIds.has(recipeId.toString());
}

/**
 * Get a snapshot of all saved IDs (returns a new Set so callers can't mutate).
 * @returns {Set<string>}
 */
export function getSavedSnapshot() {
  return new Set(savedIds);
}

// ─── Subscription ─────────────────────────────────────────────────────────────

/**
 * Subscribe to any change in saved state.
 * @param {() => void} callback
 * @returns {() => void} unsubscribe function
 */
export function subscribeSaved(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyAll() {
  listeners.forEach((cb) => cb());
}