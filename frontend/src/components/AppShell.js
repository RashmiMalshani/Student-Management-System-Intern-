"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RoleBadge, Spinner } from "@/components/ui";

const NAV = [
  { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "LECTURER", "STUDENT"] },
  { href: "/courses", label: "Courses", roles: ["ADMIN", "LECTURER", "STUDENT"] },
  { href: "/my-courses", label: "My enrollments", roles: ["STUDENT"] },
  { href: "/students", label: "Students", roles: ["ADMIN", "LECTURER"] },
  { href: "/users", label: "Users", roles: ["ADMIN"] },
];

export default function AppShell({ children }) {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => setOpen(false), [pathname]);

  if (!ready || !user) return <Spinner />;

  const links = NAV.filter((n) => n.roles.includes(user.role));
  const current = NAV.find((n) => pathname.startsWith(n.href));
  const forbidden = current && !current.roles.includes(user.role);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <header className="flex items-center justify-between bg-brand px-4 py-3 text-white lg:hidden">
        <span className="font-display text-lg">SMS</span>
        <button onClick={() => setOpen(!open)} className="rounded border border-white/40 px-3 py-1 text-sm">
          {open ? "Close" : "Menu"}
        </button>
      </header>

      <aside className={`${open ? "block" : "hidden"} bg-brand text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between`}>
        <div>
          <p className="hidden px-6 py-6 font-display text-xl lg:block">Student Management</p>
          <nav className="flex flex-col gap-1 px-3 py-3 lg:py-0">
            {links.map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link key={l.href} href={l.href}
                  className={`rounded-md px-3 py-2 text-sm ${active ? "bg-white text-brand font-medium" : "text-white/85 hover:bg-white/10"}`}>
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="border-t border-white/15 px-6 py-4 text-sm">
          <p className="font-medium">{user.fullName}</p>
          <p className="mb-2 truncate text-white/70">{user.email}</p>
          <div className="mb-3"><RoleBadge role={user.role} /></div>
          <button onClick={() => { logout(); router.replace("/login"); }} className="text-white/80 underline hover:text-white">
            Sign out
          </button>
        </div>
      </aside>

      <main className="px-5 py-8 lg:px-10">
        {forbidden ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-display text-lg">Access denied</p>
            <p className="text-sm">Your role ({user.role.toLowerCase()}) cannot open this page.</p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
