import { useState } from "react";

/**
 * Async Event Handlers
 * -------------------------------------------------
 * Unlike useEffect, an event handler CAN be declared async directly —
 * React doesn't care what an event handler returns, since it's not
 * looking for a cleanup function from it.
 *
 * 1. SignupForm    -> async onSubmit, try/catch, disable while pending
 * 2. LikeButton    -> optimistic update, roll back on failure
 */

// 1. Async submit with pending + error state ---------------------------------

function SignupForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Signup failed, please try again");

      console.log("Signed up:", email);
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      // "finally" runs whether it succeeded or threw — the button
      // should never stay stuck in a disabled/loading state.
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Signup (async submit)</h2>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing up..." : "Sign up"}
      </button>
      {error && <p>{error}</p>}
    </form>
  );
}

// 2. Optimistic update with rollback on failure -------------------------------

function LikeButton() {
  const [liked, setLiked] = useState(false);
  const [error, setError] = useState(null);

  async function handleLike() {
    const nextLiked = !liked;

    // Update the UI immediately, BEFORE the request finishes —
    // this is what makes an interaction feel instant.
    setLiked(nextLiked);
    setError(null);

    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/posts/1", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ liked: nextLiked }),
      });

      if (!res.ok) throw new Error("Server rejected the like");
    } catch (err) {
      // Roll back to the previous value if the server call fails.
      setLiked(!nextLiked);
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Like Button (optimistic update)</h2>
      <button onClick={handleLike}>{liked ? "❤️ Liked" : "🤍 Like"}</button>
      {error && <p>{error} — reverted.</p>}
    </div>
  );
}

export default function App() {
  return (
    <div>
      <h1>Async Event Handlers</h1>
      <SignupForm />
      <LikeButton />
    </div>
  );
}
