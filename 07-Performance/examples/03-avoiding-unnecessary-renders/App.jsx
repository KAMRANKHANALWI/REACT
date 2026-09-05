import { useState } from "react";

/**
 * Avoiding Unnecessary Re-renders — Structural Fixes
 * -------------------------------------------------
 * Before reaching for memo/useMemo/useCallback everywhere, these
 * structural changes often remove the problem entirely.
 *
 * 1. Colocate state    -> move state down to where it's actually used
 * 2. Composition        -> pass expensive children as JSX so they don't
 *    re-render just because a sibling's state changed
 * 3. Stable keys        -> using index as key silently breaks state
 *    when a list is reordered or filtered
 */

// 1. BEFORE — state lives too high, drags an unrelated child along ----------

function ExpensiveChart() {
  console.log("ExpensiveChart rendered");
  return <div>📊 (expensive chart, doesn't depend on the input below)</div>;
}

function PageBefore() {
  const [searchText, setSearchText] = useState("");

  // ❌ Typing here re-renders the WHOLE PageBefore component, including
  // ExpensiveChart — even though ExpensiveChart doesn't use searchText
  // at all. There's nothing wrong with the chart itself; the state
  // is just declared too high up the tree.
  return (
    <section>
      <h2>❌ Before: state lives above things that don't need it</h2>
      <input
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Typing re-renders the chart below too"
      />
      <ExpensiveChart />
    </section>
  );
}

// 1 & 2. AFTER — colocate the state, and isolate via composition -------------

function SearchBox() {
  // ✅ The state now lives in the smallest component that needs it.
  // Typing here only re-renders SearchBox itself.
  const [searchText, setSearchText] = useState("");

  return (
    <input
      value={searchText}
      onChange={(e) => setSearchText(e.target.value)}
      placeholder="Typing only re-renders this input now"
    />
  );
}

function PageAfter() {
  return (
    <section>
      <h2>✅ After: state colocated, chart untouched</h2>
      <SearchBox />
      <ExpensiveChart />
    </section>
  );
}

/**
 * Composition also helps even when the state genuinely has to live
 * higher up. Passing a component as CHILDREN means the parent doesn't
 * need to re-create that element on every render:
 *
 *   function Page({ children }) {
 *     const [count, setCount] = useState(0);
 *     return (
 *       <div>
 *         <button onClick={() => setCount(c => c + 1)}>{count}</button>
 *         {children}  // <ExpensiveChart /> passed in from ABOVE Page,
 *                      // so it isn't re-created when Page's state changes
 *       </div>
 *     );
 *   }
 */

// 3. Stable keys — index-as-key can silently break state --------------------

function TaskListWithIndexKey() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Write notes" },
    { id: 2, text: "Review PRs" },
  ]);

  function addToFront() {
    setTasks((prev) => [{ id: Date.now(), text: "New urgent task" }, ...prev]);
  }

  return (
    <section>
      <h2>⚠️ Using array index as key</h2>
      <button onClick={addToFront}>Add task to the FRONT of the list</button>
      <ul>
        {tasks.map((task, index) => (
          // ❌ key={index}: when a new item is inserted at the front,
          // every existing item's "index" shifts by one. React thinks
          // "the item at index 0 changed text" rather than "a new item
          // was inserted" — any per-item local state (like an open/closed
          // toggle, or an <input> mid-edit) gets attached to the WRONG task.
          <li key={index}>{task.text}</li>
        ))}
      </ul>
    </section>
  );
}

function TaskListWithStableKey() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Write notes" },
    { id: 2, text: "Review PRs" },
  ]);

  function addToFront() {
    setTasks((prev) => [{ id: Date.now(), text: "New urgent task" }, ...prev]);
  }

  return (
    <section>
      <h2>✅ Using a stable id as key</h2>
      <button onClick={addToFront}>Add task to the FRONT of the list</button>
      <ul>
        {tasks.map((task) => (
          // ✅ key={task.id}: React correctly recognizes each task by
          // its identity, no matter where it moves in the list.
          <li key={task.id}>{task.text}</li>
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  return (
    <div>
      <h1>Avoiding Unnecessary Renders</h1>
      <PageBefore />
      <PageAfter />
      <TaskListWithIndexKey />
      <TaskListWithStableKey />
    </div>
  );
}
