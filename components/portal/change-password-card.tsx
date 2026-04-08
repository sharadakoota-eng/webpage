"use client";

import { useState } from "react";

type ChangePasswordCardProps = {
  title?: string;
  description?: string;
};

const initialValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function ChangePasswordCard({
  title = "Change password",
  description = "Use your current password, then set a new secure password for future logins.",
}: ChangePasswordCardProps) {
  const [values, setValues] = useState(initialValues);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/portal/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update password.");
      }

      setValues(initialValues);
      setStatus("success");
      setMessage(result.message || "Password updated successfully.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to update password.");
    }
  }

  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-card">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Account Security</p>
      <h2 className="mt-2 font-display text-3xl text-navy">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-navy/68">{description}</p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          type="password"
          value={values.currentPassword}
          onChange={(event) => setValues((current) => ({ ...current, currentPassword: event.target.value }))}
          placeholder="Current password"
          className="rounded-2xl border border-navy/10 px-4 py-3"
        />
        <div className="rounded-[1.3rem] bg-[#fbf7f0] px-4 py-3 text-sm leading-7 text-navy/62">
          If you forgot your password, admin can set a temporary password and you can update it here after login.
        </div>
        <input
          type="password"
          value={values.newPassword}
          onChange={(event) => setValues((current) => ({ ...current, newPassword: event.target.value }))}
          placeholder="New password"
          className="rounded-2xl border border-navy/10 px-4 py-3"
        />
        <input
          type="password"
          value={values.confirmPassword}
          onChange={(event) => setValues((current) => ({ ...current, confirmPassword: event.target.value }))}
          placeholder="Confirm new password"
          className="rounded-2xl border border-navy/10 px-4 py-3"
        />

        <div className="md:col-span-2 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {status === "loading" ? "Updating..." : "Update password"}
          </button>
          {message ? (
            <p className={`text-sm ${status === "success" ? "text-emerald-700" : "text-red-600"}`}>{message}</p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
