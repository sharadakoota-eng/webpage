import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProgramPage } from "@/components/sections/program-page";
import { programs } from "@/lib/content";
import afterSchoolHeroImage from "@/assets/afterschool.png";
import afterSchoolFocusImage from "@/assets/afterschool1.png";
import afterSchoolGroupImage from "@/assets/afterschool2.png";

const enrichmentPillars = [
  {
    title: "Creative expression",
    copy: "Children explore art, imagination, storytelling, and self-expression in ways that feel joyful and confidence-building.",
  },
  {
    title: "Communication confidence",
    copy: "Activities encourage conversation, participation, listening, and verbal expression in a safe small-group setting.",
  },
  {
    title: "Meaningful afternoons",
    copy: "Instead of passive time after school, children experience engaging routines that feel structured, enjoyable, and enriching.",
  },
];

const whyParentsChoose = [
  "A purposeful way to extend the day with creativity, expression, and guided activity.",
  "Helps children use after-school time in a more meaningful and confidence-building way.",
  "Supports social interaction, communication, and collaboration through small-group experiences.",
  "Offers a well-balanced blend of fun, structure, and child-friendly enrichment.",
];

const activityExperience = [
  {
    title: "Art and craft",
    copy: "Hands-on making, color work, seasonal projects, and creative exploration that build expression and focus.",
  },
  {
    title: "Storytelling and language fun",
    copy: "Stories, songs, verbal games, and conversation-based activities that support listening and speaking confidence.",
  },
  {
    title: "Brain games and challenges",
    copy: "Age-appropriate puzzles, thinking activities, and collaborative tasks that keep learning active and enjoyable.",
  },
  {
    title: "Participation and confidence",
    copy: "Children are encouraged to present, share, and take part in ways that help them feel capable and seen.",
  },
];

export default function AfterSchoolActivitiesPage() {
  const program = programs.find((item) => item.slug === "after-school-activities")!;

  return (
    <div className="space-y-10">
      <ProgramPage program={program} showCta={false} />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why After School Activities Matter</p>
          <h2 className="mt-3 font-display text-4xl text-navy">An enriching extension of the day for creativity, confidence, and joyful participation</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              After school hours can be much more than a waiting period between pick-up and home. They can become a valuable time for children to create, communicate, explore, and build confidence.
            </p>
            <p>
              At Sharada Koota Montessori, our after school activities are designed to feel lively yet well-guided, giving children meaningful engagement in a space that is warm, structured, and encouraging.
            </p>
            <p>
              The goal is not only to keep children occupied, but to help them discover interests, express themselves more freely, and enjoy learning in relaxed, activity-based ways.
            </p>
          </div>
        </div>

        <div className="stagger-rise rounded-[2rem] bg-sky p-8 shadow-card" style={{ animationDelay: "120ms" }}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why Parents Choose It</p>
          <div className="mt-5 grid gap-4">
            {whyParentsChoose.map((item, index) => (
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
            <Image src={afterSchoolHeroImage} alt="After school activities environment" fill className="object-cover object-center transition duration-700 hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.08),rgba(16,33,63,0.45))]" />
          </div>
        </div>
        <div
          className="stagger-rise rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft"
          style={{ animationDelay: "120ms" }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">What Makes It Valuable</p>
          <h2 className="mt-3 font-display text-4xl">The right kind of structure can make afternoons feel inspiring</h2>
          <p className="mt-5 text-base leading-8 text-white/78">
            Children often flourish when they are given space to create, converse, imagine, and participate without pressure. After school enrichment creates exactly that kind of atmosphere.
          </p>
          <p className="mt-4 text-base leading-8 text-white/78">
            It supports self-expression, social confidence, and joyful engagement while still feeling thoughtfully guided and well-paced.
          </p>
        </div>
      </section>

      <section className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">The Enrichment Experience</p>
        <h2 className="mt-3 font-display text-4xl text-navy">Activities that feel creative, expressive, and confidence-building</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {enrichmentPillars.map((item, index) => (
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
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Inside the Program</p>
          <h2 className="mt-3 font-display text-4xl text-navy">What children actually experience after school</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              The program blends creative activities, language-rich interaction, group participation, and playful thinking tasks to make the time both enjoyable and meaningful.
            </p>
            <p>
              Children can explore art, stories, games, projects, and presentation-based activities in ways that gently strengthen communication, imagination, and self-belief.
            </p>
            <p>
              This makes the after school experience feel less like extra supervision and more like a purposeful continuation of growth.
            </p>
          </div>
        </div>

        <div
          className="stagger-rise rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft"
          style={{ animationDelay: "120ms" }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Activity Areas</p>
          <div className="mt-6 grid gap-4">
            {activityExperience.map((item, index) => (
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
            <Image src={afterSchoolFocusImage} alt="Child engaged in after school activity" fill className="object-cover object-center transition duration-700 hover:scale-[1.03]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.06),rgba(16,33,63,0.5))]" />
            <div className="absolute inset-x-6 bottom-6 rounded-[1.7rem] border border-white/15 bg-white/10 p-5 backdrop-blur gentle-float">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Confidence In Motion</p>
              <p className="mt-3 text-sm leading-7 text-white/82">
                Through repeated participation, creative risk-taking, and guided sharing, children begin to feel more expressive and self-assured.
              </p>
            </div>
          </div>
        </div>
        <div className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card" style={{ animationDelay: "120ms" }}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">What Families Notice</p>
          <h2 className="mt-3 font-display text-4xl text-navy">Children become more expressive, social, and willing to participate</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              Parents often notice that children begin talking more confidently, sharing more freely, and showing greater excitement around creative work and group activities.
            </p>
            <p>
              They also begin to enjoy structured collaboration, practical challenges, and activities that make them feel capable and recognized.
            </p>
            <p>
              Over time, these experiences support stronger communication, self-expression, and a more positive relationship with learning beyond the regular classroom.
            </p>
          </div>
        </div>
      </section>

      <section className="stagger-rise rounded-[2rem] bg-[linear-gradient(135deg,#fff8ea_0%,#f7eedf_52%,#f1e6d5_100%)] p-8 shadow-card">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Choose Meaningful Afternoons</p>
            <h2 className="mt-3 font-display text-4xl text-navy">Give your child an after-school rhythm that feels joyful and purposeful</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-navy/75">
              Speak with the school to understand available activity slots, age suitability, and how enrichment can support your child&apos;s creativity, communication, and confidence.
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
              <Image src={afterSchoolGroupImage} alt="Group after school enrichment activities" fill className="object-cover object-center transition duration-700 hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.08),rgba(16,33,63,0.44))]" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
