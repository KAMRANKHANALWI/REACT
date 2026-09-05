# Routing

Client-side routing with React Router — declaring routes, navigating without page reloads, dynamic segments, nested layouts, and protecting routes behind auth. Code examples live in `examples/`.

```bash
npm install react-router-dom
```

---

## Why Client-Side Routing?

A traditional website navigates by asking the server for a whole new HTML page on every link click — full reload, white flash, lost JS state. React Router intercepts navigation and swaps components **in the browser**, without a page reload — that's what makes a React app feel like an "app" instead of a stack of pages.

---

## Basic Setup: `BrowserRouter`, `Routes`, `Route`

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

- **`BrowserRouter`** wraps the whole app once, at the top — it's what enables routing everywhere inside it.
- **`Routes`** looks at the current URL and renders the **first** `Route` that matches.
- **`path="*"`** is a catch-all for anything unmatched. React Router v6 actually ranks routes by specificity rather than declaration order, but conventionally it's still written last, since that's where a "fallback" reads most naturally.

---

## Navigating: `Link` vs `useNavigate`

```jsx
import { Link, useNavigate } from "react-router-dom";

<Link to="/about">About</Link>
```
`Link` renders an `<a>` tag but intercepts the click so React Router handles it internally — no full reload. Use it for anything the **user clicks**.

```jsx
const navigate = useNavigate();

function handleSubmit(e) {
  e.preventDefault();
  submitForm();
  navigate("/"); // go here after the form succeeds
}
```
`useNavigate` moves the user programmatically, as a **side effect of code running** — after a successful submit, after login, a timed redirect.

**Rule of thumb:** clickable UI → `Link`. Navigation triggered by logic → `useNavigate`.

See `examples/01-basic-routes-and-navigation/App.jsx`.

---

## Dynamic Route Segments

A route path can include a placeholder, prefixed with `:`:

```jsx
<Route path="/products/:productId" element={<ProductDetails />} />
```

Inside that component, read the actual value with `useParams()`:

```jsx
function ProductDetails() {
  const { productId } = useParams();
  const product = PRODUCTS.find(p => p.id === productId);
  ...
}
```

Visiting `/products/2` makes `productId` equal `"2"` — always a **string**, even if it looks numeric.

---

## Nested Routes + `Outlet`

Use nested routes when several pages share a common layout (a sidebar, a header, tabs).

```jsx
<Route path="/products" element={<ProductLayout />}>
  <Route index element={<ProductList />} />       {/* exactly "/products" */}
  <Route path=":productId" element={<ProductDetails />} /> {/* "/products/:productId" */}
</Route>
```

```jsx
function ProductLayout() {
  return (
    <div>
      <aside>Shared sidebar</aside>
      <Outlet /> {/* the matching CHILD route renders here */}
    </div>
  );
}
```

`ProductLayout` renders once and stays mounted; only the content inside `<Outlet />` swaps as the URL changes between `/products` and `/products/2`. This is the same "slot" idea from Composition (`04-Component-Architecture`) — just wired to the current URL instead of a manually-passed prop.

The `index` route is the one that renders when the parent path matches **exactly**, with no further segment.

See `examples/02-dynamic-and-nested-routes/App.jsx`.

---

## Protected Routes (Auth Guard)

The pattern: wrap the protected route's element in a component that checks auth state, and renders a redirect instead if the user isn't logged in.

```jsx
function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Send them to /login, remembering where they were headed
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
```

```jsx
<Route
  path="/dashboard"
  element={
    <RequireAuth>
      <DashboardPage />
    </RequireAuth>
  }
/>
```

- **`<Navigate>`** is the declarative version of `useNavigate` — render it, and React Router redirects immediately.
- **`replace`** stops the redirect itself from becoming a back-button stop — hitting "back" from `/login` won't bounce you back to the redirect.
- **`state={{ from: location }}`** carries along where the user was trying to go, so after logging in you can send them back to `/dashboard` instead of always dropping them on a generic home page.

See `examples/03-protected-routes/App.jsx` for the full flow, including reading `location.state.from` on the login page.

---

## Key Takeaways

```
BrowserRouter    -> wraps the app once, enables routing
Routes / Route    -> declare which component renders for which path
Link              -> user-clicked navigation, no full reload
useNavigate       -> programmatic navigation (after an action succeeds)
:param            -> dynamic segment, read via useParams()
Outlet            -> renders the matching child route inside a shared layout
index route       -> matches the parent path exactly, no extra segment
RequireAuth        -> wrapper component; redirects via <Navigate> if unauthenticated
state on Navigate  -> carry along context (like "where to return to") through a redirect
```
