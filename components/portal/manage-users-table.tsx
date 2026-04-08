"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Power, RefreshCcw, Search, Trash2 } from "lucide-react";

export type ManagedPortalUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  roleType: string;
  designation?: string | null;
  occupation?: string | null;
};

type EditableField = "name" | "email" | "phone" | "designation" | "occupation";

type ManageUsersTableProps = {
  users: ManagedPortalUser[];
  allowedRoles?: Array<"ADMIN" | "TEACHER" | "PARENT">;
};

type InlineMessage = {
  type: "success" | "error";
  text: string;
} | null;

export function ManageUsersTable({ users: initialUsers, allowedRoles = ["ADMIN", "TEACHER", "PARENT"] }: ManageUsersTableProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "TEACHER" | "PARENT">("ALL");
  const [resetPassword, setResetPassword] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<InlineMessage>(null);
  const [drafts, setDrafts] = useState<Record<string, ManagedPortalUser>>(() =>
    Object.fromEntries(initialUsers.map((user) => [user.id, user])),
  );

  const totals = useMemo(
    () => ({
      active: users.filter((user) => user.isActive).length,
      teachers: users.filter((user) => user.roleType === "TEACHER").length,
      parents: users.filter((user) => user.roleType === "PARENT").length,
    }),
    [users],
  );

  const roleFilterOptions = ["ALL", ...allowedRoles] as const;

  const visibleUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = roleFilter === "ALL" || user.roleType === roleFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        user.name.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        (user.phone ?? "").toLowerCase().includes(normalizedSearch);

      return matchesRole && matchesSearch;
    });
  }, [roleFilter, search, users]);

  function setDraftField(userId: string, field: EditableField, value: string) {
    setDrafts((current) => ({
      ...current,
      [userId]: {
        ...current[userId],
        [field]: value,
      },
    }));
  }

  async function handleSave(userId: string) {
    const draft = drafts[userId];
    setSavingId(userId);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateProfile",
          name: draft.name,
          email: draft.email,
          phone: draft.phone ?? "",
          designation: draft.designation ?? "",
          occupation: draft.occupation ?? "",
        }),
      });

      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save changes.");
      }

      setUsers((current) => current.map((user) => (user.id === userId ? draft : user)));
      setEditingId(null);
      setMessage({ type: "success", text: "User updated successfully." });
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to save changes." });
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggleActive(userId: string, isActive: boolean) {
    setSavingId(userId);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleActive",
          isActive: !isActive,
        }),
      });

      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update access.");
      }

      setUsers((current) => current.map((user) => (user.id === userId ? { ...user, isActive: !isActive } : user)));
      setDrafts((current) => ({
        ...current,
        [userId]: {
          ...current[userId],
          isActive: !isActive,
        },
      }));
      setMessage({ type: "success", text: !isActive ? "User access restored." : "User login disabled." });
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to update access." });
    } finally {
      setSavingId(null);
    }
  }

  async function handleResetPassword(userId: string) {
    const nextPassword = resetPassword[userId]?.trim() || "admin12345";
    setSavingId(userId);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "resetPassword",
          password: nextPassword,
        }),
      });

      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to reset password.");
      }

      setMessage({ type: "success", text: `Temporary password reset to "${nextPassword}".` });
      setResetPassword((current) => ({ ...current, [userId]: "" }));
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to reset password." });
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(userId: string) {
    setSavingId(userId);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete user.");
      }

      setUsers((current) => current.filter((user) => user.id !== userId));
      setMessage({ type: "success", text: "User deleted successfully." });
      router.refresh();
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Unable to delete user." });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Current Users</p>
          <h2 className="mt-2 font-display text-3xl text-navy">Active account management</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-navy/68">
            Admin can now review user records, edit details, disable login, issue temporary passwords, and remove accounts if needed.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 rounded-[1.5rem] bg-[#fbf7f0] p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Active</p>
            <p className="mt-2 font-display text-3xl text-navy">{totals.active}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Teachers</p>
            <p className="mt-2 font-display text-3xl text-navy">{totals.teachers}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">
              {allowedRoles.includes("PARENT") ? "Parents" : "Admin users"}
            </p>
            <p className="mt-2 font-display text-3xl text-navy">
              {allowedRoles.includes("PARENT") ? totals.parents : users.filter((user) => user.roleType === "ADMIN").length}
            </p>
          </div>
        </div>
      </div>

      {message ? (
        <div className={`mt-5 rounded-[1.3rem] px-4 py-3 text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
          {message.text}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <label className="flex items-center gap-3 rounded-[1.3rem] border border-navy/10 bg-[#fbf7f0] px-4 py-3 text-sm text-navy/55 xl:min-w-[330px]">
          <Search className="h-4 w-4 text-navy/35" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, or phone"
            className="w-full bg-transparent outline-none"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          {roleFilterOptions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setRoleFilter(item)}
              className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                roleFilter === item
                  ? "bg-navy text-white"
                  : "border border-navy/10 bg-white text-navy/65 hover:border-gold/25 hover:text-navy"
              }`}
            >
              {item === "ALL" ? "All users" : item.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {visibleUsers.map((user) => {
          const isEditing = editingId === user.id;
          const draft = drafts[user.id];
          const isSaving = savingId === user.id;

          return (
            <div key={user.id} className="rounded-[1.5rem] border border-navy/10 bg-[#fffdfa] p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-semibold text-navy">{user.name}</p>
                    <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                      {user.roleType.replaceAll("_", " ")}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                        user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {user.isActive ? "Active" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-sm text-navy/68">{user.email}</p>
                  <p className="text-sm text-navy/58">{user.phone ?? "Phone not set"}</p>
                  {user.designation ? <p className="text-sm text-navy/58">Designation: {user.designation}</p> : null}
                  {user.occupation ? <p className="text-sm text-navy/58">Occupation: {user.occupation}</p> : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId((current) => (current === user.id ? null : user.id))}
                    className="inline-flex items-center gap-2 rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy/70 transition hover:border-gold/25 hover:text-navy"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    {isEditing ? "Close" : "Edit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(user.id, user.isActive)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy/70 transition hover:border-gold/25 hover:text-navy disabled:opacity-60"
                  >
                    <Power className="h-3.5 w-3.5" />
                    {user.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(user.id)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-full border border-red-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>

              {isEditing ? (
                <div className="mt-5 grid gap-4 border-t border-navy/8 pt-5 lg:grid-cols-2">
                  <input
                    value={draft.name}
                    onChange={(event) => setDraftField(user.id, "name", event.target.value)}
                    placeholder="Full name"
                    className="rounded-2xl border border-navy/10 px-4 py-3"
                  />
                  <input
                    value={draft.email}
                    onChange={(event) => setDraftField(user.id, "email", event.target.value)}
                    placeholder="Email"
                    className="rounded-2xl border border-navy/10 px-4 py-3"
                  />
                  <input
                    value={draft.phone ?? ""}
                    onChange={(event) => setDraftField(user.id, "phone", event.target.value)}
                    placeholder="Phone"
                    className="rounded-2xl border border-navy/10 px-4 py-3"
                  />
                  {user.roleType === "TEACHER" ? (
                    <input
                      value={draft.designation ?? ""}
                      onChange={(event) => setDraftField(user.id, "designation", event.target.value)}
                      placeholder="Designation"
                      className="rounded-2xl border border-navy/10 px-4 py-3"
                    />
                  ) : user.roleType === "PARENT" ? (
                    <input
                      value={draft.occupation ?? ""}
                      onChange={(event) => setDraftField(user.id, "occupation", event.target.value)}
                      placeholder="Occupation"
                      className="rounded-2xl border border-navy/10 px-4 py-3"
                    />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-navy/10 px-4 py-3 text-sm text-navy/45">
                      Admin access does not need extra profile fields here.
                    </div>
                  )}
                  <div className="lg:col-span-2 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => handleSave(user.id)}
                      disabled={isSaving}
                      className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
                    >
                      {isSaving ? "Saving..." : "Save changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setDrafts((current) => ({ ...current, [user.id]: user }));
                      }}
                      className="rounded-full border border-navy/10 px-5 py-3 text-sm font-semibold text-navy/70"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="lg:col-span-2 rounded-[1.4rem] bg-cream p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Temporary Password</p>
                    <div className="mt-3 flex flex-col gap-3 md:flex-row">
                      <input
                        value={resetPassword[user.id] ?? ""}
                        onChange={(event) =>
                          setResetPassword((current) => ({
                            ...current,
                            [user.id]: event.target.value,
                          }))
                        }
                        placeholder="Leave blank to use admin12345"
                        className="flex-1 rounded-2xl border border-navy/10 px-4 py-3"
                      />
                      <button
                        type="button"
                        onClick={() => handleResetPassword(user.id)}
                        disabled={isSaving}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-navy shadow-card disabled:opacity-60"
                      >
                        <RefreshCcw className="h-4 w-4" />
                        Reset password
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

        {visibleUsers.length === 0 ? (
          <div className="rounded-[1.4rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
            No users match the current search or role filter.
          </div>
        ) : null}
      </div>
    </section>
  );
}
