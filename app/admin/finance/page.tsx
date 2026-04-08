import { InvoiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function AdminFinancePage() {
  const [feeStructures, invoices, payments, receipts, overdueInvoices] = await Promise.all([
    prisma.feeStructure.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { program: true },
    }),
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { student: true },
    }),
    prisma.payment.count(),
    prisma.receipt.count(),
    prisma.invoice.count({
      where: {
        status: {
          in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE],
        },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Fee plans", value: feeStructures.length.toString() },
          { label: "Invoices", value: invoices.length.toString() },
          { label: "Pending or overdue", value: overdueInvoices.toString() },
          { label: "Payments", value: payments.toString() },
          { label: "Receipts", value: receipts.toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-4xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Fee Structures</p>
          <div className="mt-5 space-y-4">
            {feeStructures.length > 0 ? (
              feeStructures.map((item) => (
                <div key={item.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                  <p className="font-semibold text-navy">{item.title}</p>
                  <p className="mt-2 text-sm text-navy/65">
                    Program: {item.program?.name ?? "General"} | {item.frequency}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">Rs. {item.amount.toString()}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
                Fee plans can be created here for Montessori, Day Care, Summer Camp, and future class-wise billing.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Recent Invoices</p>
          <div className="mt-5 space-y-4">
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <div key={invoice.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                  <p className="font-semibold text-navy">{invoice.invoiceNumber}</p>
                  <p className="mt-2 text-sm text-navy/65">
                    {invoice.student.firstName} {invoice.student.lastName ?? ""} | Due {formatDate(invoice.dueDate)}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">
                    Rs. {invoice.amount.toString()} | {invoice.status.replaceAll("_", " ")}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
                Finance module is ready for expansion into invoicing, manual payment entry, receipts, and Razorpay integration.
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
