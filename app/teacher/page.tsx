import { auth } from "@/lib/auth";
import { getTeacherPortalData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeacherPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const teacher = await getTeacherPortalData(userId);
  const assignedClasses = teacher?.classes ?? [];
  const firstClass = assignedClasses[0]?.class;
  const students = firstClass?.students ?? [];
  const homeworkCount = teacher?.homeworkUpdates.length ?? 0;
  const observationCount = teacher?.observationNotes.length ?? 0;

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_58%,#21406b_100%)] px-6 py-10 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Teacher Portal</p>
        <h1 className="mt-3 font-display text-4xl">Welcome, {teacher?.user.name ?? "Teacher"}</h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-white/78">
          This workspace is where class teachers manage attendance, student performance notes, classroom communication, and daily academic coordination.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Assigned classes", value: assignedClasses.length.toString() },
          { label: "Students in focus", value: students.length.toString() },
          { label: "Updates posted", value: homeworkCount.toString() },
          { label: "Observations logged", value: observationCount.toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-4xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Assigned Class</p>
          <h2 className="mt-3 font-display text-3xl text-navy">
            {firstClass ? `${firstClass.name}${firstClass.section ? ` - ${firstClass.section}` : ""}` : "No class assigned yet"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-navy/70">
            {firstClass
              ? `Age group: ${firstClass.ageGroup ?? "Not set"} • Room: ${firstClass.roomLabel ?? "To be assigned"}`
              : "Once admin assigns a class to this teacher, student lists and classroom workflows will appear here."}
          </p>

          <div className="mt-6 grid gap-3">
            {[
              "Mark attendance for today's class",
              "Upload homework or classroom update",
              "Record student observation or development note",
              "Review parent-facing communication before publishing",
            ].map((item) => (
              <div key={item} className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy shadow-card">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-sky p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Assigned Students</p>
          <div className="mt-5 space-y-3">
            {students.length > 0 ? (
              students.map((student) => (
                <div key={student.id} className="rounded-[1.35rem] bg-white px-5 py-4 shadow-card">
                  <p className="font-semibold text-navy">
                    {student.firstName} {student.lastName ?? ""}
                  </p>
                  <p className="mt-1 text-sm text-navy/65">Admission No: {student.admissionNumber}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] bg-white px-5 py-4 text-sm leading-7 text-navy/70 shadow-card">
                No students have been assigned yet. Admin can assign students to classes, and the class mapping will automatically reflect here.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Recent Observation Workflow</p>
          <div className="mt-5 space-y-4">
            {teacher?.observationNotes.length ? (
              teacher.observationNotes.map((note) => (
                <div key={note.id} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                  <p className="font-semibold text-navy">{note.title}</p>
                  <p className="mt-2 text-sm text-navy/65">{note.student.firstName}</p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">{note.content}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
                No observations have been recorded yet. This section is designed for performance notes, behavior observations, and developmental remarks.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Recent Published Updates</p>
          <div className="mt-5 space-y-4">
            {teacher?.homeworkUpdates.length ? (
              teacher.homeworkUpdates.map((update) => (
                <div key={update.id} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                  <p className="font-semibold text-navy">{update.title}</p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">{update.content}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
                No teacher updates have been published yet. This area is where homework, activities, and classroom highlights will appear.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
