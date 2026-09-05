import { BrowserRouter, Routes, Route, Link, useNavigate } from "react-router-dom";

/**
 * Basic Routes + Navigation
 * -------------------------------------------------
 * npm install react-router-dom
 *
 * 1. BrowserRouter -> wraps the whole app, enables routing
 * 2. Routes/Route  -> declares which component renders for which URL
 * 3. Link          -> navigates WITHOUT a full page reload
 * 4. useNavigate   -> navigate imperatively (e.g. after a button click)
 * 5. A "not found" catch-all route
 */

function HomePage() {
  return <h2>Home</h2>;
}

function AboutPage() {
  return <h2>About</h2>;
}

function ContactPage() {
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Message sent");
    navigate("/"); // go back to home after "submitting"
  }

  return (
    <div>
      <h2>Contact</h2>
      <form onSubmit={handleSubmit}>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

function NotFoundPage() {
  return <h2>404 — Page not found</h2>;
}

function Navbar() {
  return (
    <nav>
      {/* Link renders an <a>, but React Router intercepts the click
          and swaps the page WITHOUT a full browser reload. */}
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/contact">Contact</Link>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        {/* "*" matches anything not matched above — always keep it last */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

/**
 * Link vs useNavigate:
 * - Link  -> for something the user CLICKS (a nav item, a "view details" link)
 * - useNavigate -> for navigation that happens as a SIDE EFFECT of code
 *   running (after a successful form submit, after login, a redirect)
 */
