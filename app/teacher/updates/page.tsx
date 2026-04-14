import { getPortalSession } from "@/lib/erp-auth";
import { getTeacherPortalData } from "@/lib/erp-data";
import { TeacherUpdateWorkbench } from "@/components/portal/teacher-update-workbench";
import { HomeworkUpdateAudience } from "@prisma/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeacherUpdatesPage() {
  const session = await getPortalSession();
  const teacher = await getTeacherPortalData(session?.sub);
  const classes =
    teacher?.classes.map((entry) => ({
      id: entry.class.id,
      name: entry.class.name,
      section: entry.class.section,
      students: entry.class.students.map((student) => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
      })),
    })) ?? [];
  const classUpdates = teacher?.homeworkUpdates.filter((update) => update.audienceType === HomeworkUpdateAudience.CLASS_UPDATE) ?? [];
  const individualNotes = teacher?.homeworkUpdates.filter((update) => update.audienceType === HomeworkUpdateAudience.INDIVIDUAL_NOTE) ?? [];

  return (
    <div className="space-y-6">
      <TeacherUpdateWorkbench classes={classes} />

      <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Class Updates</p>
        <div className="mt-5 space-y-4">
          {classUpdates.length ? (
            classUpdates.map((update) => (
              <div key={update.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                <p className="font-semibold text-navy">{update.title}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-navy/45">
                  {update.class ? `${update.class.name}${update.class.section ? ` - ${update.class.section}` : ""}` : "Assigned class"}
                </p>
                <p className="mt-2 text-sm leading-7 text-navy/72">{update.content}</p>
                {update.attachmentUrl ? (
                  <a href={update.attachmentUrl} target="_blank" className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                    View attachment
                  </a>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
              This space is ready for classroom updates, activities, homework, and parent-facing communication.
            </div>
          )}
            </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Individual Notes</p>
        <div className="mt-5 space-y-4">
          {individualNotes.length ? (
            individualNotes.map((note) => (
              <div key={note.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                <p className="font-semibold text-navy">{note.title}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-navy/45">
                  {note.students
                    .map((entry) => `${entry.student.firstName} ${entry.student.lastName ?? ""}`.trim())
                    .join(", ")}
                </p>
                <p className="mt-2 text-sm leading-7 text-navy/72">{note.content}</p>
                {note.attachmentUrl ? (
                  <a href={note.attachmentUrl} target="_blank" className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                    View attachment
                  </a>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
              Student-specific parent notes will appear here after you publish them.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Observation Notes</p>
        <div className="mt-5 space-y-4">
          {teacher?.observationNotes.length ? (
            teacher.observationNotes.map((note) => (
              <div key={note.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                <p className="font-semibold text-navy">{note.title}</p>
                <p className="mt-2 text-sm text-navy/60">{note.student.firstName}</p>
                <p className="mt-2 text-sm leading-7 text-navy/72">{note.content}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
              Teacher observations and performance remarks will appear here as the academic workflow grows.
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}
