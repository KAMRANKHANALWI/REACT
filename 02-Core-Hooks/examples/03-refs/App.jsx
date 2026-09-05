import { useState, useRef, useEffect } from "react";

/**
 * useRef — DOM References + Persistent Mutable Values
 * -------------------------------------------------
 * 1. SearchBox      -> DOM ref (autofocus on mount, imperative .focus())
 * 2. PreviousValue  -> ref that remembers the last render's value
 * 3. RenderCounter  -> ref that counts renders WITHOUT causing more renders
 */

// 1. DOM ref -------------------------------------------------------------

function SearchBox() {
  const inputRef = useRef(null);

  useEffect(() => {
    // Runs once after mount — focuses the input automatically.
    inputRef.current.focus();
  }, []);

  return (
    <section>
      <h2>Search Box (DOM ref)</h2>
      <input ref={inputRef} placeholder="Auto-focused on mount" />
      <button onClick={() => inputRef.current.focus()}>
        Focus again
      </button>
    </section>
  );
}

// 2. Tracking the previous value -----------------------------------------

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    // Runs AFTER render, so during render "ref.current" still holds
    // the value from the render before this one.
    ref.current = value;
  }, [value]);

  return ref.current;
}

function PreviousValue() {
  const [count, setCount] = useState(0);
  const previousCount = usePrevious(count);

  return (
    <section>
      <h2>Previous Value (custom mini-hook using ref)</h2>
      <p>Now: {count}, Before: {previousCount ?? "—"}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>+1</button>
    </section>
  );
}

// 3. Render counter without re-rendering ----------------------------------

function RenderCounter() {
  const [text, setText] = useState("");
  const renderCount = useRef(0);

  // Mutating renderCount.current does NOT trigger a re-render itself —
  // it just tags along and reads correctly on whichever render happens
  // because of setText below.
  renderCount.current += 1;

  return (
    <section>
      <h2>Render Counter (ref, no extra re-render)</h2>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type to trigger renders"
      />
      <p>This component has rendered {renderCount.current} times.</p>
    </section>
  );
}

export default function App() {
  return (
    <div>
      <h1>useRef — DOM + Persistent Values</h1>
      <SearchBox />
      <PreviousValue />
      <RenderCounter />
    </div>
  );
}
