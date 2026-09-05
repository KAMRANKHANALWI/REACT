import { useState, useEffect, useCallback } from "react";

/**
 * useFetch — A Reusable Data-Fetching Hook
 * -------------------------------------------------
 * Wraps the loading/error/data/race-condition pattern from
 * 05-Async-React into ONE reusable hook, so every component that
 * needs to fetch something doesn't rewrite that logic by hand.
 *
 * This is exactly the kind of thing a library like React Query
 * (next two examples) replaces once your app's data needs grow —
 * but understanding this version first is what makes React Query's
 * API feel obvious instead of magic.
 */
export function useFetch(url) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState(null);
  const [refetchIndex, setRefetchIndex] = useState(0);

  const refetch = useCallback(() => {
    setRefetchIndex((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!url) return;

    let ignore = false;
    const controller = new AbortController();

    async function load() {
      setStatus("loading");
      setError(null);

      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const json = await res.json();
        if (!ignore) {
          setData(json);
          setStatus("success");
        }
      } catch (err) {
        if (!ignore && err.name !== "AbortError") {
          setError(err.message);
          setStatus("error");
        }
      }
    }

    load();

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [url, refetchIndex]);

  return { data, status, error, refetch };
}
