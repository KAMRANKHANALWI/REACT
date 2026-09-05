import { useState } from "react";

/**
 * useState — Core Patterns
 * -------------------------------------------------
 * 1. Counter        -> primitive state
 * 2. ProfileCard     -> object state (spread to update one field)
 * 3. TodoList        -> array state (add / remove / toggle)
 */

// 1. Primitive state ------------------------------------------------

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <section>
      <h2>Counter (primitive state)</h2>
      <p>Count: {count}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>+1</button>
      <button onClick={() => setCount((prev) => prev - 1)}>-1</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </section>
  );
}

// 2. Object state -----------------------------------------------------

function ProfileCard() {
  const [profile, setProfile] = useState({
    name: "Kamran",
    role: "Generative AI Developer",
  });

  function updateRole(newRole) {
    // Spread keeps every other field intact — only "role" changes.
    setProfile((prev) => ({
      ...prev,
      role: newRole,
    }));
  }

  return (
    <section>
      <h2>Profile (object state)</h2>
      <p>{profile.name} — {profile.role}</p>
      <button onClick={() => updateRole("ML Engineer")}>
        Change role
      </button>
    </section>
  );
}

// 3. Array state --------------------------------------------------------

function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: "Finish DSA sheet", done: false },
    { id: 2, text: "Review RAG pipeline", done: true },
  ]);
  const [text, setText] = useState("");

  function addTodo() {
    if (!text.trim()) return;

    setTodos((prev) => [
      ...prev,
      { id: Date.now(), text, done: false },
    ]);
    setText("");
  }

  function removeTodo(id) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  function toggleTodo(id) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  }

  return (
    <section>
      <h2>Todo List (array state)</h2>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a task"
      />
      <button onClick={addTodo}>Add</button>

      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span
              onClick={() => toggleTodo(todo.id)}
              style={{
                cursor: "pointer",
                textDecoration: todo.done ? "line-through" : "none",
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => removeTodo(todo.id)}>✕</button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function App() {
  return (
    <div>
      <h1>useState — Core Patterns</h1>
      <Counter />
      <ProfileCard />
      <TodoList />
    </div>
  );
}
