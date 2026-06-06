"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type EntityDeleteButtonProps = {
  endpoint: string;
  label?: string;
  confirmMessage?: string;
  redirectTo?: string;
  successMessage?: string;
  className?: string;
};

export function EntityDeleteButton({
  endpoint,
  label = "Delete",
  confirmMessage = "Delete this record?",
  redirectTo,
  successMessage = "Record deleted successfully.",
  className,
}: EntityDeleteButtonProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => {
          if (!window.confirm(confirmMessage)) {
            return;
          }

          setFeedback("");
          startTransition(async () => {
            const response = await fetch(endpoint, { method: "DELETE" });
            const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string };

            if (!response.ok || !result.success) {
              setFeedback(result.message ?? "Unable to delete this record.");
              return;
            }

            if (redirectTo) {
              const separator = redirectTo.includes("?") ? "&" : "?";
              router.push(`${redirectTo}${separator}notice=${encodeURIComponent(result.message ?? successMessage)}`);
              router.refresh();
              return;
            }

            setFeedback(result.message ?? successMessage);
            router.refresh();
          });
        }}
        disabled={isPending}
        className={
          className ??
          "rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 transition hover:bg-red-50 disabled:opacity-60"
        }
      >
        {isPending ? "Deleting..." : label}
      </button>
      {feedback ? <p className={`text-sm ${feedback.toLowerCase().includes("unable") ? "text-red-600" : "text-emerald-700"}`}>{feedback}</p> : null}
    </div>
  );
}
