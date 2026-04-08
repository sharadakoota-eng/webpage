"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ParentDocumentReuploadCardProps = {
  admissionId: string;
  documentId: string;
  label: string;
  status: string;
  notes?: string | null;
};

export function ParentDocumentReuploadCard({
  admissionId,
  documentId,
  label,
  status,
  notes,
}: ParentDocumentReuploadCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  async function handleReupload() {
    if (!file) {
      setMessage("Choose a file to reupload.");
      return;
    }

    startTransition(async () => {
      setMessage("");
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/parent/admissions/${admissionId}/documents/${documentId}`, {
        method: "PATCH",
        body: formData,
      });
      const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (!response.ok || !result.success) {
        setMessage(result.message ?? "Unable to reupload document.");
        return;
      }

      setMessage(result.message ?? "Document reuploaded successfully.");
      setFile(null);
      router.refresh();
    });
  }

  return (
    <div className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
      <p className="font-semibold text-navy">{label}</p>
      <p className="mt-2 text-sm text-navy/65">{status.replaceAll("_", " ")}</p>
      {notes ? <p className="mt-2 text-sm leading-7 text-red-600">{notes}</p> : null}
      {status === "REJECTED" ? (
        <div className="mt-4">
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full text-xs text-navy/60 file:mr-3 file:rounded-full file:border-0 file:bg-cream file:px-3 file:py-2 file:text-xs file:font-semibold file:text-gold"
          />
          <button
            type="button"
            onClick={handleReupload}
            disabled={isPending}
            className="mt-3 rounded-full bg-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white disabled:opacity-60"
          >
            {isPending ? "Uploading..." : "Reupload"}
          </button>
        </div>
      ) : null}
      {message ? <p className="mt-3 text-sm text-navy/72">{message}</p> : null}
    </div>
  );
}
