import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ProgramPage } from "@/components/sections/program-page";
import { programs } from "@/lib/content";
import kannadaKasturiHeroImage from "@/assets/kannadakasturi.png";
import kannadaKasturiFocusImage from "@/assets/kannadakasturi1.png";

const languageBenefits = [
  {
    title: "Comfort with Kannada",
    copy: "Children begin to hear, recognize, and use Kannada naturally through repeated joyful exposure in stories, songs, and guided interaction.",
  },
  {
    title: "Cultural rootedness",
    copy: "The program helps children connect with local traditions, rhythms, and language in a way that feels warm, meaningful, and age-appropriate.",
  },
  {
    title: "Confident expression",
    copy: "Language games, storytelling, and participation help children speak, listen, and express themselves with greater ease.",
  },
];

const reasonsParentsChoose = [
  "A beautiful way to introduce or strengthen Kannada in everyday child-friendly contexts.",
  "Helps children feel more connected to local culture, stories, and identity.",
  "Builds listening, speaking, vocabulary, and participation without pressure.",
  "Makes language learning feel joyful, familiar, and confidence-building rather than rigid.",
];

const experienceAreas = [
  {
    title: "Storytelling and rhymes",
    copy: "Children hear and enjoy Kannada through stories, songs, rhythm, and repetition that support natural understanding.",
  },
  {
    title: "Vocabulary through play",
    copy: "Games, pictures, themed activities, and conversation-based learning help language feel active and approachable.",
  },
  {
    title: "Cultural activities",
    copy: "Festivals, traditions, songs, and local themes help children experience Kannada as a living culture, not only a subject.",
  },
  {
    title: "Gentle participation",
    copy: "Children are encouraged to join in, repeat, respond, and speak at their own comfort level so confidence grows naturally.",
  },
];

export default function KannadaKasturiPage() {
  const program = programs.find((item) => item.slug === "kannada-kasturi")!;

  return (
    <div className="space-y-10">
      <ProgramPage program={program} showCta={false} />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why Kannada Kasturi Matters</p>
          <h2 className="mt-3 font-display text-4xl text-navy">A language-rich program that helps children connect with culture, identity, and expression</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              Kannada Kasturi is designed to help children experience Kannada as something warm, musical, familiar, and joyful rather than formal or intimidating.
            </p>
            <p>
              Through stories, rhymes, songs, vocabulary activities, and cultural moments, children begin building comfort with the language in ways that feel natural and engaging.
            </p>
            <p>
              The program supports not only language familiarity, but also cultural rootedness, participation, and a stronger sense of connection to the place they live in.
            </p>
          </div>
        </div>

        <div className="stagger-rise rounded-[2rem] bg-sky p-8 shadow-card" style={{ animationDelay: "120ms" }}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why Families Choose It</p>
          <div className="mt-5 grid gap-4">
            {reasonsParentsChoose.map((item, index) => (
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
            <Image
              src={kannadaKasturiHeroImage}
              alt="Kannada language and culture learning"
              fill
              className="object-cover object-[center_22%] transition duration-700 hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.08),rgba(16,33,63,0.45))]" />
          </div>
        </div>
        <div
          className="stagger-rise rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft"
          style={{ animationDelay: "120ms" }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why This Feels Special</p>
          <h2 className="mt-3 font-display text-4xl">Language becomes easier to love when it comes through rhythm, story, and culture</h2>
          <p className="mt-5 text-base leading-8 text-white/78">
            Children connect more naturally with language when it is presented in ways that feel expressive, playful, and familiar rather than formal and pressured.
          </p>
          <p className="mt-4 text-base leading-8 text-white/78">
            Kannada Kasturi creates that kind of learning atmosphere by combining storytelling, song, repetition, and culture-rich participation.
          </p>
        </div>
      </section>

      <section className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">The Kannada Kasturi Experience</p>
        <h2 className="mt-3 font-display text-4xl text-navy">Language learning that feels joyful, expressive, and culturally alive</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {languageBenefits.map((item, index) => (
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
          <h2 className="mt-3 font-display text-4xl text-navy">More than language exposure - it builds belonging</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              Kannada Kasturi is special because it does not treat Kannada as a subject to be memorized. Instead, it presents the language through lived experiences that children can enjoy, repeat, and connect with emotionally.
            </p>
            <p>
              This helps children become more open to the language, more willing to participate, and more comfortable with expression even if they are beginners.
            </p>
            <p>
              It also creates a beautiful bridge between language, culture, rhythm, and identity - something many families value deeply.
            </p>
          </div>
        </div>

        <div
          className="stagger-rise rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft"
          style={{ animationDelay: "120ms" }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Inside the Program</p>
          <div className="mt-6 grid gap-4">
            {experienceAreas.map((item, index) => (
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
            <Image
              src={kannadaKasturiFocusImage}
              alt="Child participating in Kannada activity"
              fill
              className="object-cover object-[center_18%] transition duration-700 hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.06),rgba(16,33,63,0.5))]" />
            <div className="absolute inset-x-6 bottom-6 rounded-[1.7rem] border border-white/15 bg-white/10 p-5 backdrop-blur gentle-float">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Language In Practice</p>
              <p className="mt-3 text-sm leading-7 text-white/82">
                Through stories, songs, repetition, and interaction, children begin to feel more at ease with listening, responding, and expressing themselves in Kannada.
              </p>
            </div>
          </div>
        </div>
        <div className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card" style={{ animationDelay: "120ms" }}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">What Families Notice</p>
          <h2 className="mt-3 font-display text-4xl text-navy">Children become more open, expressive, and culturally connected</h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-navy/75">
            <p>
              Families often notice that children become more curious about Kannada words, songs, stories, and local cultural references once they experience them in joyful ways.
            </p>
            <p>
              They also begin to participate more naturally, respond with more confidence, and show a stronger sense of familiarity with the language over time.
            </p>
            <p>
              This makes Kannada Kasturi feel not only educational, but deeply meaningful for identity and belonging too.
            </p>
          </div>
        </div>
      </section>

      <section className="stagger-rise rounded-[2rem] bg-[linear-gradient(135deg,#fff8ea_0%,#f7eedf_52%,#f1e6d5_100%)] p-8 shadow-card">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Celebrate Language and Culture</p>
            <h2 className="mt-3 font-display text-4xl text-navy">Choose a program that helps children feel more rooted, expressive, and connected</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-navy/75">
              Speak with the school to understand the right age group, program fit, and how Kannada Kasturi can support your child&apos;s language confidence and cultural familiarity.
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
              <Image src={kannadaKasturiHeroImage} alt="Kannada Kasturi visit experience" fill className="object-cover object-center transition duration-700 hover:scale-[1.03]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.08),rgba(16,33,63,0.44))]" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
