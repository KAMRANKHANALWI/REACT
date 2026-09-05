import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

/**
 * React Query — Basics
 * -------------------------------------------------
 * npm install @tanstack/react-query
 *
 * 1. QueryClient / QueryClientProvider -> set up ONCE at the app root
 * 2. useQuery -> replaces useFetch entirely: loading/error/data +
 *    caching + refetching, all handled for you
 */

// 1. Set up once, at the top of the app -----------------------------------

const queryClient = new QueryClient();

// 2. useQuery ----------------------------------------------------------------

async function fetchUsers() {
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

function UserList() {
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
    isFetching, // true during ANY fetch, including background refetches
  } = useQuery({
    queryKey: ["users"], // uniquely identifies this data in the cache
    queryFn: fetchUsers,
    staleTime: 60 * 1000, // data is considered "fresh" for 60s — no refetch during that window
  });

  if (isLoading) return <p>Loading users...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <div>
      <button onClick={() => refetch()}>
        {isFetching ? "Refreshing..." : "Refetch"}
      </button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

// A second component querying the SAME key — React Query shares the
// cached result instead of firing a second network request.
function UserCount() {
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return <p>Total users: {users?.length ?? "..."}</p>;
}

export default function App() {
  return (
    // QueryClientProvider must wrap anything that uses useQuery/useMutation
    <QueryClientProvider client={queryClient}>
      <h1>React Query — Basics</h1>
      <UserList />
      <UserCount />
    </QueryClientProvider>
  );
}

/**
 * queryKey is the cache identity:
 * - ["users"] and ["users"] -> same cache entry, shared across components
 * - ["users", { page: 2 }] -> a DIFFERENT cache entry from ["users"]
 * Think of it like a dependency array for the request itself.
 *
 * staleTime vs cacheTime (called "gcTime" in v5):
 * - staleTime: how long data is considered fresh (no automatic refetch)
 * - gcTime: how long UNUSED cached data stays in memory before being
 *   garbage collected once no component is using that query anymore
 */
