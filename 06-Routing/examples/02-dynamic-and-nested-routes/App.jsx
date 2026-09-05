import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  Outlet,
} from "react-router-dom";

/**
 * Dynamic + Nested Routes
 * -------------------------------------------------
 * 1. Dynamic segments  -> :productId in the path, read with useParams
 * 2. Nested routes     -> a shared layout (ProductLayout) with an
 *    <Outlet /> where the matching child route renders
 */

const PRODUCTS = [
  { id: "1", name: "Mechanical Keyboard", price: 4200 },
  { id: "2", name: "Monitor Arm", price: 1800 },
];

// 1. Dynamic segment ----------------------------------------------------------

function ProductList() {
  return (
    <ul>
      {PRODUCTS.map((product) => (
        <li key={product.id}>
          {/* :productId in the route becomes this actual id at runtime */}
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </li>
      ))}
    </ul>
  );
}

function ProductDetails() {
  const { productId } = useParams(); // reads the dynamic segment from the URL
  const product = PRODUCTS.find((p) => p.id === productId);

  if (!product) return <p>Product not found.</p>;

  return (
    <div>
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
    </div>
  );
}

// 2. Nested routes with a shared layout ---------------------------------------

function ProductLayout() {
  return (
    <div className="product-layout">
      <aside>Filters / Categories sidebar (shared across all product pages)</aside>

      {/* Outlet renders whichever CHILD route currently matches —
          ProductList at /products, ProductDetails at /products/:productId */}
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/products">Products</Link>
      </nav>

      <Routes>
        <Route path="/products" element={<ProductLayout />}>
          {/* index route: renders at exactly "/products" */}
          <Route index element={<ProductList />} />
          {/* renders at "/products/:productId", still inside ProductLayout */}
          <Route path=":productId" element={<ProductDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Why nest routes instead of duplicating the layout in every page?
 * ProductLayout (sidebar, wrapper markup) renders ONCE and stays mounted
 * while only the <Outlet /> content swaps between ProductList and
 * ProductDetails as the URL changes — same idea as the Composition
 * "slots" pattern from 04-Component-Architecture, just wired to the URL.
 */
