import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * React Hook Form + Zod — Production-Style Form
 * -------------------------------------------------
 * npm install react-hook-form zod @hookform/resolvers
 *
 * Zod schema is the single source of truth for validation rules
 * (and, in a TS project, for the inferred TypeScript type too).
 */

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  gender: z.string().min(1, "Please select a gender"),
  country: z.string().min(1, "Please select a country"),
  agree: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms" }),
  }),
});

export default function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  function onValid(data) {
    console.log("Valid data:", data);
  }

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <h1>RHF + Zod Form</h1>

      <div>
        <label>Name</label>
        <input {...register("name")} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>

      <div>
        <label>Email</label>
        <input type="email" {...register("email")} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      <div>
        <label>Password</label>
        <input type="password" {...register("password")} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      <fieldset>
        <legend>Gender</legend>
        {["male", "female", "other"].map((option) => (
          <label key={option}>
            <input type="radio" value={option} {...register("gender")} />
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </label>
        ))}
        {errors.gender && <p>{errors.gender.message}</p>}
      </fieldset>

      <div>
        <label>Country</label>
        <select {...register("country")}>
          <option value="">Select country</option>
          <option value="india">India</option>
          <option value="usa">USA</option>
          <option value="uk">UK</option>
        </select>
        {errors.country && <p>{errors.country.message}</p>}
      </div>

      <label>
        <input type="checkbox" {...register("agree")} />
        I agree to the terms
      </label>
      {errors.agree && <p>{errors.agree.message}</p>}

      <button type="submit">Submit</button>
    </form>
  );
}
