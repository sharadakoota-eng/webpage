"use client";

import { useState, useTransition } from "react";

type OfflinePaymentUploaderProps = {
  invoiceId: string;
};

export function OfflinePaymentUploader({ invoiceId }: OfflinePaymentUploaderProps) {
  const [isPending, startTransition] = useTransition();
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function submitUpload() {
    setMessage(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("invoiceId", invoiceId);
      if (reference) formData.append("reference", reference);
      if (note) formData.append("note", note);
      if (file) formData.append("file", file);

      const response = await fetch("/api/parent/payments/offline", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (!response.ok || !data.success) {
        setMessage(data.message ?? "Unable to upload offline payment.");
        return;
      }

      setMessage("Offline payment submitted for verification.");
      setReference("");
      setNote("");
      setFile(null);
    });
  }

  return (
    <div className="mt-4 rounded-[1.2rem] border border-navy/10 bg-[#fbf7f0] p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Offline / UPI payment</p>
      <p className="mt-2 text-sm text-navy/65">
        Upload your UPI screenshot or bank reference so the school office can verify.
      </p>
      <div className="mt-4 grid gap-3">
        <input
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          placeholder="UPI / bank reference (optional)"
          className="w-full rounded-[1rem] border border-navy/10 bg-white px-4 py-2 text-sm text-navy"
        />
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Note for admin (optional)"
          className="w-full rounded-[1rem] border border-navy/10 bg-white px-4 py-2 text-sm text-navy"
        />
        <input
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="w-full text-xs text-navy/60 file:mr-3 file:rounded-full file:border-0 file:bg-cream file:px-3 file:py-2 file:text-xs file:font-semibold file:text-gold"
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={submitUpload}
          className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Uploading..." : "Submit offline payment"}
        </button>
        {message ? <p className="text-xs font-semibold text-navy/60">{message}</p> : null}
      </div>
    </div>
  );
}
