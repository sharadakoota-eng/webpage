import { DashboardShell } from "@/components/portal/dashboard-shell";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <DashboardShell
        title="Admin Portal"
        subtitle="Control content, inquiries, admissions, programs, notifications, fee structures, and school operations from one central dashboard."
        stats={[
          { label: "New inquiries", value: "18" },
          { label: "Admissions", value: "6" },
          { label: "Pending visits", value: "4" },
          { label: "Notifications", value: "12" },
        ]}
        cards={[
          { title: "Lead management", description: "Track inquiries, school visits, admission forms, and follow-up status changes." },
          { title: "Content management", description: "Update public pages, announcements, testimonials, gallery items, and FAQ content." },
          { title: "Program and class setup", description: "Manage academic offerings, classroom groups, teachers, and fee structures." },
          { title: "Audit and reports", description: "Review logs, operational events, and future payment activity in one place." },
        ]}
      />
      <section className="grid gap-4 lg:grid-cols-3">
        {[
          "Manage front-desk alerts for every inquiry, admission, visit, and payment trigger.",
          "Control gallery items, testimonials, FAQs, and public website updates without rebuilding the UI.",
          "Prepare future fee and reporting workflows on the same scalable MySQL and Prisma model.",
        ].map((item) => (
          <div key={item} className="rounded-[1.75rem] bg-white p-6 shadow-card text-sm leading-7 text-navy/70">
            {item}
          </div>
        ))}
      </section>
    </div>
  );
}
