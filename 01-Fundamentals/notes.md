# React Fundamentals

Quick-reference notes on the building blocks: JSX, Components, Props, Composition, State, Events, Rendering, Conditional Rendering, and Lists/Keys. Code examples live in `examples/`.

---

## JSX

JSX lets you write HTML-like syntax inside JavaScript. It compiles down to `React.createElement()` calls — it's not HTML, it's JS.

**Key rules:**
- A component must return a **single root element** (or a Fragment `<>...</>` to avoid an extra wrapper div).
- Attributes are **camelCase**: `className` not `class`, `onClick` not `onclick`.
- `{ }` embeds any JavaScript expression — variables, function calls, ternaries.

```jsx
function Greeting({ name }) {
  return (
    <>
      <h1>Hello, {name}!</h1>
      <p className={name ? "known" : "unknown"}>Status</p>
    </>
  );
}
```

---

## Components

A component is just a **function that returns JSX**. React renders it, and re-renders it whenever its state or props change.

```jsx
function Avatar({ name }) {
  return <div className="avatar">{name.charAt(0)}</div>;
}
```

Two rules of thumb:
- Component names start with a **capital letter** (`Avatar`, not `avatar`) — lowercase tags are treated as native HTML elements.
- Keep components small and focused on one piece of UI; combine them rather than writing one giant component (see Composition below).

---

## Props

Props are how a parent passes data **down** into a child component. They are read-only from the child's perspective — a component never modifies its own props.

```jsx
function Button({ label, onClick, variant = "primary" }) {
  return <button className={`btn-${variant}`} onClick={onClick}>{label}</button>;
}

<Button label="Save" onClick={handleSave} />
<Button label="Delete" variant="danger" onClick={handleDelete} />
```

- Destructure props in the function signature — cleaner than `props.label` everywhere.
- Default values (`variant = "primary"`) apply only when the caller doesn't pass that prop.

---

## Composition

Composition means building bigger UI out of smaller components — nesting them, and using the special **`children`** prop instead of threading data through props at every level.

```jsx
function Card({ title, children }) {
  // Anything nested inside <Card>...</Card> becomes "children" automatically.
  return (
    <div className="card">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

<Card title="Project Notes">
  <p>Any JSX goes here — Card doesn't need to know what it is.</p>
</Card>
```

This is also how you avoid **prop-drilling** — instead of passing a prop through three layers of components that don't use it, the parent builds the JSX for a "slot" and hands it straight to the component that needs it:

```jsx
<Layout
  sidebar={<Nav />}
  content={<MainPage />}
/>
```

---

## State

State is data that belongs to a component and can change over time — changing it triggers a re-render.

```jsx
const [likes, setLikes] = useState(0);

<button onClick={() => setLikes(prev => prev + 1)}>👍 {likes}</button>
```

State is local to the component instance unless explicitly lifted up or passed down via props. (Full `useState` patterns — objects, arrays, functional updates — are covered in `02-Core-Hooks/notes.md`.)

---

## Events

React wraps native DOM events in a **SyntheticEvent** — a consistent, cross-browser event object. Event handlers are passed as props like `onClick`, `onChange`, `onSubmit`.

```jsx
function QuickForm() {
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setMessage(e.target.value); // e.target is the actual DOM input
  }

  function handleSubmit(e) {
    e.preventDefault(); // stop the browser's default page reload
    console.log(message);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={message} onChange={handleChange} />
      <button type="submit">Send</button>
    </form>
  );
}
```

Common handlers: `onClick`, `onChange`, `onSubmit`, `onKeyDown`, `onBlur`, `onFocus`.

---

## Rendering

A component re-renders when:
1. Its own state changes.
2. Its parent re-renders (which re-passes props, even if they're the same values).
3. A context value it reads via `useContext` changes.

React then builds the new JSX tree, **diffs** it against the previous one, and updates only the parts of the real DOM that actually changed — it doesn't tear down and rebuild everything on every render.

---

## Conditional Rendering

Three common patterns, pick based on the shape of the check:

```jsx
// && — render something only if the condition is true
{isError && <p>Something went wrong.</p>}

// ternary — choose between two things to render
{status === "success" ? <p>Loaded.</p> : <p>No data yet.</p>}

// early return — skip rendering the rest of the component entirely
if (isLoading) return <p>Loading...</p>;
```

Use `&&` for "show or nothing," ternary for "show A or B," and an early return when one state (like loading) should replace the whole component output.

---

## Lists and Keys

Render a list with `.map()`, and give each item a **key**:

```jsx
{tasks.map(task => (
  <li key={task.id}>{task.text}</li>
))}
```

**Why keys matter:** React uses the key to match elements between renders — "this `<li>` is the same task as before" — instead of re-creating every DOM node from scratch. Without a stable key, React falls back to guessing by position, which causes bugs when the list is reordered, filtered, or has items inserted/removed (wrong item gets deleted, input focus jumps to the wrong row, etc.).

**Rule:** use a stable, unique id from your data (`task.id`) as the key — never the array index if the list can change order or length.

---

## Quick Reference

| Concept | One-line summary |
|---|---|
| JSX | HTML-like syntax that compiles to JS, one root element per return |
| Components | Functions that return JSX, capitalized names |
| Props | Read-only data passed parent → child |
| Composition | Building UI from smaller components; `children` avoids prop-drilling |
| State | Data owned by a component that triggers a re-render when changed |
| Events | `onClick`/`onChange`/`onSubmit` handlers receive a SyntheticEvent |
| Rendering | Triggered by state, prop, or context changes; React diffs and patches the DOM |
| Conditional Rendering | `&&`, ternary, or early return depending on the case |
| Lists and Keys | `.map()` + a stable unique `key` so React can track items correctly |
