
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { parseError } from "@/lib/api";
import { ErrorBanner } from "@/components/ui";

function GraduationIcon({ className = "h-8 w-8" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="m2 10 10-5 10 5-10 5-10-5Z" />
      <path d="M6 12v5c3.5 3 8.5 3 12 0v-5" />
      <path d="M22 10v6" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function normalizeRole(role) {
  if (typeof role === "object" && role !== null) {
    role = role.authority || role.name || "";
  }

  return String(role || "")
    .trim()
    .toUpperCase()
    .replace(/^ROLE_/, "");
}

export default function LoginPage() {
  const router = useRouter();
  const { login, user, ready } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("STUDENT");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && user) {
      router.replace("/dashboard");
    }
  }, [ready, user, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      await login(email.trim(), password);

      const storedUser =
        typeof window !== "undefined"
          ? localStorage.getItem("sms_user")
          : null;

      let authenticatedUser = null;

      try {
        authenticatedUser = storedUser
          ? JSON.parse(storedUser)
          : null;
      } catch {
        authenticatedUser = null;
      }

      const actualRole = normalizeRole(
        authenticatedUser?.role ||
          authenticatedUser?.roles?.[0] ||
          authenticatedUser?.authorities?.[0]
      );

      if (!actualRole) {
        setError(
          "Login succeeded, but the user role was not returned. Please check the backend login response."
        );
        return;
      }

      if (actualRole !== selectedRole) {
        localStorage.removeItem("sms_user");
        localStorage.removeItem("sms_token");

        setError(
          `This account does not have the ${selectedRole} role. Please select the correct role.`
        );
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      const parsed = parseError(err);

      const message =
        typeof parsed === "string"
          ? parsed
          : parsed?.message;

      setError(
        typeof message === "string" && message.trim()
          ? message
          : err?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden bg-slate-950 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/15">
            <GraduationIcon />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">
              Student Management
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Academic Management System
            </p>
          </div>
        </div>

        <div className="relative max-w-xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
            Welcome back
          </p>

          <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
            Manage your academic journey in one place.
          </h2>

          <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
            Access student records, courses, enrollments, and academic
            information through one simple and secure platform.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              ["01", "Students"],
              ["02", "Courses"],
              ["03", "Enrollments"],
            ].map(([number, label]) => (
              <div
                key={number}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <p className="text-2xl font-bold">{number}</p>
                <p className="mt-2 text-sm text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} Student Management System
        </p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
              <GraduationIcon />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Student Management System
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Academic Management System
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-9">
            <div className="mb-7">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Sign in
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Select your role and enter your account details.
              </p>
            </div>

            {error && (
              <div className="mb-5">
                <ErrorBanner message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Login as
                </label>

                <select
                  id="role"
                  name="role"
                  value={selectedRole}
                  onChange={(event) =>
                    setSelectedRole(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  disabled={loading}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="LECTURER">Lecturer</option>
                  <option value="STUDENT">Student</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <MailIcon />
                  </span>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <LockIcon />
                  </span>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-20 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                    required
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !ready}
                className="flex w-full items-center justify-center rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-slate-400">
                  OR
                </span>
              </div>
            </div>

            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
            >
              Create an account
            </Link>

            <p className="mt-4 text-center text-sm text-slate-500">
              New to Student Management System?
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Secure access for students, lecturers, and administrators.
          </p>
        </div>
      </section>
    </main>
  );
}
