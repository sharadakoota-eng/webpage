"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PaymentVerificationButtonProps = {
  paymentId: string;
  action: "verify" | "reject";
  label: string;
};

export function PaymentVerificationButton({ paymentId, action, label }: PaymentVerificationButtonProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleAction() {
    setIsPending(true);
    try {
      const response = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = (await response.json()) as { success?: boolean; message?: string };
      window.alert(result.message || "Unable to update payment.");
      if (response.ok && result.success) {
        router.refresh();
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleAction}
      disabled={isPending}
      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
        action === "verify" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {isPending ? "Saving..." : label}
    </button>
  );
}
