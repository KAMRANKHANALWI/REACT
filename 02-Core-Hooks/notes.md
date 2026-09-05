# React Core Hooks

Quick-reference notes on `useState`, `useEffect`, `useRef`, `useContext`, and custom hooks. Code examples live in `examples/`.

---

## Rules of Hooks

1. **Only call hooks at the top level** — never inside `if`, loops, or nested functions. React tracks hooks by call order; skipping one conditionally breaks that order on the next render.
2. **Only call hooks from React functions** — components or other custom hooks. Never from a regular JS function or event handler.

```jsx
// ❌ conditional hook
if (isLoggedIn) {
  const [user] = useState(null);
}

// ✅ hook always runs, condition goes inside
const [user, setUser] = useState(null);
if (isLoggedIn) { /* use user here */ }
```

---

## useState

Adds state to a component. Calling the setter schedules a re-render with the new value.

```jsx
const [count, setCount] = useState(0);
```

### State is a snapshot
Reading state right after calling its setter still gives you the **old** value — the setter doesn't mutate anything, it just schedules the next render.

```jsx
function handleClick() {
  setCount(1);
  console.log(count); // still the old value, not 1
}
```

### Functional updates
When the next state depends on the previous state, pass a function instead of a value. This matters when multiple updates happen back-to-back in the same event.

```jsx
// ❌ all three read the same stale "count" from this render
setCount(count + 1);
setCount(count + 1);
setCount(count + 1); // net result: +1, not +3

// ✅ each one reads the latest value
setCount(prev => prev + 1);
setCount(prev => prev + 1);
setCount(prev => prev + 1); // net result: +3
```

### Objects and arrays: never mutate directly
State updates trigger a re-render by reference comparison. Mutating in place doesn't change the reference, so React won't notice.

```jsx
// Object — spread to keep other fields, overwrite one
setUser(prev => ({ ...prev, name: "Kamran" }));

// Array — add
setTodos(prev => [...prev, newTodo]);

// Array — remove
setTodos(prev => prev.filter(todo => todo.id !== id));

// Array — update one item
setTodos(prev =>
  prev.map(todo => (todo.id === id ? { ...todo, done: true } : todo))
);
```

See `examples/01-state-basics/App.jsx` for a full runnable version (counter, object state, array/todo state).

---

## useEffect

Synchronizes a component with something **outside React** — network requests, timers, subscriptions, DOM/browser APIs.

```jsx
useEffect(() => {
  // side effect
  return () => {
    // cleanup (optional)
  };
}, [dependencies]);
```

### Dependency array behavior

| Array | Runs |
|---|---|
| Omitted | After every render |
| `[]` | Once, after the initial render |
| `[a, b]` | After initial render, and again whenever `a` or `b` changes |

### Cleanup
Returned function runs **before** the effect re-runs, and on unmount. Use it to undo whatever the effect set up.

```jsx
useEffect(() => {
  const timer = setInterval(() => console.log("tick"), 1000);
  return () => clearInterval(timer); // prevents leaked timers
}, []);
```

### Why cleanup matters for async work
If a component re-renders (e.g. `userId` prop changes) before a fetch finishes, the old fetch can resolve *after* the new one and overwrite fresher data with stale data. Cancel it with `AbortController`:

```jsx
useEffect(() => {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal })
    .then(res => res.json())
    .then(setData)
    .catch(err => {
      if (err.name !== "AbortError") setError(err);
    });

  return () => controller.abort();
}, [userId]);
```

### Stale closures
An effect captures the variables from the render that created it. If it has an empty dependency array, it will keep seeing the *original* values of anything it reads — even after state changes — because it never re-runs.

```jsx
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count); // always logs the count from mount, never updates
  }, 1000);
  return () => clearInterval(timer);
}, []); // <- count is missing here, so this closure is stuck
```
**Rule of thumb:** if the effect reads a value that can change, that value belongs in the dependency array.

See `examples/02-effects-cleanup/App.jsx` for three real patterns: fetch+abort, interval, and a browser event listener — all with proper cleanup.

---

## useRef

Holds a mutable value that **persists across renders** but does **not** trigger a re-render when changed.

```jsx
const ref = useRef(initialValue);
ref.current; // read/write directly, no setter needed
```

### Two common uses

**1. DOM references** — imperative access to an actual DOM node:
```jsx
const inputRef = useRef(null);

useEffect(() => {
  inputRef.current.focus();
}, []);

<input ref={inputRef} />
```

**2. Persistent values that shouldn't cause re-renders** — render counters, previous-value tracking, storing a timeout ID, etc:
```jsx
const renderCount = useRef(0);
renderCount.current += 1; // updates silently, no re-render triggered by this line
```

### useState vs useRef

| | `useState` | `useRef` |
|---|---|---|
| Persists across renders | Yes | Yes |
| Changing it re-renders the component | Yes | No |
| Use when | Value affects what's on screen | Value just needs to persist |

See `examples/03-refs/App.jsx` for DOM autofocus, a `usePrevious` mini-hook, and a render counter.

---

## useContext

Lets a component read a value from context without threading it through props at every level.

```jsx
const ThemeContext = createContext("light");

// Provide
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>

// Consume, anywhere inside the provider
const theme = useContext(ThemeContext);
```

Good for values many components need: theme, logged-in user, locale, app config. Context is **not** a replacement for all state management — if only one or two components need a value, plain props are simpler and easier to trace.

---

## Custom Hooks

A custom hook is a plain function that starts with `use` and can call other hooks. It packages **reusable logic**, not shared state — each component that calls it gets its own independent state.

```jsx
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```

Usage:
```jsx
const debouncedQuery = useDebounce(rawQuery, 500);
// only changes 500ms after the user stops typing —
// perfect for not firing an API call on every keystroke
```

See `examples/04-custom-hook-debounce/` for the full hook plus a live debounced-search component.

---

## Cheat Sheet

| Need | Hook |
|---|---|
| State that affects the UI | `useState` |
| Sync with something outside React (fetch, timers, subscriptions) | `useEffect` |
| Persistent value that shouldn't trigger a render | `useRef` |
| Direct DOM access | `useRef` |
| Avoid prop-drilling a shared value | `useContext` |
| Reuse stateful logic across components | Custom hook |

## Common Mistakes

- Calling hooks conditionally or inside loops.
- Mutating state directly instead of creating a new object/array.
- Using `useState` for a value that doesn't need to trigger a render (use `useRef` instead).
- Missing dependencies in `useEffect`, causing a stale closure.
- Forgetting cleanup for timers, listeners, or async requests.
