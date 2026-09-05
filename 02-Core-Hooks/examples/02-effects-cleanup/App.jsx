import { useState, useEffect } from "react";

/**
 * useEffect — Synchronization + Cleanup
 * -------------------------------------------------
 * 1. UserProfile     -> fetch + AbortController cleanup (cancel stale requests)
 * 2. Stopwatch       -> setInterval + clearInterval cleanup
 * 3. NetworkStatus   -> window event listener + removeEventListener cleanup
 */

// 1. Fetch with cleanup ------------------------------------------------

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUser() {
      setStatus("loading");
      try {
        const res = await fetch(
          `https://jsonplaceholder.typicode.com/users/${userId}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setUser(data);
        setStatus("success");
      } catch (err) {
        // Ignore the error caused by our own cleanup aborting the request.
        if (err.name !== "AbortError") setStatus("error");
      }
    }

    fetchUser();

    // Cleanup: if userId changes again before this request finishes,
    // cancel it so a slow, stale response can't overwrite newer data.
    return () => controller.abort();
  }, [userId]);

  if (status === "loading") return <p>Loading user {userId}...</p>;
  if (status === "error") return <p>Failed to load user.</p>;

  return <p>{user ? `${user.name} (${user.email})` : "No user"}</p>;
}

// 2. Interval with cleanup ---------------------------------------------

function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    // Cleanup: clear the interval when "running" flips off,
    // or when the component unmounts.
    return () => clearInterval(timer);
  }, [running]);

  return (
    <section>
      <h2>Stopwatch (interval cleanup)</h2>
      <p>{seconds}s</p>
      <button onClick={() => setRunning((prev) => !prev)}>
        {running ? "Pause" : "Start"}
      </button>
      <button onClick={() => setSeconds(0)}>Reset</button>
    </section>
  );
}

// 3. Event listener with cleanup ----------------------------------------

function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup: remove listeners on unmount to avoid memory leaks.
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <section>
      <h2>Network Status (listener cleanup)</h2>
      <p>Status: {isOnline ? "🟢 Online" : "🔴 Offline"}</p>
    </section>
  );
}

export default function App() {
  return (
    <div>
      <h1>useEffect — Synchronization + Cleanup</h1>
      <UserProfile userId={1} />
      <Stopwatch />
      <NetworkStatus />
    </div>
  );
}
