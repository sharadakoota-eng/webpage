import { getAdminDashboardData } from "@/lib/erp-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

const typeColors: Record<string, string> = {
  Inquiry: "bg-[#f8f3e3] text-[#b98112]",
  Admission: "bg-[#e7f0ff] text-[#1d4ed8]",
  Visit: "bg-[#eaf7f2] text-[#047857]",
  Contact: "bg-[#f3ecff] text-[#7c3aed]",
};

export default async function AdminLeadsPage() {
  const { leadFeed, stats } = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-navy px-6 py-10 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Admin / Leads</p>
        <h1 className="mt-3 font-display text-4xl">All website leads in one ERP tab</h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-white/78">
          This is the operational table your client needs. Every inquiry, admission form, visit booking, and contact submission captured by the website should be visible here for follow-up and conversion tracking.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "New inquiries", value: stats.inquiryCount.toString() },
          { label: "Admissions pending", value: stats.admissionCount.toString() },
          { label: "Visits raised", value: stats.visitCount.toString() },
          { label: "Alerts open", value: stats.notificationCount.toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-4xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-card lg:p-8">
        <div className="grid gap-4">
          {leadFeed.length > 0 ? (
            leadFeed.map((lead) => (
              <div key={`${lead.type}-${lead.id}`} className="rounded-[1.5rem] border border-navy/10 p-5">
                <div className="grid gap-4 lg:grid-cols-[0.75fr_1.1fr_0.55fr_0.4fr] lg:items-center">
                  <div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${typeColors[lead.type] ?? "bg-cream text-gold"}`}>
                      {lead.type}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-navy">{lead.parentName}</p>
                    <p className="mt-1 text-sm text-navy/70">
                      {lead.childName ? `${lead.childName} - ` : ""}
                      {lead.phone ?? "Phone not provided"}
                    </p>
                    <p className="mt-2 text-sm text-navy/60">{lead.title}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-navy/45">Status</p>
                    <p className="mt-2 text-sm font-medium text-navy">{lead.status}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-navy/45">Date</p>
                    <p className="mt-2 text-sm font-medium text-navy">{formatDate(lead.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[1.5rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
              No leads have been captured yet. Once the public website forms are used, the entries will begin to appear here.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
