import { useState, Suspense, lazy } from "react";

/**
 * Code Splitting — React.lazy + Suspense
 * -------------------------------------------------
 * Without splitting, EVERY component ships in one giant JS bundle that
 * downloads before the app can render anything. Lazy-loading a heavy
 * component means its code only downloads when it's actually needed.
 *
 * Note: in a real project, AnalyticsDashboard would live in its own
 * file (e.g. "./AnalyticsDashboard.jsx") and you'd write:
 *   const AnalyticsDashboard = lazy(() => import("./AnalyticsDashboard"));
 * Here it's inlined below for a self-contained example.
 */

// Pretend this is a big, heavy component (charts, a large data grid, etc.)
// living in its own file, imported lazily instead of up-front.
const AnalyticsDashboard = lazy(
  () =>
    new Promise((resolve) => {
      // Simulating the network delay of downloading a separate chunk.
      setTimeout(() => {
        resolve({
          default: function AnalyticsDashboard() {
            return (
              <div>
                <h3>Analytics Dashboard</h3>
                <p>Heavy charts and data-grid code, loaded on demand.</p>
              </div>
            );
          },
        });
      }, 1000);
    })
);

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <div>
      <h1>Code Splitting</h1>

      <button onClick={() => setShowDashboard(true)}>
        Open Analytics Dashboard
      </button>

      {showDashboard && (
        // Suspense shows a fallback UI while the lazy component's code
        // is still downloading. It only needs to wrap components that
        // might still be loading — everything else renders immediately.
        <Suspense fallback={<p>Loading dashboard...</p>}>
          <AnalyticsDashboard />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Where this matters most in a real app: route-based splitting.
 *
 *   const SettingsPage = lazy(() => import("./pages/SettingsPage"));
 *
 *   <Routes>
 *     <Route path="/settings" element={
 *       <Suspense fallback={<PageSpinner />}>
 *         <SettingsPage />
 *       </Suspense>
 *     } />
 *   </Routes>
 *
 * A user who only ever visits the home page never downloads the code
 * for the settings page, the admin panel, etc. — each route becomes
 * its own separate chunk, fetched only when visited.
 */
