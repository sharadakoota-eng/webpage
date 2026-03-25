import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/sections/page-hero";

const valueCards = [
  {
    title: "Prepared with intention",
    copy:
      "Every corner of the environment is designed to encourage calm focus, purposeful movement, independence, and confidence.",
  },
  {
    title: "Guided with warmth",
    copy:
      "Our educators are gentle observers and thoughtful guides who respect each child&apos;s pace, personality, and natural curiosity.",
  },
  {
    title: "Rooted in real growth",
    copy:
      "We care about the whole child: communication, emotional security, physical readiness, concentration, creativity, and self-belief.",
  },
];

const promisePoints = [
  "A safe and elegant Montessori environment in HSR Layout",
  "Hands-on learning that encourages independent thinking",
  "Warm parent communication and confidence-building routines",
  "A child-first journey that feels personal, calm, and premium",
];

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="About Us"
        title="A prepared environment for curiosity, confidence, and joyful learning"
        description="Sharada Koota Montessori is a warm, elegant learning space rooted in the Montessori method and designed to help every child grow with independence, respect, and joy."
      />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Our Story</p>
          <h2 className="mt-3 font-display text-4xl text-navy">A house of learning that feels warm, graceful, and deeply child-centred</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              At <strong>Sharada Koota Montessori</strong> we believe that every child is naturally curious, capable, and eager to learn. Our space is thoughtfully designed to nurture independence, creativity, and a lifelong love for learning.
            </p>
            <p>
              Rooted in the principles of the Montessori Method, we provide a prepared environment where children explore at their own pace through hands-on experiences. We focus on holistic development - cognitive, emotional, social, and physical - ensuring each child grows with confidence and joy.
            </p>
            <p>
              Located in HSR Layout, our center offers a safe, warm, and engaging environment that feels like a second home. Our educators act as gentle guides, supporting each child&apos;s unique journey while encouraging curiosity, respect, and responsibility.
            </p>
            <p>
              At Sharada Koota, we are not just preparing children for school - we are preparing them for life.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why Families Connect</p>
          <h2 className="mt-3 font-display text-4xl">A preschool journey built on trust, rhythm, and reassurance</h2>
          <p className="mt-4 text-base leading-8 text-white/78">
            Families often look for more than academics. They look for a place where their child will be seen, respected, and gently guided every single day.
          </p>
          <div className="mt-8 grid gap-3">
            {promisePoints.map((item, index) => (
              <div
                key={item}
                className="stagger-rise rounded-[1.5rem] border border-white/10 bg-white/10 px-5 py-4 text-sm leading-7 text-white/85 backdrop-blur"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/contact" className="px-7">
              Book a School Visit
            </Button>
            <Button href="/admissions" variant="secondary" className="px-7">
              Start Admissions
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {valueCards.map((item, index) => (
          <div
            key={item.title}
            className="stagger-rise rounded-[1.75rem] bg-cream p-6 shadow-card transition duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Value</p>
            <h2 className="mt-3 font-display text-2xl text-navy">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-navy/70">{item.copy}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">The Sharada Koota Experience</p>
            <h2 className="mt-3 font-display text-4xl text-navy">What makes the learning journey feel different here</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-navy/75">
            <p>
              Our environment invites children to touch, explore, listen, create, repeat, and grow at a pace that feels natural rather than rushed. This allows confidence to build from within.
            </p>
            <p>
              We believe children thrive when beauty, order, kindness, and consistency are part of their everyday routine. That is why we pay attention not only to learning materials, but also to emotional safety, communication, and the quality of everyday interactions.
            </p>
            <p>
              The result is a learning experience that feels joyful for children and reassuring for parents - a place where growth is visible, routines are meaningful, and every child is encouraged to become more independent, expressive, and secure.
            </p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#fff8ea_0%,#f7eedf_52%,#f1e6d5_100%)] p-8 shadow-card">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Visit the Campus</p>
            <h2 className="mt-3 font-display text-4xl text-navy">See the calm, warmth, and Montessori rhythm in person</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-navy/75">
              The best way to experience Sharada Koota Montessori is to walk through the space, meet the team, and sense the environment for yourself.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact" className="px-7">
              Book a Visit
            </Button>
            <Button href="/montessori-program" variant="ghost" className="px-7">
              Explore Programs
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
