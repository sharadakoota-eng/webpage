import { prisma } from "@/lib/prisma";
import { getPortalSession } from "@/lib/erp-auth";
import { getTeacherPortalData } from "@/lib/erp-data";
import { TeacherAttendanceWorkbench } from "@/components/portal/teacher-attendance-workbench";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeacherAttendancePage() {
  const session = await getPortalSession();
  const teacher = await getTeacherPortalData(session?.sub);
  const classIds = teacher?.classes.map((entry) => entry.classId) ?? [];
  const today = new Date();
  const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const attendance = classIds.length
    ? await prisma.attendance.findMany({
        where: {
          classId: { in: classIds },
          date: todayKey,
        },
      })
    : [];
  const attendanceMap = new Map(attendance.map((entry) => [entry.studentId, entry]));
  const classes =
    teacher?.classes.map((entry) => ({
      id: entry.class.id,
      name: entry.class.name,
      section: entry.class.section,
      students: entry.class.students.map((student) => ({
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        admissionNumber: student.admissionNumber,
        todayStatus: attendanceMap.get(student.id)?.status ?? null,
        todayRemarks: attendanceMap.get(student.id)?.remarks ?? null,
      })),
    })) ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Daily Attendance Workflow</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            "Open class attendance register.",
            "Mark present, absent, leave, or half day.",
            "Add remarks for exceptional cases.",
            "Parent portal attendance should update automatically.",
          ].map((item) => (
            <div key={item} className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy shadow-card">
              {item}
            </div>
          ))}
        </div>
      </section>

      {classes.length > 0 ? (
        <TeacherAttendanceWorkbench classes={classes} />
      ) : (
        <section className="rounded-[2rem] bg-white p-8 shadow-card text-sm leading-7 text-navy/70">
          Once class assignments are ready, daily attendance marking will happen from this screen.
        </section>
      )}
    </div>
  );
}
