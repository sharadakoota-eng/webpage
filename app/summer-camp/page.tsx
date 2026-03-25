import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ProgramPage } from "@/components/sections/program-page";
import { programs } from "@/lib/content";
import summerCampHeroImage from "@/assets/summercamp.png";
import summerCampMomentsImage from "@/assets/summercamp1.png";

export default function SummerCampPage() {
  const program = programs.find((item) => item.slug === "summer-camp")!;

  return (
    <div className="space-y-10">
      <ProgramPage program={program} showCta={false} />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Camp Highlights</p>
          <h2 className="mt-3 font-display text-3xl text-navy">A joyful Montessori-inspired summer for curious young minds</h2>
          <div className="mt-5 space-y-4 text-base leading-8 text-navy/75">
            <p>
              Our summer camp is designed for children who learn best through doing, exploring, imagining, and interacting in a calm, guided setting.
            </p>
            <p>
              Every session balances fun with purpose through hands-on art, practical creativity, small-group discovery, language-rich conversations, sensorial experiences, and confidence-building routines.
            </p>
            <p>
              Families can choose a one-month or two-month plan, and day care support can be paired for added convenience where needed.
            </p>
          </div>
        </div>
        <div className="stagger-rise rounded-[2rem] bg-sky p-8 shadow-card" style={{ animationDelay: "120ms" }}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Age Groups</p>
          <div className="mt-5 grid gap-4">
            <div className="rounded-[1.5rem] bg-white p-5 shadow-card">
              <h3 className="font-display text-2xl text-navy">Little Explorers</h3>
              <p className="mt-2 text-sm leading-7 text-navy/70">For ages 2 to 6 years, with playful discovery, sensorial learning, stories, and expressive activities.</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-5 shadow-card">
              <h3 className="font-display text-2xl text-navy">Young Discoverers</h3>
              <p className="mt-2 text-sm leading-7 text-navy/70">For ages 6 to 10 years, with experiments, group challenges, creative projects, and language-rich experiences.</p>
            </div>
            <div className="rounded-[1.5rem] bg-white p-5 shadow-card">
              <h3 className="font-display text-2xl text-navy">Creative Achievers</h3>
              <p className="mt-2 text-sm leading-7 text-navy/70">For children above 10 years, with advanced creative projects, presentation skills, collaboration, and confidence-building activities.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="stagger-rise overflow-hidden rounded-[2rem] bg-white shadow-card">
          <div className="page-media">
            <Image src={summerCampHeroImage} alt="Summer camp environment" fill className="object-cover object-center transition duration-700 hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.08),rgba(16,33,63,0.45))]" />
          </div>
        </div>
        <div
          className="stagger-rise rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft"
          style={{ animationDelay: "120ms" }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why Summer Camp Feels Special</p>
          <h2 className="mt-3 font-display text-4xl">A season of fun, discovery, and confidence-building in a warm small-group setting</h2>
          <p className="mt-5 text-base leading-8 text-white/78">
            Summer camp gives children the freedom to explore more creatively while still benefiting from structure, guidance, and meaningful activities.
          </p>
          <p className="mt-4 text-base leading-8 text-white/78">
            The experience is lively and stimulating, yet designed to remain safe, well-paced, and reassuring for both children and families.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="stagger-rise rounded-[2rem] bg-cream p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Activities</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[
              "Art and expression",
              "DIY craft projects",
              "Science experiments",
              "Brain games and logic play",
              "Storytelling and reading circles",
              "Language fun and phonics games",
              "Sensorial activities",
              "Cultural activities",
              "Fireless cooking",
              "Confidence-building presentations",
            ].map((item, index) => (
              <div
                key={item}
                className="stagger-rise journey-glow rounded-[1.5rem] border border-transparent bg-white px-4 py-4 text-sm font-medium text-navy shadow-card"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Timings</p>
            <h3 className="mt-3 font-display text-3xl text-navy">9:30 AM to 12:30 PM</h3>
            <p className="mt-3 text-sm leading-7 text-navy/70">
              The schedule is designed to feel energetic but not overwhelming, with a balanced flow of activity, movement, calm focus, and group engagement.
            </p>
          </div>
          <div className="stagger-rise rounded-[2rem] bg-navy p-8 text-white shadow-soft" style={{ animationDelay: "120ms" }}>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Family Support</p>
            <h3 className="mt-3 font-display text-3xl">Safe, caring, and easy to trust</h3>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Day care support is available for families who need added flexibility, and the camp experience is designed to feel warm, structured, and reassuring from the very first day.
            </p>
            <p className="mt-4 text-sm leading-7 text-white/75">
              For current availability and admissions guidance, parents can call the front desk, message on WhatsApp, or book a visit through the contact page.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Creative Achievers Track</p>
          <h2 className="mt-3 font-display text-4xl text-navy">An advanced summer pathway for children above 10 years</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              As part of Summer Camp, the Creative Achievers track is designed for older children who enjoy taking on more expressive, collaborative, and presentation-based challenges.
            </p>
            <p>
              This track focuses on imagination, project work, communication, and confidence-building through activities that feel age-appropriate, engaging, and rewarding.
            </p>
            <p>
              Instead of treating it as a completely separate program, it now sits naturally within the Summer Camp journey as a stronger enrichment option for children above 10 years.
            </p>
          </div>
        </div>
        <div className="stagger-rise rounded-[2rem] bg-sky p-8 shadow-card" style={{ animationDelay: "120ms" }}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">What This Track Includes</p>
          <div className="mt-5 grid gap-4">
            {[
              "Advanced creative projects",
              "Presentation and speaking confidence",
              "Collaborative problem-solving",
              "Showcase-style participation",
              "Expression through art, storytelling, and ideas",
            ].map((item, index) => (
              <div
                key={item}
                className="stagger-rise journey-glow rounded-[1.5rem] border border-transparent bg-white px-5 py-4 text-sm leading-7 text-navy shadow-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="stagger-rise overflow-hidden rounded-[2rem] bg-white shadow-card">
          <div className="page-media-tall">
            <Image src={summerCampMomentsImage} alt="Children participating in summer camp activities" fill className="object-cover object-center transition duration-700 hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.06),rgba(16,33,63,0.5))]" />
            <div className="absolute inset-x-6 bottom-6 rounded-[1.7rem] border border-white/15 bg-white/10 p-5 backdrop-blur gentle-float">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Camp Moments</p>
              <p className="mt-3 text-sm leading-7 text-white/82">
                Every day is designed to feel active, expressive, and joyful, while still giving children the calm support they need to settle and enjoy the experience.
              </p>
            </div>
          </div>
        </div>
        <div className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card" style={{ animationDelay: "120ms" }}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">What Families Appreciate</p>
          <h2 className="mt-3 font-display text-4xl text-navy">A camp that feels engaging for children and reassuring for parents</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              Families appreciate the way summer camp balances stimulation and safety. Children stay engaged with hands-on, age-appropriate activities while parents feel confident about the environment and daily structure.
            </p>
            <p>
              Small-group experiences, gentle guidance, and a rich mix of creative and practical activities help the camp feel both exciting and easy to trust.
            </p>
            <p>
              It becomes a meaningful part of the holiday season rather than just a place to pass the time.
            </p>
          </div>
        </div>
      </section>

      <section className="stagger-rise rounded-[2rem] bg-[linear-gradient(135deg,#fff8ea_0%,#f7eedf_52%,#f1e6d5_100%)] p-8 shadow-card">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Reserve a Camp Experience</p>
            <h2 className="mt-3 font-display text-4xl text-navy">Choose a summer that feels joyful, engaging, and easy to trust</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-navy/75">
              Speak with the school to understand camp availability, age-group fit, day care support, and how to choose the right summer experience for your child.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/contact" className="px-7">
                Book a Visit
              </Button>
              <Button href="/admissions" variant="ghost" className="px-7">
                Enquire Now
              </Button>
            </div>
          </div>
          <div className="stagger-rise overflow-hidden rounded-[2rem] bg-white shadow-card" style={{ animationDelay: "120ms" }}>
            <div className="page-media">
              <Image src={summerCampHeroImage} alt="Summer camp visit experience" fill className="object-cover object-center transition duration-700 hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.08),rgba(16,33,63,0.44))]" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
