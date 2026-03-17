import { PageHero } from "@/components/sections/page-hero";

export default function FeePaymentsPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Fee & Payments"
        title="Transparent fee communication with a payment-ready architecture"
        description="The initial launch includes fee structure presentation and future-ready invoice and payment modules built for Razorpay integration in the next phase."
      />
      <section className="grid gap-6 lg:grid-cols-3">
        {[
          "Fee structures are modeled in MySQL through Prisma.",
          "Invoices, payments, and receipts are already included in the schema.",
          "Razorpay integration can be switched on in Phase 3 without redesigning the core data model.",
        ].map((point) => (
          <div key={point} className="rounded-[1.75rem] bg-white p-6 shadow-card text-sm leading-7 text-navy/75">
            {point}
          </div>
        ))}
      </section>
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <h2 className="font-display text-3xl text-navy">Current launch approach</h2>
          <div className="mt-5 space-y-4 text-sm leading-7 text-navy/70">
            <p>Phase 1 is designed to communicate fee structures clearly and keep families informed without overcomplicating operations.</p>
            <p>As the school scales, this module can expand into invoice generation, payment tracking, digital receipts, and parent-facing payment history.</p>
          </div>
        </div>
        <div className="rounded-[2rem] bg-cream p-8 shadow-card">
          <h2 className="font-display text-3xl text-navy">Future-ready payment system</h2>
          <div className="mt-5 grid gap-3">
            {[
              "Razorpay-ready payment records",
              "Invoice and receipt tables already modeled",
              "Payment success and failure notifications",
              "Expandable finance dashboard for admin",
            ].map((item) => (
              <div key={item} className="rounded-3xl bg-white px-4 py-4 text-sm text-navy shadow-card">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
