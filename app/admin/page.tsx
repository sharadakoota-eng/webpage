import Link from "next/link";
import { Bell, CalendarClock, ClipboardList, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAdminDashboardData, getSchoolUpdatesSnapshot } from "@/lib/erp-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function AdminPage() {
  const session = await auth();
  const { stats, leadFeed } = await getAdminDashboardData();
  const updates = await getSchoolUpdatesSnapshot();
  const adminName = session?.user?.name ?? "Admin";

  const moduleCards = [
    {
      title: "Leads & admissions",
      description: "See every website inquiry, visit booking, contact form, and admission submission in one operational pipeline.",
      href: "/admin/leads",
      icon: ClipboardList,
    },
    {
      title: "Portal users",
      description: "Create admin, teacher, and parent users so the ERP can move from marketing to real daily usage.",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "School updates",
      description: "Control announcements, events, and the daily lunch menu that parents will see inside their portal.",
      href: "/admin/updates",
      icon: CalendarClock,
    },
    {
      title: "Notifications",
      description: "Monitor front-desk alerts triggered by inquiries, admissions, visits, and future payment events.",
      href: "/admin/leads",
      icon: Bell,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_58%,#21406b_100%)] px-6 py-10 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Admin ERP</p>
        <h1 className="mt-3 font-display text-4xl">Welcome, {adminName}</h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-white/78">
          This is the operational control center for Sharada Koota Montessori. From here, your team can track website leads, manage admissions, create portal users, monitor updates, and prepare the school for daily ERP workflows.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "New website inquiries", value: stats.inquiryCount.toString() },
          { label: "Pending admissions", value: stats.admissionCount.toString() },
          { label: "Visit bookings", value: stats.visitCount.toString() },
          { label: "Open notifications", value: stats.notificationCount.toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-4xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {moduleCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link key={card.title} href={card.href} className="rounded-[1.75rem] bg-white p-6 shadow-card transition duration-300 hover:-translate-y-1">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cream text-gold">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-3xl text-navy">{card.title}</h2>
              <p className="mt-3 text-sm leading-7 text-navy/70">{card.description}</p>
              <p className="mt-5 text-sm font-semibold text-gold">Open module</p>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Live Lead Feed</p>
              <h2 className="mt-2 font-display text-3xl text-navy">All website-captured leads in one place</h2>
            </div>
            <Link href="/admin/leads" className="text-sm font-semibold text-gold">
              Open leads
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {leadFeed.length > 0 ? (
              leadFeed.map((lead) => (
                <div key={`${lead.type}-${lead.id}`} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{lead.type}</p>
                      <h3 className="mt-1 font-semibold text-navy">{lead.title}</h3>
                      <p className="mt-2 text-sm text-navy/70">
                        {lead.parentName}
                        {lead.childName ? ` • ${lead.childName}` : ""}
                        {lead.phone ? ` • ${lead.phone}` : ""}
                      </p>
                    </div>
                    <div className="text-sm text-navy/60">
                      <p className="font-medium text-navy">{lead.status}</p>
                      <p className="mt-1">{formatDate(lead.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.5rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
                No leads have been captured yet. Once families start using the website forms, they will appear here automatically.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-sky p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Today's Lunch Menu</p>
            <h2 className="mt-3 font-display text-3xl text-navy">{updates.lunchMenu.title ?? "Today's Lunch Menu"}</h2>
            <div className="mt-5 grid gap-3">
              {(updates.lunchMenu.items ?? []).map((item) => (
                <div key={item} className="rounded-[1.3rem] bg-white px-4 py-3 text-sm text-navy shadow-card">
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-navy/70">{updates.lunchMenu.note ?? "This menu reflects in the parent portal."}</p>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Current Website Updates</p>
            <div className="mt-5 space-y-4">
              {updates.announcements.slice(0, 2).map((announcement) => (
                <div key={announcement.id} className="rounded-[1.3rem] bg-cream px-4 py-4">
                  <p className="font-semibold text-navy">{announcement.title}</p>
                  <p className="mt-2 text-sm leading-7 text-navy/70">{announcement.content}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
