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
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "STUDENT" });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (form.password.length < 6) e.password = "Password must be at least 6 characters";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setError("");
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    setLoading(true);
    try {
      await register(form);
      router.replace("/dashboard");
    } catch (err) {
      const p = parseError(err);
      setError(p.message);
      setErrors(p.fields);
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-sm" noValidate>
        <h1 className="text-3xl">Create account</h1>
        <p className="mb-6 mt-1 text-sm text-slate-500">Pick the role that matches how you will use the system.</p>
        <ErrorBanner message={error} />
        <div className="space-y-4">
          <Field label="Full name" error={errors.fullName}>
            <input className="input" value={form.fullName} onChange={set("fullName")} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input type="email" className="input" value={form.email} onChange={set("email")} />
          </Field>
          <Field label="Password" error={errors.password}>
            <input type="password" className="input" value={form.password} onChange={set("password")} />
          </Field>
          <Field label="I am a" error={errors.role}>
            <select className="input" value={form.role} onChange={set("role")}>
              <option value="STUDENT">Student</option>
              <option value="LECTURER">Lecturer</option>
            </select>
          </Field>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </div>
        <p className="mt-5 text-sm text-slate-500">
          Already registered? <Link href="/login" className="font-medium text-brand underline">Sign in</Link>
        </p>
      </form>
    </main>
  );
}
