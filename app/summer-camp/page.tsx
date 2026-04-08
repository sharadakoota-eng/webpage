import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import { ProgramPage } from "@/components/sections/program-page";
import { programs } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import summerCampHeroImage from "@/assets/summercamp.png";
import summerCampMomentsImage from "@/assets/summercamp1.png";

const summerOfferings = [
  {
    title: "Summer Camp Junior",
    age: "2 years to 6 years",
    fees: "Rs. 2500",
    schedule: "Mon to Fri | 9:30 AM to 10:30 AM",
    teacher: "Sharada Koota Montessori",
    note: "At Sharada Koota Montessori",
  },
  {
    title: "Summer Camp Senior",
    age: "6 years to 10 years",
    fees: "Rs. 2500",
    schedule: "Mon to Fri | 9:30 AM to 10:30 AM",
    teacher: "Sharada Koota Montessori",
    note: "At Sharada Koota Montessori",
  },
  {
    title: "Chess",
    fees: "Rs. 2000",
    schedule: "Sat and Sun | 9:00 AM to 10:00 AM",
    teacher: "Sriram",
    note: "Revenue split: 50 / 50",
  },
  {
    title: "Handwriting Class",
    fees: "2 days: Rs. 2000 | 5 days: Rs. 4000",
    schedule: "Mon to Fri | 12:00 PM to 1:00 PM",
    teacher: "Shanthini",
    note: "Revenue split: 50 / 50",
  },
  {
    title: "Crochet",
    fees: "30 days: Rs. 5000 including material",
    schedule: "Mon to Fri | 9:00 AM to 10:00 AM",
    teacher: "Monica",
    note: "Teacher share: Rs. 3500 | School share: Rs. 1500",
  },
  {
    title: "Karate",
    fees: "2 days: Rs. 2000 | 5 days: Rs. 4000",
    schedule: "Mon to Fri | 2:00 PM to 3:00 PM",
    teacher: "Krishna",
    note: "Teacher share: 2 days Rs. 1200 | 5 days Rs. 2500",
  },
  {
    title: "Phonetic Class",
    fees: "2 days: Rs. 1500 | 5 days: Rs. 3000",
    schedule: "Mon to Fri | 10:00 AM to 11:00 AM",
    teacher: "H N Shilpa",
  },
  {
    title: "Kannada Class - Offline",
    fees: "2 days: Rs. 1500 | 5 days: Rs. 3000",
    schedule: "Mon to Fri | 11:00 AM to 12:00 Noon",
    teacher: "H N Shilpa",
  },
  {
    title: "Kannada Class - Online",
    fees: "2 days: Rs. 2000 | 5 days: Rs. 4000",
    schedule: "Mon to Fri | 2:00 PM to 3:00 PM",
    teacher: "H N Shilpa",
  },
  {
    title: "Abacus Class",
    fees: "Each level: Rs. 4000 including material",
    schedule: "Timings to be shared by the school",
    teacher: "H N Shilpa",
  },
  {
    title: "Vedic Math",
    fees: "Each level: Rs. 4000 including material",
    schedule: "Timings to be shared by the school",
    teacher: "H N Shilpa",
  },
];

export default function SummerCampPage() {
  const program = programs.find((item) => item.slug === "summer-camp")!;
  const instagramHref = "https://www.instagram.com/sharada_koota_montessori/";

  return (
    <div className="space-y-10">
      <ProgramPage program={program} showCta={false} />

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Summer Camp Essentials</p>
          <h2 className="mt-3 font-display text-4xl text-navy">Everything parents usually ask first</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { label: "Summer camp age", value: "1.5 years to 6 years" },
              { label: "Camp timings", value: "9:30 AM to 12:30 PM" },
              { label: "Day care age", value: "1.5 years to 10 years" },
              { label: "WhatsApp support", value: "+91 9880199221" },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.45rem] bg-cream px-5 py-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.2em] text-navy/45">{item.label}</p>
                <p className="mt-2 text-sm font-semibold leading-7 text-navy">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm leading-7 text-navy/70">
            Families can pair summer camp with day care support where needed, so the schedule stays practical as well as joyful.
          </p>
        </div>

        <div className="stagger-rise rounded-[2rem] bg-sky p-8 shadow-card" style={{ animationDelay: "120ms" }}>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Contact & Social</p>
          <h2 className="mt-3 font-display text-4xl text-navy">Easy ways to connect with the school</h2>
          <div className="mt-6 grid gap-4">
            <a href={`https://wa.me/${siteConfig.whatsappNumber}`} target="_blank" rel="noreferrer" className="rounded-[1.5rem] bg-white px-5 py-4 shadow-card transition hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <MessageCircle className="mt-1 h-5 w-5 text-gold" />
                <div>
                  <p className="font-semibold text-navy">School WhatsApp</p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">+91 9880199221</p>
                </div>
              </div>
            </a>
            <a href={`tel:${siteConfig.phones[0]}`} className="rounded-[1.5rem] bg-white px-5 py-4 shadow-card transition hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-5 w-5 text-gold" />
                <div>
                  <p className="font-semibold text-navy">Call the school</p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">{siteConfig.phones[0]}</p>
                </div>
              </div>
            </a>
            <a href={instagramHref} target="_blank" rel="noreferrer" className="rounded-[1.5rem] bg-white px-5 py-4 shadow-card transition hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <Instagram className="mt-1 h-5 w-5 text-gold" />
                <div>
                  <p className="font-semibold text-navy">Instagram</p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">sharada_koota_montessori</p>
                </div>
              </div>
            </a>
            <Link href={siteConfig.locationUrl} target="_blank" rel="noreferrer" className="rounded-[1.5rem] bg-white px-5 py-4 shadow-card transition hover:-translate-y-1">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-gold" />
                <div>
                  <p className="font-semibold text-navy">Location</p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">Open Google Map</p>
                </div>
              </div>
            </Link>
            <div className="rounded-[1.5rem] bg-white px-5 py-4 shadow-card">
              <div className="flex items-start gap-3">
                <Facebook className="mt-1 h-5 w-5 text-gold" />
                <div>
                  <p className="font-semibold text-navy">Facebook</p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">Facebook link will be shared soon.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      <section className="stagger-rise rounded-[2rem] bg-white p-8 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Summer Camp Fee Structure</p>
            <h2 className="mt-3 font-display text-4xl text-navy">Courses, timings, fees, and teacher details in one place</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-navy/70">
            This section is designed to make it easy for families to compare options quickly and choose the right summer or enrichment track.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {summerOfferings.map((item, index) => (
            <div
              key={item.title}
              className="stagger-rise rounded-[1.6rem] border border-navy/10 bg-[#fdfaf4] p-6 shadow-card"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="flex flex-col gap-2">
                <p className="font-display text-2xl text-navy">{item.title}</p>
                {item.age ? <p className="text-sm font-medium text-navy/72">Age: {item.age}</p> : null}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.1rem] bg-white px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-navy/45">Fees</p>
                  <p className="mt-2 text-sm font-semibold text-navy">{item.fees}</p>
                </div>
                <div className="rounded-[1.1rem] bg-white px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-navy/45">Schedule</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-navy">{item.schedule}</p>
                </div>
              </div>

              <div className="mt-4 rounded-[1.1rem] bg-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-navy/45">Teacher / Coordination</p>
                <p className="mt-2 text-sm font-semibold text-navy">{item.teacher}</p>
                {item.note ? <p className="mt-2 text-sm leading-6 text-navy/68">{item.note}</p> : null}
              </div>
            </div>
          ))}
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
