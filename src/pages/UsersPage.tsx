// ============================================================
// Users Management Page — admin-only, full CRUD with modals
// ============================================================
import React, { useState, useMemo } from "react";
import {
  Search, UserPlus, Pencil, Trash2, X, AlertTriangle,
  ChevronLeft, ChevronRight, Shield, Users, UserCheck, UserX,
} from "lucide-react";
import type { Role } from "@/types";

// ── Types ────────────────────────────────────────────────────
interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  status: "Active" | "Inactive";
  createdAt: string;
  avatar: string;
}

// ── Seed data ────────────────────────────────────────────────
const seed: ManagedUser[] = [
  { id: "u1", name: "Alice Admin",   email: "admin@helpdesk.com", role: "admin", department: "IT Operations", status: "Active",   createdAt: "2024-01-10", avatar: "AA" },
  { id: "u2", name: "Bob Agent",     email: "agent@helpdesk.com", role: "agent", department: "Support",       status: "Active",   createdAt: "2024-02-14", avatar: "BA" },
  { id: "u3", name: "Carol User",    email: "user@helpdesk.com",  role: "user",  department: "Finance",       status: "Active",   createdAt: "2024-03-01", avatar: "CU" },
  { id: "u4", name: "David Smith",   email: "david@helpdesk.com", role: "agent", department: "Network",       status: "Inactive", createdAt: "2024-03-15", avatar: "DS" },
  { id: "u5", name: "Eva Johnson",   email: "eva@helpdesk.com",   role: "user",  department: "HR",            status: "Active",   createdAt: "2024-04-02", avatar: "EJ" },
  { id: "u6", name: "Frank Lee",     email: "frank@helpdesk.com", role: "user",  department: "Marketing",     status: "Inactive", createdAt: "2024-04-10", avatar: "FL" },
  { id: "u7", name: "Grace Kim",     email: "grace@helpdesk.com", role: "admin", department: "IT Security",   status: "Active",   createdAt: "2024-04-18", avatar: "GK" },
  { id: "u8", name: "Henry Brown",   email: "henry@helpdesk.com", role: "agent", department: "Support",       status: "Active",   createdAt: "2024-05-01", avatar: "HB" },
];

const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  agent: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  user:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
};

const AVATAR_COLORS = [
  "bg-purple-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500",
  "bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500",
];

const PAGE_SIZE = 6;

// ── Empty form ────────────────────────────────────────────────
const emptyForm = { name: "", email: "", password: "", role: "user" as Role, department: "", status: "Active" as "Active" | "Inactive" };

