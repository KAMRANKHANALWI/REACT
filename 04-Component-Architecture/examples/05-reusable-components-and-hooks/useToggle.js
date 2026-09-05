import { useState } from "react";

/**
 * useToggle
 * -------------------------------------------------
 * Two different components (a dropdown and a details panel) both had
 * the exact same "isOpen + toggle function" logic written out by hand.
 * Extracting it here means writing it once and reusing the LOGIC —
 * each component that calls it still gets its own independent state.
 */
export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  function toggle() {
    setValue((prev) => !prev);
  }

  return [value, toggle];
}
