"use client";

import { TeacherAttendanceStatus } from "@prisma/client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type AdminTeacherAttendanceDeskProps = {
  teachers: Array<{
    id: string;
    name: string;
    classId?: string | null;
    classLabel?: string | null;
  }>;
};

export function AdminTeacherAttendanceDesk({ teachers }: AdminTeacherAttendanceDeskProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [values, setValues] = useState<{
    teacherId: string;
    classId: string;
    date: string;
    status: TeacherAttendanceStatus;
    remarks: string;
  }>({
    teacherId: teachers[0]?.id ?? "",
    classId: teachers[0]?.classId ?? "",
    date: new Date().toISOString().slice(0, 10),
    status: TeacherAttendanceStatus.PRESENT,
    remarks: "",
  });

  return (
    <section className="rounded-[2rem] bg-white p-8 shadow-card">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Teacher Attendance</p>
      <h2 className="mt-2 font-display text-3xl text-navy">Mark teacher present, absent, or leave</h2>
      <p className="mt-3 text-sm leading-7 text-navy/68">
        Admin can keep a yearly teacher attendance history here, including leave tracking and classroom coverage notes.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <select
          value={values.teacherId}
          onChange={(event) => {
            const selected = teachers.find((teacher) => teacher.id === event.target.value);
            setValues((current) => ({
              ...current,
              teacherId: event.target.value,
              classId: selected?.classId ?? "",
            }));
          }}
          className="rounded-2xl border border-navy/10 px-4 py-3"
        >
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={values.date}
          onChange={(event) => setValues((current) => ({ ...current, date: event.target.value }))}
          className="rounded-2xl border border-navy/10 px-4 py-3"
        />
        <select
          value={values.status}
          onChange={(event) => setValues((current) => ({ ...current, status: event.target.value as TeacherAttendanceStatus }))}
          className="rounded-2xl border border-navy/10 px-4 py-3"
        >
          {Object.values(TeacherAttendanceStatus).map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <input
          value={values.remarks}
          onChange={(event) => setValues((current) => ({ ...current, remarks: event.target.value }))}
          placeholder="Remarks / leave note"
          className="rounded-2xl border border-navy/10 px-4 py-3"
        />
      </div>

      <button
        type="button"
        disabled={isPending || !values.teacherId}
        onClick={() => {
          setMessage("");
          startTransition(async () => {
            const response = await fetch("/api/admin/attendance", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(values),
            });
            const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string };
            if (!response.ok || !result.success) {
              setMessage(result.message ?? "Unable to save teacher attendance.");
              return;
            }

            setMessage(result.message ?? "Teacher attendance saved.");
            router.refresh();
          });
        }}
        className="mt-5 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save teacher attendance"}
      </button>

      {message ? <p className="mt-4 text-sm text-navy/72">{message}</p> : null}
    </section>
  );
}
