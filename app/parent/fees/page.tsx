import { InvoiceStatus, PaymentStatus } from "@prisma/client";
import { getPortalSession } from "@/lib/erp-auth";
import { getParentPortalData } from "@/lib/erp-data";
import { DocumentDownloadButton } from "@/components/portal/document-download-button";
import { RazorpayPaymentButton } from "@/components/portal/razorpay-payment-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ParentFeesPage() {
  const session = await getPortalSession();
  const parent = await getParentPortalData(session?.sub);
  const student = parent?.parentStudents[0]?.student;
  const currentEnrollment = student?.enrollments[0];
  const invoices = student?.invoices ?? [];
  const receipts = student?.receipts ?? [];
  const configuredFees = currentEnrollment?.program.feeStructures ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-[2rem] bg-white p-8 shadow-card lg:col-span-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Configured Program Fees</p>
        <h2 className="mt-2 font-display text-3xl text-navy">
          {currentEnrollment?.program.name ?? "Program pricing pending"}
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {configuredFees.length > 0 ? (
            configuredFees.map((fee) => (
              <div key={fee.id} className="rounded-[1.35rem] bg-cream px-5 py-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.2em] text-navy/45">{fee.frequency}</p>
                <p className="mt-2 text-sm font-semibold text-navy">{fee.title}</p>
                <p className="mt-2 text-sm text-navy/72">Rs. {fee.amount.toString()}</p>
              </div>
            ))
          ) : (
            <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70 md:col-span-2 xl:col-span-4">
              Admin-configured program pricing will appear here once fee structures are set in the ERP.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Invoices</p>
        <div className="mt-5 space-y-4">
          {invoices.length > 0 ? (
            invoices.map((invoice) => {
              const actionablePayments = invoice.payments.filter((payment) => payment.status !== PaymentStatus.FAILED);
              return (
                <div key={invoice.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                  <p className="font-semibold text-navy">{invoice.invoiceNumber}</p>
                  <p className="mt-2 text-sm text-navy/65">
                    Due {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(invoice.dueDate)}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">
                    Rs. {invoice.amount.toString()} | {invoice.status.replaceAll("_", " ")}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <DocumentDownloadButton
                      href={`/api/parent/invoices/${invoice.id}/pdf`}
                      filename={`${invoice.invoiceNumber.toLowerCase()}-invoice.pdf`}
                    >
                      Download invoice
                    </DocumentDownloadButton>
                    {invoice.receipt ? (
                      <DocumentDownloadButton
                        href={`/api/parent/receipts/${invoice.receipt.id}/pdf`}
                        filename={`${invoice.receipt.receiptNumber.toLowerCase()}-receipt.pdf`}
                      >
                        Download receipt
                      </DocumentDownloadButton>
                    ) : null}
                  </div>
                  {actionablePayments.length > 0 ? (
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#b45309]">
                      Payment submitted. Waiting for school verification.
                    </p>
                  ) : null}
                  {invoice.status !== InvoiceStatus.PAID && actionablePayments.length === 0 ? (
                    <div className="mt-4">
                      <RazorpayPaymentButton invoiceId={invoice.id} label="Pay with Razorpay" />
                    </div>
                  ) : null}
                </div>
              );
            })
          ) : (
            <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
              Finance records will appear here once the school office begins issuing invoices through the ERP.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Receipts</p>
        <div className="mt-5 space-y-4">
          {receipts.length > 0 ? (
            receipts.map((receipt) => (
              <div key={receipt.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-navy">{receipt.receiptNumber}</p>
                    <p className="mt-2 text-sm leading-7 text-navy/72">
                      Rs. {receipt.amount.toString()} | Issued{" "}
                      {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(receipt.issuedAt)}
                    </p>
                  </div>
                  <DocumentDownloadButton
                    href={`/api/parent/receipts/${receipt.id}/pdf`}
                    filename={`${receipt.receiptNumber.toLowerCase()}-receipt.pdf`}
                  >
                    Download receipt
                  </DocumentDownloadButton>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
              Receipts will be available here after payments are recorded by the school administration.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
