import Image from "next/image";
import { ArrowRight, Briefcase, GraduationCap, HeartHandshake, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/sections/page-hero";
import careerImage from "@/assets/career.png";
import careerDetailImage from "@/assets/career1.png";

const careerHighlights = [
  {
    title: "Child-centred work with meaning",
    copy: "Every role contributes to an environment where children feel respected, calm, and encouraged to grow with confidence.",
    icon: HeartHandshake,
  },
  {
    title: "A team culture that keeps learning",
    copy: "We value reflective educators and staff who are open to improving practice, communication, and care every day.",
    icon: GraduationCap,
  },
  {
    title: "A premium school experience",
    copy: "We are building a learning house that feels polished, warm, and deeply intentional for both children and parents.",
    icon: Sparkles,
  },
];

const openings = [
  "Montessori Directress / Guide",
  "Early Years Teacher",
  "Day Care Facilitator",
  "Front Desk / Admissions Coordinator",
  "Activity / Enrichment Facilitator",
  "Operations and Parent Support Executive",
];

const whatWeValue = [
  "Warm, respectful communication with children and families",
  "Strong classroom presence and emotional steadiness",
  "A willingness to learn, observe, and work collaboratively",
  "Attention to cleanliness, order, and environment care",
];

export default function CareerPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Career"
        title="Build a meaningful career in a warm house of learning"
        description="Sharada Koota Montessori welcomes educators and support professionals who want to shape a calm, purposeful, and deeply trusted early years environment."
      />

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
          <div className="page-media">
            <Image src={careerImage} alt="Career opportunities at Sharada Koota Montessori" fill className="object-cover object-center" />
          </div>
          <div className="flex h-full flex-col justify-center p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why Work With Us</p>
            <h2 className="mt-3 font-display text-4xl text-navy sm:text-5xl">A school where care, culture, and professionalism belong together</h2>
            <p className="mt-5 text-base leading-8 text-navy/72">
              We are creating more than a workplace. We are building a thoughtful early years community where educators, coordinators, and support staff can do meaningful work with pride. The environment is expected to feel calm, elegant, child-centred, and organized, and every team member helps shape that experience.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="mailto:sharadakoota@gmail.com" className="px-7">
                Apply by Email
              </Button>
              <Button href="/contact" variant="ghost" className="px-7">
                Talk to Our Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {careerHighlights.map((item, index) => {
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

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-card lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Open Roles</p>
          <h2 className="mt-3 font-display text-4xl text-navy">Roles we may hire for as we grow</h2>
          <div className="mt-6 grid gap-3">
            {openings.map((role, index) => (
              <div
                key={role}
                className="stagger-rise flex items-center gap-4 rounded-[1.4rem] border border-navy/10 px-5 py-4"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cream text-gold">
                  <Briefcase className="h-4 w-4" />
                </div>
                <p className="text-sm font-medium text-navy">{role}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-sky shadow-card">
          <div className="page-media-short">
            <Image src={careerDetailImage} alt="Warm school environment at Sharada Koota Montessori" fill className="object-cover object-center" />
          </div>
          <div className="p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">What We Value</p>
            <div className="mt-5 grid gap-3">
              {whatWeValue.map((item, index) => (
                <div
                  key={item}
                  className="stagger-rise rounded-[1.35rem] border border-transparent bg-white px-5 py-4 text-sm leading-7 text-navy shadow-card"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-cream p-8 shadow-card lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">How To Apply</p>
          <h2 className="mt-3 font-display text-4xl text-navy">Share your profile with clarity and warmth</h2>
          <div className="mt-5 space-y-4 text-sm leading-8 text-navy/72">
            <p>Send your resume along with a short note about who you are, the role you are applying for, and why you would like to be part of an early years environment like Sharada Koota Montessori.</p>
            <p>For teaching roles, include your experience with Montessori or early childhood education, classroom strengths, and how you build calm, respectful engagement with children.</p>
            <p>For admissions, front desk, and operations roles, highlight parent communication, follow-up skills, organization, and a professional yet warm approach.</p>
          </div>
        </div>

        <div className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Application Details</p>
          <div className="mt-6 grid gap-4">
            {[
              { label: "Primary email", value: "sharadakoota@gmail.com", icon: Users },
              { label: "Suggested subject", value: "Application - Role Name - Your Name", icon: ArrowRight },
              { label: "Best documents to send", value: "Resume + short introduction + role preference", icon: Briefcase },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="stagger-rise rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-gold">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{item.label}</p>
                      <p className="mt-2 text-sm leading-7 text-white/84">{item.value}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
