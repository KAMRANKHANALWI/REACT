import { useState } from "react";

/**
 * useCart
 * -------------------------------------------------
 * All the CART LOGIC lives here: what's in it, how to add/remove items,
 * how to compute the total. None of this hook knows or cares how the
 * cart is displayed — that's the job of the component that calls it
 * (see CartWidget in App.jsx). This is "UI vs logic separation":
 * the hook owns behavior, the component owns markup.
 */
export function useCart() {
  const [items, setItems] = useState([]);

  function addItem(product) {
    setItems((prev) => [...prev, product]);
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return { items, addItem, removeItem, total };
}
