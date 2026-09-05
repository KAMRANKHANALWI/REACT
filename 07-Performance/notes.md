# Performance

When and how to optimize a React app — memoization, code splitting, and structural fixes that prevent unnecessary re-renders in the first place. Code examples live in `examples/`.

**Read this first:** most performance problems in React apps are fixed by *restructuring* components, not by sprinkling `memo`/`useMemo`/`useCallback` everywhere. Reach for those tools once you've actually noticed a real, measurable problem — not by default.

---

## Why Re-renders Happen

A component re-renders when:
1. Its own state changes.
2. Its parent re-renders (props are re-passed, even if the values look the same).
3. A context value it reads changes.

React then diffs the new output against the old and only touches the real DOM where something changed. **Re-rendering a component is not automatically slow** — the problem is specifically re-rendering something *expensive* (a big list, a chart, a heavy calculation) *unnecessarily*.

---

## `React.memo`

Skips re-rendering a component if its props haven't changed, using a **shallow comparison** (`===` on each prop).

```jsx
const ExpensiveList = memo(function ExpensiveList({ items, onSelect }) {
  return <ul>{/* ... */}</ul>;
});
```

**The catch:** `memo` compares by reference, not by deep equality. An array or function created fresh during render is a *new reference every time*, even if it looks identical — so `memo` alone often does nothing unless the props being compared are also kept stable.

```jsx
// ❌ New array + new function every render — memo sees "different props"
<ExpensiveList items={items.filter(...)} onSelect={(item) => setSelected(item)} />
```

---

## `useMemo`

Caches the **result of a calculation**, recomputing it only when its dependencies change.

```jsx
const filteredItems = useMemo(
  () => items.filter(item => item.name.includes(searchText)),
  [items, searchText]
);
```

Now `filteredItems` keeps the same array reference across renders where `items`/`searchText` haven't changed — which is what lets `React.memo` on a child actually work.

## `useCallback`

Same idea, but for **functions** — caches a function reference instead of recreating it every render.

```jsx
const handleSelect = useCallback((item) => {
  setSelected(item);
}, []); // empty deps: this function never needs to change
```

**Together:** `useMemo`/`useCallback` produce stable references → `React.memo` can then actually detect "nothing changed" → the expensive child skips re-rendering.

See `examples/01-memoization/App.jsx` for a direct before/after — same component, only the reference-stability differs, with `console.log` calls to actually observe it.

---

## Code Splitting — `React.lazy` + `Suspense`

Without splitting, your entire app's JS ships as one bundle that has to download before anything can render. Lazy-loading defers a component's code until it's actually needed.

```jsx
const AnalyticsDashboard = lazy(() => import("./AnalyticsDashboard"));

<Suspense fallback={<p>Loading...</p>}>
  <AnalyticsDashboard />
</Suspense>
```

- `lazy(() => import(...))` tells the bundler to split that component into its **own chunk**, fetched on demand.
- `Suspense` shows a fallback while that chunk is still downloading.

### Where this matters most: route-based splitting
```jsx
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

<Route path="/settings" element={
  <Suspense fallback={<PageSpinner />}>
    <SettingsPage />
  </Suspense>
} />
```
A user who never visits `/settings` never downloads its code at all. On a real app with many pages, this is usually the single biggest bundle-size win available.

See `examples/02-code-splitting/App.jsx`.

---

## Structural Fixes (Usually the Better First Move)

### 1. Colocate state
Move state down to the smallest component that actually needs it, instead of declaring it high up and dragging unrelated siblings into every re-render.

```jsx
// ❌ Typing here re-renders ExpensiveChart too, even though it
// doesn't use searchText at all
function Page() {
  const [searchText, setSearchText] = useState("");
  return (
    <>
      <input value={searchText} onChange={...} />
      <ExpensiveChart />
    </>
  );
}

// ✅ State lives inside SearchBox — typing only re-renders SearchBox
function SearchBox() {
  const [searchText, setSearchText] = useState("");
  return <input value={searchText} onChange={...} />;
}

function Page() {
  return (
    <>
      <SearchBox />
      <ExpensiveChart />
    </>
  );
}
```

### 2. Composition to isolate re-renders
Even when state genuinely has to live higher up, passing an expensive component in as `children` (rather than rendering it directly inside the stateful component) means the parent doesn't recreate that element every render:

```jsx
function Page({ children }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      {children} {/* passed in from above Page — untouched by count changing */}
    </div>
  );
}

<Page>
  <ExpensiveChart />
</Page>
```

### 3. Stable keys in lists
Using the array **index** as a key silently breaks per-item state when the list is reordered, filtered, or has items inserted:

```jsx
// ❌ Inserting a new item at the front shifts every existing index.
// React thinks "the item AT index 0 changed," not "a new item arrived" —
// any local state attached to a list item can end up on the wrong row.
{tasks.map((task, index) => <li key={index}>{task.text}</li>)}

// ✅ A stable id lets React track each item's identity correctly,
// no matter where it moves in the list.
{tasks.map((task) => <li key={task.id}>{task.text}</li>)}
```

See `examples/03-avoiding-unnecessary-renders/App.jsx` for all three, side by side with their "before" versions.

---

## Decision Order

```
1. Is something actually slow/janky? (Don't optimize what isn't a problem.)
2. Can state be moved DOWN to a smaller component? (Colocate)
3. Can the expensive part be passed as children/composition instead
   of rendered directly inside the changing component?
4. Are list keys stable (a real id, not the index)?
5. Only then: React.memo + useMemo/useCallback on the specific
   expensive piece, with stable references feeding into it.
6. Is a whole route/feature rarely used? -> React.lazy + Suspense
```

## Key Takeaways

```
React.memo         -> skips a re-render if props are reference-equal
useMemo            -> caches a computed VALUE across renders
useCallback         -> caches a FUNCTION reference across renders
memo needs stable props -> useMemo/useCallback is often what makes memo work at all
React.lazy + Suspense -> split code, load on demand (huge win for rarely-used routes)
Colocate state      -> move state to the smallest component that needs it
Composition          -> pass expensive children as JSX to isolate them from re-renders
Stable keys          -> use a real id, never the array index, for reorderable lists
Optimize last         -> fix structure first; memoize only a proven, specific bottleneck
```
