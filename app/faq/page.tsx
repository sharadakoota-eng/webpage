import Image from "next/image";
import { CircleHelp, MessageSquareText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/sections/page-hero";
import faqImage from "@/assets/faq.png";
import faqDetailImage from "@/assets/faq1.png";

const faqs = [
  {
    question: "How do I enquire about admissions?",
    answer: "You can submit the enquiry form through the website, call the school directly, message on WhatsApp, or book a school visit through the contact page.",
  },
  {
    question: "Can I visit the school before applying?",
    answer: "Yes. Families are encouraged to book a visit so they can understand the environment, meet the team, and gain clarity on the right program before taking the next step.",
  },
  {
    question: "Which age group does the Montessori program support?",
    answer: "The Montessori environment is designed primarily for children between 2 and 6 years, while related care and enrichment offerings support other age groups as needed.",
  },
  {
    question: "Is day care available along with the school program?",
    answer: "Yes. Day care can be paired with school programs based on the child's age, family routine, and the support needed during the day.",
  },
  {
    question: "What happens after I submit an enquiry or admission form?",
    answer: "The front desk receives the submission, creates an internal notification, and follows up with the family on next steps, school visits, or clarification requests.",
  },
  {
    question: "Will parents get a portal later?",
    answer: "Yes. The platform is already structured for a future parent portal that can include attendance, communication, fee history, documents, and school updates.",
  },
  {
    question: "Is the system ready for online payments later?",
    answer: "Yes. The database and backend architecture already include fee structures, invoices, payments, receipts, and a payment-ready expansion path.",
  },
  {
    question: "Can I speak to the school if I am unsure which program is right?",
    answer: "Absolutely. Families are encouraged to contact the school so the team can understand the child's age, needs, and routine before suggesting the best fit.",
  },
];

const quickHelp = [
  {
    title: "Admissions support",
    copy: "Questions about programmes, age groups, forms, or school visits can all be handled through the website and front desk team.",
    icon: CircleHelp,
  },
  {
    title: "Fast parent reassurance",
    copy: "A thoughtful FAQ reduces uncertainty and gives families confidence before they even make the first call.",
    icon: ShieldCheck,
  },
  {
    title: "Still need help?",
    copy: "Parents can always reach out directly if they would prefer a conversation instead of reading through details alone.",
    icon: MessageSquareText,
  },
];

export default function FAQPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="FAQ"
        title="Helpful answers for prospective and current families"
        description="This page is designed to reduce hesitation, answer practical parent questions clearly, and make Sharada Koota Montessori feel easy to trust from the very beginning."
      />

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
          <div className="flex h-full flex-col justify-center p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Questions Parents Ask First</p>
            <h2 className="mt-3 font-display text-4xl text-navy sm:text-5xl">Practical clarity makes the school easier to choose</h2>
            <p className="mt-5 text-base leading-8 text-navy/72">
              A premium school website should not leave parents guessing. It should answer the most common questions with calmness, clarity, and empathy so families feel informed before they enquire, visit, or apply.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/contact" className="px-7">
                Ask a Question
              </Button>
              <Button href="/admissions" variant="ghost" className="px-7">
                Start Admissions
              </Button>
            </div>
          </div>
          <div className="page-media">
            <Image src={faqImage} alt="Sharada Koota Montessori support team" fill className="object-cover object-center" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-sky p-8 shadow-card lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why FAQ Helps</p>
          <div className="mt-5 grid gap-4">
            {quickHelp.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="stagger-rise journey-glow rounded-[1.5rem] border border-transparent bg-white p-5 shadow-card"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cream text-gold">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-navy/70">{item.copy}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-card">
          <div className="page-media-short">
            <Image src={faqDetailImage} alt="Parent support and school communication" fill className="object-cover object-center" />
          </div>
          <div className="p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Still Need Help?</p>
            <div className="mt-4 space-y-4 text-sm leading-8 text-navy/72">
              <p>If your question is not listed here, the school team can still guide you personally. Some families prefer a conversation, especially when choosing between programs or planning a first school visit.</p>
              <p>You can use the contact page, WhatsApp, or the enquiry form to receive a more direct response.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        {faqs.map((item, index) => (
          <div
            key={item.question}
            className="stagger-rise rounded-[1.8rem] bg-white p-6 shadow-card lg:p-7"
            style={{ animationDelay: `${index * 85}ms` }}
          >
            <h2 className="font-semibold text-navy lg:text-lg">{item.question}</h2>
            <p className="mt-3 text-sm leading-8 text-navy/75">{item.answer}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
