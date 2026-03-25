import { Button } from "@/components/ui/button";
import { ProgramContent } from "@/lib/content";

export function ProgramPage({ program, showCta = true }: { program: ProgramContent; showCta?: boolean }) {
  return (
    <div className="space-y-12">
      <section className="rounded-[2rem] bg-navy px-6 py-12 text-white shadow-soft sm:px-10 sm:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,164,54,0.18),transparent_24%)]" />
        <p className="relative text-sm font-semibold uppercase tracking-[0.25em] text-gold">Program</p>
        <h1 className="relative mt-4 font-display text-4xl sm:text-5xl">{program.title}</h1>
        <p className="relative mt-5 max-w-3xl text-lg leading-8 text-white/80">{program.subtitle}</p>
        <div className="relative mt-8 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-white/10 px-4 py-2">{program.ageGroup}</span>
          <span className="rounded-full bg-white/10 px-4 py-2">{program.schedule}</span>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <h2 className="font-display text-3xl text-navy">Overview</h2>
          <div className="mt-5 space-y-4 text-base leading-8 text-navy/75">
            {program.overview.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-sky p-8 shadow-card">
          <h2 className="font-display text-3xl text-navy">Benefits</h2>
          <div className="mt-5 grid gap-3">
            {program.benefits.map((item) => (
              <div key={item} className="rounded-3xl bg-white px-4 py-4 text-sm text-navy shadow-card transition duration-300 hover:-translate-y-1">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-cream p-8 shadow-card">
          <h2 className="font-display text-3xl text-navy">Features</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {program.features.map((feature) => (
              <div key={feature} className="rounded-3xl bg-white px-4 py-4 text-sm text-navy shadow-card transition duration-300 hover:-translate-y-1">
                {feature}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <h2 className="font-display text-3xl text-navy">FAQ</h2>
          <div className="mt-5 space-y-4">
            {program.faq.map((item) => (
              <div key={item.question} className="rounded-3xl border border-navy/10 p-5">
                <h3 className="font-semibold text-navy">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-navy/70">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showCta ? (
        <section className="rounded-[2rem] bg-gradient-to-r from-gold to-peach px-6 py-10 text-ink shadow-soft sm:px-10">
          <h2 className="font-display text-3xl">{program.ctaTitle}</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink/80">{program.ctaDescription}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/contact">Book a Visit</Button>
            <Button href="/admissions" variant="ghost">Apply for Admission</Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
