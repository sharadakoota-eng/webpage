"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ProgramManagerProps = {
  programs: Array<{
    id: string;
    name: string;
    slug: string;
    category: string;
    ageGroup: string;
    schedule?: string | null;
    shortIntro: string;
    overview: string;
    ctaLabel: string;
    isPublished: boolean;
  }>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProgramManager({ programs }: ProgramManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "CORE",
    ageGroup: "",
    schedule: "",
    shortIntro: "",
    overview: "",
    ctaLabel: "Apply now",
    isPublished: true,
  });

  function updateField(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm({
      name: "",
      slug: "",
      category: "CORE",
      ageGroup: "",
      schedule: "",
      shortIntro: "",
      overview: "",
      ctaLabel: "Apply now",
      isPublished: true,
    });
  }

  function applyEdit(program: ProgramManagerProps["programs"][number]) {
    setEditingId(program.id);
    setForm({
      name: program.name,
      slug: program.slug,
      category: program.category,
      ageGroup: program.ageGroup,
      schedule: program.schedule ?? "",
      shortIntro: program.shortIntro,
      overview: program.overview,
      ctaLabel: program.ctaLabel,
      isPublished: program.isPublished,
    });
  }

  function postAction(payload: Record<string, unknown>, successMessage: string) {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (!response.ok || !result.success) {
        setMessage(result.message ?? "Unable to update programs.");
        return;
      }
      setMessage(result.message ?? successMessage);
      resetForm();
      router.refresh();
    });
  }

  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-card">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Program Builder</p>
      <h3 className="mt-2 font-display text-3xl text-navy">Create, edit, and manage program offerings</h3>
      <p className="mt-3 text-sm leading-7 text-navy/68">
        Add new programs directly from the ERP, update pricing visibility, or remove a program that should no longer accept admissions.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <input
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="Program name"
          className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy"
        />
        <input
          value={form.slug}
          onChange={(event) => updateField("slug", event.target.value)}
          placeholder="Slug (auto if left blank)"
          className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy"
        />
        <select
          value={form.category}
          onChange={(event) => updateField("category", event.target.value)}
          className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy"
        >
          {["CORE", "DAYCARE", "ENRICHMENT", "CAMP", "LANGUAGE"].map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <input
          value={form.ageGroup}
          onChange={(event) => updateField("ageGroup", event.target.value)}
          placeholder="Age group"
          className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy"
        />
        <input
          value={form.schedule}
          onChange={(event) => updateField("schedule", event.target.value)}
          placeholder="Schedule / timings"
          className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy"
        />
        <input
          value={form.ctaLabel}
          onChange={(event) => updateField("ctaLabel", event.target.value)}
          placeholder="CTA label"
          className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy"
        />
        <input
          value={form.shortIntro}
          onChange={(event) => updateField("shortIntro", event.target.value)}
          placeholder="Short intro"
          className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy md:col-span-2"
        />
        <textarea
          value={form.overview}
          onChange={(event) => updateField("overview", event.target.value)}
          placeholder="Program overview"
          className="min-h-[120px] rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy md:col-span-2"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending || !form.name.trim() || !form.ageGroup.trim() || !form.shortIntro.trim()}
          onClick={() =>
            postAction(
              {
                action: editingId ? "updateProgram" : "createProgram",
                programId: editingId ?? undefined,
                ...form,
                slug: form.slug.trim() || slugify(form.name),
              },
              editingId ? "Program updated." : "Program created.",
            )
          }
          className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Saving..." : editingId ? "Update program" : "Create program"}
        </button>
        {editingId ? (
          <button
            type="button"
            onClick={resetForm}
            className="rounded-full border border-navy/10 px-6 py-3 text-sm font-semibold text-navy"
          >
            Cancel edit
          </button>
        ) : null}
      </div>

      {message ? <p className="mt-4 text-sm text-navy/70">{message}</p> : null}

      <div className="mt-8 space-y-4">
        {programs.map((program) => (
          <div key={program.id} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-navy">{program.name}</p>
                <p className="mt-2 text-sm text-navy/62">
                  {program.category} | {program.ageGroup} | {program.schedule ?? "Schedule pending"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyEdit(program)}
                  className="rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => postAction({ action: "deleteProgram", programId: program.id }, "Program deleted.")}
                  className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
