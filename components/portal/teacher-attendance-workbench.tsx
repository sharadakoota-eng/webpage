"use client";

import { AttendanceStatus } from "@prisma/client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type TeacherAttendanceWorkbenchProps = {
  classes: Array<{
    id: string;
    name: string;
    section?: string | null;
    students: Array<{
      id: string;
      firstName: string;
      lastName?: string | null;
      admissionNumber: string;
      todayStatus?: AttendanceStatus | null;
      todayRemarks?: string | null;
    }>;
  }>;
};

export function TeacherAttendanceWorkbench({ classes }: TeacherAttendanceWorkbenchProps) {
  const router = useRouter();
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const selectedClass = useMemo(() => classes.find((entry) => entry.id === selectedClassId) ?? classes[0], [classes, selectedClassId]);
  const [entries, setEntries] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>(
    Object.fromEntries(
      classes.flatMap((entry) =>
        entry.students.map((student) => [
          student.id,
          {
            status: student.todayStatus ?? AttendanceStatus.PRESENT,
            remarks: student.todayRemarks ?? "",
          },
        ]),
      ),
    ),
  );

  function updateEntry(studentId: string, partial: Partial<{ status: AttendanceStatus; remarks: string }>) {
    setEntries((current) => ({
      ...current,
      [studentId]: {
        status: current[studentId]?.status ?? AttendanceStatus.PRESENT,
        remarks: current[studentId]?.remarks ?? "",
        ...partial,
      },
    }));
  }

  function submitAttendance() {
    if (!selectedClass) {
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/teacher/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass.id,
          date,
          entries: selectedClass.students.map((student) => ({
            studentId: student.id,
            status: entries[student.id]?.status ?? AttendanceStatus.PRESENT,
            remarks: entries[student.id]?.remarks ?? "",
          })),
        }),
      });
      const result = (await response.json()) as { success?: boolean; message?: string };
      setFeedback(result.message ?? "Unable to save attendance.");
      if (response.ok && result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Attendance Register</p>
            <h2 className="mt-2 font-display text-3xl text-navy">Save one clean daily record for the class</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={selectedClassId} onChange={(event) => setSelectedClassId(event.target.value)} className="rounded-[1.2rem] border border-navy/10 px-4 py-3 text-sm text-navy">
              {classes.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                  {entry.section ? ` - ${entry.section}` : ""}
                </option>
              ))}
            </select>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-[1.2rem] border border-navy/10 px-4 py-3 text-sm text-navy" />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {(selectedClass?.students ?? []).map((student) => (
            <div key={student.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold text-navy">
                    {student.firstName} {student.lastName ?? ""}
                  </p>
                  <p className="mt-1 text-sm text-navy/58">{student.admissionNumber}</p>
                </div>

                <div className="grid gap-3 lg:grid-cols-[180px_240px]">
                  <select
                    value={entries[student.id]?.status ?? AttendanceStatus.PRESENT}
                    onChange={(event) => updateEntry(student.id, { status: event.target.value as AttendanceStatus })}
                    className="rounded-[1rem] border border-navy/10 px-4 py-3 text-sm text-navy"
                  >
                    {Object.values(AttendanceStatus).map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                  <input
                    value={entries[student.id]?.remarks ?? ""}
                    onChange={(event) => updateEntry(student.id, { remarks: event.target.value })}
                    placeholder="Optional remark"
                    className="rounded-[1rem] border border-navy/10 px-4 py-3 text-sm text-navy"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={submitAttendance}
            disabled={isPending || !selectedClass}
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save attendance"}
          </button>
          {feedback ? <p className="text-sm text-navy/70">{feedback}</p> : null}
        </div>
      </section>
    </div>
  );
}
