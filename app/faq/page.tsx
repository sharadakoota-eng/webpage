import Image from "next/image";
import { PageHero } from "@/components/sections/page-hero";
import teamImage from "@/assets/team.jpg";

const faqs = [
  {
    question: "How do I enquire about admissions?",
    answer: "You can use the enquiry form, call the school directly, or book a campus visit through the contact page.",
  },
  {
    question: "Will parents get a portal?",
    answer: "Yes. The architecture already includes a parent portal for attendance, communication, fee history, documents, and updates.",
  },
  {
    question: "Is the system ready for online payments later?",
    answer: "Yes. The schema and backend modules already account for invoices, payments, receipts, and Razorpay-ready integrations.",
  },
  {
    question: "Can the school start small and scale later?",
    answer: "Yes. The platform is phased intentionally so the public website and lead workflows can launch first, while portals and payments can be activated later.",
  },
];

export default function FAQPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="FAQ"
        title="Answers for prospective and current families"
        description="Common questions are structured here so the team can continue expanding them through the admin content module."
      />
      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
          <div className="p-8">
            <h2 className="font-display text-3xl text-navy">Questions parents often ask first</h2>
            <p className="mt-4 text-base leading-8 text-navy/70">
              A premium school website should answer the practical concerns of families quickly while still reflecting warmth and trust. This page can keep growing as admissions conversations reveal new recurring questions.
            </p>
          </div>
          <div className="relative min-h-[18rem]">
            <Image src={teamImage} alt="Shaarada Kuuta support team" fill className="object-cover" />
          </div>
        </div>
      </section>
      <section className="space-y-4">
        {faqs.map((item) => (
          <div key={item.question} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <h2 className="font-semibold text-navy">{item.question}</h2>
            <p className="mt-3 text-sm leading-7 text-navy/75">{item.answer}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
