import Image from "next/image";
import { CalendarDays, Megaphone, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/sections/page-hero";
import eventsImage from "@/assets/events.png";
import eventsDetailImage from "@/assets/events1.png";

const events = [
  {
    title: "Admissions Open for the New Academic Cycle",
    date: "April 2026",
    copy: "Families can begin enquiries, schedule school visits, and understand the programs best suited for their child's age and readiness.",
  },
  {
    title: "Campus Visit Week",
    date: "May 2026",
    copy: "A dedicated window for families to experience the classrooms, meet the team, and understand the tone of the environment before applying.",
  },
  {
    title: "Summer Camp Welcome Meet",
    date: "May 2026",
    copy: "A warm introduction for camp families to understand activities, timings, routines, and the child-friendly support available during the season.",
  },
  {
    title: "Language and Culture Celebration",
    date: "June 2026",
    copy: "A school moment that highlights rhythm, storytelling, expression, and local cultural connection through child-friendly participation.",
  },
];

const updateTypes = [
  {
    title: "Admissions notices",
    copy: "Important admission updates, visit windows, and intake information for prospective families.",
    icon: Megaphone,
  },
  {
    title: "Parent visit opportunities",
    copy: "Announcements for campus visits, orientation slots, and school interaction windows.",
    icon: Users,
  },
  {
    title: "Seasonal programs and launches",
    copy: "Updates related to summer camp, enrichment tracks, and special program announcements.",
    icon: Sparkles,
  },
];

export default function EventsPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Events"
        title="Announcements, school moments, and family updates in one polished place"
        description="This page helps families stay informed about admissions windows, school visits, orientations, celebrations, and current happenings at Sharada Koota Montessori."
      />

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="page-media">
            <Image src={eventsImage} alt="Events and announcements at Sharada Koota Montessori" fill className="object-cover object-center" />
          </div>
          <div className="flex h-full flex-col justify-center p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why This Page Matters</p>
            <h2 className="mt-3 font-display text-4xl text-navy sm:text-5xl">Families feel more confident when a school feels active and current</h2>
            <p className="mt-5 text-base leading-8 text-navy/72">
              A strong events page shows that the school is active, well-managed, and in conversation with families. It helps parents understand timelines, visit opportunities, program launches, and community moments without depending only on calls or messages.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/contact" className="px-7">
                Ask About Upcoming Dates
              </Button>
              <Button href="/admissions" variant="ghost" className="px-7">
                Start Admissions
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="rounded-[2rem] bg-sky p-8 shadow-card lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Update Categories</p>
          <div className="mt-5 grid gap-4">
            {updateTypes.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="stagger-rise journey-glow rounded-[1.5rem] border border-transparent bg-white p-5 shadow-card"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-cream text-gold">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-navy/70">{item.copy}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-card">
          <div className="page-media-short">
            <Image src={eventsDetailImage} alt="School moments and events" fill className="object-cover object-center" />
          </div>
          <div className="p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">How This Will Grow Later</p>
            <div className="mt-5 space-y-4 text-sm leading-8 text-navy/72">
              <p>As the admin portal becomes more active, events and announcements can be managed directly from the dashboard so the site stays current and useful.</p>
              <p>This makes the public website feel alive while also giving parents a simple way to keep track of admissions dates, orientations, and school happenings.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5">
        {events.map((event, index) => (
          <div
            key={event.title}
            className="stagger-rise rounded-[1.9rem] bg-white p-6 shadow-card lg:p-7"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">{event.date}</p>
                <h2 className="mt-2 font-display text-2xl text-navy lg:text-3xl">{event.title}</h2>
              </div>
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cream text-gold">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-sm leading-8 text-navy/72">{event.copy}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
