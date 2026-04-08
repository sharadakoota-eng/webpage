import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

export default async function AdminPerformancePage() {
  const observations = await prisma.studentObservation.findMany({
    orderBy: { observedAt: "desc" },
    take: 80,
    include: {
      student: {
        include: {
          currentClass: true,
        },
      },
      teacher: {
        include: {
          user: true,
        },
      },
    },
  });

  const byStudent = new Map<string, { name: string; classLabel: string; count: number; latest: Date }>();
  for (const observation of observations) {
    const key = observation.studentId;
    const classLabel = observation.student.currentClass
      ? `${observation.student.currentClass.name}${observation.student.currentClass.section ? ` - ${observation.student.currentClass.section}` : ""}`
      : "Class pending";
    const current = byStudent.get(key) ?? {
      name: `${observation.student.firstName} ${observation.student.lastName ?? ""}`.trim(),
      classLabel,
      count: 0,
      latest: observation.observedAt,
    };
    current.count += 1;
    if (observation.observedAt > current.latest) {
      current.latest = observation.observedAt;
    }
    byStudent.set(key, current);
  }

  const classSummary = new Map<string, number>();
  for (const item of observations) {
    const key = item.student.currentClass
      ? `${item.student.currentClass.name}${item.student.currentClass.section ? ` - ${item.student.currentClass.section}` : ""}`
      : "Class pending";
    classSummary.set(key, (classSummary.get(key) ?? 0) + 1);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Performance</p>
        <h1 className="mt-2 font-display text-4xl text-navy">Montessori observations and development timeline</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-navy/68">
          This page should help admin review whether teachers are submitting observations consistently and which students or classes need closer developmental follow-up.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Observation records", value: observations.length.toString() },
          { label: "Students covered", value: byStudent.size.toString() },
          { label: "Teachers contributing", value: new Set(observations.map((item) => item.teacherId)).size.toString() },
          { label: "Classes touched", value: classSummary.size.toString() },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.5rem] bg-white p-5 shadow-card">
            <p className="text-sm text-navy/60">{item.label}</p>
            <p className="mt-3 font-display text-3xl text-navy">{item.value}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Student Progress Watchlist</p>
          <div className="mt-5 space-y-4">
            {Array.from(byStudent.values())
              .sort((a, b) => b.count - a.count)
              .slice(0, 12)
              .map((item) => (
                <div key={item.name} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-navy">{item.name}</p>
                      <p className="mt-2 text-sm text-navy/62">{item.classLabel}</p>
                    </div>
                    <div className="text-right text-sm text-navy/72">
                      <p className="font-medium text-navy">{item.count} note(s)</p>
                      <p className="mt-1">{formatDate(item.latest)}</p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </section>

        <section className="space-y-6">
          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Class Observation Coverage</p>
            <div className="mt-5 space-y-4">
              {Array.from(classSummary.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([label, count]) => (
                  <div key={label} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-semibold text-navy">{label}</p>
                      <p className="text-sm font-medium text-navy">{count} note(s)</p>
                    </div>
                    <div className="mt-3 h-3 rounded-full bg-[#fbf7f0]">
                      <div
                        className="h-3 rounded-full bg-[linear-gradient(90deg,#132b4d_0%,#d7a11e_100%)]"
                        style={{ width: `${Math.max((count / Math.max(...classSummary.values(), 1)) * 100, 10)}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Latest Observation Timeline</p>
            <div className="mt-5 space-y-4">
              {observations.slice(0, 10).map((item) => (
                <article key={item.id} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-navy">{item.title}</p>
                      <p className="mt-2 text-sm leading-7 text-navy/68">
                        {item.student.firstName} {item.student.lastName ?? ""} | {item.teacher.user.name}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-navy/72">{item.content}</p>
                    </div>
                    <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                      {formatDate(item.observedAt)}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
