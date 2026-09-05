import { useState } from "react";

/**
 * Lifting State Up + Prop Drilling
 * -------------------------------------------------
 * 1. BrokenSearch  -> two siblings each with their OWN state (doesn't work)
 * 2. FixedSearch   -> state lifted to their common parent (works)
 * 3. DrillingDemo  -> that same lifted state now needs to reach a
 *    component 3 levels deep, forcing every layer in between to pass
 *    a prop it never actually uses — this is prop drilling.
 */

// 1. BROKEN — each sibling owns its own copy of "query" ----------------------

function BrokenSearchBox() {
  const [query, setQuery] = useState("");
  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Type to search (but results won't update)"
    />
  );
}

function BrokenResultsList() {
  // This component has NO idea what was typed in BrokenSearchBox —
  // they are separate components with separate, disconnected state.
  return <p>Results for: (nothing — this component can't see the query)</p>;
}

function BrokenSearch() {
  return (
    <section>
      <h2>❌ Broken: sibling state doesn't cross components</h2>
      <BrokenSearchBox />
      <BrokenResultsList />
    </section>
  );
}

// 2. FIXED — lift the state to the closest common parent ---------------------

function SearchBox({ query, onQueryChange }) {
  // No state of its own anymore — it's now a "controlled" child,
  // just like a controlled <input>.
  return (
    <input
      value={query}
      onChange={(e) => onQueryChange(e.target.value)}
      placeholder="Type to search"
    />
  );
}

function ResultsList({ query }) {
  const allItems = ["React", "Redux", "React Router", "Recoil"];
  const filtered = allItems.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <ul>
      {filtered.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function FixedSearch() {
  // The state now lives in the closest common ancestor of both
  // components that need it. Neither sibling owns it anymore.
  const [query, setQuery] = useState("");

  return (
    <section>
      <h2>✅ Fixed: state lifted to the common parent</h2>
      <SearchBox query={query} onQueryChange={setQuery} />
      <ResultsList query={query} />
    </section>
  );
}

// 3. PROP DRILLING — the cost of lifting state too far up --------------------

function Toolbar({ query, onQueryChange }) {
  // Toolbar itself never reads "query" — it just forwards it down
  // because SearchBox, three levels below the page, needs it.
  return (
    <div className="toolbar">
      <SearchPanel query={query} onQueryChange={onQueryChange} />
    </div>
  );
}

function SearchPanel({ query, onQueryChange }) {
  // SearchPanel doesn't use "query" either — still just passing it along.
  return <SearchBox query={query} onQueryChange={onQueryChange} />;
}

function DrillingDemo() {
  const [query, setQuery] = useState("");

  return (
    <section>
      <h2>⚠️ Prop Drilling</h2>
      {/* query has to pass through Toolbar -> SearchPanel -> SearchBox.
          Toolbar and SearchPanel don't use it — they're just plumbing. */}
      <Toolbar query={query} onQueryChange={setQuery} />
      <ResultsList query={query} />
    </section>
  );
}

export default function App() {
  return (
    <div>
      <h1>Lifting State Up + Prop Drilling</h1>
      <BrokenSearch />
      <FixedSearch />
      <DrillingDemo />
    </div>
  );
}

/**
 * The question to keep asking: "who should own this state?"
 * - Two siblings need it -> lift it to their closest common parent.
 * - That parent is now far from a deeply nested consumer -> you're
 *   forced to drill it through components that don't care about it.
 * Prop drilling isn't a bug — it's what naturally happens once you've
 * correctly lifted state high enough for everyone who needs it to
 * reach it. The next file (04-context) shows the way out.
 */
