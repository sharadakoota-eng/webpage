import { prisma } from "@/lib/prisma";
import { getClassBatchProfiles } from "@/lib/admin-config";
import { ClassBatchManager } from "@/components/portal/class-batch-manager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminClassesPage() {
  const [classes, teachers, programs, profiles] = await Promise.all([
    prisma.class.findMany({
      orderBy: [{ name: "asc" }, { section: "asc" }],
      include: {
        students: { select: { id: true } },
        classTeachers: {
          include: {
            teacher: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    }),
    prisma.teacher.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.program.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    getClassBatchProfiles(),
  ]);

  const profileMap = new Map(profiles.map((item) => [item.classId, item]));

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Classes", value: classes.length.toString() },
          { label: "Teachers assigned", value: classes.filter((item) => item.classTeachers.length > 0).length.toString() },
          { label: "Students placed", value: classes.reduce((sum, item) => sum + item.students.length, 0).toString() },
          { label: "Batch profiles", value: profiles.length.toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-4xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_58%,#21406b_100%)] px-6 py-10 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Classes & Batches</p>
        <h1 className="mt-3 font-display text-4xl">Classes should connect program, timing, teacher ownership, and student placement</h1>
        <p className="mt-3 max-w-4xl text-base leading-8 text-white/78">
          Admin uses this module to define class structure, assign teachers, control capacity, and make sure students are seated in the right learning environment for their program.
        </p>
      </section>

      <ClassBatchManager
        classes={classes.map((item) => ({
          id: item.id,
          name: item.name,
          section: item.section,
          ageGroup: item.ageGroup,
          capacity: item.capacity,
          roomLabel: item.roomLabel,
          studentCount: item.students.length,
          teacherNames: item.classTeachers.map((map) => map.teacher.user.name),
          programName: profileMap.get(item.id)?.programId
            ? programs.find((program) => program.id === profileMap.get(item.id)?.programId)?.name
            : undefined,
          batchName: profileMap.get(item.id)?.batchName,
          timing: profileMap.get(item.id)?.timing,
          status: profileMap.get(item.id)?.status,
        }))}
        teachers={teachers.map((teacher) => ({ id: teacher.id, name: teacher.user.name }))}
        programs={programs}
      />
    </div>
  );
}
