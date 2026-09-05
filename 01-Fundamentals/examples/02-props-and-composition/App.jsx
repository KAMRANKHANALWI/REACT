/**
 * Props + Composition
 * -------------------------------------------------
 * 1. Button          -> props, default values, destructuring
 * 2. Card            -> the "children" prop (composition slot)
 * 3. Layout          -> composition instead of prop-drilling
 */

// 1. Props basics ----------------------------------------------------------

function Button({ label, onClick, variant = "primary" }) {
  // "variant" has a default value, used if the caller doesn't pass one
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {label}
    </button>
  );
}

// 2. children prop — composition instead of a "content" prop ----------------

function Card({ title, children }) {
  // Anything nested inside <Card>...</Card> becomes "children" automatically.
  // This is composition: Card doesn't need to know what's inside it.
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="card-body">{children}</div>
    </div>
  );
}

// 3. Composition avoids prop-drilling -----------------------------------

function Layout({ sidebar, content }) {
  // Instead of passing 10 props down through Layout to deeply nested
  // children, the parent builds each slot and hands it in as JSX.
  return (
    <div className="layout">
      <aside>{sidebar}</aside>
      <main>{content}</main>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <h1>Props + Composition</h1>

      <Button label="Save" onClick={() => console.log("saved")} />
      <Button label="Delete" variant="danger" onClick={() => console.log("deleted")} />

      <Card title="Project Notes">
        <p>RAG pipeline is passing RAGAS eval at 0.87 faithfulness.</p>
        <Button label="Open" onClick={() => console.log("open")} />
      </Card>

      <Layout
        sidebar={<nav>Home · Projects · Settings</nav>}
        content={<p>Main page content goes here.</p>}
      />
    </div>
  );
}
