import Image from "next/image";
import {
  ArrowRight,
  HeartHandshake,
  Palette,
  ShieldCheck,
  Sparkles,
  Stars,
  Trees,
} from "lucide-react";
import { InquiryForm } from "@/components/sections/inquiry-form";
import { TestimonialsCarousel } from "@/components/sections/testimonials-carousel";
import { HeroSection } from "@/components/sections/hero";
import { SectionHeading } from "@/components/ui/section-heading";
import homeImage from "@/assets/home.jpg";
import programsImage from "@/assets/programs.jpg";
import galleryImage from "@/assets/gallery.jpg";
import testimonialsImage from "@/assets/testimonials.png";
import teamImage from "@/assets/team.jpg";

const pillars = [
  "Intellectual abilities",
  "Communication skills",
  "Emotional strength",
  "Cultural awareness",
  "Confidence through meaningful learning",
];

const highlights = [
  "Montessori Program",
  "Day Care",
  "After School Activities",
  "Summer Camp",
  "Admissions",
  "Kannada Kasturi",
];

const trustMetrics = [
  { label: "Programs Designed", value: "6+" },
  { label: "Parent-First Flows", value: "Mobile" },
  { label: "Admissions Journey", value: "Structured" },
  { label: "Care Experience", value: "Premium" },
];

const signatureBlocks = [
  {
    title: "Thoughtful Montessori foundation",
    copy: "Prepared environments, sensorial discovery, language-rich routines, and child-led growth.",
    icon: Trees,
  },
  {
    title: "Warm day care and extended support",
    copy: "Reliable, caring continuity for modern families with structured, reassuring supervision.",
    icon: HeartHandshake,
  },
  {
    title: "Creative enrichment and confidence",
    copy: "Arts, stories, cultural exposure, expression, and practical confidence-building experiences.",
    icon: Palette,
  },
];

const featuredTestimonials = [
  {
    quote:
      "Sharada Koota feels calm, polished, and caring. We were especially reassured by how thoughtfully the school communicates with parents.",
    parent: "Ritika N.",
    child: "Parent of Vihaan",
  },
  {
    quote:
      "The blend of structure, creativity, and emotional warmth is exactly what we wanted for our child&apos;s early years journey.",
    parent: "Karthik R.",
    child: "Parent of Anika",
  },
  {
    quote:
      "The environment feels warm and beautifully organized. Our child settled much faster than we expected and now looks forward to school each morning.",
    parent: "Meghana S.",
    child: "Parent of Riaan",
  },
  {
    quote:
      "We loved the combination of structure and gentleness. The school makes parents feel informed, welcomed, and genuinely supported.",
    parent: "Shweta P.",
    child: "Parent of Aadhya",
  },
  {
    quote:
      "From the first visit, the atmosphere felt calm, thoughtful, and child-focused. That sense of trust made a huge difference for our family.",
    parent: "Naveen K.",
    child: "Parent of Tanvi",
  },
];

