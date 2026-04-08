"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type StudentAssignmentCardProps = {
  studentId: string;
  currentClassId?: string | null;
  currentProgramId?: string | null;
  classes: Array<{ id: string; name: string; section?: string | null }>;
  programs: Array<{ id: string; name: string }>;
};

export function StudentAssignmentCard({
  studentId,
  currentClassId,
  currentProgramId,
  classes,
  programs,
}: StudentAssignmentCardProps) {
  const router = useRouter();
  const [classId, setClassId] = useState(currentClassId ?? "");
  const [programId, setProgramId] = useState(currentProgramId ?? "");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <section className="rounded-[1.6rem] border border-navy/10 bg-[#fbf7f0] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Assignments</p>
          <h3 className="mt-2 font-display text-2xl text-navy">Class and program mapping</h3>
          <p className="mt-2 text-sm leading-6 text-navy/62">
            Use this section to reassign the student without leaving the record page.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-navy/45">Class / Section</span>
          <select value={classId} onChange={(event) => setClassId(event.target.value)} className="w-full rounded-2xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy">
            <option value="">Class pending</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
                {item.section ? ` - ${item.section}` : ""}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-navy/45">Program</span>
          <select value={programId} onChange={(event) => setProgramId(event.target.value)} className="w-full rounded-2xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy">
            <option value="">Program unchanged</option>
            {programs.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {feedback ? <p className={`mt-4 text-sm ${feedback.startsWith("Unable") ? "text-red-600" : "text-emerald-700"}`}>{feedback}</p> : null}

      <div className="mt-5">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setFeedback("");
            startTransition(async () => {
              const response = await fetch(`/api/admin/students/${studentId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "assign",
                  classId,
                  programId,
                }),
              });

              const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string };
              if (!response.ok || !result.success) {
                setFeedback(result.message ?? "Unable to update student assignment.");
                return;
              }

              setFeedback("Student assignment updated.");
              router.refresh();
            });
          }}
          className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Save assignment"}
        </button>
      </div>
    </section>
  );
}
