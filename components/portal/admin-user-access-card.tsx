"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type AdminUserAccessCardProps = {
  userId: string;
  isActive: boolean;
  title?: string;
};

export function AdminUserAccessCard({ userId, isActive, title = "Portal access" }: AdminUserAccessCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function runAction(body: Record<string, unknown>, successMessage: string) {
    setMessage("");
    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (!response.ok || !result.success) {
        setMessage(result.message ?? "Unable to update portal access.");
        return;
      }

      setMessage(successMessage);
      setPassword("");
      router.refresh();
    });
  }

  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-card">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">{title}</p>
      <h2 className="mt-2 font-display text-3xl text-navy">Reset password or control login</h2>
      <p className="mt-3 text-sm leading-7 text-navy/68">
        Admin can disable access, restore access, or set a temporary password if the user forgets their login.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() =>
            runAction(
              {
                action: "toggleActive",
                isActive: !isActive,
              },
              isActive ? "Portal access disabled." : "Portal access restored.",
            )
          }
          className="rounded-full border border-navy/10 px-5 py-3 text-sm font-semibold text-navy disabled:opacity-60"
        >
          {isPending ? "Updating..." : isActive ? "Disable login" : "Restore login"}
        </button>
      </div>

      <div className="mt-6 rounded-[1.5rem] bg-[#fbf7f0] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Temporary password</p>
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Leave blank to use admin12345"
            className="flex-1 rounded-2xl border border-navy/10 bg-white px-4 py-3"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              runAction(
                {
                  action: "resetPassword",
                  password: password.trim() || "admin12345",
                },
                `Temporary password set to "${password.trim() || "admin12345"}".`,
              )
            }
            className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Set temporary password"}
          </button>
        </div>
      </div>

      {message ? <p className="mt-4 text-sm text-navy/72">{message}</p> : null}
    </section>
  );
}
