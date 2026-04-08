import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminAcademicsPage() {
  const [classes, teachers, students, attendanceCount, observationCount] = await Promise.all([
    prisma.class.findMany({
      include: {
        classTeachers: {
          include: {
            teacher: {
              include: { user: true },
            },
          },
        },
        students: {
          take: 6,
          orderBy: { firstName: "asc" },
        },
      },
      orderBy: [{ name: "asc" }, { section: "asc" }],
    }),
    prisma.teacher.findMany({
      include: { user: true, classes: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.student.count(),
    prisma.attendance.count(),
    prisma.studentObservation.count(),
  ]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Classes", value: classes.length.toString() },
          { label: "Teachers", value: teachers.length.toString() },
          { label: "Students", value: students.toString() },
          { label: "Observations logged", value: observationCount.toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-4xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Class and Teacher Mapping</p>
          <div className="mt-5 space-y-4">
            {classes.map((item) => (
              <div key={item.id} className="rounded-[1.45rem] border border-navy/10 px-5 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold text-navy">
                      {item.name}
                      {item.section ? ` - ${item.section}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-navy/65">
                      {item.ageGroup ?? "Age group pending"} | {item.students.length} visible students
                    </p>
                  </div>
                  <p className="rounded-full bg-cream px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                    {item.classTeachers[0]?.teacher.user.name ?? "Teacher pending"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-sky p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Academic Workflow</p>
            <div className="mt-5 grid gap-3">
              {[
                "Admin assigns teacher to class and maps students to the section.",
                "Teacher sees only assigned students in the teacher portal.",
                "Attendance and observations flow from teacher to parent portal.",
                "Class communication stays role-specific and trackable.",
              ].map((item) => (
                <div key={item} className="rounded-[1.35rem] bg-white px-5 py-4 text-sm leading-7 text-navy shadow-card">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Attendance Records</p>
            <p className="mt-4 font-display text-4xl text-navy">{attendanceCount}</p>
            <p className="mt-3 text-sm leading-7 text-navy/70">
              This should become the daily academic checkpoint for the office once teachers begin marking attendance from their portal.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
