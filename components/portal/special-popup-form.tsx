"use client";

import { useState, useTransition } from "react";

type PopupState = {
  enabled: boolean;
  title: string;
  message: string;
  buttonLabel: string;
  buttonUrl: string;
  audience: string;
};

export function SpecialPopupForm({ initialState }: { initialState: PopupState }) {
  const [form, setForm] = useState(initialState);
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateField<Key extends keyof PopupState>(key: Key, value: PopupState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    startTransition(async () => {
      const response = await fetch("/api/admin/special-popup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setFeedback(result?.error ?? "Unable to update popup settings right now.");
        return;
      }

      setFeedback("Special event popup updated successfully.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] bg-white p-8 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Special Event Popup</p>
          <h2 className="mt-2 font-display text-3xl text-navy">Manage a site-wide event popup</h2>
          <p className="mt-3 text-sm leading-7 text-navy/70">
            Use this for admissions drives, orientation events, camp launches, or urgent school announcements. Turning it off removes the popup from the website and portals.
          </p>
        </div>
        <label className="inline-flex items-center gap-3 rounded-full bg-cream px-4 py-3 text-sm font-semibold text-navy">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(event) => updateField("enabled", event.target.checked)}
            className="h-4 w-4 accent-navy"
          />
          Popup live
        </label>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="Popup title"
          className="rounded-2xl border border-navy/10 px-4 py-3"
        />
        <select
          value={form.audience}
          onChange={(event) => updateField("audience", event.target.value)}
          className="rounded-2xl border border-navy/10 px-4 py-3"
        >
          <option value="ALL">All visitors</option>
          <option value="PUBLIC">Public website only</option>
          <option value="PARENTS">Parents only</option>
        </select>
        <input
          value={form.buttonLabel}
          onChange={(event) => updateField("buttonLabel", event.target.value)}
          placeholder="Button label"
          className="rounded-2xl border border-navy/10 px-4 py-3"
        />
        <input
          value={form.buttonUrl}
          onChange={(event) => updateField("buttonUrl", event.target.value)}
          placeholder="Button URL"
          className="rounded-2xl border border-navy/10 px-4 py-3"
        />
      </div>

      <textarea
        value={form.message}
        onChange={(event) => updateField("message", event.target.value)}
        placeholder="Popup message"
        className="mt-4 min-h-[140px] w-full rounded-[1.6rem] border border-navy/10 px-4 py-4"
      />

      {feedback ? <p className="mt-4 text-sm text-navy/70">{feedback}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="submit" disabled={isPending} className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-70">
          {isPending ? "Saving..." : "Save popup settings"}
        </button>
        <button
          type="button"
          onClick={() =>
            setForm({
              enabled: false,
              title: "",
              message: "",
              buttonLabel: "Explore",
              buttonUrl: "/events",
              audience: "ALL",
            })
          }
          className="rounded-full border border-navy/10 px-5 py-3 text-sm font-semibold text-navy"
        >
          Clear draft
        </button>
      </div>
    </form>
  );
}
