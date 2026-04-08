import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentAssignmentCard } from "@/components/portal/student-assignment-card";
import { EntityDeleteButton } from "@/components/portal/entity-delete-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value?: Date | null) {
  if (!value) return "Pending";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default async function AdminStudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;

  const [student, classes, programs] = await Promise.all([
    prisma.student.findUnique({
      where: { id: studentId },
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
            program: {
              include: {
                feeStructures: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        attendance: {
          orderBy: { date: "desc" },
          take: 60,
        },
        observations: {
          include: {
            teacher: {
              include: { user: true },
            },
          },
          orderBy: { observedAt: "desc" },
          take: 8,
        },
        invoices: {
          orderBy: { dueDate: "desc" },
          include: { payments: true },
          take: 8,
        },
        receipts: {
          orderBy: { issuedAt: "desc" },
          take: 6,
        },
        admissions: {
          include: { documents: true, program: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
    prisma.class.findMany({
      orderBy: [{ name: "asc" }, { section: "asc" }],
      select: { id: true, name: true, section: true },
    }),
    prisma.program.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!student) {
    notFound();
  }

  const primaryParent = student.parentMaps.find((entry) => entry.isPrimary) ?? student.parentMaps[0];
  const currentEnrollment = student.enrollments[0];
  const activeTeacher = student.currentClass?.classTeachers.find((entry) => entry.isLead) ?? student.currentClass?.classTeachers[0];
  const attendanceRate =
    student.attendance.length > 0
      ? Math.round((student.attendance.filter((entry) => entry.status === "PRESENT").length / student.attendance.length) * 100)
      : 0;
  const latestAdmission = student.admissions[0];
  const totalDue = student.invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  const overviewCards = [
    { label: "Class", value: student.currentClass ? `${student.currentClass.name}${student.currentClass.section ? ` - ${student.currentClass.section}` : ""}` : "Pending" },
    { label: "Program", value: currentEnrollment?.program.name ?? "Pending" },
    { label: "Attendance", value: student.attendance.length > 0 ? `${attendanceRate}%` : "No logs" },
    { label: "Outstanding", value: formatCurrency(totalDue) },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Student Record</p>
            <h1 className="mt-2 font-display text-4xl text-navy">
              {student.firstName} {student.lastName ?? ""}
            </h1>
            <p className="mt-3 text-sm leading-7 text-navy/68">
              Admission no. {student.admissionNumber}. This page should give admin a full operational view of the student, parent linkage, class mapping, attendance health, performance, and finance status.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/admin/students" className="rounded-full border border-navy/10 px-5 py-3 text-sm font-semibold text-navy">
              Back to students
            </Link>
            <EntityDeleteButton
              endpoint={`/api/admin/students/${student.id}`}
              redirectTo="/admin/students"
              confirmMessage={`Delete ${student.firstName}'s student record and linked transactional data?`}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {overviewCards.map((item) => (
            <div key={item.label} className="rounded-[1.35rem] bg-[#fbf7f0] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-navy/45">{item.label}</p>
              <p className="mt-3 text-lg font-semibold text-navy">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Profile</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                { label: "Date of birth", value: formatDate(student.dateOfBirth) },
                { label: "Gender", value: student.gender ?? "Pending" },
                { label: "Blood group", value: student.bloodGroup ?? "Pending" },
                { label: "Lead teacher", value: activeTeacher?.teacher.user.name ?? "Pending" },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-navy/45">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-navy">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Parent Details</p>
            <div className="mt-5 space-y-4">
              {student.parentMaps.length > 0 ? (
                student.parentMaps.map((entry) => (
                  <div key={entry.parentId} className="rounded-[1.3rem] border border-navy/10 px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-navy">{entry.parent.user.name}</p>
                      {entry.isPrimary ? (
                        <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">Primary</span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-navy/68">
                      {entry.relation} | {entry.parent.user.phone ?? "Phone pending"} | {entry.parent.user.email}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4 text-sm leading-7 text-navy/68">
                  No parent mapping has been added yet.
                </div>
              )}
            </div>
          </section>

          <StudentAssignmentCard
            studentId={student.id}
            currentClassId={student.currentClassId}
            currentProgramId={currentEnrollment?.programId}
            classes={classes}
            programs={programs}
          />
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Attendance & Performance</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-navy/45">Recent attendance</p>
                <div className="mt-3 space-y-3">
                  {student.attendance.length > 0 ? (
                    student.attendance.slice(0, 6).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between gap-3 border-b border-navy/10 pb-3 text-sm text-navy/72">
                        <span>{formatDate(entry.date)}</span>
                        <span className="font-medium text-navy">{entry.status.replaceAll("_", " ")}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-navy/62">No attendance records yet.</p>
                  )}
                </div>
              </div>
              <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-navy/45">Recent observations</p>
                <div className="mt-3 space-y-3">
                  {student.observations.length > 0 ? (
                    student.observations.slice(0, 4).map((entry) => (
                      <div key={entry.id} className="border-b border-navy/10 pb-3 text-sm text-navy/72">
                        <p className="font-medium text-navy">{entry.title}</p>
                        <p className="mt-1">{entry.teacher.user.name}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-navy/62">No observation notes yet.</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Fees & Payments</p>
            <div className="mt-5 space-y-4">
              {student.invoices.length > 0 ? (
                student.invoices.map((invoice) => (
                  <div key={invoice.id} className="rounded-[1.3rem] border border-navy/10 px-5 py-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <p className="font-semibold text-navy">{invoice.invoiceNumber}</p>
                      <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                        {invoice.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-navy/68">
                      {formatCurrency(Number(invoice.amount))} | Due {formatDate(invoice.dueDate)} | Payments logged {invoice.payments.length}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4 text-sm leading-7 text-navy/68">
                  No invoice has been created for this student yet.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Admission & Documents</p>
            <div className="mt-5 space-y-4">
              {latestAdmission ? (
                <>
                  <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4 text-sm leading-7 text-navy/72">
                    Application {latestAdmission.applicationNumber} | {latestAdmission.program?.name ?? currentEnrollment?.program.name ?? "Program pending"} | {latestAdmission.documents.length} document(s)
                  </div>
                  {latestAdmission.documents.map((doc) => (
                    <div key={doc.id} className="rounded-[1.2rem] border border-navy/10 px-4 py-3 text-sm text-navy/72">
                      {doc.documentType.replaceAll("_", " ")} | {doc.status}
                    </div>
                  ))}
                </>
              ) : (
                <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4 text-sm leading-7 text-navy/68">
                  This student does not yet have a linked admission packet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
