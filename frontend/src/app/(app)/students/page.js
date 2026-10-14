"use client";
import { useEffect, useMemo, useState } from "react";
import api, { parseError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Empty, ErrorBanner, Field, Modal, Notice, Spinner } from "@/components/ui";

export default function StudentsPage() {
  const { user } = useAuth();
  const isAdmin = user.role === "ADMIN";
  const [items, setItems] = useState(null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  const load = async () => {
    setError("");
    try {
      setItems((await api.get("/enrollments")).data);
    } catch (err) {
      setError(parseError(err).message);
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    return items.filter((e) => !q || [e.studentName, e.studentEmail, e.courseCode, e.courseTitle].some((v) => v.toLowerCase().includes(q)));
  }, [items, query]);

  const remove = async (e) => {
    if (!confirm(`Remove ${e.studentName} from ${e.courseCode}?`)) return;
    try {
      await api.delete(`/enrollments/${e.id}`);
      setNotice("Enrollment removed");
      load();
    } catch (err) {
      setError(parseError(err).message);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Students</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isAdmin ? "Every enrollment across all courses." : "Students enrolled in your courses."}
          </p>
        </div>
        {isAdmin && <button className="btn-primary" onClick={() => setEnrolling(true)}>Enroll a student</button>}
      </div>

      <input className="input mb-5 max-w-sm" placeholder="Search student or course" value={query}
        onChange={(e) => setQuery(e.target.value)} aria-label="Search enrollments" />
      <ErrorBanner message={error} onRetry={load} />
      <Notice message={notice} />

      {!items && !error && <Spinner />}
      {items && filtered.length === 0 && <Empty title="No enrollments to show" hint="Students appear here once they enroll in a course." />}
      {filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr><th className="p-3">Student</th><th className="p-3">Email</th><th className="p-3">Course</th><th className="p-3">Enrolled on</th>{isAdmin && <th className="p-3" />}</tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{e.studentName}</td>
                  <td className="p-3">{e.studentEmail}</td>
                  <td className="p-3">{e.courseCode} · {e.courseTitle}</td>
                  <td className="p-3">{new Date(e.enrolledAt).toLocaleDateString()}</td>
                  {isAdmin && <td className="p-3 text-right"><button className="btn-ghost" onClick={() => remove(e)}>Remove</button></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {enrolling && <EnrollForm onClose={() => setEnrolling(false)} onSaved={() => { setEnrolling(false); setNotice("Student enrolled"); load(); }} />}
    </div>
  );
}

function EnrollForm({ onClose, onSaved }) {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ studentId: "", courseId: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/users", { params: { role: "STUDENT" } }), api.get("/courses")])
      .then(([s, c]) => { setStudents(s.data); setCourses(c.data); })
      .catch((err) => setError(parseError(err).message));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.courseId) return setError("Select a student and a course");
    try {
      await api.post("/enrollments", { studentId: Number(form.studentId), courseId: Number(form.courseId) });
      onSaved();
    } catch (err) {
      setError(parseError(err).message);
    }
  };

  return (
    <Modal title="Enroll a student" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <ErrorBanner message={error} />
        <Field label="Student">
          <select className="input" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
            <option value="">Select a student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.fullName} ({s.email})</option>)}
          </select>
        </Field>
        <Field label="Course">
          <select className="input" value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
            <option value="">Select a course</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code} · {c.title}</option>)}
          </select>
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary">Enroll</button>
        </div>
      </form>
    </Modal>
  );
}
