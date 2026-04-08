import { AttendanceStatus } from "@prisma/client";
import { getPortalSession } from "@/lib/erp-auth";
import { getParentPortalData, splitParentUpdatesByAudience } from "@/lib/erp-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ParentProgressPage() {
  const session = await getPortalSession();
  const parent = await getParentPortalData(session?.sub);
  const student = parent?.parentStudents[0]?.student;
  const attendance = student?.attendance ?? [];
  const homeworkUpdates = student?.homeworkUpdates ?? [];
  const { classUpdates, individualNotes } = splitParentUpdatesByAudience(homeworkUpdates);
  const presentDays = attendance.filter((item) => item.status === AttendanceStatus.PRESENT).length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Attendance Summary</p>
        <p className="mt-4 font-display text-5xl text-navy">{attendanceRate}%</p>
        <p className="mt-3 text-sm leading-7 text-navy/70">
          Present days are calculated from the attendance records updated by the class teacher.
        </p>
        <div className="mt-5 space-y-3">
          {attendance.slice(0, 8).map((entry) => (
            <div key={entry.id} className="rounded-[1.35rem] border border-navy/10 px-5 py-4 text-sm text-navy/72">
              {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(entry.date)} |{" "}
              {entry.status.replaceAll("_", " ")}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Teacher Observations</p>
        <div className="mt-5 space-y-4">
          {student?.observations.length ? (
            student.observations.map((note) => (
              <div key={note.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                <p className="font-semibold text-navy">{note.title}</p>
                <p className="mt-2 text-sm leading-7 text-navy/72">{note.content}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
              Performance notes, developmental remarks, and class observations will appear here for parents.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Class Updates</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {classUpdates.length ? (
            classUpdates.map((entry) => (
              <div key={entry.homeworkUpdateId} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                <p className="font-semibold text-navy">{entry.homeworkUpdate.title}</p>
                <p className="mt-2 text-sm text-navy/60">
                  {entry.homeworkUpdate.teacher.user.name} |{" "}
                  {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(entry.homeworkUpdate.publishedAt)}
                </p>
                <p className="mt-2 text-sm leading-7 text-navy/72">{entry.homeworkUpdate.content}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70 md:col-span-2">
              Weekly class activity and homework notes will appear here once the teacher posts them for parents.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Individual Notes</p>
        <div className="mt-5 space-y-4">
          {individualNotes.length ? (
            individualNotes.map((entry) => (
              <div key={entry.homeworkUpdateId} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                <p className="font-semibold text-navy">{entry.homeworkUpdate.title}</p>
                <p className="mt-2 text-sm text-navy/60">
                  {entry.homeworkUpdate.teacher.user.name} |{" "}
                  {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(entry.homeworkUpdate.publishedAt)}
                </p>
                <p className="mt-2 text-sm leading-7 text-navy/72">{entry.homeworkUpdate.content}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
              Individual student notes will appear here when the teacher sends private feedback or child-specific updates.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
