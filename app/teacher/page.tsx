import Link from "next/link";
import { BookOpenCheck, CalendarCheck2, ClipboardList, Megaphone, NotebookPen } from "lucide-react";
import { getPortalSession } from "@/lib/erp-auth";
import { getTeacherPortalData } from "@/lib/erp-data";
import { ChangePasswordCard } from "@/components/portal/change-password-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TeacherPage() {
  const session = await getPortalSession();
  const teacher = await getTeacherPortalData(session?.sub);
  const assignedClasses = teacher?.classes ?? [];
  const firstClass = assignedClasses[0]?.class;
  const students = assignedClasses.flatMap((entry) => entry.class.students);
  const homeworkCount = teacher?.homeworkUpdates.length ?? 0;
  const observationCount = teacher?.observationNotes.length ?? 0;

  const actionCards = [
    {
      title: "Open my students",
      copy: "Review assigned learners, quick student context, and class ownership before the day begins.",
      href: "/teacher/students",
      icon: ClipboardList,
    },
    {
      title: "Mark attendance",
      copy: "Record present, absent, leave, and half-day status so parent visibility stays current.",
      href: "/teacher/attendance",
      icon: CalendarCheck2,
    },
    {
      title: "Post class updates",
      copy: "Share activities, homework, and classroom highlights without leaving the teacher workspace.",
      href: "/teacher/updates",
      icon: Megaphone,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_58%,#21406b_100%)] px-6 py-10 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Teacher Dashboard</p>
        <h1 className="mt-3 font-display text-4xl">Welcome, {teacher?.user.name ?? "Teacher"}</h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-white/78">
          This should feel like a calm classroom command centre. Attendance, student notes, activity publishing, and parent-facing updates should all be reachable in a few clicks.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Assigned classes", value: assignedClasses.length.toString() },
          { label: "Students in focus", value: students.length.toString() },
          { label: "Updates posted", value: homeworkCount.toString() },
          { label: "Observations logged", value: observationCount.toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-4xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Teaching Priorities</p>
              <h2 className="mt-2 font-display text-3xl text-navy">What should happen in the classroom today</h2>
            </div>
            <BookOpenCheck className="mt-2 h-5 w-5 text-gold" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {actionCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link key={card.title} href={card.href} className="rounded-[1.5rem] border border-navy/10 bg-[#fcfaf6] p-5 transition duration-300 hover:-translate-y-1 hover:border-gold/25">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gold shadow-card">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 font-display text-2xl text-navy">{card.title}</p>
                  <p className="mt-3 text-sm leading-7 text-navy/68">{card.copy}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-sky p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Current Class</p>
            <h2 className="mt-3 font-display text-3xl text-navy">
              {firstClass ? `${firstClass.name}${firstClass.section ? ` - ${firstClass.section}` : ""}` : "No class assigned yet"}
            </h2>
            <p className="mt-3 text-sm leading-7 text-navy/70">
              {firstClass
                ? `Age group: ${firstClass.ageGroup ?? "Not set"} | Room: ${firstClass.roomLabel ?? "To be assigned"}`
                : "Once admin assigns a class to this teacher, student lists and classroom workflows will appear here."}
            </p>

            <div className="mt-5 grid gap-3">
              {[
                `${students.length} student(s) visible across assigned classes.`,
                `${homeworkCount} update(s) already posted from this teacher profile.`,
                `${observationCount} observation note(s) recorded for parent visibility.`,
              ].map((item) => (
                <div key={item} className="rounded-[1.35rem] bg-white px-5 py-4 text-sm leading-7 text-navy shadow-card">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Recent Observation Notes</p>
              <h2 className="mt-2 font-display text-3xl text-navy">Student development remarks</h2>
            </div>
            <NotebookPen className="h-5 w-5 text-gold" />
          </div>
          <div className="mt-5 space-y-4">
            {teacher?.observationNotes.length ? (
              teacher.observationNotes.map((note) => (
                <div key={note.id} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                  <p className="font-semibold text-navy">{note.title}</p>
                  <p className="mt-2 text-sm text-navy/65">{note.student.firstName}</p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">{note.content}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
                No observations have been recorded yet. This area is designed for language, behavior, skills, and developmental notes.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Published Classroom Updates</p>
              <h2 className="mt-2 font-display text-3xl text-navy">What parents can already see</h2>
            </div>
            <Megaphone className="h-5 w-5 text-gold" />
          </div>
          <div className="mt-5 space-y-4">
            {teacher?.homeworkUpdates.length ? (
              teacher.homeworkUpdates.map((update) => (
                <div key={update.id} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                  <p className="font-semibold text-navy">{update.title}</p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">{update.content}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
                No teacher updates have been published yet. Homework, class activity, and classroom highlights will appear here.
              </div>
            )}
          </div>
        </div>
      </section>

      <ChangePasswordCard
        title="Update teacher password"
        description="Keep your classroom login secure. If admin shares a temporary password, update it here after signing in."
      />
    </div>
  );
}
