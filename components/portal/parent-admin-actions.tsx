"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ParentAdminActionsProps = {
  parentId: string;
  students: Array<{
    id: string;
    name: string;
  }>;
};

export function ParentAdminActions({ parentId, students }: ParentAdminActionsProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedStudent, setSelectedStudent] = useState(students[0]?.id ?? "");
  const [targetEmail, setTargetEmail] = useState("");

  function postAction(payload: Record<string, unknown>, successMessage: string) {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/admin/parents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (!response.ok || !result.success) {
        setMessage(result.message ?? "Unable to update parent record.");
        return;
      }

      setMessage(result.message ?? successMessage);
      setTargetEmail("");
      router.refresh();
    });
  }

  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-card">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Parent Actions</p>
      <h2 className="mt-2 font-display text-3xl text-navy">Manage access and student linkage</h2>
      <p className="mt-3 text-sm leading-7 text-navy/68">
        Use these controls to disable access, reassign a child, or remove incorrect linkages without deleting the admission record.
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          {students.length > 0 ? (
            students.map((student) => (
              <div key={student.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[1.3rem] border border-navy/10 px-5 py-4">
                <p className="font-semibold text-navy">{student.name}</p>
                <button
                  type="button"
                  onClick={() => postAction({ action: "removeStudentLink", parentId, studentId: student.id }, "Student unlinked.")}
                  disabled={isPending}
                  className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700 disabled:opacity-60"
                >
                  Remove link
                </button>
              </div>
            ))
          ) : (
            <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4 text-sm text-navy/68">No students linked yet.</div>
          )}
        </div>

        <div className="rounded-[1.5rem] bg-[#fbf7f0] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Reassign student</p>
          <div className="mt-3 grid gap-3">
            <select
              value={selectedStudent}
              onChange={(event) => setSelectedStudent(event.target.value)}
              className="rounded-[1rem] border border-navy/10 bg-white px-4 py-3 text-sm text-navy"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            <input
              value={targetEmail}
              onChange={(event) => setTargetEmail(event.target.value)}
              placeholder="Target parent email"
              className="rounded-[1rem] border border-navy/10 bg-white px-4 py-3 text-sm text-navy"
            />
            <button
              type="button"
              disabled={isPending || !selectedStudent || !targetEmail}
              onClick={() =>
                postAction(
                  { action: "reassignStudent", parentId, studentId: selectedStudent, targetEmail },
                  "Student reassigned successfully.",
                )
              }
              className="rounded-full bg-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-60"
            >
              Reassign
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => postAction({ action: "deactivateParent", parentId }, "Parent access disabled.")}
          className="rounded-full border border-navy/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-navy disabled:opacity-60"
        >
          Disable portal access
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => postAction({ action: "deleteParent", parentId }, "Parent deleted.")}
          className="rounded-full border border-rose-200 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-rose-700 disabled:opacity-60"
        >
          Delete parent record
        </button>
      </div>

      {message ? <p className="mt-4 text-sm text-navy/72">{message}</p> : null}
    </section>
  );
}
