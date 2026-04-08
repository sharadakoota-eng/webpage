"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type CreateUserValues = {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleType: "ADMIN" | "TEACHER";
  designation?: string;
};

type CreateUserFormProps = {
  defaultRoleType?: "ADMIN" | "TEACHER";
  lockRoleType?: boolean;
  title?: string;
  description?: string;
};

const initialValues: CreateUserValues = {
  name: "",
  email: "",
  phone: "",
  password: "",
  roleType: "TEACHER",
  designation: "",
};

export function CreateUserForm({
  defaultRoleType = "TEACHER",
  lockRoleType = false,
  title = "Create admin or teacher access only",
  description = "This section is only for direct staff access. Parent accounts should never be created here. Parents must be generated from approved admissions or student enrollment workflows.",
}: CreateUserFormProps) {
  const router = useRouter();
  const [values, setValues] = useState<CreateUserValues>({ ...initialValues, roleType: defaultRoleType });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create user");
      }

      setStatus("success");
      setMessage(data.message || "User created successfully.");
      setValues({ ...initialValues, roleType: defaultRoleType });
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to create user");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 shadow-card">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Access & Staff</p>
      <h2 className="mt-2 font-display text-3xl text-navy">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-navy/70">{description}</p>

      <div className="mt-5 rounded-[1.45rem] bg-[#fbf7f0] p-4 text-sm leading-7 text-navy/68">
        Use a temporary password here, then hand it to the staff member. Admin can later disable access, reset credentials, or update teacher details from the same control module.
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <input
          value={values.name}
          onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
          placeholder="Full name"
          className="rounded-2xl border border-navy/10 px-4 py-3"
        />
        <input
          value={values.email}
          onChange={(event) => setValues((current) => ({ ...current, email: event.target.value }))}
          placeholder="Email"
          className="rounded-2xl border border-navy/10 px-4 py-3"
        />
        <input
          value={values.phone}
          onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))}
          placeholder="Phone"
          className="rounded-2xl border border-navy/10 px-4 py-3"
        />
        <input
          type="password"
          value={values.password}
          onChange={(event) => setValues((current) => ({ ...current, password: event.target.value }))}
          placeholder="Temporary password"
          className="rounded-2xl border border-navy/10 px-4 py-3"
        />
        {lockRoleType ? (
          <div className="rounded-2xl border border-navy/10 bg-[#fbf7f0] px-4 py-3 text-sm text-navy/70">
            {values.roleType === "TEACHER" ? "Teacher access" : "Admin access"}
          </div>
        ) : (
          <select
            value={values.roleType}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                roleType: event.target.value as CreateUserValues["roleType"],
              }))
            }
            className="rounded-2xl border border-navy/10 px-4 py-3"
          >
            <option value="TEACHER">Teacher</option>
            <option value="ADMIN">Admin</option>
          </select>
        )}

        <input
          value={values.designation}
          onChange={(event) => setValues((current) => ({ ...current, designation: event.target.value }))}
          placeholder={values.roleType === "TEACHER" ? "Designation" : "Access note / department"}
          className="rounded-2xl border border-navy/10 px-4 py-3"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white">
          {status === "loading" ? "Creating..." : "Create user"}
        </button>
        {message ? (
          <p className={`text-sm ${status === "success" ? "text-emerald-700" : "text-red-600"}`}>{message}</p>
        ) : null}
      </div>
    </form>
  );
}
