import { useState, useContext, createContext } from "react";

/**
 * Context
 * -------------------------------------------------
 * Solves the exact prop-drilling problem from 03-lifting-state...:
 * Toolbar and SearchPanel no longer need to accept or forward
 * "query"/"onQueryChange" at all. SearchBox reads it directly from
 * context, no matter how deep it is.
 */

const SearchContext = createContext(null);

// Deep child — reads context directly, no props needed for this at all -----

function SearchBox() {
  const { query, setQuery } = useContext(SearchContext);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Type to search"
    />
  );
}

function ResultsList() {
  const { query } = useContext(SearchContext);
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

// Middle components — clean now, no props to forward -------------------------

function SearchPanel() {
  return <SearchBox />;
}

function Toolbar() {
  return (
    <div className="toolbar">
      <SearchPanel />
    </div>
  );
}

// Top-level — provides the value once, for the whole subtree below ----------

function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      <Toolbar />
      <ResultsList />
    </SearchContext.Provider>
  );
}

export default function App() {
  return (
    <div>
      <h1>Context</h1>
      <SearchPage />
    </div>
  );
}

/**
 * When Context helps:
 * - A value is needed by many components at different nesting depths
 *   (theme, current user, this search query).
 * - You're drilling props through components that don't use them.
 *
 * When Context does NOT help (common misuse):
 * - Only 1–2 components need the value -> plain props are simpler and
 *   easier to trace ("where does this come from?" stays obvious).
 * - You're using it as a full app-wide state manager -> every consumer
 *   re-renders whenever the context value changes, which can get
 *   expensive; a dedicated state library scales better for that.
 * - The value changes very frequently (e.g. mouse position) -> context
 *   re-renders every subscriber on every change, unlike targeted props.
 */
