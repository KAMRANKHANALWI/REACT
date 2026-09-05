import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

/**
 * React Query — Mutations
 * -------------------------------------------------
 * useMutation handles POST/PATCH/DELETE-style requests — actions that
 * CHANGE data, as opposed to useQuery which only READS it.
 *
 * 1. AddTodo        -> basic mutation + invalidate the list on success
 * 2. TodoItem        -> optimistic update with rollback on failure
 */

const queryClient = new QueryClient();

async function fetchTodos() {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
  return res.json();
}

async function addTodoRequest(title) {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, completed: false }),
  });
  if (!res.ok) throw new Error("Failed to add todo");
  return res.json();
}

async function toggleTodoRequest({ id, completed }) {
  const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error("Failed to update todo");
  return res.json();
}

// 1. Basic mutation + cache invalidation --------------------------------------

function AddTodo() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: addTodoRequest,
    onSuccess: () => {
      // Tell React Query the "todos" cache is stale — it will
      // automatically refetch it, so the new item shows up.
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    const title = e.target.elements.title.value;
    if (title.trim()) mutation.mutate(title);
    e.target.reset();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" placeholder="New todo" />
      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Adding..." : "Add"}
      </button>
      {mutation.isError && <p>{mutation.error.message}</p>}
    </form>
  );
}

// 2. Optimistic update with automatic rollback ---------------------------------

function TodoItem({ todo }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: toggleTodoRequest,

    // Runs BEFORE the request — update the cache immediately so the
    // checkbox feels instant.
    onMutate: async (updatedTodo) => {
      await queryClient.cancelQueries({ queryKey: ["todos"] });
      const previousTodos = queryClient.getQueryData(["todos"]);

      queryClient.setQueryData(["todos"], (old) =>
        old.map((t) => (t.id === updatedTodo.id ? { ...t, ...updatedTodo } : t))
      );

      // Passed to onError as "context" if the request fails.
      return { previousTodos };
    },

    // Roll back to the snapshot taken in onMutate.
    onError: (err, updatedTodo, context) => {
      queryClient.setQueryData(["todos"], context.previousTodos);
    },

    // Whether it succeeded or failed, re-sync with the server eventually.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });

  return (
    <li>
      <label>
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={(e) =>
            mutation.mutate({ id: todo.id, completed: e.target.checked })
          }
        />
        {todo.title}
      </label>
    </li>
  );
}

function TodoList() {
  const { data: todos, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  if (isLoading) return <p>Loading todos...</p>;

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <h1>React Query — Mutations</h1>
      <AddTodo />
      <TodoList />
    </QueryClientProvider>
  );
}

/**
 * The three mutation lifecycle hooks that matter for optimistic updates:
 *
 *   onMutate  -> fires immediately, before the network request. Snapshot
 *                the current cache, then apply the optimistic change.
 *   onError   -> fires if the request fails. Roll back using the snapshot.
 *   onSettled -> fires whether it succeeded or failed. Re-sync with the
 *                server as the final source of truth.
 *
 * Compare this to the hand-rolled optimistic update in 05-Async-React —
 * same idea (update first, roll back on failure), but React Query gives
 * you the snapshot/rollback machinery instead of managing it by hand
 * with useState.
 */
