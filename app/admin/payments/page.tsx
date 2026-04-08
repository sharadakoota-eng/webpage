import Link from "next/link";
import { InvoiceStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AdminPaymentsDesk } from "@/components/portal/admin-payments-desk";
import { DocumentDownloadButton } from "@/components/portal/document-download-button";
import { PaymentVerificationButton } from "@/components/portal/payment-verification-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default async function AdminPaymentsPage() {
  const [students, programs, invoices, payments, receipts] = await Promise.all([
    prisma.student.findMany({
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      include: {
        currentClass: true,
        parentMaps: {
          include: {
            parent: {
              include: { user: true },
            },
          },
        },
      },
      take: 200,
    }),
    prisma.program.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        category: true,
      },
    }),
    prisma.invoice.findMany({
      orderBy: { dueDate: "desc" },
      take: 60,
      include: {
        student: {
          include: {
            parentMaps: {
              include: {
                parent: {
                  include: { user: true },
                },
              },
            },
            enrollments: {
              include: { program: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        payments: true,
        receipt: true,
      },
    }),
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        invoice: {
          include: {
            student: true,
          },
        },
      },
    }),
    prisma.receipt.findMany({
      orderBy: { issuedAt: "desc" },
      take: 30,
      include: {
        student: true,
      },
    }),
  ]);

  const dueStatuses = new Set<InvoiceStatus>([InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE]);
  const dueInvoices = invoices.filter((invoice) => dueStatuses.has(invoice.status));
  const verifyQueue = payments.filter((payment) => payment.status === PaymentStatus.PENDING);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Payments & Receipts</p>
            <h1 className="mt-2 font-display text-4xl text-navy">Finance verification and receipt desk</h1>
            <p className="mt-3 text-sm leading-7 text-navy/68">
              Admin should be able to see invoices, confirm payments, and release receipts from one clean workbench.
            </p>
          </div>
          <Link href="/admin/revenue" className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
            Open revenue
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Invoices", value: invoices.length.toString() },
          { label: "Due / overdue", value: dueInvoices.length.toString() },
          { label: "Verification queue", value: verifyQueue.length.toString() },
          { label: "Successful payments", value: payments.filter((payment) => payment.status === PaymentStatus.SUCCESS).length.toString() },
          { label: "Receipts", value: receipts.length.toString() },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.5rem] bg-white p-5 shadow-card">
            <p className="text-sm text-navy/60">{item.label}</p>
            <p className="mt-3 font-display text-3xl text-navy">{item.value}</p>
          </div>
        ))}
      </section>

      <AdminPaymentsDesk
        students={students.map((student) => ({
          id: student.id,
          label: `${student.firstName} ${student.lastName ?? ""}`.trim() + ` (${student.admissionNumber})`,
          parentLabel: student.parentMaps.find((item) => item.isPrimary)?.parent.user.name ?? student.parentMaps[0]?.parent.user.name ?? "Parent pending",
          classLabel: student.currentClass ? `${student.currentClass.name}${student.currentClass.section ? ` - ${student.currentClass.section}` : ""}` : undefined,
        }))}
        programs={programs.map((program) => ({
          id: program.id,
          name: program.name,
          category: program.category,
        }))}
        invoices={dueInvoices.map((invoice) => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount.toString(),
          studentLabel: `${invoice.student.firstName} ${invoice.student.lastName ?? ""}`.trim(),
        }))}
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Invoice Desk</p>
          <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-navy/10">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-navy/10 text-left">
                <thead className="bg-[#fbf7f0]">
                  <tr className="text-xs uppercase tracking-[0.18em] text-navy/45">
                    <th className="px-5 py-4 font-semibold">Invoice</th>
                    <th className="px-5 py-4 font-semibold">Student</th>
                    <th className="px-5 py-4 font-semibold">Parent</th>
                    <th className="px-5 py-4 font-semibold">Program</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Documents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/10">
                  {invoices.map((invoice) => {
                    const parent = invoice.student.parentMaps.find((item) => item.isPrimary) ?? invoice.student.parentMaps[0];
                    return (
                      <tr key={invoice.id}>
                        <td className="px-5 py-4 text-sm font-medium text-navy">
                          {invoice.invoiceNumber}
                          <p className="mt-1 text-xs text-navy/55">Due {formatDate(invoice.dueDate)}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-navy/72">
                          {invoice.student.firstName} {invoice.student.lastName ?? ""}
                        </td>
                        <td className="px-5 py-4 text-sm text-navy/72">{parent?.parent.user.name ?? "Pending"}</td>
                        <td className="px-5 py-4 text-sm text-navy/72">{invoice.student.enrollments[0]?.program.name ?? "Pending"}</td>
                        <td className="px-5 py-4 text-sm text-navy/72">{formatCurrency(Number(invoice.amount))}</td>
                        <td className="px-5 py-4 text-sm">
                          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${invoice.status === InvoiceStatus.PAID ? "bg-emerald-50 text-emerald-700" : "bg-[#fff4e5] text-[#b45309]"}`}>
                            {invoice.status.replaceAll("_", " ")}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm">
                          <div className="flex flex-wrap gap-2">
                            <DocumentDownloadButton
                              href={`/api/admin/invoices/${invoice.id}/pdf`}
                              filename={`${invoice.invoiceNumber.toLowerCase()}-invoice.pdf`}
                            >
                              Download invoice
                            </DocumentDownloadButton>
                            {invoice.receipt ? (
                              <DocumentDownloadButton
                                href={`/api/admin/receipts/${invoice.receipt.id}/pdf`}
                                filename={`${invoice.receipt.receiptNumber.toLowerCase()}-receipt.pdf`}
                              >
                                Download receipt
                              </DocumentDownloadButton>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Payment Verification</p>
            <div className="mt-5 space-y-4">
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <div key={payment.id} className="rounded-[1.3rem] border border-navy/10 px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-navy">{payment.invoice.invoiceNumber}</p>
                        <p className="mt-2 text-sm leading-7 text-navy/68">
                          {payment.invoice.student.firstName} {payment.invoice.student.lastName ?? ""} | {formatCurrency(Number(payment.amount))} | {payment.method ?? "Method pending"}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${payment.status === PaymentStatus.SUCCESS ? "bg-emerald-50 text-emerald-700" : payment.status === PaymentStatus.PENDING ? "bg-[#fff4e5] text-[#b45309]" : "bg-red-50 text-red-600"}`}>
                          {payment.status.replaceAll("_", " ")}
                        </span>
                        {payment.status === PaymentStatus.PENDING ? (
                          <>
                            <PaymentVerificationButton paymentId={payment.id} action="verify" label="Verify" />
                            <PaymentVerificationButton paymentId={payment.id} action="reject" label="Reject" />
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4 text-sm leading-7 text-navy/68">
                  No payment records have been created yet.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Receipt Log</p>
            <div className="mt-5 space-y-4">
              {receipts.length > 0 ? (
                receipts.map((receipt) => (
                  <div key={receipt.id} className="rounded-[1.3rem] border border-navy/10 px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-navy">{receipt.receiptNumber}</p>
                        <p className="mt-2 text-sm leading-7 text-navy/68">
                          {receipt.student.firstName} {receipt.student.lastName ?? ""} | {formatCurrency(Number(receipt.amount))} | Issued {formatDate(receipt.issuedAt)}
                        </p>
                      </div>
                      <DocumentDownloadButton
                        href={`/api/admin/receipts/${receipt.id}/pdf`}
                        filename={`${receipt.receiptNumber.toLowerCase()}-receipt.pdf`}
                      >
                        Download receipt
                      </DocumentDownloadButton>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4 text-sm leading-7 text-navy/68">
                  Receipts will appear here once payments are confirmed and receipt generation begins.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
