import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function AdminNotificationsPage() {
  const notifications = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
  });

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Notifications", value: notifications.length.toString() },
          { label: "Queued", value: notifications.filter((item) => item.status === "QUEUED").length.toString() },
          { label: "Failed", value: notifications.filter((item) => item.status === "FAILED").length.toString() },
          { label: "Dashboard alerts", value: notifications.filter((item) => item.channel === "DASHBOARD").length.toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-4xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Notification Queue</p>
        <h2 className="mt-2 font-display text-3xl text-navy">Admission alerts, payment reminders, and operational signals</h2>
        <div className="mt-6 space-y-4">
          {notifications.map((item) => (
            <div key={item.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold text-navy">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-navy/68">
                    {item.type} | {item.channel}
                  </p>
                  <p className="text-sm leading-7 text-navy/58">{item.message}</p>
                </div>
                <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                  {item.status.replaceAll("_", " ")} | {formatDate(item.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
