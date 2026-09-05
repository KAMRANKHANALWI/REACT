import { useState, useMemo, useCallback, memo } from "react";

/**
 * Memoization — React.memo, useMemo, useCallback
 * -------------------------------------------------
 * A concrete before/after: typing in an unrelated input causes a
 * child list to re-render for no reason, then we fix it.
 *
 * console.log calls are left in on purpose — open devtools and watch
 * them to actually SEE the difference these make.
 */

// ---- Slow, expensive-looking child component --------------------------------

function ExpensiveList({ items, onSelect }) {
  console.log("ExpensiveList rendered");

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id} onClick={() => onSelect(item)}>
          {item.name}
        </li>
      ))}
    </ul>
  );
}

// React.memo: skip re-rendering ExpensiveList if its PROPS haven't
// changed (shallow comparison), even if its parent re-renders.
const MemoizedExpensiveList = memo(ExpensiveList);

const RAW_ITEMS = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
];

// ---- BEFORE: still re-renders every keystroke, even though memoized ---------

function BeforeFix() {
  const [searchText, setSearchText] = useState("");
  const [selected, setSelected] = useState(null);

  // ❌ This creates a BRAND NEW array every render, and a BRAND NEW
  // function every render. React.memo's shallow comparison sees
  // "different references" and re-renders the child anyway.
  const filteredItems = RAW_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  function handleSelect(item) {
    setSelected(item);
  }

  return (
    <section>
      <h2>❌ Before: memo doesn't help here</h2>
      <input
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search (watch console log on every keystroke)"
      />
      <p>Selected: {selected?.name ?? "none"}</p>
      <MemoizedExpensiveList items={filteredItems} onSelect={handleSelect} />
    </section>
  );
}

// ---- AFTER: memo actually works once references are stable -----------------

function AfterFix() {
  const [searchText, setSearchText] = useState("");
  const [selected, setSelected] = useState(null);

  // ✅ useMemo only recomputes the array when searchText actually changes,
  // so the reference stays the SAME across renders where it's unrelated.
  const filteredItems = useMemo(
    () =>
      RAW_ITEMS.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      ),
    [searchText]
  );

  // ✅ useCallback keeps the SAME function reference across renders
  // (as long as its dependencies don't change), instead of creating
  // a new one every time AfterFix re-renders.
  const handleSelect = useCallback((item) => {
    setSelected(item);
  }, []);

  return (
    <section>
      <h2>✅ After: stable references, memo works</h2>
      <input
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Search (log fires only when results actually change)"
      />
      <p>Selected: {selected?.name ?? "none"}</p>
      <MemoizedExpensiveList items={filteredItems} onSelect={handleSelect} />
    </section>
  );
}

export default function App() {
  return (
    <div>
      <h1>Memoization</h1>
      <BeforeFix />
      <AfterFix />
    </div>
  );
}

/**
 * The rule that actually matters here:
 * React.memo compares props by REFERENCE (===), not by deep equality.
 * A new array/object/function literal created during render is a new
 * reference every time, even if its contents look identical — so memo
 * alone does nothing unless the props it's comparing are ALSO stable,
 * which is what useMemo/useCallback are for.
 *
 * Don't reach for these by default — they add overhead too. Use them
 * when you've noticed an actual unnecessary re-render of something
 * expensive (a big list, a heavy chart), not on every component.
 */