const portalCards = [
  {
    title: "Admin Portal",
    copy: "Manage inquiries, admissions, content, notifications, classes, fee structures, and operations.",
    href: "/admin",
  },
  {
    title: "Parent Portal",
    copy: "View attendance, child profile, announcements, homework updates, fee history, and documents.",
    href: "/parent",
  },
  {
    title: "Teacher Portal",
    copy: "Access class lists, mark attendance, post updates, and maintain observation records.",
    href: "/teacher",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <HeroSection />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {trustMetrics.map((metric, index) => (
          <div
            key={metric.label}
            className="premium-panel stagger-rise rounded-[1.8rem] border border-white/70 p-6 shadow-card"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">{metric.label}</p>
            <p className="mt-3 font-display text-4xl text-navy">{metric.value}</p>
          </div>
        ))}
      </section>

      <section className="grid items-start gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-card">
          <div className="page-media">
            <Image src={homeImage} alt="Sharada Koota school environment" fill className="object-cover object-center" />
          </div>
          <div className="p-8">
            <SectionHeading
              eyebrow="About"
              title="A premium Montessori journey rooted in warmth and trust"
              description="Sharada Koota Montessori blends elegant environments, child-centred guidance, and thoughtful communication to support both children and parents."
            />
          </div>
        </div>
        <div className="rounded-[2rem] bg-sky p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">
            Centre of Excellence in Holistic Child Development
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-navy/70">
            Every program is designed to strengthen thinking, communication, emotional confidence, cultural rootedness, and joyful independence.
          </p>
          <div className="mt-6 grid content-start gap-3 sm:grid-cols-2">
            {pillars.map((pillar) => (
              <div key={pillar} className="rounded-3xl bg-white px-4 py-4 text-sm font-medium text-navy shadow-card">
                {pillar}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0d1d38_0%,#152d50_55%,#1a3b63_100%)] px-6 py-10 text-white shadow-soft sm:px-8">
        <div className="grid gap-5 lg:grid-cols-3">
          {signatureBlocks.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-[1.8rem] border border-white/10 bg-white/8 p-6 backdrop-blur">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-gold">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/75">{item.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="grid items-stretch gap-0 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative h-full min-h-[32rem] overflow-hidden">
            <Image src={programsImage} alt="Sharada Koota programs" fill className="object-cover object-center" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.08),rgba(16,33,63,0.48))]" />
          </div>
          <div className="flex h-full flex-col justify-center p-8">
            <SectionHeading
              eyebrow="Programs"
              title="Designed around care, curiosity, and confidence"
              description="The public website and school platform are organized around flagship programs and future-ready parent and teacher workflows."
            />
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {highlights.map((item) => (
                <div key={item} className="rounded-[1.75rem] bg-cream p-6 shadow-card transition duration-300 hover:-translate-y-1">
                  <h3 className="font-display text-2xl text-navy">{item}</h3>
                  <p className="mt-3 text-sm leading-7 text-navy/70">
                    Rich storytelling, elegant content presentation, and conversion-focused CTAs tailored for mobile-first parent journeys.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid items-stretch gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <SectionHeading
            eyebrow="Why Choose Us"
            title="An elegant preschool feel with a deeply practical parent journey"
            description="Families do not just choose a program. They choose trust, communication, safety, and the confidence that their child is seen with care."
          />
          <div className="mt-8 grid gap-4">
            {[
              { title: "Safe and caring environment", icon: ShieldCheck },
              { title: "Creative and cultural development", icon: Sparkles },
              { title: "Small-group attention and meaningful routines", icon: Stars },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} className="flex items-center gap-4 rounded-[1.5rem] border border-navy/10 px-5 py-5">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-gold">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-navy">{item.title}</p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-card">
          <div className="relative h-full min-h-[32rem] overflow-hidden">
            <Image src={teamImage} alt="Teachers and care team" fill className="object-cover object-center" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.12),rgba(16,33,63,0.76))]" />
            <div className="absolute inset-x-6 bottom-6 rounded-[1.8rem] border border-white/15 bg-white/10 p-6 backdrop-blur gentle-float">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Parent confidence</p>
              <p className="mt-3 text-sm leading-7 text-white/80">
                From first inquiry to school visit, the experience is designed to feel personal, premium, and easy to trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="p-8">
            <SectionHeading
              eyebrow="Testimonials"
              title="Families should feel reassurance before they even visit"
              description="A premium school website should build trust quickly, and these sections are designed to help parents feel the warmth, polish, and credibility of the school."
            />
            <TestimonialsCarousel items={featuredTestimonials} />
          </div>
          <div className="page-media-tall">
            <Image src={testimonialsImage} alt="Parent trust and testimonials" fill className="object-cover object-center" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.14),rgba(16,33,63,0.72))]" />
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#fffdf8_0%,#f8f3ea_52%,#f3ebdf_100%)] p-8 shadow-card">
        <SectionHeading
          eyebrow="Portal Access"
          title="Built for admin, parent, and teacher workflows from day one"
          description="The platform already includes role-based dashboard foundations. Parents and teachers do not have to rely only on calls and WhatsApp once operations grow."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {portalCards.map((item) => (
            <a
              key={item.title}
              href={item.href}
              className="group rounded-[1.8rem] border border-navy/10 bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Portal</p>
              <h3 className="mt-3 font-display text-2xl text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-navy/70">{item.copy}</p>
              <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-navy">
                Open portal
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <SectionHeading
          eyebrow="Journey"
          title="A simple path from discovery to admission"
          description="This school website is designed to help busy parents move from curiosity to confidence without friction."
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {[
            "Discover the school and programs",
            "Book a visit or call instantly",
            "Submit inquiry or admission form",
            "Receive guided follow-up from the front desk",
          ].map((step, index) => (
            <div
              key={step}
              className="stagger-rise journey-glow rounded-[1.75rem] border border-transparent bg-cream p-6 shadow-card"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Step {index + 1}</p>
              <p className="mt-3 text-sm leading-7 text-navy/75">{step}</p>
              <ArrowRight className="mt-4 h-4 w-4 text-navy/40" />
            </div>
          ))}
        </div>
      </section>

      <section className="grid items-start gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <InquiryForm />
        <div className="overflow-hidden rounded-[2rem] bg-navy text-white shadow-soft">
          <div className="page-media-short">
            <Image src={galleryImage} alt="Sharada Koota gallery preview" fill className="object-cover object-center opacity-70" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,22,43,0.12),rgba(9,22,43,0.78))]" />
          </div>
          <div className="p-7">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Contact Strip</p>
            <h2 className="mt-3 font-display text-3xl text-white">Speak with the front desk, plan a visit, or begin admissions</h2>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Built for busy parents who want clear next steps. Call instantly, message on WhatsApp, submit an inquiry, or request a guided school visit without friction.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { label: "Response style", value: "Warm and guided follow-up" },
                { label: "Support mode", value: "Call, WhatsApp, and inquiry form" },
                { label: "Visit option", value: "Book a school visit easily" },
                { label: "Admissions", value: "Start online and continue offline" },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/55">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-white/90">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3">
              {[
                "Book a school visit",
                "Call the admissions desk",
                "Submit a contact enquiry",
                "Start the admission form online",
              ].map((item) => (
                <div key={item} className="rounded-3xl bg-white/10 px-4 py-3 text-sm text-white/90">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
