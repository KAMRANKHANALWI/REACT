import { useState } from "react";

/**
 * Parent ↔ Child Communication
 * -------------------------------------------------
 * ShopPage (parent) OWNS the cart state.
 * ProductCard (child) only DISPLAYS a product and REPORTS clicks upward —
 * it never touches the cart state directly.
 *
 * Parent -> Child : plain props        (product, isInCart)
 * Child  -> Parent: a callback prop    (onAddToCart)
 */

const PRODUCTS = [
  { id: 1, name: "Mechanical Keyboard", price: 4200 },
  { id: 2, name: "Monitor Arm", price: 1800 },
  { id: 3, name: "Desk Mat", price: 900 },
];

// Child — receives data down, reports events up ----------------------------

function ProductCard({ product, isInCart, onAddToCart }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <button
        disabled={isInCart}
        onClick={() => onAddToCart(product)} // child -> parent: "user did something"
      >
        {isInCart ? "Added" : "Add to cart"}
      </button>
    </div>
  );
}

// Parent — owns the state, decides what happens when the child reports up ---

function ShopPage() {
  const [cart, setCart] = useState([]);

  function handleAddToCart(product) {
    // The child never calls setCart directly — it just says "this
    // happened," and the parent decides how state should change.
    setCart((prev) => [...prev, product]);
  }

  return (
    <section>
      <h2>Shop ({cart.length} in cart)</h2>

      {PRODUCTS.map((product) => (
        <ProductCard
          key={product.id}
          product={product} // parent -> child
          isInCart={cart.some((item) => item.id === product.id)} // parent -> child
          onAddToCart={handleAddToCart} // parent -> child (a function, called by the child)
        />
      ))}
    </section>
  );
}

export default function App() {
  return (
    <div>
      <h1>Parent ↔ Child Communication</h1>
      <ShopPage />
    </div>
  );
}

/**
 * The pattern in one line:
 * Parent passes data DOWN as props, and passes a FUNCTION down as a prop
 * too. The child calls that function to notify the parent — it never
 * mutates the parent's state itself. Data flows down, events flow up.
 */
