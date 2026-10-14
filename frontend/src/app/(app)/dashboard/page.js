"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api, { parseError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ErrorBanner, Spinner } from "@/components/ui";

const copy = {
  ADMIN: "You have full access: manage users, courses and enrollments.",
  LECTURER: "Create and update your courses, and see who has enrolled.",
  STUDENT: "Browse courses and enroll in the ones you want to take.",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const courses = (await api.get("/courses")).data;
      if (user.role === "STUDENT") {
        const mine = (await api.get("/enrollments/my")).data;
        setStats({
          items: [
            ["Available courses", courses.length],
            ["My enrollments", mine.length],
            ["My credits", mine.reduce((sum, e) => sum + (courses.find((c) => c.id === e.courseId)?.credits || 0), 0)],
          ],
        });
      } else if (user.role === "LECTURER") {
        const enr = (await api.get("/enrollments")).data;
        const own = courses.filter((c) => c.lecturerId === user.id);
        setStats({ items: [["My courses", own.length], ["Enrolled students", enr.length], ["All courses", courses.length]] });
      } else {
        const [users, enr] = await Promise.all([api.get("/users"), api.get("/enrollments")]);
        setStats({
          items: [
            ["Courses", courses.length],
            ["Students", users.data.filter((u) => u.role === "STUDENT").length],
            ["Lecturers", users.data.filter((u) => u.role === "LECTURER").length],
            ["Enrollments", enr.data.length],
          ],
        });
      }
    } catch (err) {
      setError(parseError(err).message);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  return (
    <div>
      <h1 className="text-3xl">Welcome, {user.fullName.split(" ")[0]}</h1>
      <p className="mb-8 mt-1 text-slate-600">{copy[user.role]}</p>
      <ErrorBanner message={error} onRetry={load} />
      {!stats && !error && <Spinner />}
      {stats && (
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.items.map(([label, value]) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-5">
              <dd className="font-display text-4xl">{value}</dd>
              <dt className="mt-1 text-sm text-slate-500">{label}</dt>
            </div>
          ))}
        </dl>
      )}
      <Link href="/courses" className="btn-primary mt-8">Go to courses</Link>
    </div>
  );
}
