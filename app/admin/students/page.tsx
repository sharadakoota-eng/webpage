import Link from "next/link";
import { InvoiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { EntityDeleteButton } from "@/components/portal/entity-delete-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    classId?: string;
    programId?: string;
  }>;
};

export default async function AdminStudentsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const classId = params.classId?.trim() ?? "";
  const programId = params.programId?.trim() ?? "";

  const [classes, programs, students] = await Promise.all([
    prisma.class.findMany({
      orderBy: [{ name: "asc" }, { section: "asc" }],
      select: { id: true, name: true, section: true },
    }),
    prisma.program.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.student.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { firstName: { contains: query } },
                { lastName: { contains: query } },
                { admissionNumber: { contains: query } },
                { parentMaps: { some: { parent: { user: { name: { contains: query } } } } } },
              ],
            }
          : {}),
        ...(classId ? { currentClassId: classId } : {}),
        ...(programId ? { enrollments: { some: { programId } } } : {}),
      },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      include: {
        currentClass: {
          include: {
            classTeachers: {
              include: {
                teacher: {
                  include: { user: true },
                },
              },
            },
          },
        },
        parentMaps: {
          include: {
            parent: {
              include: { user: true },
            },
          },
        },
        enrollments: {
          include: {
            program: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        attendance: {
          orderBy: { date: "desc" },
          take: 60,
        },
        invoices: {
          where: {
            status: {
              in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE],
            },
          },
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
      take: 120,
    }),
  ]);

  const summary = {
    total: students.length,
    classAssigned: students.filter((student) => student.currentClassId).length,
    feesPending: students.filter((student) => student.invoices.length > 0).length,
    programMapped: students.filter((student) => student.enrollments.length > 0).length,
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Students</p>
            <h1 className="mt-2 font-display text-4xl text-navy">Student register and assignment desk</h1>
            <p className="mt-3 text-sm leading-7 text-navy/68">
              This is where admin should search students, review attendance and fee health, open full records, and reassign class or program without digging through multiple tabs.
            </p>
          </div>
          <Link
            href="/admin/admissions"
            className="inline-flex rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white"
          >
            Open admissions
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Students in view", value: summary.total.toString() },
          { label: "Class assigned", value: summary.classAssigned.toString() },
          { label: "Program mapped", value: summary.programMapped.toString() },
          { label: "Fees pending", value: summary.feesPending.toString() },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.5rem] bg-white p-5 shadow-card">
            <p className="text-sm text-navy/60">{item.label}</p>
            <p className="mt-3 font-display text-3xl text-navy">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-card lg:p-8">
        <form className="grid gap-4 lg:grid-cols-[1.2fr_0.7fr_0.7fr_auto]">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by student, admission no, or parent"
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
          <select name="programId" defaultValue={programId} className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy">
            <option value="">All programs</option>
            {programs.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <div className="flex gap-3">
            <button type="submit" className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
              Filter
            </button>
            <Link href="/admin/students" className="rounded-full border border-navy/10 px-5 py-3 text-sm font-semibold text-navy">
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy/10 text-left">
            <thead className="bg-[#fbf7f0]">
              <tr className="text-xs uppercase tracking-[0.22em] text-navy/45">
                <th className="px-6 py-4 font-semibold">Student</th>
                <th className="px-6 py-4 font-semibold">Class</th>
                <th className="px-6 py-4 font-semibold">Program</th>
                <th className="px-6 py-4 font-semibold">Parent</th>
                <th className="px-6 py-4 font-semibold">Teacher</th>
                <th className="px-6 py-4 font-semibold">Attendance</th>
                <th className="px-6 py-4 font-semibold">Fee Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {students.length > 0 ? (
                students.map((student) => {
                  const parent = student.parentMaps.find((item) => item.isPrimary) ?? student.parentMaps[0];
                  const program = student.enrollments[0]?.program;
                  const teacher = student.currentClass?.classTeachers.find((item) => item.isLead) ?? student.currentClass?.classTeachers[0];
                  const attendanceRate =
                    student.attendance.length > 0
                      ? (student.attendance.filter((item) => item.status === "PRESENT").length / student.attendance.length) * 100
                      : 0;

                  return (
                    <tr key={student.id} className="align-top">
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-navy">
                            {student.firstName} {student.lastName ?? ""}
                          </p>
                          <p className="mt-2 text-sm text-navy/62">{student.admissionNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-navy/72">
                        {student.currentClass ? `${student.currentClass.name}${student.currentClass.section ? ` - ${student.currentClass.section}` : ""}` : "Pending"}
                      </td>
                      <td className="px-6 py-5 text-sm text-navy/72">{program?.name ?? "Pending"}</td>
                      <td className="px-6 py-5 text-sm text-navy/72">
                        {parent ? (
                          <>
                            <p>{parent.parent.user.name}</p>
                            <p className="mt-1 text-navy/55">{parent.parent.user.phone ?? parent.parent.user.email}</p>
                          </>
                        ) : (
                          "Pending"
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm text-navy/72">{teacher?.teacher.user.name ?? "Pending"}</td>
                      <td className="px-6 py-5 text-sm text-navy/72">{student.attendance.length > 0 ? formatPercent(attendanceRate) : "No logs"}</td>
                      <td className="px-6 py-5 text-sm">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${student.invoices.length > 0 ? "bg-[#fff4e5] text-[#b45309]" : "bg-emerald-50 text-emerald-700"}`}>
                          {student.invoices.length > 0 ? "Pending" : "Clear"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-3">
                          <Link href={`/admin/students/${student.id}`} className="rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy">
                            View student
                          </Link>
                          <EntityDeleteButton
                            endpoint={`/api/admin/students/${student.id}`}
                            label="Delete"
                            confirmMessage={`Delete ${student.firstName}'s full student record?`}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm leading-7 text-navy/62">
                    No student records match these filters yet.
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
