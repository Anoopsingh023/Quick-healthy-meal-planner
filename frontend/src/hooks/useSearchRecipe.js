import axios from "axios";
import { base_url } from "../utils/constant";

/**
 * Fetch recipe suggestions for autocomplete.
 * @param {string} query
 * @param {AbortSignal} [signal] - optional AbortController.signal passed from caller
 * @returns {Promise<Array>} array of suggestion objects (safe empty array on error)
 */
export const fetchSuggestions = async (query, signal) => {
  if (!query || !String(query).trim()) return [];

  try {
    const res = await axios.get(`${base_url}/searches/suggestions`, {
      params: { query, limit: 8 }, // limit optional; adjust to your controller
      withCredentials: true,
      signal,
    });

    // Try several common shapes and return the first array we find
    const body = res?.data;
    const candidates =
      (body && body.data && body.data.data) || // new apiResponse(200, { count, data }, message)
      (body && body.data) || // fallback
      body || // sometimes API puts array at root
      [];

    // Normalize to array
    const arr = Array.isArray(candidates) ? candidates : [];
    return arr;
  } catch (err) {
    // Detect axios cancel/abort (ERR_CANCELED) and return [] silently
    const isCanceled =
      err?.code === "ERR_CANCELED" || err?.name === "CanceledError" || err?.message === "canceled";

    if (isCanceled) {
      // request aborted by user typing -> not an error
      return [];
    }

    // Real error -> log for debugging and return an empty array
    console.error("Suggestion fetch failed:", err);
    return [];
  }
};
