import { DashboardShell } from "@/components/portal/dashboard-shell";

export default function ParentPage() {
  return (
    <div className="space-y-8">
      <DashboardShell
        title="Parent Portal"
        subtitle="A mobile-friendly parent dashboard for child profile, admission status, attendance, fee history, documents, announcements, and teacher updates."
        stats={[
          { label: "Attendance", value: "94%" },
          { label: "Announcements", value: "3" },
          { label: "Homework", value: "2" },
          { label: "Receipts", value: "5" },
        ]}
        cards={[
          { title: "Child profile", description: "Admission details, age group, class assignment, and downloadable school documents." },
          { title: "Communication", description: "Teacher messages, class updates, announcements, and homework or activity notes." },
          { title: "Fees and receipts", description: "Invoice history, fee records, receipt downloads, and future payment actions." },
          { title: "Leave requests", description: "Submit and monitor leave requests directly from the parent dashboard." },
        ]}
      />
      <section className="grid gap-4 lg:grid-cols-3">
        {[
          "Designed primarily for busy parents using phones rather than desktops.",
          "Keeps school communication clear, organized, and less dependent on scattered messages.",
          "Expands naturally into online payments, documents, and teacher-parent collaboration in later phases.",
        ].map((item) => (
          <div key={item} className="rounded-[1.75rem] bg-white p-6 shadow-card text-sm leading-7 text-navy/70">
            {item}
          </div>
        ))}
      </section>
    </div>
  );
}
