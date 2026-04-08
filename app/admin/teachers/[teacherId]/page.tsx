import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminUserAccessCard } from "@/components/portal/admin-user-access-card";
import { TeacherAssignmentCard } from "@/components/portal/teacher-assignment-card";
import { EntityDeleteButton } from "@/components/portal/entity-delete-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value?: Date | null) {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

export default async function AdminTeacherDetailPage({ params }: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = await params;

  const [teacher, classes] = await Promise.all([
    prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: true,
        classes: {
          include: {
            class: {
              include: {
                students: {
                  include: {
                    parentMaps: {
                      include: {
                        parent: {
                          include: { user: true },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        homeworkUpdates: {
          orderBy: { publishedAt: "desc" },
          take: 8,
        },
        observationNotes: {
          orderBy: { observedAt: "desc" },
          take: 8,
          include: {
            student: true,
          },
        },
      },
    }),
    prisma.class.findMany({
      orderBy: [{ name: "asc" }, { section: "asc" }],
      select: { id: true, name: true, section: true },
    }),
  ]);

  if (!teacher) {
    notFound();
  }

  const assignedStudents = teacher.classes.flatMap((entry) =>
    entry.class.students.map((student) => ({
      id: student.id,
      name: `${student.firstName} ${student.lastName ?? ""}`.trim(),
      classLabel: `${entry.class.name}${entry.class.section ? ` - ${entry.class.section}` : ""}`,
      parent: student.parentMaps.find((item) => item.isPrimary)?.parent.user.name ?? student.parentMaps[0]?.parent.user.name ?? "Parent pending",
    })),
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Teacher Record</p>
            <h1 className="mt-2 font-display text-4xl text-navy">{teacher.user.name}</h1>
            <p className="mt-3 text-sm leading-7 text-navy/68">
              {teacher.designation ?? "Teacher"} | {teacher.user.email} | {teacher.user.phone ?? "Phone pending"}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/teachers" className="rounded-full border border-navy/10 px-5 py-3 text-sm font-semibold text-navy">
              Back to teachers
            </Link>
            <EntityDeleteButton
              endpoint={`/api/admin/teachers/${teacher.id}`}
              redirectTo="/admin/teachers"
              confirmMessage={`Delete ${teacher.user.name}'s teacher record?`}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-6">
          <TeacherAssignmentCard
            teacherId={teacher.id}
            currentClassIds={teacher.classes.map((entry) => entry.classId)}
            classes={classes}
            isActive={teacher.user.isActive}
          />

          <AdminUserAccessCard userId={teacher.userId} isActive={teacher.user.isActive} title="Teacher Portal Access" />

          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Assigned Classes</p>
            <div className="mt-5 space-y-4">
              {teacher.classes.length > 0 ? (
                teacher.classes.map((entry) => (
                  <div key={entry.classId} className="rounded-[1.3rem] border border-navy/10 px-5 py-4">
                    <p className="font-semibold text-navy">
                      {entry.class.name}
                      {entry.class.section ? ` - ${entry.class.section}` : ""}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-navy/68">
                      {entry.isLead ? "Lead teacher" : "Support teacher"} | Students {entry.class.students.length}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4 text-sm leading-7 text-navy/68">
                  This teacher has not been assigned to any class yet.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Students in scope</p>
            <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-navy/10">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-navy/10 text-left">
                  <thead className="bg-[#fbf7f0]">
                    <tr className="text-xs uppercase tracking-[0.18em] text-navy/45">
                      <th className="px-5 py-4 font-semibold">Student</th>
                      <th className="px-5 py-4 font-semibold">Class</th>
                      <th className="px-5 py-4 font-semibold">Parent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy/10">
                    {assignedStudents.length > 0 ? (
                      assignedStudents.map((student) => (
                        <tr key={student.id}>
                          <td className="px-5 py-4 text-sm font-medium text-navy">{student.name}</td>
                          <td className="px-5 py-4 text-sm text-navy/68">{student.classLabel}</td>
                          <td className="px-5 py-4 text-sm text-navy/68">{student.parent}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-5 py-8 text-center text-sm text-navy/62">
                          No students are mapped through this teacher&apos;s assigned classes yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Classroom Activity</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-navy/45">Homework updates</p>
                <div className="mt-3 space-y-3">
                  {teacher.homeworkUpdates.length > 0 ? (
                    teacher.homeworkUpdates.map((item) => (
                      <div key={item.id} className="border-b border-navy/10 pb-3 text-sm text-navy/72">
                        <p className="font-medium text-navy">{item.title}</p>
                        <p className="mt-1">{formatDate(item.publishedAt)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-navy/62">No class updates published yet.</p>
                  )}
                </div>
              </div>
              <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-navy/45">Observation entries</p>
                <div className="mt-3 space-y-3">
                  {teacher.observationNotes.length > 0 ? (
                    teacher.observationNotes.map((item) => (
                      <div key={item.id} className="border-b border-navy/10 pb-3 text-sm text-navy/72">
                        <p className="font-medium text-navy">{item.student.firstName} {item.student.lastName ?? ""}</p>
                        <p className="mt-1">{item.title} | {formatDate(item.observedAt)}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-navy/62">No observation entries yet.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
