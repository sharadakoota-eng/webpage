import { prisma } from "@/lib/prisma";
import { AdminTeacherAttendanceDesk } from "@/components/portal/admin-teacher-attendance-desk";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  searchParams?: Promise<{
    classId?: string;
    q?: string;
  }>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

function withinDays(date: Date, days: number) {
  const now = Date.now();
  return now - date.getTime() <= days * 24 * 60 * 60 * 1000;
}

export default async function AdminAttendancePage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const classId = params.classId?.trim() ?? "";
  const query = params.q?.trim().toLowerCase() ?? "";

  const [classes, records, teachers, teacherAttendance] = await Promise.all([
    prisma.class.findMany({
      orderBy: [{ name: "asc" }, { section: "asc" }],
      include: {
        students: true,
        attendance: true,
      },
    }),
    prisma.attendance.findMany({
      where: classId ? { classId } : undefined,
      orderBy: { date: "desc" },
      take: 120,
      include: {
        student: true,
        class: true,
      },
    }),
    prisma.teacher.findMany({
      include: {
        user: true,
        classes: {
          include: {
            class: true,
          },
        },
        observationNotes: true,
      },
    }),
    prisma.teacherAttendance.findMany({
      orderBy: { date: "desc" },
      take: 400,
      include: {
        teacher: {
          include: {
            user: true,
          },
        },
        class: true,
      },
    }),
  ]);

  const filteredStudentHistory = query
    ? records.filter((record) => {
        const studentName = `${record.student.firstName} ${record.student.lastName ?? ""}`.toLowerCase();
        const classLabel = `${record.class.name}${record.class.section ? ` ${record.class.section}` : ""}`.toLowerCase();
        return studentName.includes(query) || classLabel.includes(query);
      })
    : records;

  const filteredTeacherHistory = query
    ? teacherAttendance.filter((entry) => {
        const teacherName = entry.teacher.user.name.toLowerCase();
        const classLabel = entry.class ? `${entry.class.name}${entry.class.section ? ` ${entry.class.section}` : ""}`.toLowerCase() : "";
        return teacherName.includes(query) || classLabel.includes(query);
      })
    : teacherAttendance;

  const selectedClass = classes.find((item) => item.id === classId) ?? classes[0];
  const classSummaries = classes.map((item) => {
    const total = item.attendance.length;
    const present = item.attendance.filter((entry) => entry.status === "PRESENT").length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return {
      id: item.id,
      label: `${item.name}${item.section ? ` - ${item.section}` : ""}`,
      studentCount: item.students.length,
      rate,
      total,
    };
  });

  const studentAttendanceMetrics = {
    monthly: records.filter((item) => withinDays(item.date, 30)).length,
    quarterly: records.filter((item) => withinDays(item.date, 90)).length,
    halfYearly: records.filter((item) => withinDays(item.date, 182)).length,
    yearly: records.filter((item) => withinDays(item.date, 365)).length,
  };

  const teacherAttendanceMetrics = {
    monthly: teacherAttendance.filter((item) => withinDays(item.date, 30)).length,
    quarterly: teacherAttendance.filter((item) => withinDays(item.date, 90)).length,
    halfYearly: teacherAttendance.filter((item) => withinDays(item.date, 182)).length,
    yearly: teacherAttendance.filter((item) => withinDays(item.date, 365)).length,
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Attendance</p>
        <h1 className="mt-2 font-display text-4xl text-navy">Class-wise student attendance history</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-navy/68">
          Admin should be able to review monthly and yearly attendance by class, then inspect the student-level history without hunting through each portal separately.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Attendance records", value: records.length.toString() },
          { label: "Classes tracked", value: classes.length.toString() },
          { label: "Student presence", value: records.filter((item) => item.status === "PRESENT").length.toString() },
          { label: "Teacher coverage", value: teachers.filter((teacher) => teacher.classes.length > 0).length.toString() },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.5rem] bg-white p-5 shadow-card">
            <p className="text-sm text-navy/60">{item.label}</p>
            <p className="mt-3 font-display text-3xl text-navy">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Student Attendance Metrics</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Monthly", value: studentAttendanceMetrics.monthly },
              { label: "Quarterly", value: studentAttendanceMetrics.quarterly },
              { label: "Half-yearly", value: studentAttendanceMetrics.halfYearly },
              { label: "Yearly", value: studentAttendanceMetrics.yearly },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-navy/45">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-navy">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Teacher Attendance Metrics</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Monthly", value: teacherAttendanceMetrics.monthly },
              { label: "Quarterly", value: teacherAttendanceMetrics.quarterly },
              { label: "Half-yearly", value: teacherAttendanceMetrics.halfYearly },
              { label: "Yearly", value: teacherAttendanceMetrics.yearly },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-navy/45">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-navy">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-card lg:p-8">
        <form className="grid gap-4 lg:grid-cols-[1fr_1fr_auto_auto]">
          <select name="classId" defaultValue={classId} className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy">
            <option value="">All classes</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
                {item.section ? ` - ${item.section}` : ""}
              </option>
            ))}
          </select>
          <input
            name="q"
            defaultValue={query}
            placeholder="Search student or teacher"
            className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy"
          />
          <button type="submit" className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
            Search
          </button>
          <a
            href="/admin/attendance"
            className="inline-flex items-center justify-center rounded-full border border-navy/15 px-5 py-3 text-sm font-semibold text-navy transition hover:border-navy/30"
          >
            Clear
          </a>
        </form>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Class Attendance Board</p>
          <div className="mt-5 space-y-4">
            {classSummaries.map((summary) => (
              <div key={summary.id} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-navy">{summary.label}</p>
                    <p className="mt-2 text-sm text-navy/62">
                      Students {summary.studentCount} | Records {summary.total}
                    </p>
                  </div>
                  <p className="text-xl font-semibold text-navy">{summary.rate}%</p>
                </div>
                <div className="mt-4 h-3 rounded-full bg-[#fbf7f0]">
                  <div className="h-3 rounded-full bg-[linear-gradient(90deg,#132b4d_0%,#d7a11e_100%)]" style={{ width: `${Math.max(summary.rate, summary.total > 0 ? 10 : 0)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <details className="rounded-[2rem] bg-white p-8 shadow-card" open>
            <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.24em] text-gold">Teacher Attendance Log</summary>
            <div className="mt-5 space-y-6">
              <AdminTeacherAttendanceDesk
                teachers={teachers.map((teacher) => {
                  const firstClass = teacher.classes[0]?.class;
                  return {
                    id: teacher.id,
                    name: teacher.user.name,
                    classId: firstClass?.id,
                    classLabel: firstClass ? `${firstClass.name}${firstClass.section ? ` - ${firstClass.section}` : ""}` : null,
                  };
                })}
              />
              <div className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-navy/45">Teacher history</p>
                <div className="mt-4 space-y-3">
                  {filteredTeacherHistory.length > 0 ? (
                    filteredTeacherHistory.slice(0, 18).map((entry) => (
                      <div key={entry.id} className="rounded-[1.2rem] border border-navy/10 px-4 py-3 text-sm text-navy/72">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <p className="font-medium text-navy">{entry.teacher.user.name}</p>
                          <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                            {entry.status.replaceAll("_", " ")}
                          </span>
                        </div>
                        <p className="mt-2">
                          {formatDate(entry.date)} | {entry.class ? `${entry.class.name}${entry.class.section ? ` - ${entry.class.section}` : ""}` : "No class linked"}
                        </p>
                        {entry.remarks ? <p className="mt-1 text-navy/60">{entry.remarks}</p> : null}
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4 text-sm leading-7 text-navy/68">
                      No teacher attendance has been marked yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </details>

          <details className="rounded-[2rem] bg-white p-8 shadow-card" open>
            <summary className="cursor-pointer text-sm font-semibold uppercase tracking-[0.24em] text-gold">Student Attendance Log</summary>
            <div className="mt-5 space-y-4">
              {filteredStudentHistory.length > 0 ? (
                filteredStudentHistory.slice(0, 24).map((record) => (
                  <div key={record.id} className="rounded-[1.3rem] border border-navy/10 px-5 py-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-navy">
                          {record.student.firstName} {record.student.lastName ?? ""}
                        </p>
                        <p className="mt-1 text-sm text-navy/62">
                          {record.class.name}
                          {record.class.section ? ` - ${record.class.section}` : ""} | {formatDate(record.date)}
                        </p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${record.status === "PRESENT" ? "bg-emerald-50 text-emerald-700" : "bg-[#fff4e5] text-[#b45309]"}`}>
                        {record.status.replaceAll("_", " ")}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4 text-sm leading-7 text-navy/68">
                  No attendance history matches the selected class yet.
                </div>
              )}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
