import { useState, useEffect } from "react";

/**
 * useDebounce
 * -------------------------------------------------
 * Delays updating a value until the user has stopped changing it
 * for `delay` ms. Classic use case: search inputs — you don't want
 * to fire an API/RAG query on every keystroke.
 *
 * @param {*} value  - the fast-changing value (e.g. raw input text)
 * @param {number} delay - how long to wait after the last change (ms)
 * @returns the debounced value, which only updates after the pause
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // If "value" changes again before the timer fires, this cleanup
    // cancels the pending update — that's what creates the debounce.
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
