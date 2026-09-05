import { useState, useEffect } from "react";

/**
 * Async in Effects
 * -------------------------------------------------
 * 1. WHY the effect callback itself can't be "async"
 * 2. The correct pattern: define an async function inside, call it
 * 3. Race conditions: what happens when props change faster than
 *    requests resolve, and how to guard against it
 */

// 1 & 2. The correct async-in-useEffect pattern -----------------------------

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ❌ You CANNOT do: useEffect(async () => { ... }, [dep])
    // useEffect expects its callback to return either nothing or a
    // cleanup function. An async function always returns a Promise —
    // React would try to treat that Promise as a cleanup function,
    // which breaks things. So instead:

    async function loadUser() {
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/users/${userId}`
      );
      const data = await res.json();
      setUser(data);
    }

    loadUser(); // define async logic separately, then just call it
  }, [userId]);

  return <p>{user ? user.name : "Loading..."}</p>;
}

// 3. Race condition: a slow older request can overwrite a newer one ----------

function UserProfileSafe({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let ignore = false; // a flag local to THIS effect run

    async function loadUser() {
      const res = await fetch(
        `https://jsonplaceholder.typicode.com/users/${userId}`
      );
      const data = await res.json();

      // Only apply the result if this effect run is still the latest one.
      if (!ignore) {
        setUser(data);
      }
    }

    loadUser();

    // Cleanup runs before the NEXT effect (i.e. when userId changes again),
    // marking this stale run's result as something to ignore.
    return () => {
      ignore = true;
    };
  }, [userId]);

  return <p>{user ? user.name : "Loading..."}</p>;
}

/**
 * Why this matters:
 * Suppose userId changes 1 -> 2 quickly. Two fetches are now in flight.
 * If the request for userId=1 (now stale) resolves AFTER the request
 * for userId=2, it would overwrite the correct data with old data.
 * The "ignore" flag prevents a stale response from ever being applied.
 *
 * (AbortController, shown in 02-Core-Hooks/examples/02-effects-cleanup,
 * solves the same problem by cancelling the request outright instead
 * of just ignoring its result — both are valid, AbortController also
 * saves the wasted network work.)
 */

export default function App() {
  const [userId, setUserId] = useState(1);

  return (
    <div>
      <h1>Async in Effects</h1>

      <button onClick={() => setUserId((id) => (id === 1 ? 2 : 1))}>
        Switch user
      </button>

      <h2>Without race protection</h2>
      <UserProfile userId={userId} />

      <h2>With race protection</h2>
      <UserProfileSafe userId={userId} />
    </div>
  );
}
