# Data Fetching

From a hand-rolled `useFetch` hook to React Query — reading data, caching it, and mutating it (POST/PATCH/DELETE) the right way. Code examples live in `examples/`.

---

## The Hand-Rolled Version: `useFetch`

Everything from `05-Async-React` (status modeling, race-condition protection, cleanup) packaged into one reusable hook:

```jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setStatus("loading");
      try {
        const res = await fetch(url, { signal: controller.signal });
        setData(await res.json());
        setStatus("success");
      } catch (err) {
        if (err.name !== "AbortError") setStatus("error");
      }
    }

    load();
    return () => controller.abort();
  }, [url]);

  return { data, status, error };
}
```

```jsx
const { data: user, status, error } = useFetch(`/api/users/${userId}`);
```

This is exactly the custom-hook extraction pattern from `04-Component-Architecture` — every component that needed to fetch something was about to rewrite this block by hand.

### What it doesn't give you
- **Caching** — switching away and back re-fetches from scratch.
- **Deduping** — two components fetching the same URL fire two separate requests.
- **Background refetching, retries, pagination helpers.**

These gaps are exactly what a data-fetching library exists to fill.

See `examples/01-custom-fetch-hook/` (`useFetch.js` + `App.jsx`, including a `refetch` function).

---

## React Query (`@tanstack/react-query`)

```bash
npm install @tanstack/react-query
```

### Setup — once, at the app root
```jsx
const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### `useQuery` — replaces `useFetch` entirely
```jsx
const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
  queryKey: ["users"],
  queryFn: fetchUsers,
  staleTime: 60 * 1000,
});
```

- **`queryKey`** is the cache identity. `["users"]` used by two different components means they **share one cached result** instead of both fetching independently. `["users", { page: 2 }]` is a *different* cache entry — think of the key like a dependency array for the request itself.
- **`isLoading`** — true only on the very first fetch for this key.
- **`isFetching`** — true during *any* fetch, including silent background refetches.
- **`staleTime`** — how long the data is considered fresh; no automatic refetch during that window. (`gcTime` — formerly `cacheTime` — controls how long unused data stays in memory before being dropped.)

See `examples/02-react-query-basics/App.jsx` for two components sharing one query key.

---

## `useMutation` — Changing Data

`useQuery` reads; `useMutation` handles POST/PATCH/DELETE — anything that changes data.

```jsx
const mutation = useMutation({
  mutationFn: addTodoRequest,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["todos"] });
  },
});

mutation.mutate(title); // trigger it
```

- **`invalidateQueries`** marks a cache entry stale, causing React Query to refetch it automatically — this is how the UI picks up a change made by a mutation.
- **`mutation.isPending`** — true while the request is in flight, good for disabling a submit button.

### Optimistic Updates — the React Query Way

Same idea as the hand-rolled version in `05-Async-React` (update the UI first, roll back on failure) — but with the snapshot/rollback machinery built in via three lifecycle hooks:

```jsx
useMutation({
  mutationFn: toggleTodoRequest,

  onMutate: async (updatedTodo) => {
    await queryClient.cancelQueries({ queryKey: ["todos"] });
    const previousTodos = queryClient.getQueryData(["todos"]);

    queryClient.setQueryData(["todos"], (old) =>
      old.map((t) => (t.id === updatedTodo.id ? { ...t, ...updatedTodo } : t))
    );

    return { previousTodos }; // passed to onError as "context"
  },

  onError: (err, updatedTodo, context) => {
    queryClient.setQueryData(["todos"], context.previousTodos); // roll back
  },

  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ["todos"] }); // re-sync either way
  },
});
```

| Hook | Fires | Purpose |
|---|---|---|
| `onMutate` | Immediately, before the request | Snapshot current cache, apply the optimistic change |
| `onError` | If the request fails | Roll back using the snapshot |
| `onSettled` | Always, success or failure | Re-sync with the server as final source of truth |

See `examples/03-react-query-mutations/App.jsx` for a full add + toggle flow.

---

## `useFetch` vs React Query

| | Hand-rolled `useFetch` | React Query |
|---|---|---|
| Loading/error state | Manual | Built in |
| Caching across components | No — refetches every time | Yes — shared by `queryKey` |
| Deduping simultaneous requests | No | Yes |
| Background refetch / retry | You'd write it yourself | Built in |
| Optimistic updates | Manual `useState` juggling | `onMutate`/`onError`/`onSettled` |
| Good for | Learning the mechanics, tiny apps | Apps where caching/dedup start to matter |

Understanding `useFetch` first is exactly why React Query's API doesn't feel like a black box — it's solving the same problem, just with the repetitive parts (caching, dedup, rollback bookkeeping) done for you.

---

## Key Takeaways

```
useFetch          -> the mechanics: status state + AbortController + cleanup
useQuery          -> reads data; queryKey is the cache identity
staleTime          -> how long data stays "fresh" before a refetch is allowed
invalidateQueries  -> mark a cache entry stale so it refetches
useMutation        -> writes data (POST/PATCH/DELETE)
onMutate/onError/onSettled -> optimistic update, rollback, and final re-sync
Shared queryKey     -> multiple components, one cached result, one network request
```
