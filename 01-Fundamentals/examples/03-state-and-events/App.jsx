import { useState } from "react";

/**
 * State + Events
 * -------------------------------------------------
 * 1. Toggle       -> useState + onClick (boolean state)
 * 2. LikeButton   -> useState + onClick (numeric state)
 * 3. QuickForm    -> onChange + onSubmit + event object
 */

// 1. Boolean state + click event -------------------------------------------

function Toggle() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <h2>Toggle (boolean state)</h2>
      <button onClick={() => setIsOpen((prev) => !prev)}>
        {isOpen ? "Hide" : "Show"} details
      </button>
      {isOpen && <p>Here are the extra details.</p>}
    </section>
  );
}

// 2. Numeric state + click event --------------------------------------------

function LikeButton() {
  const [likes, setLikes] = useState(0);

  function handleLike() {
    setLikes((prev) => prev + 1);
  }

  return (
    <section>
      <h2>Like Button (numeric state)</h2>
      <button onClick={handleLike}>👍 {likes}</button>
    </section>
  );
}

// 3. Change + submit events ---------------------------------------------------

function QuickForm() {
  const [message, setMessage] = useState("");

  function handleChange(e) {
    // "e" is React's SyntheticEvent — a cross-browser wrapper around
    // the native DOM event. e.target is the actual input element.
    setMessage(e.target.value);
  }

  function handleSubmit(e) {
    e.preventDefault(); // stop the browser's default page reload
    console.log("Sent:", message);
    setMessage("");
  }

  return (
    <section>
      <h2>Quick Form (change + submit events)</h2>
      <form onSubmit={handleSubmit}>
        <input value={message} onChange={handleChange} placeholder="Type a message" />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}

export default function App() {
  return (
    <div>
      <h1>State + Events</h1>
      <Toggle />
      <LikeButton />
      <QuickForm />
    </div>
  );
}
