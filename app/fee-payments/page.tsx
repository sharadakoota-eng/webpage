import Image from "next/image";
import { CreditCard, FileBadge2, Receipt, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/sections/page-hero";
import feePaymentsImage from "@/assets/feepayments.png";
import feePaymentsDetailImage from "@/assets/feepayments1.png";

const feeHighlights = [
  {
    title: "Clarity from the first conversation",
    copy: "Families should know that fee discussions will be handled with respect, transparency, and proper guidance.",
    icon: ShieldCheck,
  },
  {
    title: "Records that stay organized",
    copy: "The backend is structured for invoices, receipts, status tracking, and parent-facing history as the school grows.",
    icon: FileBadge2,
  },
  {
    title: "Future-ready online collection",
    copy: "The platform is already prepared for Razorpay-ready payment records, digital receipts, and notification-based updates.",
    icon: CreditCard,
  },
];

const currentApproach = [
  "Fee discussions are guided by the front desk or admissions team so parents can understand structure and next steps clearly.",
  "The launch version keeps communication simple and human while preserving a strong system foundation behind the scenes.",
  "As the school scales, the same setup can expand into payment history, due reminders, invoices, and digital receipts.",
];

const futureCapabilities = [
  "Invoice generation and fee structure management",
  "Receipt tracking and payment status updates",
  "Payment success and payment failure notifications",
  "Parent portal access to fee history in later phases",
];

export default function FeePaymentsPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Fee & Payments"
        title="Transparent fee guidance with a future-ready payment system"
        description="For launch, Sharada Koota Montessori focuses on clarity and parent trust. Behind the scenes, the platform is already structured to grow into invoices, receipts, and online payments."
      />

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="page-media">
            <Image src={feePaymentsImage} alt="Fee communication at Sharada Koota Montessori" fill className="object-cover object-center" />
          </div>
          <div className="flex h-full flex-col justify-center p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why This Matters</p>
            <h2 className="mt-3 font-display text-4xl text-navy sm:text-5xl">Parents value financial clarity just as much as academic trust</h2>
            <p className="mt-5 text-base leading-8 text-navy/72">
              A well-run school does not treat fee communication as an afterthought. It should feel clear, respectful, and properly guided. Families should know what to expect, whom to speak to, and how records will be handled as the school journey progresses.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/contact" className="px-7">
                Enquire About Fees
              </Button>
              <Button href="/admissions" variant="ghost" className="px-7">
                Start Admissions
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {feeHighlights.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="stagger-rise journey-glow rounded-[1.85rem] border border-transparent bg-white p-6 shadow-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-gold">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-2xl text-navy">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-navy/70">{item.copy}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-sky p-8 shadow-card lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Current Launch Approach</p>
          <h2 className="mt-3 font-display text-4xl text-navy">Simple for parents now, scalable for the school later</h2>
          <div className="mt-6 grid gap-4">
            {currentApproach.map((item, index) => (
              <div
                key={item}
                className="stagger-rise journey-glow rounded-[1.5rem] border border-transparent bg-white px-5 py-4 text-sm leading-7 text-navy shadow-card"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-card">
          <div className="page-media-short">
            <Image src={feePaymentsDetailImage} alt="Parent support and fee guidance" fill className="object-cover object-center" />
          </div>
          <div className="p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">What Families Can Expect</p>
            <div className="mt-5 space-y-4 text-sm leading-8 text-navy/72">
              <p>Fee-related questions can be raised during enquiry, visit, or admissions conversations. The aim is to provide guidance in a way that feels direct and easy to understand.</p>
              <p>As the platform evolves, parents will also be able to view receipts, status, and fee history through the portal rather than depending only on manual follow-up.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Future Payment Readiness</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {futureCapabilities.map((item, index) => (
            <div
              key={item}
              className="stagger-rise rounded-[1.5rem] border border-white/10 bg-white/10 p-5 text-sm leading-7 text-white/82 backdrop-blur"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-gold">
                <Receipt className="h-4 w-4" />
              </div>
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
