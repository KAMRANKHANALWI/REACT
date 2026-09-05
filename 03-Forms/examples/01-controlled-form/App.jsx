import { useState } from "react";

/**
 * Controlled Form — Baseline Pattern
 * -------------------------------------------------
 * Covers: text input, checkbox, radio group, select — all wired
 * through ONE generic handleChange using computed property names.
 */

export default function App() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    country: "",
    agree: false,
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Submitted:", form);
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Controlled Form</h1>

      <div>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} />
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
      </div>

      <fieldset>
        <legend>Gender</legend>
        {["male", "female", "other"].map((option) => (
          <label key={option}>
            <input
              type="radio"
              name="gender"
              value={option}
              checked={form.gender === option}
              onChange={handleChange}
            />
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </label>
        ))}
      </fieldset>

      <div>
        <label>Country</label>
        <select name="country" value={form.country} onChange={handleChange}>
          <option value="">Select country</option>
          <option value="india">India</option>
          <option value="usa">USA</option>
          <option value="uk">UK</option>
        </select>
      </div>

      <label>
        <input
          type="checkbox"
          name="agree"
          checked={form.agree}
          onChange={handleChange}
        />
        I agree to the terms
      </label>

      <button type="submit">Submit</button>
    </form>
  );
}
