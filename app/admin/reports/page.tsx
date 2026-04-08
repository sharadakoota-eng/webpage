import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminReportsPage() {
  const [studentCount, classCount, teacherCount, paymentCount, admissionCount, dues] = await Promise.all([
    prisma.student.count(),
    prisma.class.count(),
    prisma.teacher.count(),
    prisma.payment.count(),
    prisma.admission.count(),
    prisma.invoice.count({ where: { status: { in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] } } }),
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Reports</p>
        <h2 className="mt-2 font-display text-3xl text-navy">Operational reporting for admissions, enrollment, fees, classes, and staff</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            `Admission report: ${admissionCount} application record(s).`,
            `Enrollment report: ${studentCount} student record(s) across ${classCount} class(es).`,
            `Teacher assignment report: ${teacherCount} teacher profile(s).`,
            `Fee collection report: ${paymentCount} payment record(s).`,
            `Dues report: ${dues} invoice(s) still need attention.`,
            "Attendance report should pair with the Attendance module for export and review.",
          ].map((item) => (
            <div key={item} className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy shadow-card">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
