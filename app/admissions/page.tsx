import Image from "next/image";
import { CheckCircle2, FileText, HeartHandshake, School2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/sections/page-hero";
import { AdmissionForm } from "@/components/sections/admission-form";
import admissionsImage from "@/assets/admissions.png";
import admissionsDetailImage from "@/assets/admissions1.png";

const admissionSteps = [
  {
    title: "Start with a warm enquiry",
    copy: "Reach out through the website, call, or WhatsApp so the admissions team can understand your child's age, routine, and the kind of support your family is looking for.",
    icon: HeartHandshake,
  },
  {
    title: "Book a school visit",
    copy: "Visit the environment, walk through the classrooms, understand the Montessori flow, and experience the tone of the school before making a decision.",
    icon: School2,
  },
  {
    title: "Share child details and documents",
    copy: "Complete the admission form with parent details, child information, and any basic documents needed for the next stage of review.",
    icon: FileText,
  },
  {
    title: "Receive guided follow-up",
    copy: "The front desk keeps you updated with next steps, program guidance, and admissions progress so the process feels clear and personal.",
    icon: CheckCircle2,
  },
];

const trustPoints = [
  "Personalized guidance instead of a confusing application flow",
  "Clear support for visits, forms, and follow-up questions",
  "A child-first process designed to feel calm and respectful",
  "Future-ready admin tracking so every enquiry is handled properly",
];

const parentQuestions = [
  "Which program is right for my child's age and readiness?",
  "Can we visit before we complete the form?",
  "What details or documents should we keep ready?",
  "How does the school communicate updates after submission?",
  "Will we get guidance if we are unsure about the best fit?",
  "How soon can we expect a response after applying?",
];

export default function AdmissionsPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Admissions"
        title="A calm, guided admissions journey for new families"
        description="At Sharada Koota Montessori, admissions are designed to feel welcoming, transparent, and easy to trust from the first enquiry to the final follow-up."
      />

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="page-media">
            <Image src={admissionsImage} alt="Admissions journey at Sharada Koota Montessori" fill className="object-cover object-center" />
          </div>
          <div className="flex h-full flex-col justify-center p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why Parents Feel Comfortable Here</p>
            <h2 className="mt-3 font-display text-4xl text-navy sm:text-5xl">Admissions should feel reassuring, not overwhelming</h2>
            <p className="mt-5 text-base leading-8 text-navy/72">
              For many parents, the admissions process is the first real experience of a school. That is why we believe it should feel warm, organized, and genuinely supportive. Families should leave with clarity, not confusion, and with confidence that their child will be seen with care.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/contact" className="px-7">
                Book a Visit
              </Button>
              <Button href="#admission-form" variant="ghost" className="px-7">
                Start Application
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {admissionSteps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div
              key={step.title}
              className="stagger-rise journey-glow rounded-[1.9rem] border border-transparent bg-white p-6 shadow-card"
              style={{ animationDelay: `${index * 110}ms` }}
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-gold">
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.24em] text-gold">Step {index + 1}</p>
              <h2 className="mt-3 font-display text-2xl text-navy">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-navy/70">{step.copy}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">What Families Appreciate</p>
          <h2 className="mt-3 font-display text-4xl text-white sm:text-[3.2rem]">A process built around trust, clarity, and thoughtful follow-up</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {trustPoints.map((item, index) => (
              <div
                key={item}
                className="stagger-rise rounded-[1.5rem] border border-white/10 bg-white/10 p-5 text-sm leading-7 text-white/80 backdrop-blur"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-card">
          <div className="page-media-short">
            <Image src={admissionsDetailImage} alt="Admissions support team at Sharada Koota Montessori" fill className="object-cover object-center" />
          </div>
          <div className="p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">What Parents Usually Ask</p>
            <div className="mt-5 grid gap-3">
              {parentQuestions.map((item, index) => (
                <div
                  key={item}
                  className="stagger-rise rounded-[1.35rem] border border-navy/10 bg-cream px-5 py-4 text-sm leading-7 text-navy/80"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-sky p-8 shadow-card lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Before You Begin</p>
            <h2 className="mt-3 font-display text-4xl text-navy">A few helpful things to keep ready</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "Your child's age and preferred program",
              "Your preferred visit date or time window",
              "Basic parent contact details",
              "Any specific care, routine, or readiness questions",
            ].map((item, index) => (
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
      </section>

      <div id="admission-form">
        <AdmissionForm />
      </div>
    </div>
  );
}
