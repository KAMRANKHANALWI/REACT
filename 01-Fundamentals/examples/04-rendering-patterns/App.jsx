import { useState } from "react";

/**
 * Rendering Patterns
 * -------------------------------------------------
 * 1. ConditionalRendering  -> &&, ternary, early return
 * 2. TaskList              -> lists + keys (why keys matter)
 * 3. Note on re-renders    -> see comments in TaskList
 */

// 1. Conditional rendering — three common styles ---------------------------

function ConditionalRendering({ status }) {
  // Early return — good when one case should skip everything else
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <section>
      <h2>Conditional Rendering</h2>

      {/* && — render something only if the condition is true */}
      {status === "error" && <p>Something went wrong.</p>}

      {/* ternary — choose between two things to render */}
      <p>{status === "success" ? "Loaded successfully." : "No data yet."}</p>
    </section>
  );
}

// 2. Lists + keys ------------------------------------------------------------

function TaskList() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Finish DSA sheet" },
    { id: 2, text: "Review RAG pipeline" },
    { id: 3, text: "Prep interview notes" },
  ]);

  function removeTask(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  return (
    <section>
      <h2>Task List (keys)</h2>
      <ul>
        {tasks.map((task) => (
          // key must be STABLE and UNIQUE per item — use an id, never the
          // array index if the list can be reordered/filtered/inserted.
          // React uses the key to match old elements to new ones on
          // re-render, instead of re-creating every DOM node from scratch.
          <li key={task.id}>
            {task.text}
            <button onClick={() => removeTask(task.id)}>✕</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  return (
    <div>
      <h1>Rendering Patterns</h1>
      <ConditionalRendering status="success" />
      <TaskList />
    </div>
  );
}

/**
 * Why re-renders happen at all:
 * A component re-renders when its own state changes, its parent re-renders
 * (passing new props), or a context value it reads changes. React then
 * diffs the new JSX tree against the previous one (using keys for lists)
 * and only updates the real DOM where something actually changed.
 */
