import { getSchoolUpdatesSnapshot } from "@/lib/erp-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function AdminUpdatesPage() {
  const { announcements, events, lunchMenu } = await getSchoolUpdatesSnapshot();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-navy px-6 py-10 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Admin / School Updates</p>
        <h1 className="mt-3 font-display text-4xl">Control what parents and visitors see daily</h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-white/78">
          This module is where events, announcements, and lunch menu operations should be managed. These updates are designed to reflect on the public website and in the parent portal.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[2rem] bg-sky p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Today's Lunch Menu</p>
          <h2 className="mt-3 font-display text-3xl text-navy">{lunchMenu.title ?? "Today's Lunch Menu"}</h2>
          <div className="mt-5 grid gap-3">
            {(lunchMenu.items ?? []).map((item) => (
              <div key={item} className="rounded-[1.4rem] bg-white px-4 py-3 text-sm text-navy shadow-card">
                {item}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-navy/70">{lunchMenu.note ?? "This data should reflect in the parent portal."}</p>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">ERP Publishing Flow</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              "Admin updates lunch menu in ERP",
              "Parents see the new menu in their dashboard",
              "Admin publishes events and announcements",
              "Website and parent portal stay aligned",
            ].map((item) => (
              <div key={item} className="rounded-[1.4rem] bg-cream px-5 py-4 text-sm leading-7 text-navy shadow-card">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Announcements</p>
          <div className="mt-5 space-y-4">
            {announcements.length > 0 ? (
              announcements.map((item) => (
                <div key={item.id} className="rounded-[1.45rem] border border-navy/10 px-5 py-4">
                  <p className="font-semibold text-navy">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-navy/70">{item.content}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-navy/45">{formatDate(item.createdAt)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">No announcements available yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Events</p>
          <div className="mt-5 space-y-4">
            {events.length > 0 ? (
              events.map((item) => (
                <div key={item.id} className="rounded-[1.45rem] border border-navy/10 px-5 py-4">
                  <p className="font-semibold text-navy">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-navy/70">{item.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-navy/45">
                    {formatDate(item.startsAt)}
                    {item.location ? ` - ${item.location}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">No upcoming events available yet.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
