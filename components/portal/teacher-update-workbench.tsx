"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type TeacherUpdateWorkbenchProps = {
  classes: Array<{
    id: string;
    name: string;
    section?: string | null;
    students: Array<{
      id: string;
      firstName: string;
      lastName?: string | null;
    }>;
  }>;
};

export function TeacherUpdateWorkbench({ classes }: TeacherUpdateWorkbenchProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? "");
  const [classUpdateTitle, setClassUpdateTitle] = useState("Weekly classroom update");
  const [classUpdateContent, setClassUpdateContent] = useState("");
  const [classAttachment, setClassAttachment] = useState<File | null>(null);
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [individualTitle, setIndividualTitle] = useState("Individual parent note");
  const [individualContent, setIndividualContent] = useState("");
  const [individualAttachment, setIndividualAttachment] = useState<File | null>(null);
  const [observationStudentId, setObservationStudentId] = useState(classes[0]?.students[0]?.id ?? "");
  const [observationTitle, setObservationTitle] = useState("Weekly performance observation");
  const [observationContent, setObservationContent] = useState("");

  const selectedClass = useMemo(() => classes.find((entry) => entry.id === selectedClassId) ?? classes[0], [classes, selectedClassId]);
  const visibleStudents = selectedClass?.students ?? [];

  if (classes.length === 0) {
    return (
      <section className="rounded-[2rem] bg-white p-8 shadow-card text-sm leading-7 text-navy/70">
        This teacher is not mapped to a class yet. Once admin assigns a class, weekly homework and performance updates can be posted from here.
      </section>
    );
  }

  function toggleStudent(studentId: string) {
    setStudentIds((current) => (current.includes(studentId) ? current.filter((id) => id !== studentId) : [...current, studentId]));
  }

  async function submitClassUpdate() {
    setFeedback("");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("action", "createClassUpdate");
      formData.append("classId", selectedClass?.id ?? "");
      formData.append("title", classUpdateTitle);
      formData.append("content", classUpdateContent);
      if (classAttachment) {
        formData.append("attachment", classAttachment);
      }
      const response = await fetch("/api/teacher/updates", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { success?: boolean; message?: string };
      setFeedback(result.message ?? "Unable to save weekly update.");
      if (response.ok && result.success) {
        setClassUpdateContent("");
        setClassAttachment(null);
        router.refresh();
      }
    });
  }

  async function submitIndividualNote() {
    setFeedback("");
    startTransition(async () => {
      const formData = new FormData();
      formData.append("action", "createIndividualNote");
      formData.append("classId", selectedClass?.id ?? "");
      formData.append("title", individualTitle);
      formData.append("content", individualContent);
      formData.append("studentIds", studentIds.join(","));
      if (individualAttachment) {
        formData.append("attachment", individualAttachment);
      }
      const response = await fetch("/api/teacher/updates", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as { success?: boolean; message?: string };
      setFeedback(result.message ?? "Unable to save individual note.");
      if (response.ok && result.success) {
        setIndividualContent("");
        setStudentIds([]);
        setIndividualAttachment(null);
        router.refresh();
      }
    });
  }

  async function submitObservation() {
    setFeedback("");
    startTransition(async () => {
      const response = await fetch("/api/teacher/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createObservation",
          studentId: observationStudentId,
          title: observationTitle,
          content: observationContent,
        }),
      });
      const result = (await response.json()) as { success?: boolean; message?: string };
      setFeedback(result.message ?? "Unable to save weekly observation.");
      if (response.ok && result.success) {
        setObservationContent("");
        router.refresh();
      }
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Class-wide Update</p>
        <h2 className="mt-2 font-display text-3xl text-navy">Publish one update for the whole class</h2>
        <p className="mt-3 text-sm leading-7 text-navy/68">
          Use this for homework, activities, and general classroom communication that every parent in the selected class should see.
        </p>

        <div className="mt-6 grid gap-4">
          <select
            value={selectedClassId}
            onChange={(event) => {
              setSelectedClassId(event.target.value);
              setObservationStudentId(classes.find((entry) => entry.id === event.target.value)?.students[0]?.id ?? "");
              setStudentIds([]);
            }}
            className="rounded-[1.2rem] border border-navy/10 px-4 py-3 text-sm text-navy"
          >
            {classes.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name}
                {entry.section ? ` - ${entry.section}` : ""}
              </option>
            ))}
          </select>

          <input value={classUpdateTitle} onChange={(event) => setClassUpdateTitle(event.target.value)} className="rounded-[1.2rem] border border-navy/10 px-4 py-3 text-sm text-navy" />
          <textarea
            value={classUpdateContent}
            onChange={(event) => setClassUpdateContent(event.target.value)}
            placeholder="Share homework, activity highlights, or what the class is learning this week."
            className="min-h-[150px] rounded-[1.2rem] border border-navy/10 px-4 py-3 text-sm text-navy"
          />
          <input
            type="file"
            onChange={(event) => setClassAttachment(event.target.files?.[0] ?? null)}
            className="text-xs text-navy/60 file:mr-3 file:rounded-full file:border-0 file:bg-cream file:px-3 file:py-2 file:text-xs file:font-semibold file:text-gold"
          />

          <button
            type="button"
            onClick={submitClassUpdate}
            disabled={isPending || !selectedClass || classUpdateContent.trim().length < 8}
            className="inline-flex w-fit rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Publishing..." : "Publish class update"}
          </button>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Individual Parent Note</p>
        <h2 className="mt-2 font-display text-3xl text-navy">Send a note only to selected families</h2>
        <p className="mt-3 text-sm leading-7 text-navy/68">
          Use this for child-specific weekly notes. Only the selected student families should see this note in the parent portal.
        </p>

        <div className="mt-6 grid gap-4">
          <input value={individualTitle} onChange={(event) => setIndividualTitle(event.target.value)} className="rounded-[1.2rem] border border-navy/10 px-4 py-3 text-sm text-navy" />
          <textarea
            value={individualContent}
            onChange={(event) => setIndividualContent(event.target.value)}
            placeholder="Example: showed stronger focus during language circle and participated confidently in group activity."
            className="min-h-[180px] rounded-[1.2rem] border border-navy/10 px-4 py-3 text-sm text-navy"
          />
          <input
            type="file"
            onChange={(event) => setIndividualAttachment(event.target.files?.[0] ?? null)}
            className="text-xs text-navy/60 file:mr-3 file:rounded-full file:border-0 file:bg-cream file:px-3 file:py-2 file:text-xs file:font-semibold file:text-gold"
          />
          <div className="rounded-[1.4rem] bg-cream px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Selected Students</p>
            <p className="mt-2 text-sm text-navy/65">Choose one or more students for this parent-specific note.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {visibleStudents.map((student) => (
                <label key={student.id} className="flex items-center gap-3 rounded-[1rem] bg-white px-4 py-3 text-sm text-navy shadow-card">
                  <input type="checkbox" checked={studentIds.includes(student.id)} onChange={() => toggleStudent(student.id)} />
                  <span>
                    {student.firstName} {student.lastName ?? ""}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={submitIndividualNote}
            disabled={isPending || studentIds.length === 0 || individualContent.trim().length < 8}
            className="inline-flex w-fit rounded-full border border-gold/30 bg-white px-6 py-3 text-sm font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Publish individual note"}
          </button>
        </div>
      </section>

      <section className="xl:col-span-2 rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Performance Observation</p>
        <h2 className="mt-2 font-display text-3xl text-navy">Save a Montessori-style performance observation</h2>
        <p className="mt-3 text-sm leading-7 text-navy/68">
          These observations feed the formal performance timeline and should be used for developmental progress notes.
        </p>

        <div className="mt-6 grid gap-4">
          <select
            value={observationStudentId}
            onChange={(event) => setObservationStudentId(event.target.value)}
            className="rounded-[1.2rem] border border-navy/10 px-4 py-3 text-sm text-navy"
          >
            {visibleStudents.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName ?? ""}
              </option>
            ))}
          </select>
          <input value={observationTitle} onChange={(event) => setObservationTitle(event.target.value)} className="rounded-[1.2rem] border border-navy/10 px-4 py-3 text-sm text-navy" />
          <textarea
            value={observationContent}
            onChange={(event) => setObservationContent(event.target.value)}
            placeholder="Document behavior, communication, concentration, participation, or developmental progress."
            className="min-h-[180px] rounded-[1.2rem] border border-navy/10 px-4 py-3 text-sm text-navy"
          />
          <button
            type="button"
            onClick={submitObservation}
            disabled={isPending || !observationStudentId || observationContent.trim().length < 8}
            className="inline-flex w-fit rounded-full border border-gold/30 bg-white px-6 py-3 text-sm font-semibold text-navy disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save performance observation"}
          </button>
        </div>
      </section>

      {feedback ? (
        <div className="xl:col-span-2 rounded-[1.4rem] bg-[#eef6ff] px-5 py-4 text-sm text-navy">{feedback}</div>
      ) : null}
    </div>
  );
}
