/**
 * useSavedStore.js
 *
 * React hook that subscribes to savedStore and re-renders on any change.
 * Use this in any component that needs to know isSaved state.
 *
 * Usage:
 *   const { checkSaved, toggle } = useSavedStore();
 *   const saved = checkSaved(recipe._id);
 */

import { useCallback, useReducer, useEffect } from "react";
import axios from "axios";
import { base_url } from "../utils/constant"; // adjust path
import {
  subscribeSaved,
  toggleSaved,
  revertToggle,
  isSaved,
} from "./savedStore";

export function useSavedStore() {
  // dispatch is the stable function — savedVersion is just the counter value
  const [savedVersion, dispatch] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    // dispatch is stable across re-renders (React guarantees this)
    // so it's safe to pass directly — no ref wrapper needed
    const unsub = subscribeSaved(dispatch);
    return unsub;
  }, []); // runs once, no leaks

  // Stable — reads live from the store at call time
  const checkSaved = useCallback((recipeId) => isSaved(recipeId), []);

  const toggle = useCallback(async (recipeId) => {
    toggleSaved(recipeId); // optimistic — triggers bumpVersion via subscription

    try {
      await axios.post(
        `${base_url}/users/me/toggle-save/${recipeId}`,
        {},
        { withCredentials: true },
      );
    } catch (err) {
      console.error("Toggle save failed, reverting", err);
      revertToggle(recipeId); // triggers bumpVersion again
    }
  }, []);

  // Expose savedVersion so callers can use it as a useMemo dep
  return { checkSaved, toggle, savedVersion };
}