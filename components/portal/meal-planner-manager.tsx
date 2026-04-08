"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type MealPlannerEntry = {
  id: string;
  date: string;
  title: string;
  items: string[];
  note?: string;
  programIds: string[];
};

type MealPlannerManagerProps = {
  entries: MealPlannerEntry[];
  programs: Array<{ id: string; name: string }>;
};

export function MealPlannerManager({ entries, programs }: MealPlannerManagerProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    title: "Today's Meal",
    items: "Mini idli\nVegetable pulao\nFresh fruit",
    note: "",
    programIds: [] as string[],
  });

  const sortedEntries = useMemo(() => [...entries].sort((a, b) => a.date.localeCompare(b.date)).reverse(), [entries]);

  function toggleProgram(programId: string) {
    setForm((current) => ({
      ...current,
      programIds: current.programIds.includes(programId)
        ? current.programIds.filter((id) => id !== programId)
        : [...current.programIds, programId],
    }));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Meal Planner</p>
        <h2 className="mt-2 font-display text-3xl text-navy">Publish daily meals for selected courses</h2>
        <p className="mt-3 text-sm leading-7 text-navy/68">
          Parents should only see the menu that matches their child&apos;s program. Admin can publish one or more program menus from here.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-navy/45">Date</span>
            <input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className="w-full rounded-2xl border border-navy/10 px-4 py-3" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-navy/45">Menu title</span>
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-2xl border border-navy/10 px-4 py-3" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-navy/45">Meals</span>
            <textarea value={form.items} onChange={(event) => setForm((current) => ({ ...current, items: event.target.value }))} className="min-h-[140px] w-full rounded-[1.5rem] border border-navy/10 px-4 py-4" />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-navy/45">Note</span>
            <textarea value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} className="min-h-[100px] w-full rounded-[1.5rem] border border-navy/10 px-4 py-4" />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {programs.map((program) => {
            const active = form.programIds.includes(program.id);
            return (
              <button
                key={program.id}
                type="button"
                onClick={() => toggleProgram(program.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${active ? "bg-navy text-white" : "border border-navy/10 bg-white text-navy/68"}`}
              >
                {program.name}
              </button>
            );
          })}
        </div>

        {feedback ? <p className={`mt-4 text-sm ${feedback.startsWith("Unable") ? "text-red-600" : "text-emerald-700"}`}>{feedback}</p> : null}

        <div className="mt-5">
          <button
            type="button"
            disabled={isPending}
            onClick={() => {
              setFeedback("");
              startTransition(async () => {
                const response = await fetch("/api/admin/meal-planner", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    action: "save",
                    entry: {
                      date: form.date,
                      title: form.title,
                      items: form.items.split("\n").map((item) => item.trim()).filter(Boolean),
                      note: form.note,
                      programIds: form.programIds,
                    },
                  }),
                });

                const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string };
                if (!response.ok || !result.success) {
                  setFeedback(result.message ?? "Unable to save the meal plan.");
                  return;
                }

                setFeedback("Meal plan published successfully.");
                router.refresh();
              });
            }}
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Publish meal plan"}
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Published Menu Board</p>
            <h2 className="mt-2 font-display text-3xl text-navy">Recent course-wise menus</h2>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {sortedEntries.length > 0 ? (
            sortedEntries.map((entry) => (
              <article key={entry.id} className="rounded-[1.45rem] border border-navy/10 px-5 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-semibold text-navy">{entry.title}</p>
                    <p className="mt-2 text-sm text-navy/62">{entry.date}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.programIds.length > 0 ? entry.programIds.map((id) => {
                        const program = programs.find((item) => item.id === id);
                        return (
                          <span key={id} className="rounded-full bg-[#eef6ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1d4ed8]">
                            {program?.name ?? "Selected course"}
                          </span>
                        );
                      }) : (
                        <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                          All courses
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFeedback("");
                      startTransition(async () => {
                        const response = await fetch("/api/admin/meal-planner", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            action: "delete",
                            id: entry.id,
                          }),
                        });
                        const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string };
                        if (!response.ok || !result.success) {
                          setFeedback(result.message ?? "Unable to delete meal plan.");
                          return;
                        }
                        setFeedback("Meal plan deleted.");
                        router.refresh();
                      });
                    }}
                    className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-4 grid gap-3">
                  {entry.items.map((item) => (
                    <div key={item} className="rounded-[1.1rem] bg-[#fbf7f0] px-4 py-3 text-sm text-navy">
                      {item}
                    </div>
                  ))}
                </div>
                {entry.note ? <p className="mt-4 text-sm leading-6 text-navy/62">{entry.note}</p> : null}
              </article>
            ))
          ) : (
            <div className="rounded-[1.45rem] bg-[#fbf7f0] px-5 py-5 text-sm leading-7 text-navy/68">
              No course-wise menu has been published yet. Once admin adds one here, the parent portal can surface it cleanly.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
