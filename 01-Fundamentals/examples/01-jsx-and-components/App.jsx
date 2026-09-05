/**
 * JSX + Components
 * -------------------------------------------------
 * 1. JsxRules       -> expressions, attributes, fragments, conditional class
 * 2. Avatar/Badge    -> small reusable components
 * 3. ProfileCard     -> composing components together
 */

// 1. JSX rules -----------------------------------------------------------

function JsxRules() {
  const name = "Kamran";
  const isOnline = true;

  return (
    // A component can only return ONE root element (or a Fragment <>...</>)
    <section>
      <h2>JSX Rules</h2>

      {/* Curly braces embed any JS expression */}
      <p>Hello, {name}!</p>

      {/* camelCase for DOM attributes, not "class" */}
      <p className={isOnline ? "status-online" : "status-offline"}>
        {isOnline ? "Online" : "Offline"}
      </p>

      {/* Fragment: group elements without adding an extra DOM node */}
      <>
        <span>No wrapper div</span>
        <span>around these two spans</span>
      </>
    </section>
  );
}

// 2. Small components ------------------------------------------------------

function Avatar({ name }) {
  return <div className="avatar">{name.charAt(0).toUpperCase()}</div>;
}

function Badge({ role }) {
  return <span className="badge">{role}</span>;
}

// 3. Composition — building a bigger UI from smaller components -------------

function ProfileCard({ name, role }) {
  return (
    <div className="profile-card">
      <Avatar name={name} />
      <h3>{name}</h3>
      <Badge role={role} />
    </div>
  );
}

export default function App() {
  return (
    <div>
      <h1>JSX + Components</h1>
      <JsxRules />
      <ProfileCard name="Kamran" role="GenAI Developer" />
    </div>
  );
}
