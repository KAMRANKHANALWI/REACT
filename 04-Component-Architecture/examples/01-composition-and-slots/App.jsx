/**
 * Composition + Slots
 * -------------------------------------------------
 * 1. Card         -> containment (children, doesn't know its content)
 * 2. PageLayout   -> multiple named slots (not just "children")
 * 3. Dialog / WelcomeDialog -> specialization (compose a specific
 *    component out of a generic one, instead of extending it)
 */

// 1. Containment — a single "children" slot ------------------------------

function Card({ children }) {
  // Card has no idea what's inside it. It just provides the box.
  return <div className="card">{children}</div>;
}

// 2. Multiple named slots ---------------------------------------------------

function PageLayout({ header, sidebar, content }) {
  // header/sidebar/content aren't special — they're just prop names
  // that happen to hold JSX. React treats them exactly like children.
  return (
    <div className="layout">
      <header>{header}</header>
      <aside>{sidebar}</aside>
      <main>{content}</main>
    </div>
  );
}

function Navbar() {
  return <nav>Home · Products · Cart</nav>;
}

function FilterPanel() {
  return <div>Filter by: Price, Category</div>;
}

function ProductGrid() {
  return <div>Product grid goes here</div>;
}

// 3. Specialization — build a specific component from a generic one ---------

function Dialog({ title, message, children }) {
  return (
    <div className="dialog">
      <h2>{title}</h2>
      <p>{message}</p>
      {children}
    </div>
  );
}

function WelcomeDialog() {
  // WelcomeDialog composes Dialog with specific content baked in —
  // it doesn't extend/inherit from Dialog, it just uses it.
  return (
    <Dialog title="Welcome" message="Thanks for signing up!">
      <button>Get Started</button>
    </Dialog>
  );
}

export default function App() {
  return (
    <div>
      <h1>Composition + Slots</h1>

      <Card>
        <h2>Hello</h2>
        <p>Welcome to React.</p>
      </Card>

      <PageLayout
        header={<Navbar />}
        sidebar={<FilterPanel />}
        content={<ProductGrid />}
      />

      <WelcomeDialog />
    </div>
  );
}
