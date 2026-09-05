import { useState, useEffect } from "react";

/**
 * Loading / Error / Success States
 * -------------------------------------------------
 * Any async operation has (at minimum) four possible states. Modeling
 * them explicitly avoids bugs like showing stale data during a reload,
 * or a spinner and an error message rendering at the same time.
 *
 *   idle -> loading -> success
 *                   \-> error
 */

function PostDetails({ postId }) {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadPost() {
      setStatus("loading");
      setError(null);

      try {
        const res = await fetch(
          `https://jsonplaceholder.typicode.com/posts/${postId}`
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data = await res.json();
        if (!ignore) {
          setPost(data);
          setStatus("success");
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
          setStatus("error");
        }
      }
    }

    loadPost();
    return () => {
      ignore = true;
    };
  }, [postId]);

  // Each state renders its OWN thing — never a mix of two states at once.
  if (status === "loading") return <p>Loading post...</p>;
  if (status === "error") return <p>Failed to load post: {error}</p>;
  if (status === "success") return <h3>{post.title}</h3>;

  return null; // idle — nothing fetched yet
}

export default function App() {
  const [postId, setPostId] = useState(1);

  return (
    <div>
      <h1>Loading / Error / Success</h1>

      <button onClick={() => setPostId((id) => id + 1)}>Next post</button>
      {/* An id likely to 404, to see the error state in action */}
      <button onClick={() => setPostId(9999)}>Load broken post</button>

      <PostDetails postId={postId} />
    </div>
  );
}

/**
 * Why an explicit status string beats a couple of booleans:
 *
 *   const [isLoading, setIsLoading] = useState(false);
 *   const [isError, setIsError] = useState(false);
 *
 * lets you accidentally end up with isLoading=true AND isError=true
 * at the same time — an impossible state that still compiles fine.
 * A single "status" variable can only ever be ONE value, so impossible
 * combinations simply can't happen.
 */
