import { DashboardShell } from "@/components/portal/dashboard-shell";

export default function TeacherPage() {
  return (
    <div className="space-y-8">
      <DashboardShell
        title="Teacher Portal"
        subtitle="A focused workspace for attendance, classroom communication, student observations, homework updates, and reminders."
        stats={[
          { label: "Class strength", value: "20" },
          { label: "Attendance due", value: "1" },
          { label: "Updates posted", value: "8" },
          { label: "Observations", value: "14" },
        ]}
        cards={[
          { title: "Class list", description: "Review enrolled students, primary guardians, and classroom assignment details." },
          { title: "Attendance", description: "Mark daily attendance with remarks and future leave synchronization." },
          { title: "Learning updates", description: "Post homework, activities, and classroom highlights for parents." },
          { title: "Observation notes", description: "Capture student progress and developmental notes in a structured format." },
        ]}
      />
      <section className="grid gap-4 lg:grid-cols-3">
        {[
          "Supports daily classroom discipline without forcing teachers into complicated software flows.",
          "Makes parent communication structured, searchable, and less dependent on informal chat trails.",
          "Creates a strong base for future observations, reports, reminders, and class-level planning.",
        ].map((item) => (
          <div key={item} className="rounded-[1.75rem] bg-white p-6 shadow-card text-sm leading-7 text-navy/70">
            {item}
          </div>
        ))}
      </section>
    </div>
  );
}
