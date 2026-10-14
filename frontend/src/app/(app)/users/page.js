"use client";
import { useEffect, useState } from "react";
import api, { parseError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Empty, ErrorBanner, Field, Modal, Notice, RoleBadge, Spinner } from "@/components/ui";

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(null); // null | "new" | user
  const [filter, setFilter] = useState("");

  const load = async () => {
    setError("");
    try {
      setUsers((await api.get("/users")).data);
    } catch (err) {
      setError(parseError(err).message);
    }
  };
  useEffect(() => { load(); }, []);

  const remove = async (u) => {
    if (!confirm(`Delete ${u.fullName}? Their enrollments will be removed too.`)) return;
    setNotice("");
    try {
      await api.delete(`/users/${u.id}`);
      setNotice("User deleted");
      load();
    } catch (err) {
      setError(parseError(err).message);
    }
  };

  const shown = users ? users.filter((u) => !filter || u.role === filter) : [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl">Users</h1>
          <p className="mt-1 text-sm text-slate-600">Create accounts and change roles.</p>
        </div>
        <button className="btn-primary" onClick={() => setEditing("new")}>Add user</button>
      </div>

      <select className="input mb-5 max-w-[200px]" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by role">
        <option value="">All roles</option>
        <option value="ADMIN">Admins</option>
        <option value="LECTURER">Lecturers</option>
        <option value="STUDENT">Students</option>
      </select>

      <ErrorBanner message={error} onRetry={load} />
      <Notice message={notice} />
      {!users && !error && <Spinner />}
      {users && shown.length === 0 && <Empty title="No users match this filter" />}
      {shown.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr><th className="p-3">Name</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="p-3 font-medium">{u.fullName}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3"><RoleBadge role={u.role} /></td>
                  <td className="space-x-2 p-3 text-right">
                    <button className="btn-ghost" onClick={() => setEditing(u)}>Edit</button>
                    {u.id !== me.id && <button className="btn-danger" onClick={() => remove(u)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <UserForm
          user={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(m) => { setEditing(null); setNotice(m); load(); }}
        />
      )}
    </div>
  );
}

function UserForm({ user, onClose, onSaved }) {
  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "STUDENT",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!form.fullName.trim()) v.fullName = "Full name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) v.email = "Enter a valid email";
    if (!user && form.password.length < 6) v.password = "Password must be at least 6 characters";
    if (user && form.password && form.password.length < 6) v.password = "Password must be at least 6 characters";
    setErrors(v);
    if (Object.keys(v).length) return;
    try {
      if (user) await api.put(`/users/${user.id}`, form);
      else await api.post("/users", form);
      onSaved(user ? "User updated" : "User created");
    } catch (err) {
      const p = parseError(err);
      setError(p.message);
      setErrors(p.fields);
    }
  };

  return (
    <Modal title={user ? "Edit user" : "Add user"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <ErrorBanner message={error} />
        <Field label="Full name" error={errors.fullName}><input className="input" value={form.fullName} onChange={set("fullName")} /></Field>
        <Field label="Email" error={errors.email}><input type="email" className="input" value={form.email} onChange={set("email")} /></Field>
        <Field label={user ? "New password (leave empty to keep)" : "Password"} error={errors.password}>
          <input type="password" className="input" value={form.password} onChange={set("password")} />
        </Field>
        <Field label="Role" error={errors.role}>
          <select className="input" value={form.role} onChange={set("role")}>
            <option value="STUDENT">Student</option>
            <option value="LECTURER">Lecturer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </Field>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary">Save user</button>
        </div>
      </form>
    </Modal>
  );
}
