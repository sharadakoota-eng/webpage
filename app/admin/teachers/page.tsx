import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { EntityDeleteButton } from "@/components/portal/entity-delete-button";
import { CreateUserForm } from "@/components/portal/create-user-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    classId?: string;
  }>;
};

export default async function AdminTeachersPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const classId = params.classId?.trim() ?? "";

  const [classes, teachers] = await Promise.all([
    prisma.class.findMany({
      orderBy: [{ name: "asc" }, { section: "asc" }],
      select: { id: true, name: true, section: true },
    }),
    prisma.teacher.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { user: { name: { contains: query } } },
                { user: { email: { contains: query } } },
                { designation: { contains: query } },
              ],
            }
          : {}),
        ...(classId ? { classes: { some: { classId } } } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        classes: {
          include: {
            class: {
              include: {
                students: true,
              },
            },
          },
        },
        observationNotes: {
          select: { id: true },
        },
        homeworkUpdates: {
          select: { id: true },
        },
      },
      take: 80,
    }),
  ]);

  const activeTeachers = teachers.filter((teacher) => teacher.user.isActive).length;

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Teachers</p>
        <h1 className="mt-2 font-display text-4xl text-navy">Teacher roster and assignment desk</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-navy/68">
          Admin should be able to see every teacher, the classes they own, the students in their care, and whether the account should stay active.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Teachers in view", value: teachers.length.toString() },
          { label: "Active", value: activeTeachers.toString() },
          { label: "With class mapping", value: teachers.filter((teacher) => teacher.classes.length > 0).length.toString() },
          { label: "Observation activity", value: teachers.reduce((sum, teacher) => sum + teacher.observationNotes.length, 0).toString() },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.5rem] bg-white p-5 shadow-card">
            <p className="text-sm text-navy/60">{item.label}</p>
            <p className="mt-3 font-display text-3xl text-navy">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-card lg:p-8">
        <form className="grid gap-4 lg:grid-cols-[1.2fr_0.7fr_auto]">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by teacher name, email, or designation"
            className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy"
          />
          <select name="classId" defaultValue={classId} className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy">
            <option value="">All classes</option>
            {classes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
                {item.section ? ` - ${item.section}` : ""}
              </option>
            ))}
          </select>
          <div className="flex gap-3">
            <button type="submit" className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
              Filter
            </button>
            <Link href="/admin/teachers" className="rounded-full border border-navy/10 px-5 py-3 text-sm font-semibold text-navy">
              Reset
            </Link>
          </div>
        </form>
      </section>

      <CreateUserForm
        defaultRoleType="TEACHER"
        lockRoleType
        title="Create teacher account"
        description="Create teacher login access directly from the Teachers module, then assign classes from the teacher record page."
      />

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy/10 text-left">
            <thead className="bg-[#fbf7f0]">
              <tr className="text-xs uppercase tracking-[0.22em] text-navy/45">
                <th className="px-6 py-4 font-semibold">Teacher</th>
                <th className="px-6 py-4 font-semibold">Assigned Classes</th>
                <th className="px-6 py-4 font-semibold">Students</th>
                <th className="px-6 py-4 font-semibold">Activity</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {teachers.length > 0 ? (
                teachers.map((teacher) => {
                  const classLabels = teacher.classes.map((entry) => `${entry.class.name}${entry.class.section ? ` - ${entry.class.section}` : ""}`);
                  const studentCount = teacher.classes.reduce((sum, entry) => sum + entry.class.students.length, 0);

                  return (
                    <tr key={teacher.id} className="align-top">
                      <td className="px-6 py-5">
                        <p className="font-semibold text-navy">{teacher.user.name}</p>
                        <p className="mt-2 text-sm text-navy/62">{teacher.designation ?? "Teacher"}</p>
                        <p className="mt-1 text-sm text-navy/55">{teacher.user.email}</p>
                      </td>
                      <td className="px-6 py-5 text-sm text-navy/72">
                        {classLabels.length > 0 ? classLabels.join(", ") : "Pending"}
                      </td>
                      <td className="px-6 py-5 text-sm text-navy/72">{studentCount}</td>
                      <td className="px-6 py-5 text-sm text-navy/72">
                        {teacher.observationNotes.length} observations
                        <br />
                        {teacher.homeworkUpdates.length} updates
                      </td>
                      <td className="px-6 py-5 text-sm">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${teacher.user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                          {teacher.user.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-3">
                          <Link href={`/admin/teachers/${teacher.id}`} className="rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy">
                            View teacher
                          </Link>
                          <EntityDeleteButton
                            endpoint={`/api/admin/teachers/${teacher.id}`}
                            label="Delete"
                            confirmMessage={`Delete ${teacher.user.name}'s record?`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm leading-7 text-navy/62">
                    No teacher records match these filters yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
