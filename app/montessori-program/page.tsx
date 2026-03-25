import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProgramPage } from "@/components/sections/program-page";
import { programs } from "@/lib/content";
import montessoriHeroImage from "@/assets/Montessoriprogram.png";
import montessoriFocusImage from "@/assets/Montessoriprogram1.png";
import montessoriClassroomImage from "@/assets/Montessoriprogram2.png";

const montessoriPillars = [
  {
    title: "Independence",
    copy: "Children learn to do simple tasks for themselves, make choices, and build genuine confidence through everyday success.",
  },
  {
    title: "Hands-on learning",
    copy: "Materials are designed to be touched, explored, repeated, and understood through experience rather than passive instruction.",
  },
  {
    title: "Concentration",
    copy: "Montessori encourages deep focus by allowing children to engage meaningfully with work at their own pace.",
  },
  {
    title: "Respectful guidance",
    copy: "Educators observe, guide, and support instead of constantly directing, allowing each child&apos;s natural rhythm to unfold.",
  },
];

const reasonsToChoose = [
  "It helps children become confident, capable, and more independent from an early age.",
  "It supports emotional stability by creating calm, predictable routines and respectful interactions.",
  "It builds strong foundations in language, sensorial awareness, coordination, concentration, and order.",
  "It values the whole child, not just academics, by nurturing social, emotional, and practical life skills too.",
];

const differences = [
  {
    title: "Child-led, not one-size-fits-all",
    copy: "Instead of every child doing the same thing at the same time, Montessori allows guided choice and personalized learning readiness.",
  },
  {
    title: "Materials with purpose",
    copy: "Each Montessori material isolates a concept clearly, helping children understand through repetition, movement, and discovery.",
  },
  {
    title: "Learning through doing",
    copy: "Children absorb more deeply when they pour, sort, build, trace, count, match, and explore with their hands.",
  },
  {
    title: "Grace, order, and responsibility",
    copy: "The environment teaches children to care for themselves, respect others, and participate meaningfully in the classroom community.",
  },
];

export default function MontessoriProgramPage() {
  const program = programs.find((item) => item.slug === "montessori-program")!;

  return (
    <div className="space-y-10">
      <ProgramPage program={program} showCta={false} />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">What Is Montessori?</p>
          <h2 className="mt-3 font-display text-4xl text-navy">A way of learning that respects how children naturally grow</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              Montessori is not just a teaching style. It is a child-centred philosophy that believes children learn best when they are given freedom within structure, meaningful materials, and calm guidance.
            </p>
            <p>
              In a Montessori environment, children are encouraged to explore, repeat, observe, concentrate, and discover concepts through hands-on experiences. This helps learning feel joyful, natural, and deeply rooted.
            </p>
            <p>
              Rather than rushing children through rigid instruction, Montessori supports the development of independence, confidence, coordination, communication, and responsibility in a way that feels respectful and age-appropriate.
            </p>
          </div>
        </div>

        <div className="stagger-rise rounded-[2rem] bg-sky p-8 shadow-card" style={{ animationDelay: "120ms" }}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why It Matters</p>
          <h2 className="mt-3 font-display text-4xl text-navy">A foundation that supports both school readiness and life readiness</h2>
          <div className="mt-6 grid gap-4">
            {reasonsToChoose.map((item, index) => (
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
            <Image src={montessoriHeroImage} alt="Montessori classroom environment" fill className="object-cover object-center transition duration-700 hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.08),rgba(16,33,63,0.45))]" />
          </div>
        </div>
        <div
          className="stagger-rise rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft"
          style={{ animationDelay: "120ms" }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">A Prepared Environment</p>
          <h2 className="mt-3 font-display text-4xl">Beauty, order, and calm are part of the learning process</h2>
          <p className="mt-5 text-base leading-8 text-white/78">
            A Montessori classroom is intentionally designed to feel inviting, orderly, and child-accessible. Materials are placed thoughtfully, movement has purpose, and the environment itself teaches independence.
          </p>
          <p className="mt-4 text-base leading-8 text-white/78">
            When children feel calm and capable in their environment, learning becomes deeper, more self-motivated, and more joyful.
          </p>
        </div>
      </section>

      <section className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Core Montessori Pillars</p>
        <h2 className="mt-3 font-display text-4xl text-navy">What children experience in a true Montessori environment</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {montessoriPillars.map((item, index) => (
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
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why Families Choose Montessori</p>
          <h2 className="mt-3 font-display text-4xl text-navy">Because it nurtures more than academics</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              Families often choose Montessori because they want their child to grow in confidence, independence, and emotional security, not just memorize early concepts.
            </p>
            <p>
              Montessori gives children the space to become active participants in their own learning. They begin to trust their abilities, enjoy purposeful routines, and feel proud of what they can do for themselves.
            </p>
            <p>
              For parents, this often means seeing children become calmer, more expressive, more coordinated, and more willing to engage with the world around them.
            </p>
          </div>
        </div>

        <div
          className="stagger-rise rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft"
          style={{ animationDelay: "120ms" }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">How Montessori Is Different</p>
          <div className="mt-6 grid gap-4">
            {differences.map((item, index) => (
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
            <Image src={montessoriFocusImage} alt="Child engaged in Montessori learning" fill className="object-cover object-center transition duration-700 hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.06),rgba(16,33,63,0.5))]" />
            <div className="absolute inset-x-6 bottom-6 rounded-[1.7rem] border border-white/15 bg-white/10 p-5 backdrop-blur gentle-float">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Learning In Action</p>
              <p className="mt-3 text-sm leading-7 text-white/82">
                Montessori helps children move from curiosity to concentration through purposeful activity, repetition, and joyful discovery.
              </p>
            </div>
          </div>
        </div>
        <div className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card" style={{ animationDelay: "120ms" }}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">What Parents Often Notice</p>
          <h2 className="mt-3 font-display text-4xl text-navy">Children begin to show confidence in quiet but meaningful ways</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              Parents often notice that Montessori children become more independent in daily routines, more willing to try things on their own, and more comfortable expressing their needs.
            </p>
            <p>
              Over time, they also begin to show stronger concentration, more careful movement, better listening, and greater pride in completing tasks for themselves.
            </p>
            <p>
              These are the kinds of foundations that support not just early schooling, but self-confidence and responsibility over the long term.
            </p>
          </div>
        </div>
      </section>

      <section className="stagger-rise rounded-[2rem] bg-[linear-gradient(135deg,#fff8ea_0%,#f7eedf_52%,#f1e6d5_100%)] p-8 shadow-card">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">See Montessori in Action</p>
            <h2 className="mt-3 font-display text-4xl text-navy">The best way to understand Montessori is to experience the environment in person</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-navy/75">
              Visit Sharada Koota Montessori to see how the classroom feels, how materials are arranged, how children engage with work, and how calm, purposeful learning becomes part of the everyday rhythm.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/contact" className="px-7">
                Book a Visit
              </Button>
              <Button href="/admissions" variant="ghost" className="px-7">
                Start Admissions
              </Button>
            </div>
          </div>
          <div className="stagger-rise overflow-hidden rounded-[2rem] bg-white shadow-card" style={{ animationDelay: "120ms" }}>
            <div className="page-media">
              <Image src={montessoriClassroomImage} alt="Montessori visit experience" fill className="object-cover object-center transition duration-700 hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.08),rgba(16,33,63,0.44))]" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
