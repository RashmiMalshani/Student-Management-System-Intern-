
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { parseError } from "@/lib/api";
import { ErrorBanner, Field } from "@/components/ui";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};

    if (!form.fullName.trim()) {
      e.fullName = "Full name is required";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      e.email = "Enter a valid email";
    }

    if (form.password.length < 6) {
      e.password = "Password must be at least 6 characters";
    }

    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setError("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      await register(form);
      router.replace("/dashboard");
    } catch (err) {
      const parsedError = parseError(err);

      setError(
        typeof parsedError === "string"
          ? parsedError
          : parsedError?.message ||
              err?.message ||
              "Registration failed. Please try again."
      );

      setErrors(parsedError?.fields || {});
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (event) => {
    setForm((previous) => ({
      ...previous,
      [key]: event.target.value,
    }));
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm"
        noValidate
      >
        <h1 className="text-3xl">Create account</h1>

        <p className="mb-6 mt-1 text-sm text-slate-500">
          Pick the role that matches how you will use the system.
        </p>

        <ErrorBanner message={error} />

        <div className="space-y-4">
          <Field label="Full name" error={errors.fullName}>
            <input
              name="fullName"
              type="text"
              autoComplete="name"
              className="input"
              value={form.fullName}
              onChange={set("fullName")}
              required
            />
          </Field>

          <Field label="Email" error={errors.email}>
            <input
              name="email"
              type="email"
              autoComplete="email"
              className="input"
              value={form.email}
              onChange={set("email")}
              required
            />
          </Field>

          <Field label="Password" error={errors.password}>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              className="input"
              value={form.password}
              onChange={set("password")}
              minLength={6}
              required
            />
          </Field>

          <Field label="I am a" error={errors.role}>
            <select
              name="role"
              className="input"
              value={form.role}
              onChange={set("role")}
              required
            >
              <option value="STUDENT">Student</option>
              <option value="LECTURER">Lecturer</option>
              <option value="ADMIN">Admin</option>
            </select>
          </Field>

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>

        <p className="mt-5 text-sm text-slate-500">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-medium text-brand underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
