import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProgramPage } from "@/components/sections/program-page";
import { programs } from "@/lib/content";
import dayCareHeroImage from "@/assets/daycare.png";
import dayCareFocusImage from "@/assets/daycare1.png";
import dayCareRoutineImage from "@/assets/daycare2.png";

const careHighlights = [
  {
    title: "Warm supervision",
    copy: "Children are supported in a caring environment where routines feel reassuring, calm, and familiar throughout the day.",
  },
  {
    title: "Rest and rhythm",
    copy: "A good day care rhythm balances movement, quiet time, nourishment, and child-friendly engagement without overstimulation.",
  },
  {
    title: "Parent confidence",
    copy: "Families need to know their child feels safe, settled, and looked after with patience, attentiveness, and consistency.",
  },
];

const reasonsFamiliesChoose = [
  "Reliable support for working parents who need a trustworthy extension of the school day.",
  "A gentle transition that helps children feel secure instead of rushed or overwhelmed.",
  "Structured routines that balance rest, supervised play, nourishment, and calm interaction.",
  "A school-linked environment that feels more intentional than generic child care.",
];

const experiencePoints = [
  {
    title: "Safe and caring atmosphere",
    copy: "Children are welcomed into a supervised environment designed to feel emotionally secure, calm, and responsive.",
  },
  {
    title: "Smooth daily flow",
    copy: "From arrival to pick-up, the experience is designed to reduce stress for both parents and children through familiar routines.",
  },
  {
    title: "Meaningful engagement",
    copy: "Free play, quiet activities, stories, and guided interaction help children feel occupied, connected, and at ease.",
  },
  {
    title: "Comfort for families",
    copy: "Parents appreciate knowing their child is cared for in a warm environment connected to the school&apos;s values and culture.",
  },
];

export default function DayCarePage() {
  const program = programs.find((item) => item.slug === "day-care")!;

  return (
    <div className="space-y-10">
      <ProgramPage program={program} showCta={false} />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why Day Care Matters</p>
          <h2 className="mt-3 font-display text-4xl text-navy">A safe extension of the day that feels warm, dependable, and reassuring</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              Good day care is not only about supervision. It is about giving children a secure, comfortable rhythm when parents need added flexibility in the day.
            </p>
            <p>
              At Sharada Koota Montessori, our day care environment is designed to feel warm, calm, and structured so children feel emotionally settled while parents feel confident and supported.
            </p>
            <p>
              The experience prioritizes safety, gentle guidance, and routines that help children transition smoothly between learning, rest, play, and pick-up time.
            </p>
          </div>
        </div>

        <div className="stagger-rise rounded-[2rem] bg-sky p-8 shadow-card" style={{ animationDelay: "120ms" }}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why Families Choose It</p>
          <div className="mt-5 grid gap-4">
            {reasonsFamiliesChoose.map((item, index) => (
              <div
                key={item}
                className="stagger-rise journey-glow rounded-[1.5rem] border border-transparent bg-white px-5 py-4 text-sm leading-7 text-navy shadow-card"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="stagger-rise overflow-hidden rounded-[2rem] bg-white shadow-card">
          <div className="page-media">
            <Image src={dayCareHeroImage} alt="Premium day care environment" fill className="object-cover object-center transition duration-700 hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.08),rgba(16,33,63,0.45))]" />
          </div>
        </div>
        <div
          className="stagger-rise rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft"
          style={{ animationDelay: "120ms" }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">A Space That Feels Secure</p>
          <h2 className="mt-3 font-display text-4xl">Children settle more easily when the environment feels calm and familiar</h2>
          <p className="mt-5 text-base leading-8 text-white/78">
            A strong day care environment does more than occupy time. It helps children feel emotionally safe, gently cared for, and supported through predictable rhythms.
          </p>
          <p className="mt-4 text-base leading-8 text-white/78">
            The atmosphere matters: calm tones, attentive supervision, child-friendly routines, and a sense of comfort that helps children relax into the day.
          </p>
        </div>
      </section>

      <section className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">The Day Care Experience</p>
        <h2 className="mt-3 font-display text-4xl text-navy">Designed around comfort, continuity, and child-friendly routines</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {careHighlights.map((item, index) => (
            <div
              key={item.title}
              className="stagger-rise journey-glow rounded-[1.75rem] border border-transparent bg-cream p-6 shadow-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <h3 className="font-display text-2xl text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-navy/70">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="stagger-rise rounded-[2rem] bg-cream p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">What Makes It Special</p>
          <h2 className="mt-3 font-display text-4xl text-navy">More thoughtful than ordinary child care</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              Our day care is designed to feel like a natural extension of the school&apos;s environment, not a disconnected holding space. That means care routines are approached with the same warmth, attentiveness, and intentionality as the rest of the school experience.
            </p>
            <p>
              Children benefit from calm surroundings, responsive adults, and a sense of familiarity that helps them feel comfortable through longer days.
            </p>
            <p>
              Parents benefit from peace of mind, knowing their child is in an environment that values emotional security, consistency, and respectful care.
            </p>
          </div>
        </div>

        <div
          className="stagger-rise rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft"
          style={{ animationDelay: "120ms" }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Inside the Routine</p>
          <div className="mt-6 grid gap-4">
            {experiencePoints.map((item, index) => (
              <div
                key={item.title}
                className="stagger-rise rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur gentle-float"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <h3 className="font-display text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-white/78">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="stagger-rise overflow-hidden rounded-[2rem] bg-white shadow-card">
          <div className="page-media-tall">
            <Image src={dayCareFocusImage} alt="Teacher caring for child in day care" fill className="object-cover object-center transition duration-700 hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.06),rgba(16,33,63,0.5))]" />
            <div className="absolute inset-x-6 bottom-6 rounded-[1.7rem] border border-white/15 bg-white/10 p-5 backdrop-blur gentle-float">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Care In Practice</p>
              <p className="mt-3 text-sm leading-7 text-white/82">
                Children feel more secure when care is calm, responsive, and attentive to their mood, rhythm, and everyday needs.
              </p>
            </div>
          </div>
        </div>
        <div className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card" style={{ animationDelay: "120ms" }}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">What Parents Appreciate</p>
          <h2 className="mt-3 font-display text-4xl text-navy">Peace of mind through a safe and organized care journey</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              Parents value knowing that their child is spending longer hours in a place that still feels warm, protected, and thoughtfully run.
            </p>
            <p>
              The combination of supervision, smooth routines, meaningful engagement, and school-aligned care helps families feel supported rather than stretched.
            </p>
            <p>
              This creates a day care experience that is not only practical, but emotionally reassuring for the entire family.
            </p>
          </div>
        </div>
      </section>

      <section className="stagger-rise rounded-[2rem] bg-[linear-gradient(135deg,#fff8ea_0%,#f7eedf_52%,#f1e6d5_100%)] p-8 shadow-card">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Plan Care Support</p>
            <h2 className="mt-3 font-display text-4xl text-navy">Find a day care rhythm that works for your family</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-navy/75">
              Speak with the school to understand timings, flexibility, child comfort, and how day care can be paired with Montessori and seasonal programs.
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
              <Image src={dayCareRoutineImage} alt="Day care routine and quiet play" fill className="object-cover object-center transition duration-700 hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.08),rgba(16,33,63,0.44))]" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
