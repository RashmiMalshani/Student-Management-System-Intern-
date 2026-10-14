"use client";
import { useEffect, useMemo, useState } from "react";
import api, { parseError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Empty, ErrorBanner, Field, Modal, Notice, Spinner } from "@/components/ui";

const blank = { code: "", title: "", description: "", credits: 3, capacity: 30, lecturerId: "" };

export default function CoursesPage() {
  const { user } = useAuth();
  const isStudent = user.role === "STUDENT";
  const isAdmin = user.role === "ADMIN";
  const canCreate = isAdmin || user.role === "LECTURER";

  const [courses, setCourses] = useState(null);
  const [myEnrollments, setMyEnrollments] = useState([]); // student only
  const [lecturers, setLecturers] = useState([]); // admin only
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [editing, setEditing] = useState(null); // null | "new" | course

  const load = async () => {
    setError("");
    try {
      const requests = [api.get("/courses")];
      if (isStudent) requests.push(api.get("/enrollments/my"));
      if (isAdmin) requests.push(api.get("/users", { params: { role: "LECTURER" } }));
      const res = await Promise.all(requests);
      setCourses(res[0].data);
      if (isStudent) setMyEnrollments(res[1].data);
      if (isAdmin) setLecturers(res[1].data);
    } catch (err) {
      setError(parseError(err).message);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const filtered = useMemo(() => {
    if (!courses) return [];
    const q = query.trim().toLowerCase();
    return courses.filter((c) => !q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q));
  }, [courses, query]);

  const run = async (id, fn, okMessage) => {
    setBusyId(id);
    setError("");
    setNotice("");
    try {
      await fn();
      setNotice(okMessage);
      await load();
    } catch (err) {
      setError(parseError(err).message);
    } finally {
      setBusyId(null);
    }
  };

  const enroll = (c) => run(c.id, () => api.post("/enrollments", { courseId: c.id }), `Enrolled in ${c.code}`);
  const drop = (c) => {
    const enr = myEnrollments.find((e) => e.courseId === c.id);
    if (enr) run(c.id, () => api.delete(`/enrollments/${enr.id}`), `Dropped ${c.code}`);
  };
  const remove = (c) => {
    if (confirm(`Delete ${c.code}? Enrollments in this course will be removed too.`))
      run(c.id, () => api.delete(`/courses/${c.id}`), `Deleted ${c.code}`);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Courses</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isStudent ? "Enroll in the courses you want to take." : "Create and maintain the course catalogue."}
          </p>
        </div>
        {canCreate && <button className="btn-primary" onClick={() => setEditing("new")}>Add course</button>}
      </div>

      <input className="input mb-5 max-w-sm" placeholder="Search by code or title" value={query}
        onChange={(e) => setQuery(e.target.value)} aria-label="Search courses" />

      <ErrorBanner message={error} onRetry={load} />
      <Notice message={notice} />

      {!courses && !error && <Spinner />}
      {courses && filtered.length === 0 && (
        <Empty title="No courses found" hint={canCreate ? "Use Add course to create the first one." : "Check back later or change your search."} />
      )}

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {filtered.map((c) => {
          const full = c.enrolledCount >= c.capacity;
          const own = c.lecturerId === user.id;
          const canEdit = isAdmin || (user.role === "LECTURER" && own);
          return (
            <article key={c.id} className="flex flex-col rounded-lg border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-accent">{c.code}</p>
                  <h2 className="text-xl leading-snug">{c.title}</h2>
                </div>
                <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{c.credits} credits</span>
              </div>
              <p className="mt-2 flex-1 text-sm text-slate-600">{c.description || "No description yet."}</p>
              <p className="mt-3 text-xs text-slate-500">
                Lecturer: {c.lecturerName || "Not assigned"} · {c.enrolledCount}/{c.capacity} seats taken
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {isStudent && (c.enrolled ? (
                  <button className="btn-ghost" disabled={busyId === c.id} onClick={() => drop(c)}>Drop course</button>
                ) : (
                  <button className="btn-primary" disabled={busyId === c.id || full} onClick={() => enroll(c)}>
                    {full ? "Course full" : "Enroll"}
                  </button>
                ))}
                {canEdit && <button className="btn-ghost" onClick={() => setEditing(c)}>Edit</button>}
                {isAdmin && <button className="btn-danger" disabled={busyId === c.id} onClick={() => remove(c)}>Delete</button>}
              </div>
            </article>
          );
        })}
      </div>

      {editing && (
        <CourseForm
          course={editing === "new" ? null : editing}
          isAdmin={isAdmin}
          lecturers={lecturers}
          onClose={() => setEditing(null)}
          onSaved={(msg) => { setEditing(null); setNotice(msg); load(); }}
        />
      )}
    </div>
  );
}

function CourseForm({ course, isAdmin, lecturers, onClose, onSaved }) {
  const [form, setForm] = useState(
    course
      ? { code: course.code, title: course.title, description: course.description || "", credits: course.credits, capacity: course.capacity, lecturerId: course.lecturerId || "" }
      : blank
  );
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.code.trim()) v.code = "Course code is required";
    if (!form.title.trim()) v.title = "Title is required";
    if (!(Number(form.credits) >= 1 && Number(form.credits) <= 10)) v.credits = "Credits must be between 1 and 10";
    if (!(Number(form.capacity) >= 1)) v.capacity = "Capacity must be at least 1";
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    setError("");
    const payload = {
      ...form,
      credits: Number(form.credits),
      capacity: Number(form.capacity),
      lecturerId: form.lecturerId ? Number(form.lecturerId) : null,
    };
    try {
      if (course) await api.put(`/courses/${course.id}`, payload);
      else await api.post("/courses", payload);
      onSaved(course ? "Course updated" : "Course created");
    } catch (err) {
      const p = parseError(err);
      setError(p.message);
      setErrors(p.fields);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={course ? "Edit course" : "Add course"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <ErrorBanner message={error} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Code" error={errors.code}><input className="input" value={form.code} onChange={set("code")} /></Field>
          <Field label="Credits" error={errors.credits}><input type="number" className="input" value={form.credits} onChange={set("credits")} /></Field>
        </div>
        <Field label="Title" error={errors.title}><input className="input" value={form.title} onChange={set("title")} /></Field>
        <Field label="Description" error={errors.description}>
          <textarea rows={3} className="input" value={form.description} onChange={set("description")} />
        </Field>
        <Field label="Capacity" error={errors.capacity}><input type="number" className="input" value={form.capacity} onChange={set("capacity")} /></Field>
        {isAdmin && (
          <Field label="Lecturer" error={errors.lecturerId}>
            <select className="input" value={form.lecturerId} onChange={set("lecturerId")}>
              <option value="">Not assigned</option>
              {lecturers.map((l) => <option key={l.id} value={l.id}>{l.fullName}</option>)}
            </select>
          </Field>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" disabled={saving}>{saving ? "Saving..." : "Save course"}</button>
        </div>
      </form>
    </Modal>
  );
}
