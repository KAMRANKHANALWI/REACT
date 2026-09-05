import { useToggle } from "./useToggle";
import { useCart } from "./useCart";

/**
 * Reusable Components + UI vs Logic Separation
 * -------------------------------------------------
 * 1. Button        -> designed around a clean API (variant/size), not
 *    hardcoded for one specific screen
 * 2. Dropdown / DetailsPanel -> both reuse useToggle instead of each
 *    writing their own isOpen state + toggle function
 * 3. CartWidget    -> pure UI, all cart LOGIC lives in useCart (separate file)
 */

// 1. A reusable component designed around an API, not a use case ------------

function Button({ children, variant = "primary", size = "medium", ...rest }) {
  // "variant" and "size" describe WHAT the button should look like —
  // the caller decides the specifics, Button doesn't hardcode any of it.
  // ...rest forwards anything else (onClick, disabled, type) untouched.
  return (
    <button className={`btn btn-${variant} btn-${size}`} {...rest}>
      {children}
    </button>
  );
}

// 2. Two unrelated components, same reusable hook ----------------------------

function Dropdown() {
  const [isOpen, toggle] = useToggle(false);

  return (
    <div>
      <Button onClick={toggle}>{isOpen ? "Close menu" : "Open menu"}</Button>
      {isOpen && <ul><li>Option A</li><li>Option B</li></ul>}
    </div>
  );
}

function DetailsPanel() {
  const [isOpen, toggle] = useToggle(false);

  return (
    <div>
      <Button variant="secondary" onClick={toggle}>
        {isOpen ? "Hide" : "Show"} details
      </Button>
      {isOpen && <p>Extra detail text here.</p>}
    </div>
  );
}

// 3. UI vs logic separation ---------------------------------------------------

const PRODUCTS = [
  { id: 1, name: "Keyboard", price: 4200 },
  { id: 2, name: "Monitor Arm", price: 1800 },
];

function CartWidget() {
  // All the logic (state, add/remove, total) comes from the hook.
  // This component ONLY describes what should appear on screen.
  const { items, addItem, removeItem, total } = useCart();

  return (
    <div>
      <h3>Cart ({items.length})</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.name} — ₹{item.price}
            <Button variant="danger" size="small" onClick={() => removeItem(item.id)}>
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <p>Total: ₹{total}</p>

      {PRODUCTS.map((product) => (
        <Button key={product.id} onClick={() => addItem(product)}>
          Add {product.name}
        </Button>
      ))}
    </div>
  );
}

export default function App() {
  return (
    <div>
      <h1>Reusable Components + Custom Hooks</h1>
      <Dropdown />
      <DetailsPanel />
      <CartWidget />
    </div>
  );
}

/**
 * Why this matters:
 * - Button's API (variant/size/children) works for ANY button anywhere
 *   in the app — nothing about it is specific to the cart or the menu.
 * - useToggle is reused by two completely unrelated components with
 *   zero shared state between them — each call gets its own isOpen.
 * - useCart could be swapped out (e.g. backed by an API or localStorage)
 *   without CartWidget's JSX changing at all — that's the payoff of
 *   separating logic from UI.
 */
