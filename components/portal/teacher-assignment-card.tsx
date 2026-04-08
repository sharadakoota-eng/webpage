"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type TeacherAssignmentCardProps = {
  teacherId: string;
  currentClassIds: string[];
  classes: Array<{ id: string; name: string; section?: string | null }>;
  isActive: boolean;
};

export function TeacherAssignmentCard({ teacherId, currentClassIds, classes, isActive }: TeacherAssignmentCardProps) {
  const router = useRouter();
  const [classId, setClassId] = useState(currentClassIds[0] ?? "");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <section className="rounded-[1.6rem] border border-navy/10 bg-[#fbf7f0] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">Assignments</p>
      <h3 className="mt-2 font-display text-2xl text-navy">Class ownership</h3>
      <p className="mt-2 text-sm leading-6 text-navy/62">
        Assign this teacher to a class or disable access if the teacher should no longer log in.
      </p>

      <label className="mt-5 block space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-navy/45">Assign class</span>
        <select value={classId} onChange={(event) => setClassId(event.target.value)} className="w-full rounded-2xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy">
          <option value="">Select class</option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
              {item.section ? ` - ${item.section}` : ""}
            </option>
          ))}
        </select>
      </label>

      {feedback ? <p className={`mt-4 text-sm ${feedback.startsWith("Unable") ? "text-red-600" : "text-emerald-700"}`}>{feedback}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setFeedback("");
            startTransition(async () => {
              const response = await fetch(`/api/admin/teachers/${teacherId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "assignClass",
                  classId,
                  isLead: true,
                }),
              });
              const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string };
              if (!response.ok || !result.success) {
                setFeedback(result.message ?? "Unable to assign class.");
                return;
              }

              setFeedback("Teacher assignment updated.");
              router.refresh();
            });
          }}
          className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Assign class"}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            setFeedback("");
            startTransition(async () => {
              const response = await fetch(`/api/admin/teachers/${teacherId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "toggleActive",
                  isActive: !isActive,
                }),
              });
              const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string };
              if (!response.ok || !result.success) {
                setFeedback(result.message ?? "Unable to update teacher access.");
                return;
              }

              setFeedback(`Teacher access ${isActive ? "disabled" : "restored"}.`);
              router.refresh();
            });
          }}
          className="rounded-full border border-navy/10 px-5 py-3 text-sm font-semibold text-navy disabled:opacity-60"
        >
          {isPending ? "Updating..." : isActive ? "Disable login" : "Restore login"}
        </button>
      </div>
    </section>
  );
}
