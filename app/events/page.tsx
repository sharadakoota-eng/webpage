import { PageHero } from "@/components/sections/page-hero";

export default function EventsPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Events"
        title="Announcements, visits, and school happenings in one elegant feed"
        description="This page is designed to publish admissions updates, school events, and operational announcements from the admin dashboard."
      />
      <section className="space-y-4">
        {[
          { title: "Admissions Open for 2026", date: "April 2026" },
          { title: "Campus Visit Week", date: "April 2026" },
          { title: "Summer Camp Orientation", date: "April 2026" },
        ].map((event) => (
          <div key={event.title} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">{event.date}</p>
            <h2 className="mt-2 font-display text-2xl text-navy">{event.title}</h2>
            <p className="mt-3 text-sm leading-7 text-navy/70">
              This event module can be updated from the admin portal to showcase admissions updates, visit windows, community celebrations, and program launches.
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
