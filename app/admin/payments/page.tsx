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

type PageProps = {
  searchParams?: Promise<{
    category?: string;
    q?: string;
  }>;
};

export default async function AdminPaymentsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const categoryFilter = params.category?.trim() ?? "";
  const query = params.q?.trim().toLowerCase() ?? "";
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
      orderBy: { createdAt: "desc" },
      take: 80,
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
  const programById = new Map(programs.map((program) => [program.id, program]));
  const categories = Array.from(new Set(programs.map((program) => program.category)));
  const manualInvoices = invoices.filter((invoice) => {
    const lineItems = invoice.lineItems as Record<string, unknown> | null;
    return typeof lineItems?.invoiceType === "string" && lineItems.invoiceType === "MANUAL";
  });
  const totalManualDue = manualInvoices
    .filter((invoice) => invoice.status !== InvoiceStatus.PAID)
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);

  const filteredInvoices = invoices.filter((invoice) => {
    if (categoryFilter) {
      const enrollmentProgramId = invoice.student.enrollments[0]?.programId;
      const lineItems = invoice.lineItems as Record<string, unknown> | null;
      const lineItemProgramId = typeof lineItems?.programId === "string" ? lineItems.programId : undefined;
      const programId = enrollmentProgramId ?? lineItemProgramId;
      if (!programId || programById.get(programId)?.category !== categoryFilter) {
        return false;
      }
    }

    if (!query) return true;
    const parent = invoice.student.parentMaps.find((item) => item.isPrimary) ?? invoice.student.parentMaps[0];
    const parentName = parent?.parent.user.name.toLowerCase() ?? "";
    const studentName = `${invoice.student.firstName} ${invoice.student.lastName ?? ""}`.toLowerCase();
    const invoiceNumber = invoice.invoiceNumber.toLowerCase();
    const programLabel = invoice.student.enrollments[0]?.program?.name?.toLowerCase() ?? "";
    return (
      studentName.includes(query) ||
      parentName.includes(query) ||
      invoiceNumber.includes(query) ||
      programLabel.includes(query)
    );
  });

  const filteredPayments = query
    ? payments.filter((payment) => {
        const studentName = `${payment.invoice.student.firstName} ${payment.invoice.student.lastName ?? ""}`.toLowerCase();
        const invoiceNumber = payment.invoice.invoiceNumber.toLowerCase();
        return studentName.includes(query) || invoiceNumber.includes(query);
      })
    : payments;

  const filteredReceipts = query
    ? receipts.filter((receipt) => {
        const studentName = `${receipt.student.firstName} ${receipt.student.lastName ?? ""}`.toLowerCase();
        return receipt.receiptNumber.toLowerCase().includes(query) || studentName.includes(query);
      })
    : receipts;

  const filteredVerifyQueue = query
    ? verifyQueue.filter((payment) => {
        const studentName = `${payment.invoice.student.firstName} ${payment.invoice.student.lastName ?? ""}`.toLowerCase();
        const invoiceNumber = payment.invoice.invoiceNumber.toLowerCase();
        return studentName.includes(query) || invoiceNumber.includes(query);
      })
    : verifyQueue;

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
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/revenue" className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
              Open revenue
            </Link>
            <form className="flex flex-wrap gap-2">
              <select name="category" defaultValue={categoryFilter} className="rounded-full border border-navy/10 px-4 py-2 text-sm text-navy">
                <option value="">All programs</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                name="q"
                defaultValue={query}
                placeholder="Search invoice, student, parent"
                className="rounded-full border border-navy/10 px-4 py-2 text-sm text-navy"
              />
              <button type="submit" className="rounded-full border border-navy/10 px-4 py-2 text-sm font-semibold text-navy">
                Filter
              </button>
              {categoryFilter || query ? (
                <Link href="/admin/payments" className="rounded-full border border-navy/10 px-4 py-2 text-sm font-semibold text-navy">
                  Reset
                </Link>
              ) : null}
            </form>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <a href="#invoice-desk" className="rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy">
            Invoice desk
          </a>
          <a href="#verification-queue" className="rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy">
            Verification queue
          </a>
          <a href="#receipt-log" className="rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy">
            Receipt log
          </a>
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

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Manual invoices", value: manualInvoices.length.toString() },
          { label: "Manual dues", value: formatCurrency(totalManualDue) },
          { label: "Pending verification", value: verifyQueue.length.toString() },
          { label: "Cash collections", value: payments.filter((payment) => payment.method === "CASH").length.toString() },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.4rem] border border-navy/10 bg-white px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-navy/45">{item.label}</p>
            <p className="mt-3 text-xl font-semibold text-navy">{item.value}</p>
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

      <section className="rounded-[2rem] bg-white p-8 shadow-card" id="invoice-desk">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Invoice Desk</p>
            <h2 className="mt-2 font-display text-2xl text-navy">Track manual + program invoices clearly</h2>
          </div>
          <div className="rounded-full bg-[#fbf7f0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-navy/60">
            Showing {filteredInvoices.length} invoices
          </div>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="overflow-hidden rounded-[1.4rem] border border-navy/10">
            <div className="max-h-[520px] overflow-auto">
              <table className="min-w-full table-fixed divide-y divide-navy/10 text-left">
                <thead className="bg-[#fbf7f0]">
                  <tr className="text-xs uppercase tracking-[0.18em] text-navy/45">
                    <th className="px-5 py-4 font-semibold w-[140px]">Invoice</th>
                    <th className="px-5 py-4 font-semibold w-[140px]">Student</th>
                    <th className="px-5 py-4 font-semibold w-[140px]">Parent</th>
                    <th className="px-5 py-4 font-semibold w-[150px]">Program</th>
                    <th className="px-5 py-4 font-semibold w-[130px]">Type</th>
                    <th className="px-5 py-4 font-semibold w-[110px]">Amount</th>
                    <th className="px-5 py-4 font-semibold w-[150px]">Payment</th>
                    <th className="px-5 py-4 font-semibold w-[150px]">Documents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/10">
                  {filteredInvoices.map((invoice) => {
                    const parent = invoice.student.parentMaps.find((item) => item.isPrimary) ?? invoice.student.parentMaps[0];
                    const lineItems = invoice.lineItems as Record<string, unknown> | null;
                    const lineItemProgramId = typeof lineItems?.programId === "string" ? lineItems.programId : undefined;
                    const programId = invoice.student.enrollments[0]?.programId ?? lineItemProgramId;
                    const programLabel = programId ? programById.get(programId)?.name ?? "Program pending" : "Program pending";
                    const invoiceType = typeof lineItems?.invoiceType === "string" ? lineItems.invoiceType : "PROGRAM_ENROLLMENT";
                    const manualLabel = typeof lineItems?.title === "string" ? lineItems.title : undefined;
                    const sortedPayments = [...invoice.payments].sort((a, b) => {
                      const aDate = a.paidAt ?? a.createdAt;
                      const bDate = b.paidAt ?? b.createdAt;
                      return bDate.getTime() - aDate.getTime();
                    });
                    const latestPayment = sortedPayments[0];
                    const paymentDate = latestPayment?.paidAt ?? latestPayment?.createdAt;
                    return (
                      <tr key={invoice.id}>
                        <td className="px-5 py-4 text-sm font-medium text-navy">
                          {invoice.invoiceNumber}
                          <p className="mt-1 text-xs text-navy/55">Due {formatDate(invoice.dueDate)}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-navy/72 break-words">
                          {invoice.student.firstName} {invoice.student.lastName ?? ""}
                        </td>
                        <td className="px-5 py-4 text-sm text-navy/72 break-words">{parent?.parent.user.name ?? "Pending"}</td>
                        <td className="px-5 py-4 text-sm text-navy/72 break-words">
                          {programLabel}
                          {manualLabel ? <p className="mt-1 text-xs text-navy/55">{manualLabel}</p> : null}
                        </td>
                        <td className="px-5 py-4 text-xs uppercase tracking-[0.18em] text-navy/60">
                          {invoiceType === "MANUAL" ? "Manual invoice" : invoiceType.replaceAll("_", " ").toLowerCase()}
                        </td>
                        <td className="px-5 py-4 text-sm text-navy/72">{formatCurrency(Number(invoice.amount))}</td>
                        <td className="px-5 py-4 text-sm">
                          <div className="flex flex-col gap-2">
                            <span
                              className={`w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                                invoice.status === InvoiceStatus.PAID ? "bg-emerald-50 text-emerald-700" : "bg-[#fff4e5] text-[#b45309]"
                              }`}
                            >
                              {invoice.status.replaceAll("_", " ")}
                            </span>
                            <p className="text-xs text-navy/60">
                              {latestPayment ? `${latestPayment.method ?? "Method pending"} - ${paymentDate ? formatDate(paymentDate) : "Date pending"}` : "No payment logged"}
                            </p>
                          </div>
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

          <div className="space-y-6">
            <section className="rounded-[1.6rem] border border-navy/10 bg-white p-6" id="verification-queue">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Payment Verification</p>
              <p className="mt-2 text-sm text-navy/60">Review pending payments and approve or reject.</p>
              <div className="mt-5 max-h-[420px] space-y-4 overflow-auto pr-1">
                {filteredVerifyQueue.length > 0 ? (
                filteredVerifyQueue.map((payment) => (
                  <div key={payment.id} className="rounded-[1.3rem] border border-navy/10 px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-navy">{payment.invoice.invoiceNumber}</p>
                        <p className="mt-2 text-sm leading-7 text-navy/68">
                          {payment.invoice.student.firstName} {payment.invoice.student.lastName ?? ""} | {formatCurrency(Number(payment.amount))} | {payment.method ?? "Method pending"}
                        </p>
                        {payment.gatewayPayload && typeof payment.gatewayPayload === "object" && !Array.isArray(payment.gatewayPayload) ? (
                          (() => {
                            const payload = payment.gatewayPayload as Record<string, unknown>;
                            const fileUrl = typeof payload.fileUrl === "string" ? payload.fileUrl : null;
                            const reference = typeof payload.reference === "string" ? payload.reference : null;
                            return (
                              <div className="mt-2 text-xs text-navy/60">
                                {reference ? <p>Ref: {reference}</p> : null}
                                {fileUrl ? (
                                  <a href={fileUrl} target="_blank" className="font-semibold text-gold">
                                    View payment proof
                                  </a>
                                ) : null}
                              </div>
                            );
                          })()
                        ) : null}
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
                  No pending payments are waiting for verification.
                </div>
              )}
            </div>
            </section>

            <section className="rounded-[1.6rem] border border-navy/10 bg-white p-6" id="receipt-log">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Receipt Log</p>
              <div className="mt-5 max-h-[360px] space-y-4 overflow-auto pr-1">
                {filteredReceipts.length > 0 ? (
                  filteredReceipts.map((receipt) => (
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
      </section>

      {manualInvoices.length > 0 ? (
        <section className="rounded-[2rem] bg-white p-8 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Summer Camp Manual Invoices</p>
              <h2 className="mt-2 font-display text-2xl text-navy">Track summer camp invoices clearly</h2>
              <p className="mt-2 text-sm text-navy/60">Manual invoices for camp and activities with status + download.</p>
            </div>
            <div className="rounded-full bg-[#fbf7f0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-navy/60">
              Showing {manualInvoices.length}
            </div>
          </div>
          <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-navy/10">
            <div className="max-h-[360px] overflow-auto">
              <table className="min-w-full divide-y divide-navy/10 text-left">
                <thead className="bg-[#fbf7f0]">
                  <tr className="text-xs uppercase tracking-[0.18em] text-navy/45">
                    <th className="px-5 py-4 font-semibold">Invoice</th>
                    <th className="px-5 py-4 font-semibold">Student</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/10">
                  {manualInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-5 py-4 text-sm font-medium text-navy">{invoice.invoiceNumber}</td>
                      <td className="px-5 py-4 text-sm text-navy/72">
                        {invoice.student.firstName} {invoice.student.lastName ?? ""}
                      </td>
                      <td className="px-5 py-4 text-sm text-navy/72">{formatCurrency(Number(invoice.amount))}</td>
                      <td className="px-5 py-4 text-sm">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                            invoice.status === InvoiceStatus.PAID ? "bg-emerald-50 text-emerald-700" : "bg-[#fff4e5] text-[#b45309]"
                          }`}
                        >
                          {invoice.status.replaceAll("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm">
                        <DocumentDownloadButton
                          href={`/api/admin/invoices/${invoice.id}/pdf`}
                          filename={`${invoice.invoiceNumber.toLowerCase()}-invoice.pdf`}
                        >
                          Download invoice
                        </DocumentDownloadButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
