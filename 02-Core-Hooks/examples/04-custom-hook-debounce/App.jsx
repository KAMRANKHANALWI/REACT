import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";

/**
 * Custom Hook Example — Debounced Search
 * -------------------------------------------------
 * Typing fires on every keystroke, but the actual "search" (API call)
 * only runs once the user pauses for 500ms. This is the real-world
 * reason custom hooks exist: the debounce LOGIC is reusable, the
 * component just consumes it.
 */

function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    async function search() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://jsonplaceholder.typicode.com/users?name_like=${query}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setResults(data);
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      } finally {
        setLoading(false);
      }
    }

    search();
    return () => controller.abort();
  }, [query]);

  if (loading) return <p>Searching...</p>;
  if (!query.trim()) return <p>Type to search users.</p>;
  if (results.length === 0) return <p>No results for "{query}".</p>;

  return (
    <ul>
      {results.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}

export default function App() {
  const [rawQuery, setRawQuery] = useState("");
  const debouncedQuery = useDebounce(rawQuery, 500);

  return (
    <div>
      <h1>Debounced Search (custom hook)</h1>

      <input
        value={rawQuery}
        onChange={(e) => setRawQuery(e.target.value)}
        placeholder="Search users..."
      />

      {/* SearchResults only re-fetches when debouncedQuery changes,
          not on every keystroke of rawQuery. */}
      <SearchResults query={debouncedQuery} />
    </div>
  );
}
