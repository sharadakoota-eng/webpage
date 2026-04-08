import { getPortalSession } from "@/lib/erp-auth";
import { getParentPortalData, getSchoolUpdatesSnapshotForPrograms } from "@/lib/erp-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ParentAnnouncementsPage() {
  const session = await getPortalSession();
  const parent = await getParentPortalData(session?.sub);
  const programId = parent?.parentStudents[0]?.student.enrollments[0]?.programId;
  const updates = await getSchoolUpdatesSnapshotForPrograms(programId ? [programId] : []);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="rounded-[2rem] bg-sky p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Today's Lunch Menu</p>
        <h2 className="mt-3 font-display text-3xl text-navy">{updates.lunchMenu.title ?? "Today's Lunch Menu"}</h2>
        <div className="mt-5 grid gap-3">
          {(updates.lunchMenu.items ?? []).map((item) => (
            <div key={item} className="rounded-[1.35rem] bg-white px-5 py-4 text-sm text-navy shadow-card">
              {item}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-7 text-navy/70">{updates.lunchMenu.note ?? "Updated by the school admin team."}</p>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Announcements</p>
        <div className="mt-5 space-y-4">
          {updates.announcements.map((announcement) => (
            <div key={announcement.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
              <p className="font-semibold text-navy">{announcement.title}</p>
              <p className="mt-2 text-sm leading-7 text-navy/72">{announcement.content}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.24em] text-gold">Upcoming Events</p>
        <div className="mt-4 space-y-4">
          {updates.events.map((event) => (
            <div key={event.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
              <p className="font-semibold text-navy">{event.title}</p>
              <p className="mt-2 text-sm leading-7 text-navy/72">{event.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
