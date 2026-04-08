import Link from "next/link";
import { notFound } from "next/navigation";
import { InvoiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AdminUserAccessCard } from "@/components/portal/admin-user-access-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default async function AdminParentDetailPage({ params }: { params: Promise<{ parentId: string }> }) {
  const { parentId } = await params;

  const parent = await prisma.parent.findUnique({
    where: { id: parentId },
    include: {
      user: true,
      parentStudents: {
        include: {
          student: {
            include: {
              currentClass: true,
              enrollments: {
                include: { program: true },
                orderBy: { createdAt: "desc" },
                take: 1,
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
                  invoiceNumber: true,
                },
              },
            },
          },
        },
      },
      admissions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!parent) {
    notFound();
  }

  const latestAdmission = parent.admissions[0];
  const familyProfile = (latestAdmission?.familyProfile as Record<string, string | undefined> | undefined) ?? {};
  const totalDue = parent.parentStudents.reduce(
    (sum, entry) => sum + entry.student.invoices.reduce((invoiceSum, invoice) => invoiceSum + Number(invoice.amount), 0),
    0,
  );

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Parent Record</p>
            <h1 className="mt-2 font-display text-4xl text-navy">{parent.user.name}</h1>
            <p className="mt-3 text-sm leading-7 text-navy/68">
              {parent.user.phone ?? "Phone pending"} | {parent.user.email}
            </p>
          </div>
          <Link href="/admin/parents" className="rounded-full border border-navy/10 px-5 py-3 text-sm font-semibold text-navy">
            Back to parents
          </Link>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-6">
          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Family Profile</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                { label: "Father", value: familyProfile.fatherName ?? "Pending" },
                { label: "Mother", value: familyProfile.motherName ?? "Pending" },
                { label: "Father phone", value: familyProfile.fatherPhone ?? "Pending" },
                { label: "Mother phone", value: familyProfile.motherPhone ?? "Pending" },
                { label: "Primary parent", value: familyProfile.primaryParent ?? "Pending" },
                { label: "Portal active", value: parent.user.isActive ? "Yes" : "No" },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-navy/45">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-navy">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Fee Summary</p>
            <div className="mt-5 rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-navy/45">Outstanding balance</p>
              <p className="mt-2 text-2xl font-semibold text-navy">{formatCurrency(totalDue)}</p>
            </div>
          </section>

          <AdminUserAccessCard userId={parent.userId} isActive={parent.user.isActive} title="Parent Portal Access" />
        </section>

        <section className="space-y-6">
          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Linked Children</p>
            <div className="mt-5 space-y-4">
              {parent.parentStudents.length > 0 ? (
                parent.parentStudents.map((entry) => (
                  <div key={entry.studentId} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-navy">
                          {entry.student.firstName} {entry.student.lastName ?? ""}
                        </p>
                        <p className="mt-2 text-sm leading-7 text-navy/68">
                          {entry.student.currentClass ? `${entry.student.currentClass.name}${entry.student.currentClass.section ? ` - ${entry.student.currentClass.section}` : ""}` : "Class pending"}
                          {" | "}
                          {entry.student.enrollments[0]?.program.name ?? "Program pending"}
                        </p>
                      </div>
                      <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                        {entry.relation}
                      </span>
                    </div>

                    {entry.student.invoices.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {entry.student.invoices.map((invoice) => (
                          <span key={invoice.id} className="rounded-full bg-[#fff4e5] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b45309]">
                            {invoice.invoiceNumber} | {formatCurrency(Number(invoice.amount))}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-[1.35rem] bg-[#fbf7f0] px-5 py-4 text-sm leading-7 text-navy/68">
                  No students have been linked to this parent profile yet.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
