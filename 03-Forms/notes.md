# React Forms

Quick-reference notes on controlled inputs, validation, and React Hook Form + Zod. Code examples live in `examples/`.

---

## Controlled Inputs

A controlled input's displayed value comes from React state, and every keystroke updates that state.

```jsx
const [name, setName] = useState("");

<input
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

```
State --value--> <input> --user types--> onChange --setState--> State
```

If `value` is set without `onChange`, the input becomes effectively read-only — React keeps forcing it back to whatever the state holds.

---

## Multiple Fields — One State Object

```jsx
const [form, setForm] = useState({
  name: "",
  email: "",
  password: "",
});
```

### One generic handler for every field
```jsx
function handleChange(e) {
  const { name, value } = e.target;
  setForm(prev => ({ ...prev, [name]: value }));
}
```
`[name]` is a computed property key — if the input's `name` attribute is `"email"`, this updates `form.email` specifically, and `...prev` preserves every other field.

```jsx
<input name="name" value={form.name} onChange={handleChange} />
<input name="email" value={form.email} onChange={handleChange} />
```

---

## Checkbox

Checkboxes hold a **boolean**, so they're controlled with `checked` + `e.target.checked`, not `value`.

```jsx
<input
  type="checkbox"
  checked={agree}
  onChange={(e) => setAgree(e.target.checked)}
/>
```

### Handling text + checkbox with one function
```jsx
function handleChange(e) {
  const { name, value, type, checked } = e.target;
  setForm(prev => ({
    ...prev,
    [name]: type === "checkbox" ? checked : value,
  }));
}
```

---

## Radio Buttons

Represents one choice from a group. All radios in the group share the same `name`; each has a different `value`.

```jsx
<input
  type="radio"
  name="gender"
  value="male"
  checked={form.gender === "male"}
  onChange={handleChange}
/>
```

- `value` → identifies which option this input represents.
- `checked` → a **comparison**, re-evaluated every render: `form.gender === "male"`.

Because `form.gender` can only hold one string at a time, only one comparison across the whole group can ever be `true` — that's what makes radios mutually exclusive. React isn't manually unchecking the others; every render just recomputes the same comparison for each option.

The same generic `handleChange` above works unchanged for radios — `type` is `"radio"`, which is not `"checkbox"`, so it falls into the `value` branch.

---

## Select / Dropdown

Controlled the same way as a text input — `value` + `onChange` on the `<select>` tag itself, not on the `<option>`s.

```jsx
<select name="country" value={form.country} onChange={handleChange}>
  <option value="">Select country</option>
  <option value="india">India</option>
  <option value="usa">USA</option>
</select>
```

The visible label ("India") and the stored value (`"india"`) can differ — `<option value="...">` sets what gets stored.

---

## Form Submission

```jsx
function handleSubmit(e) {
  e.preventDefault(); // stop the browser's default reload/navigation
  console.log(form);
}

<form onSubmit={handleSubmit}>...</form>
```

`preventDefault()` does not stop `handleSubmit` from running — it only blocks the browser's native form-submit behavior (a full page reload).

See `examples/01-controlled-form/App.jsx` for the complete pattern (text, checkbox, radio, select) wired together.

---

## Manual Validation

Keep `errors` as a separate state object from `form` — one holds data, the other holds feedback about that data.

```jsx
const [errors, setErrors] = useState({});

function validate(data) {
  const errors = {};
  if (!data.name.trim()) errors.name = "Name is required";
  if (!data.email.includes("@")) errors.email = "Invalid email";
  return errors; // empty object = no errors
}

function handleSubmit(e) {
  e.preventDefault();
  const newErrors = validate(form);
  setErrors(newErrors);

  if (Object.keys(newErrors).length === 0) {
    console.log("Submitting:", form);
  }
}
```

Displaying an error:
```jsx
{errors.name && <p>{errors.name}</p>}
```

**Frontend validation is UX, not security.** The backend must always re-validate — anyone can bypass client-side checks entirely.

See `examples/02-validated-form/App.jsx` for the full pattern, including clearing a field's error as the user edits it.

---

## React Hook Form (RHF)

A library that manages form state via refs instead of `useState`, so typing doesn't re-render the whole form on every keystroke — better performance on large forms.

```bash
npm install react-hook-form
```

```jsx
const { register, handleSubmit, formState: { errors } } = useForm();

<input {...register("email", { required: "Email is required" })} />
{errors.email && <p>{errors.email.message}</p>}

<form onSubmit={handleSubmit((data) => console.log(data))}>
```

- `register("email")` wires up `name`, `onChange`, `onBlur`, and a `ref` — replacing manual `value` + `onChange`.
- `handleSubmit(callback)` validates first, then calls your callback only if the form is valid — same idea as a hand-rolled validate-then-submit wrapper, just built in.
- `errors.email` is an object (`{ type, message }`), so display it with `.message`.

---

## Zod — Schema Validation

Describes the *shape* validation rules should check, instead of writing `if` statements by hand.

```bash
npm install zod @hookform/resolvers
```

```js
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  agree: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
});
```

## RHF + Zod Together

```jsx
import { zodResolver } from "@hookform/resolvers/zod";

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
});
```

```
Submit → RHF collects values from refs → zodResolver runs schema
       → fails: errors populated, form re-renders with messages
       → passes: your onValid(data) callback runs
```

See `examples/03-rhf-zod-form/App.jsx` for the complete production-style form.

---

## Reference Table

| Control | State type | Controlled with | Read from event |
|---|---|---|---|
| Text | string | `value` | `e.target.value` |
| Checkbox | boolean | `checked` | `e.target.checked` |
| Radio | string | `checked` (per option) | `e.target.value` |
| Select | string | `value` (on `<select>`) | `e.target.value` |

## When to Reach for RHF + Zod

- Small form, few fields, learning the fundamentals → plain `useState` is fine and worth understanding first.
- Larger form, many fields, complex validation, production app → React Hook Form + Zod saves real boilerplate and re-render overhead.

Either way, the core idea never changes: **state holds the data, something validates it before submit, and errors are shown conditionally.**
