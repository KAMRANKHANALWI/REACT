# Async React

How Promises, `async`/`await`, and network requests fit into React's render/effect model — and the patterns that keep async code from causing bugs. Code examples live in `examples/`.

---

## Quick Refresher: Promises & async/await

A **Promise** represents a value that isn't ready yet, but will resolve (succeed) or reject (fail) eventually.

```js
fetch(url)
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

`async`/`await` is syntax sugar over the same thing — it lets promise-based code read top-to-bottom instead of nesting `.then()` chains:

```js
async function loadData() {
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}
```

Both do the same thing. `async`/`await` is generally easier to read once more than one step is involved.

---

## Async Inside `useEffect`

**You cannot make the effect callback itself `async`:**

```jsx
// ❌ Wrong
useEffect(async () => {
  const res = await fetch(url);
  ...
}, []);
```

`useEffect` expects its callback to return either nothing, or a cleanup function. An `async` function always returns a Promise — React can't use a Promise as a cleanup function, and this pattern causes warnings/bugs.

**Correct pattern:** define the async function separately, then call it.

```jsx
useEffect(() => {
  async function loadUser() {
    const res = await fetch(url);
    const data = await res.json();
    setUser(data);
  }

  loadUser();
}, [userId]);
```

---

## Race Conditions

If `userId` changes quickly (1 → 2), two requests can be in flight at once. If the request for the **old** `userId` resolves *after* the request for the new one, it overwrites correct data with stale data.

### Fix 1 — an "ignore" flag
```jsx
useEffect(() => {
  let ignore = false;

  async function loadUser() {
    const data = await fetchUser(userId);
    if (!ignore) setUser(data); // only apply if still relevant
  }

  loadUser();
  return () => { ignore = true; }; // runs before the next effect
}, [userId]);
```

### Fix 2 — `AbortController`
Cancels the request outright instead of just ignoring its result (also saves the wasted network call). See `02-Core-Hooks/notes.md` for the full pattern.

Both solve the same problem; `AbortController` is generally preferred when the underlying API supports it.

See `examples/01-async-in-effects/App.jsx` for the broken version next to the fixed one.

---

## Loading / Error / Success States

Any async operation naturally has more than just "loading or not." Model the states explicitly:

```
idle -> loading -> success
                \-> error
```

```jsx
const [status, setStatus] = useState("idle"); // idle | loading | success | error
```

```jsx
if (status === "loading") return <p>Loading...</p>;
if (status === "error") return <p>Something went wrong.</p>;
if (status === "success") return <PostView post={post} />;
```

### Why one status string beats separate booleans
```jsx
// ❌ These can end up in an impossible combination
const [isLoading, setIsLoading] = useState(false);
const [isError, setIsError] = useState(false);
// isLoading=true AND isError=true is nonsensical, but nothing stops it
```
A single `status` variable can only hold one value at a time, so contradictory UI states (spinner + error message both showing) can't happen by construction.

See `examples/02-loading-error-success-states/App.jsx`.

---

## Async Event Handlers

Unlike `useEffect`, an **event handler can be `async` directly** — React doesn't inspect what a handler returns.

```jsx
async function handleSubmit(e) {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    await submitForm(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setIsSubmitting(false); // always runs, success or failure
  }
}
```

Key pieces:
- **`try/catch`** around the `await` so a rejected promise doesn't crash silently.
- **`finally`** to guarantee a loading/disabled state gets cleared no matter what happened.
- **Disabling the trigger** (`disabled={isSubmitting}`) prevents duplicate submissions from a double-click.

### Optimistic Updates
Update the UI immediately, assuming the request will succeed, then roll back if it fails. Makes interactions feel instant instead of waiting on network latency.

```jsx
async function handleLike() {
  const next = !liked;
  setLiked(next); // update immediately

  try {
    await patchLike(next);
  } catch (err) {
    setLiked(!next); // roll back on failure
    setError(err.message);
  }
}
```

Use this when the request usually succeeds and a failure is rare/recoverable — not for anything where an incorrect optimistic state would be confusing or costly if it has to revert.

See `examples/03-async-event-handlers/App.jsx` for both an async form submit and an optimistic like button.

---

## Effects vs Event Handlers — Where Does Async Code Belong?

| | `useEffect` | Event handler |
|---|---|---|
| Triggered by | Render / dependency change | User action (click, submit, etc.) |
| Can be `async` itself | No — wrap in an inner function | Yes, directly |
| Needs cleanup | Often (cancel stale requests) | Rarely |
| Typical use | Load data when a component mounts or a prop changes | Submit a form, like a post, save on click |

**Rule of thumb:** if the async work should happen *because the user did something*, put it in an event handler. If it should happen *because the component needs to stay in sync with something* (a prop, a mount), put it in `useEffect`.

---

## Key Takeaways

```
useEffect callback   -> can't be async itself; define an inner async fn and call it
Race conditions       -> guard with an "ignore" flag or AbortController
Status modeling       -> one string (idle/loading/success/error), not separate booleans
Event handlers        -> CAN be async directly; wrap in try/catch/finally
Optimistic updates    -> update UI first, roll back on failure
Effects vs handlers    -> "sync with something" -> effect; "user did something" -> handler
```
