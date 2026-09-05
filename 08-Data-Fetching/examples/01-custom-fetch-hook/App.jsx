import { useFetch } from "./useFetch";

/**
 * Using useFetch
 * -------------------------------------------------
 * The component only cares about the shape it gets back —
 * { data, status, error, refetch } — not how any of that is produced.
 */

function UserList() {
  const { data: users, status, error, refetch } = useFetch(
    "https://jsonplaceholder.typicode.com/users"
  );

  if (status === "loading") return <p>Loading users...</p>;
  if (status === "error") return <p>Error: {error}</p>;

  return (
    <div>
      <button onClick={refetch}>Refetch</button>
      <ul>
        {users?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <h1>Custom Fetch Hook</h1>
      <UserList />
    </div>
  );
}

/**
 * What this hand-rolled version DOESN'T give you (and React Query does):
 * - Caching across components — two components calling useFetch on the
 *   same URL each fetch independently; React Query shares one cache entry.
 * - Automatic refetch on window focus / reconnect.
 * - Deduplication of identical in-flight requests.
 * - Built-in retry logic, stale-time controls, background refetching.
 * These aren't bugs in useFetch — they're exactly the gap React Query
 * exists to fill once an app's data needs grow past a few fetches.
 */
