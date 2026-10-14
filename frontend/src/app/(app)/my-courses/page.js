"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import api, { parseError } from "@/lib/api";
import { Empty, ErrorBanner, Notice, Spinner } from "@/components/ui";

export default function MyCourses() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setError("");
    try {
      setItems((await api.get("/enrollments/my")).data);
    } catch (err) {
      setError(parseError(err).message);
    }
  };
  useEffect(() => { load(); }, []);

  const drop = async (e) => {
    setNotice("");
    try {
      await api.delete(`/enrollments/${e.id}`);
      setNotice(`Dropped ${e.courseCode}`);
      load();
    } catch (err) {
      setError(parseError(err).message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl">My enrollments</h1>
      <p className="mb-6 mt-1 text-sm text-slate-600">Courses you are currently enrolled in.</p>
      <ErrorBanner message={error} onRetry={load} />
      <Notice message={notice} />
      {!items && !error && <Spinner />}
      {items && items.length === 0 && (
        <div>
          <Empty title="You have not enrolled in any course yet" hint="Pick a course from the catalogue to get started." />
          <Link href="/courses" className="btn-primary mt-4">Browse courses</Link>
        </div>
      )}
      {items && items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr><th className="p-3">Course</th><th className="p-3">Lecturer</th><th className="p-3">Enrolled on</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="p-3"><span className="font-medium">{e.courseCode}</span> · {e.courseTitle}</td>
                  <td className="p-3">{e.lecturerName || "-"}</td>
                  <td className="p-3">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right"><button className="btn-ghost" onClick={() => drop(e)}>Drop</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
