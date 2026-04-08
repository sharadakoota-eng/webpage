"use client";

import { useState } from "react";

type DocumentDownloadButtonProps = {
  href: string;
  filename: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
};

export function DocumentDownloadButton({
  href,
  filename,
  children,
  variant = "secondary",
}: DocumentDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    try {
      setDownloading(true);
      const response = await fetch(href);
      if (!response.ok) {
        throw new Error("Unable to download document.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to download document.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={downloading}
      className={
        variant === "primary"
          ? "rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          : "rounded-full border border-navy/10 px-4 py-2 text-sm font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {downloading ? "Preparing..." : children}
    </button>
  );
}