// ══════════════════════════════════════════════════════════════
export default function UsersPage() {
  const [users, setUsers]       = useState<ManagedUser[]>(seed);
  const [search, setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");
  const [page, setPage]         = useState(1);

  // Modal state
  const [modalOpen, setModalOpen]       = useState(false);
  const [editTarget, setEditTarget]     = useState<ManagedUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [form, setForm]                 = useState(emptyForm);
  const [formErrors, setFormErrors]     = useState<Partial<typeof emptyForm>>({});

  // ── Filter + search ──────────────────────────────────────────
  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "All" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    users.length,
    admins:   users.filter((u) => u.role === "admin").length,
    agents:   users.filter((u) => u.role === "agent").length,
    inactive: users.filter((u) => u.status === "Inactive").length,
  }), [users]);

  // ── Modal helpers ────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEdit = (u: ManagedUser) => {
    setEditTarget(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role, department: u.department, status: u.status });
    setFormErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const e: Partial<typeof emptyForm> = {};
    if (!form.name.trim())    e.name    = "Name is required";
    if (!form.email.trim())   e.email   = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!editTarget && !form.password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = () => {
    const e = validateForm();
    if (Object.keys(e).length) { setFormErrors(e); return; }
    if (editTarget) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editTarget.id
            ? { ...u, name: form.name, email: form.email, role: form.role, department: form.department, status: form.status }
            : u
        )
      );
    } else {
      const newUser: ManagedUser = {
        id:         `u${Date.now()}`,
        name:       form.name,
        email:      form.email,
        role:       form.role,
        department: form.department,
        status:     form.status,
        createdAt:  new Date().toISOString().split("T")[0],
        avatar:     form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const setField = <K extends keyof typeof emptyForm>(k: K, v: typeof emptyForm[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (formErrors[k]) setFormErrors((p) => ({ ...p, [k]: "" }));
  };

  return (
    <div className="p-6 space-y-6 page-enter">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Users Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage team members, roles and access</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm
            hover:bg-[hsl(var(--primary-dark))] transition-all hover:shadow-[0_4px_14px_hsl(var(--primary)/0.4)] active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users",  value: stats.total,    icon: Users,     color: "text-blue-400",   bg: "bg-blue-500/10"   },
          { label: "Admins",       value: stats.admins,   icon: Shield,    color: "text-purple-400", bg: "bg-purple-500/10" },
          { label: "Agents",       value: stats.agents,   icon: UserCheck, color: "text-emerald-400",bg: "bg-emerald-500/10"},
          { label: "Inactive",     value: stats.inactive, icon: UserX,     color: "text-amber-400",  bg: "bg-amber-500/10"  },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4 shadow-[var(--shadow-card)]">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm
              placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value as Role | "All"); setPage(1); }}
          className="px-3 py-2.5 rounded-xl border border-input bg-card text-foreground text-sm
            focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all min-w-[140px]"
        >
          <option value="All">All Roles</option>
          <option value="admin">Admin</option>
          <option value="agent">Agent</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-card rounded-2xl border border-border shadow-[var(--shadow-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Department</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted-foreground text-sm">
                    No users match your search.
                  </td>
                </tr>
              ) : (
                paginated.map((u, i) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                            AVATAR_COLORS[i % AVATAR_COLORS.length]
                          }`}
                        >
                          {u.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground hidden md:table-cell">{u.department || "—"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border capitalize ${ROLE_COLORS[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        u.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                          : "bg-muted text-muted-foreground border-border"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === "Active" ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground hidden lg:table-cell">{u.createdAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
                          title="Edit user"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setPage(idx + 1)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                    page === idx + 1
                      ? "bg-primary text-primary-foreground shadow-[0_2px_8px_hsl(var(--primary)/0.35)]"
                      : "border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ Add/Edit User Modal ══ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-card rounded-2xl shadow-[var(--shadow-modal)] border border-border w-full max-w-md animate-[fadeSlideUp_0.25s_ease-out] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
                <h2 className="text-base font-bold text-foreground">
                  {editTarget ? "Edit User" : "Add New User"}
                </h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  placeholder="John Doe"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-background text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all
                    ${formErrors.name ? "border-destructive" : "border-input"}`}
                />
                {formErrors.name && <p className="mt-1 text-xs text-destructive">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  placeholder="john@company.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-background text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all
                    ${formErrors.email ? "border-destructive" : "border-input"}`}
                />
                {formErrors.email && <p className="mt-1 text-xs text-destructive">{formErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Password {editTarget ? "(leave blank to keep)" : "*"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-background text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all
                    ${formErrors.password ? "border-destructive" : "border-input"}`}
                />
                {formErrors.password && <p className="mt-1 text-xs text-destructive">{formErrors.password}</p>}
              </div>

              {/* Role + Department row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setField("role", e.target.value as Role)}
                    className="w-full px-3 py-2.5 rounded-xl border border-input text-sm bg-background text-foreground
                      focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                  >
                    <option value="admin">Admin</option>
                    <option value="agent">Agent</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value as "Active" | "Inactive")}
                    className="w-full px-3 py-2.5 rounded-xl border border-input text-sm bg-background text-foreground
                      focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Department</label>
                <input
                  value={form.department}
                  onChange={(e) => setField("department", e.target.value)}
                  placeholder="e.g. IT Operations"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input text-sm bg-background text-foreground
                    placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-all"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/20">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold
                  hover:bg-[hsl(var(--primary-dark))] transition-all hover:shadow-[0_4px_14px_hsl(var(--primary)/0.35)]"
              >
                {editTarget ? "Save Changes" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ Delete Confirmation Modal ══ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-card rounded-2xl shadow-[var(--shadow-modal)] border border-border w-full max-w-sm animate-[fadeSlideUp_0.25s_ease-out] p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-destructive" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Delete User</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <span className="font-semibold text-foreground">{deleteTarget.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
