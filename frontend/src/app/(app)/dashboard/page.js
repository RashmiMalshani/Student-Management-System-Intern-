
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api, { parseError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ErrorBanner, Spinner } from "@/components/ui";

const roleMessages = {
  ADMIN: "Manage your people, courses, and enrollments from one place.",
  LECTURER: "Organize your courses and keep track of student progress.",
  STUDENT: "Explore courses and stay up to date with your learning.",
};

const icons = {
  courses: "▤",
  students: "♙",
  lecturers: "✦",
  enrollments: "✓",
  credits: "◈",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      const coursesResponse = await api.get("/courses");
      const courses = Array.isArray(coursesResponse.data)
        ? coursesResponse.data
        : [];

      if (user.role === "STUDENT") {
        const enrollmentResponse = await api.get("/enrollments/my");
        const enrollments = Array.isArray(enrollmentResponse.data)
          ? enrollmentResponse.data
          : [];

        const credits = enrollments.reduce((total, enrollment) => {
          const course = courses.find(
            (item) => item.id === enrollment.courseId
          );
          return total + (course?.credits || 0);
        }, 0);

        setStats([
          {
            label: "Available courses",
            value: courses.length,
            icon: icons.courses,
            color: "blue",
          },
          {
            label: "My enrollments",
            value: enrollments.length,
            icon: icons.enrollments,
            color: "green",
          },
          {
            label: "My credits",
            value: credits,
            icon: icons.credits,
            color: "purple",
          },
        ]);
      } else if (user.role === "LECTURER") {
        const enrollmentResponse = await api.get("/enrollments");
        const enrollments = Array.isArray(enrollmentResponse.data)
          ? enrollmentResponse.data
          : [];

        const myCourses = courses.filter(
          (course) => course.lecturerId === user.id
        );

        setStats([
          {
            label: "My courses",
            value: myCourses.length,
            icon: icons.courses,
            color: "blue",
          },
          {
            label: "Enrollments",
            value: enrollments.length,
            icon: icons.students,
            color: "green",
          },
          {
            label: "All courses",
            value: courses.length,
            icon: icons.credits,
            color: "purple",
          },
        ]);
      } else {
        const [usersResponse, enrollmentResponse] = await Promise.all([
          api.get("/users"),
          api.get("/enrollments"),
        ]);

        const users = Array.isArray(usersResponse.data)
          ? usersResponse.data
          : [];

        const enrollments = Array.isArray(enrollmentResponse.data)
          ? enrollmentResponse.data
          : [];

        setStats([
          {
            label: "Total courses",
            value: courses.length,
            icon: icons.courses,
            color: "blue",
          },
          {
            label: "Students",
            value: users.filter((item) => item.role === "STUDENT").length,
            icon: icons.students,
            color: "green",
          },
          {
            label: "Lecturers",
            value: users.filter((item) => item.role === "LECTURER").length,
            icon: icons.lecturers,
            color: "purple",
          },
          {
            label: "Enrollments",
            value: enrollments.length,
            icon: icons.enrollments,
            color: "orange",
          },
        ]);
      }
    } catch (err) {
      setError(
        parseError(err)?.message ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadDashboard();
  }, [user]);

  if (!user) return <Spinner />;

  const firstName = user.fullName?.split(" ")[0] || "User";

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10254b] via-[#174a99] to-[#3479e5] px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border-[35px] border-white/5" />
        <div className="pointer-events-none absolute -bottom-28 right-40 h-64 w-64 rounded-full bg-blue-300/10 blur-2xl" />

        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-50">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            STUDENT MANAGEMENT SYSTEM
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back, {firstName}!
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
            {roleMessages[user.role] || "Welcome to your academic workspace."}
          </p>

          <Link
            href="/courses"
            className="mt-7 inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#173b79] shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50"
          >
            Explore courses <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              OVERVIEW
            </p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Dashboard
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Here is what is happening in your workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="btn-ghost"
          >
            {loading ? "Refreshing..." : "↻ Refresh data"}
          </button>
        </div>

        <ErrorBanner message={error} onRetry={loadDashboard} />

        {loading && !stats ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <Spinner label="Loading dashboard..." />
          </div>
        ) : stats ? (
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => (
              <div
                key={item.label}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-sm font-semibold text-slate-500">
                    {item.label}
                  </dt>

                  <span className={`dashboard-stat-icon ${item.color}`}>
                    {item.icon}
                  </span>
                </div>

                <dd className="mt-5 text-4xl font-bold tracking-tight text-slate-900">
                  {item.value}
                </dd>

                <p className="mt-2 text-xs text-slate-400">
                  Current system data
                </p>
              </div>
            ))}
          </dl>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Quick actions
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Navigate to your most-used sections.
            </p>
          </div>

          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
            {user.role}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Link href="/courses" className="quick-action">
            <span className="quick-action-icon">▤</span>
            <span>
              <strong>Browse courses</strong>
              <small>Explore the course catalogue</small>
            </span>
            <span className="ml-auto text-slate-400">→</span>
          </Link>

          {user.role !== "STUDENT" && (
            <Link href="/students" className="quick-action">
              <span className="quick-action-icon">♙</span>
              <span>
                <strong>Manage students</strong>
                <small>View student information</small>
              </span>
              <span className="ml-auto text-slate-400">→</span>
            </Link>
          )}

          {user.role === "ADMIN" && (
            <Link href="/users" className="quick-action">
              <span className="quick-action-icon">✦</span>
              <span>
                <strong>Manage users</strong>
                <small>Accounts and user roles</small>
              </span>
              <span className="ml-auto text-slate-400">→</span>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
