"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

type PopupPayload = {
  enabled?: boolean;
  title?: string;
  message?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  audience?: string;
};

export function SpecialEventPopup() {
  const [popup, setPopup] = useState<PopupPayload | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const storageKey = useMemo(() => {
    if (!popup?.title && !popup?.message) {
      return "";
    }

    return `special-popup:${popup.title ?? ""}:${popup.message ?? ""}`;
  }, [popup]);

  useEffect(() => {
    let isMounted = true;

    async function loadPopup() {
      const response = await fetch("/api/public/special-popup", { cache: "no-store" });
      const result = await response.json().catch(() => ({}));

      if (!isMounted) {
        return;
      }

      setPopup(result?.popup ?? null);
    }

    loadPopup();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!storageKey) {
      return;
    }

    setDismissed(window.localStorage.getItem(storageKey) === "dismissed");
  }, [storageKey]);

  if (!popup?.enabled || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-navy/45 p-4 sm:items-center">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] bg-white shadow-soft">
        <button
          type="button"
          onClick={() => {
            if (storageKey) {
              window.localStorage.setItem(storageKey, "dismissed");
            }
            setDismissed(true);
          }}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-navy/5 text-navy/70"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="bg-[linear-gradient(135deg,#0f2242_0%,#18325b_62%,#d7a43d_160%)] px-6 py-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">Special School Update</p>
          <h2 className="mt-3 font-display text-3xl">{popup.title ?? "Sharada Koota Montessori"}</h2>
        </div>

        <div className="space-y-5 px-6 py-6 sm:px-8">
          <p className="text-sm leading-8 text-navy/74">{popup.message ?? "A new school update is available."}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={popup.buttonUrl ?? "/events"} className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
              {popup.buttonLabel ?? "View details"}
            </Link>
            <button
              type="button"
              onClick={() => {
                if (storageKey) {
                  window.localStorage.setItem(storageKey, "dismissed");
                }
                setDismissed(true);
              }}
              className="rounded-full border border-navy/10 px-5 py-3 text-sm font-semibold text-navy"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
