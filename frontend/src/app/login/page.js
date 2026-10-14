"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { parseError } from "@/lib/api";
import { ErrorBanner } from "@/components/ui";

export default function LoginPage() {
  const { login, user, ready } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) return setError("Enter your email and password");
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.replace("/dashboard");
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const fill = (email, password) => setForm({ email, password });

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <p className="font-display text-xl">Student Management System</p>
        <div>
          <h1 className="max-w-md text-4xl leading-tight">Courses, lecturers and students in one place.</h1>
          <p className="mt-4 max-w-md text-white/80">
            Students enroll in courses, lecturers run them, and admins keep everything in order.
          </p>
        </div>
        <p className="text-sm text-white/60">Spring Boot · Next.js · MySQL</p>
      </section>

      <section className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm" noValidate>
          <h2 className="text-3xl">Sign in</h2>
          <p className="mb-6 mt-1 text-sm text-slate-500">Use the account you registered with.</p>
          <ErrorBanner message={error} />
          <div className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" type="password" className="input" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
            </div>
            <button className="btn-primary w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
          <p className="mt-5 text-sm text-slate-500">
            New here? <Link href="/register" className="font-medium text-brand underline">Create an account</Link>
          </p>

          <div className="mt-8 rounded-md border border-slate-200 bg-white p-4 text-xs text-slate-600">
            <p className="mb-2 font-medium text-slate-700">Demo accounts</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-ghost !px-2 !py-1 !text-xs" onClick={() => fill("admin@sms.com", "Admin@123")}>Admin</button>
              <button type="button" className="btn-ghost !px-2 !py-1 !text-xs" onClick={() => fill("lecturer@sms.com", "Lecturer@123")}>Lecturer</button>
              <button type="button" className="btn-ghost !px-2 !py-1 !text-xs" onClick={() => fill("student@sms.com", "Student@123")}>Student</button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}
