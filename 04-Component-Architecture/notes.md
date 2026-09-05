# Component Architecture

How to structure multiple components in a real app — composition, communication, state ownership, and code organization. Code examples live in `examples/`.

The thread connecting every section here is one question:

> **Who should own this state?**

```
Props  →  Parent → Child  →  Callbacks  →  Child → Parent
   →  Lifting State  →  Prop Drilling  →  Context  →  Custom Hooks
```

Once that question has a clear answer for a given piece of state, the right pattern to use becomes obvious.

---

## 1. Composition

React prefers **composition over inheritance**. Instead of extending a base component to add features, you combine (nest) components together.

```jsx
function App() {
  return (
    <div>
      <Navbar />
      <ProductList />
      <Footer />
    </div>
  );
}
```

### The `children` prop — containment
A component can accept arbitrary content via the special `children` prop, filled automatically with whatever's nested between its tags:

```jsx
function Card({ children }) {
  return <div className="card">{children}</div>;
}

<Card>
  <h2>Hello</h2>
  <p>Welcome to React.</p>
</Card>
```

`Card` doesn't know or care what's inside it — it just reserves the spot. This is called **containment**.

### Multiple named slots
Sometimes one `children` blob isn't enough. Pass JSX as a **named prop** instead — React treats it exactly like `children`:

```jsx
<PageLayout
  header={<Navbar />}
  sidebar={<FilterPanel />}
  content={<ProductGrid />}
/>
```

### Specialization
A specific component can be built by composing a generic one, instead of extending it:

```jsx
function Dialog({ title, message, children }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{message}</p>
      {children}
    </div>
  );
}

function WelcomeDialog() {
  return (
    <Dialog title="Welcome" message="Thanks for signing up!">
      <button>Get Started</button>
    </Dialog>
  );
}
```

**Rule of thumb:** if a component is turning into a pile of boolean/config props (`hasHeader`, `showImage`, `footerButtons`), that's a sign to compose smaller pieces instead of adding more props.

See `examples/01-composition-and-slots/App.jsx`.

---

## 2. Parent → Child Communication

Data flows down through **props** — the same idea as basic props, just now inside a real hierarchy.

```jsx
<ProductCard product={product} isInCart={isInCart} />
```

The child reads props, never writes to them. If the child needs to affect state, it doesn't reach up and mutate anything — it reports the event instead (next section).

---

## 3. Child → Parent Communication

The parent passes a **function** down as a prop. The child calls that function to notify the parent something happened — the child never touches the parent's state directly.

```jsx
function ProductCard({ product, onAddToCart }) {
  return <button onClick={() => onAddToCart(product)}>Add to cart</button>;
}

function ShopPage() {
  const [cart, setCart] = useState([]);

  function handleAddToCart(product) {
    setCart(prev => [...prev, product]);
  }

  return <ProductCard product={product} onAddToCart={handleAddToCart} />;
}
```

```
Parent: owns "cart" state, defines handleAddToCart
   ↓ passes down as a prop
Child: calls onAddToCart(product) when clicked
   ↑ parent's handler runs, updates its own state
```

**Data flows down, events flow up.** This is the core React data-flow rule.

See `examples/02-parent-child-communication/App.jsx`.

---

## 4. Lifting State Up

**The question:** two sibling components both need the same piece of state. Where does it live?

```
❌ Each sibling has its own local state
   -> they can't see each other's values, nothing syncs

✅ Move the state to their closest common parent
   -> parent passes it down to both as props
```

```jsx
function SearchPage() {
  const [query, setQuery] = useState(""); // lifted here

  return (
    <>
      <SearchBox query={query} onQueryChange={setQuery} />
      <ResultsList query={query} />
    </>
  );
}
```

Neither `SearchBox` nor `ResultsList` owns `query` anymore — the closest component that's an ancestor of *both* does. This is **lifting state up**: moving state to the lowest common ancestor of everything that needs it.

See `examples/03-lifting-state-and-prop-drilling/App.jsx` for the broken (unlifted) version next to the fixed one.

---

## 5. Prop Drilling

**The cost of lifting state up too far:** once state lives high enough for every consumer to reach it, it sometimes has to pass through components that don't use it at all — just to get to a deeply nested child that does.

```jsx
function Toolbar({ query, onQueryChange }) {
  // Toolbar never reads "query" — just forwards it
  return <SearchPanel query={query} onQueryChange={onQueryChange} />;
}

function SearchPanel({ query, onQueryChange }) {
  // Neither does SearchPanel
  return <SearchBox query={query} onQueryChange={onQueryChange} />;
}
```

`query` has to "drill" through `Toolbar` and `SearchPanel`, neither of which cares about it. This isn't a mistake — it's a natural consequence of correctly lifting state up. It only becomes a real problem when the chain gets long or the props multiply.

