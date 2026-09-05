import { useState, createContext, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";

/**
 * Protected Routes
 * -------------------------------------------------
 * 1. A tiny auth context (stand-in for real auth state/logic)
 * 2. RequireAuth -> a wrapper component that redirects if not logged in
 * 3. Redirecting back to the originally requested page after login
 */

// 1. Minimal auth context ------------------------------------------------------

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  function login() {
    setUser({ name: "Kamran" });
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  return useContext(AuthContext);
}

// 2. The guard component --------------------------------------------------------

function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation(); // where the user was trying to go

  if (!user) {
    // "replace" avoids adding the redirect itself to browser history,
    // and "state" carries along where to send them back after login.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

// 3. Pages ------------------------------------------------------------------------

function HomePage() {
  return <h2>Home (public)</h2>;
}

function DashboardPage() {
  const { user, logout } = useAuth();
  return (
    <div>
      <h2>Dashboard (protected)</h2>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  function handleLogin() {
    login();
    // In a real app you'd navigate("/dashboard", { replace: true }) here
    // after an async login call succeeds.
    window.history.replaceState(null, "", from);
  }

  return (
    <div>
      <h2>Login</h2>
      <p>You'll be sent to: {from}</p>
      <button onClick={handleLogin}>Log in</button>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

/**
 * The pattern in one line:
 * RequireAuth wraps a route's element. If there's no logged-in user,
 * it renders a <Navigate> instead of the protected page — same idea
 * as an "if (!user) return <Redirect />" guard, just expressed as a
 * reusable wrapper component around any route you want to protect.
 */
