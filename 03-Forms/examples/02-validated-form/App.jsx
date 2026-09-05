import { useState } from "react";

/**
 * Validated Form — Manual Validation
 * -------------------------------------------------
 * Same controlled-form pattern as before, plus a validate() function
 * that runs on submit and populates an errors object.
 */

function validate(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Name is required";

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!form.email.includes("@")) {
    errors.email = "Invalid email";
  }

  if (!form.password) {
    errors.password = "Password is required";
  } else if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!form.gender) errors.gender = "Please select a gender";
  if (!form.country) errors.country = "Please select a country";
  if (!form.agree) errors.agree = "You must agree to the terms";

  return errors;
}

export default function App() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    country: "",
    agree: false,
  });

  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear this field's error as soon as the user edits it.
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    const newErrors = validate(form);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Valid form:", form);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Validated Form</h1>

      <div>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} />
        {errors.name && <p>{errors.name}</p>}
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
        />
        {errors.email && <p>{errors.email}</p>}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />
        {errors.password && <p>{errors.password}</p>}
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
        {errors.gender && <p>{errors.gender}</p>}
      </fieldset>

      <div>
        <label>Country</label>
        <select name="country" value={form.country} onChange={handleChange}>
          <option value="">Select country</option>
          <option value="india">India</option>
          <option value="usa">USA</option>
          <option value="uk">UK</option>
        </select>
        {errors.country && <p>{errors.country}</p>}
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
      {errors.agree && <p>{errors.agree}</p>}

      <button type="submit">Submit</button>
    </form>
  );
}