See the `DrillingDemo` section in `examples/03-lifting-state-and-prop-drilling/App.jsx`.

---

## 6. Context

**Solves prop drilling** by letting a deeply nested component read a value directly, without every component in between forwarding it.

```jsx
const SearchContext = createContext(null);

function SearchPage() {
  const [query, setQuery] = useState("");
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      <Toolbar />       {/* no props needed anymore */}
      <ResultsList />
    </SearchContext.Provider>
  );
}

function SearchBox() {
  const { query, setQuery } = useContext(SearchContext); // reads directly
  return <input value={query} onChange={e => setQuery(e.target.value)} />;
}
```

`Toolbar` and `SearchPanel` no longer need `query` in their props at all — `SearchBox`, however deep, pulls it straight from context.

### When Context does NOT help
- Only 1–2 components need the value → plain props are simpler to trace.
- You're trying to use it as a full app-wide state manager → every consumer re-renders on every context change, which doesn't scale well for large apps.
- The value changes very frequently (e.g. mouse position, animation frame) → context isn't optimized for high-frequency updates; a dedicated state library handles that better.

Context is for **moderately-changing values needed across a wide, uneven part of the tree** — theme, current user, locale, this search query — not a universal fix for "too many props."

See `examples/04-context/App.jsx`.

---

## 7. Reusable Components

Design a component's props around a general **API**, not the one screen you first needed it for.

```jsx
// ❌ Hardcoded for one use case
function SaveButton() {
  return <button className="green-btn">Save</button>;
}

// ✅ Designed around a reusable API
function Button({ children, variant = "primary", size = "medium", ...rest }) {
  return <button className={`btn btn-${variant} btn-${size}`} {...rest}>{children}</button>;
}
```

`variant` and `size` describe *what kind* of button, not *which specific button*. The same `Button` now works for save actions, delete actions, cancel actions — anywhere in the app — without modification. Spreading `...rest` forwards anything else (`onClick`, `disabled`, `type`) without the component needing to know about every possible prop in advance.

---

## 8. UI vs Logic Separation

Keep **what a component looks like** separate from **how it behaves**. Logic (state, calculations, side effects) goes in a hook; markup goes in the component.

```jsx
// Logic — knows nothing about how the cart is displayed
function useCart() {
  const [items, setItems] = useState([]);
  function addItem(product) { setItems(prev => [...prev, product]); }
  function removeItem(id) { setItems(prev => prev.filter(i => i.id !== id)); }
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return { items, addItem, removeItem, total };
}

// UI — knows nothing about HOW the cart logic works internally
function CartWidget() {
  const { items, addItem, removeItem, total } = useCart();
  return (/* JSX only */);
}
```

The payoff: `useCart`'s internals (backed by local state, an API, `localStorage`, whatever) can change completely without touching `CartWidget`'s markup — and `CartWidget`'s markup can be redesigned without touching the cart logic.

---

## 9. Custom Hooks

A custom hook extracts **reusable stateful logic** so multiple components don't duplicate the same `useState` + functions by hand.

```jsx
function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);
  function toggle() { setValue(prev => !prev); }
  return [value, toggle];
}
```

```jsx
function Dropdown() {
  const [isOpen, toggle] = useToggle(false);
  // ...
}

function DetailsPanel() {
  const [isOpen, toggle] = useToggle(false);
  // ...
}
```

Both components use the exact same logic, but each gets its **own independent state** — calling a hook twice creates two separate instances of that state, not a shared one.

See `examples/05-reusable-components-and-hooks/` for `useToggle`, `useCart`, and a `Button` built around a clean API, all working together.

---

## The "Who Owns This State?" Decision Tree

```
Does only ONE component need this state?
    → keep it local (useState in that component)

Do TWO OR MORE sibling components need it?
    → lift it to their closest common parent

Does a deeply nested component need state from way up the tree,
forcing several components in between to just forward props?
    → that's prop drilling — consider Context

Is the same STATEFUL LOGIC (not the same state) repeated
across unrelated components?
    → extract it into a custom hook (each caller still gets
      its own independent state)
```

## Key Takeaways

```
Composition        → nest components; children/slots over config-prop piles
Parent -> Child     → props, read-only
Child -> Parent     → callback props; child reports, parent decides
Lifting State Up    → move state to the closest common ancestor
Prop Drilling       → the cost of that: passing props through non-consumers
Context             → lets deep consumers skip the middlemen (use sparingly)
Reusable Components → design around a general API, not one screen
UI vs Logic         → hooks own behavior, components own markup
Custom Hooks        → reuse LOGIC; each call gets independent STATE
```
