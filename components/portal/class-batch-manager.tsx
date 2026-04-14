"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ClassBatchManagerProps = {
  classes: Array<{
    id: string;
    name: string;
    section?: string | null;
    ageGroup?: string | null;
    capacity?: number | null;
    roomLabel?: string | null;
    studentCount: number;
    teacherNames: string[];
    programName?: string;
    batchName?: string;
    timing?: string;
    status?: string;
  }>;
  programs: Array<{ id: string; name: string }>;
  teachers: Array<{ id: string; name: string }>;
};

export function ClassBatchManager({ classes, programs, teachers }: ClassBatchManagerProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [classDraft, setClassDraft] = useState({
    id: "",
    name: "",
    section: "",
    ageGroup: "",
    capacity: "",
    roomLabel: "",
    programId: programs[0]?.id ?? "",
    batchName: "",
    timing: "",
  });
  const [assignment, setAssignment] = useState({
    classId: classes[0]?.id ?? "",
    teacherId: teachers[0]?.id ?? "",
  });
  const [deleteCandidate, setDeleteCandidate] = useState(classes[0]?.id ?? "");

  async function postAction(payload: Record<string, unknown>, successMessage: string) {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { success?: boolean; message?: string };

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update class workflow.");
      }

      setStatus("success");
      setMessage(successMessage);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to update class workflow.");
    }
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className={`rounded-[1.3rem] px-4 py-3 text-sm ${status === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Create Class / Batch</p>
          <h3 className="mt-2 font-display text-3xl text-navy">Set up a class with program, timing, and capacity</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input value={classDraft.id} onChange={(e) => setClassDraft((c) => ({ ...c, id: e.target.value }))} placeholder="Class ID" className="rounded-2xl border border-navy/10 px-4 py-3" />
            <input value={classDraft.name} onChange={(e) => setClassDraft((c) => ({ ...c, name: e.target.value }))} placeholder="Class name" className="rounded-2xl border border-navy/10 px-4 py-3" />
            <input value={classDraft.section} onChange={(e) => setClassDraft((c) => ({ ...c, section: e.target.value }))} placeholder="Section" className="rounded-2xl border border-navy/10 px-4 py-3" />
            <input value={classDraft.ageGroup} onChange={(e) => setClassDraft((c) => ({ ...c, ageGroup: e.target.value }))} placeholder="Age group" className="rounded-2xl border border-navy/10 px-4 py-3" />
            <input value={classDraft.capacity} onChange={(e) => setClassDraft((c) => ({ ...c, capacity: e.target.value }))} placeholder="Capacity" className="rounded-2xl border border-navy/10 px-4 py-3" />
            <input value={classDraft.roomLabel} onChange={(e) => setClassDraft((c) => ({ ...c, roomLabel: e.target.value }))} placeholder="Room label" className="rounded-2xl border border-navy/10 px-4 py-3" />
            <select value={classDraft.programId} onChange={(e) => setClassDraft((c) => ({ ...c, programId: e.target.value }))} className="rounded-2xl border border-navy/10 px-4 py-3">
              {programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
            <input value={classDraft.batchName} onChange={(e) => setClassDraft((c) => ({ ...c, batchName: e.target.value }))} placeholder="Batch name" className="rounded-2xl border border-navy/10 px-4 py-3" />
            <input value={classDraft.timing} onChange={(e) => setClassDraft((c) => ({ ...c, timing: e.target.value }))} placeholder="Timing" className="rounded-2xl border border-navy/10 px-4 py-3 sm:col-span-2" />
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={() =>
                postAction(
                  {
                    action: "createClass",
                    ...classDraft,
                    capacity: classDraft.capacity ? Number(classDraft.capacity) : undefined,
                  },
                  "Class and batch profile created successfully.",
                )
              }
              className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white"
            >
              {status === "loading" ? "Saving..." : "Create class"}
            </button>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Assign Teacher</p>
          <h3 className="mt-2 font-display text-3xl text-navy">Map class ownership clearly</h3>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <select value={assignment.classId} onChange={(e) => setAssignment((c) => ({ ...c, classId: e.target.value }))} className="rounded-2xl border border-navy/10 px-4 py-3">
              {classes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.section ? ` - ${item.section}` : ""}
                </option>
              ))}
            </select>
            <select value={assignment.teacherId} onChange={(e) => setAssignment((c) => ({ ...c, teacherId: e.target.value }))} className="rounded-2xl border border-navy/10 px-4 py-3">
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-5">
            <button
              type="button"
              onClick={() =>
                postAction(
                  { action: "assignTeacher", classId: assignment.classId, teacherId: assignment.teacherId, isLead: true },
                  "Teacher assigned to class successfully.",
                )
              }
              className="rounded-full border border-navy/10 px-6 py-3 text-sm font-semibold text-navy"
            >
              Assign teacher
            </button>
          </div>

          <div className="mt-8 rounded-[1.4rem] border border-rose-100 bg-[#fff7f5] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">Delete Class</p>
            <p className="mt-2 text-sm text-navy/70">
              You can delete a class only if no students are assigned. Remove students before deleting.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <select value={deleteCandidate} onChange={(e) => setDeleteCandidate(e.target.value)} className="rounded-2xl border border-navy/10 bg-white px-4 py-3">
                {classes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {item.section ? ` - ${item.section}` : ""}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() =>
                  postAction(
                    { action: "deleteClass", classId: deleteCandidate },
                    "Class deleted successfully.",
                  )
                }
                className="rounded-full border border-rose-200 px-6 py-3 text-sm font-semibold text-rose-700"
              >
                Delete class
              </button>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {classes.map((item) => (
              <div key={item.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-navy">
                      {item.name}
                      {item.section ? ` - ${item.section}` : ""}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-navy/65">
                      {item.programName ?? "Program pending"} | {item.batchName ?? "Batch pending"} | {item.timing ?? "Timing pending"}
                    </p>
                    <p className="text-sm leading-7 text-navy/58">
                      Age group: {item.ageGroup ?? "Pending"} | Capacity: {item.capacity ?? "Pending"} | Students: {item.studentCount}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                      {item.status ?? "ACTIVE"}
                    </span>
                    <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1d4ed8]">
                      {item.teacherNames.length > 0 ? item.teacherNames.join(", ") : "Teacher pending"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
