import Link from "next/link";
import { AttendanceStatus, InvoiceStatus } from "@prisma/client";
import { BellDot, CalendarDays, CreditCard, NotebookPen } from "lucide-react";
import { getPortalSession } from "@/lib/erp-auth";
import { getParentPortalData, getSchoolUpdatesSnapshotForPrograms, splitParentUpdatesByAudience } from "@/lib/erp-data";
import { ChangePasswordCard } from "@/components/portal/change-password-card";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function ParentPage() {
  const session = await getPortalSession();
  const parent = await getParentPortalData(session?.sub);
  const studentMap = parent?.parentStudents[0];
  const student = studentMap?.student;
  const currentEnrollment = student?.enrollments[0];
  const schoolUpdates = await getSchoolUpdatesSnapshotForPrograms(currentEnrollment?.programId ? [currentEnrollment.programId] : []);
  const attendance = student?.attendance ?? [];
  const presentDays = attendance.filter((item) => item.status === AttendanceStatus.PRESENT).length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : 0;
  const invoices = student?.invoices ?? [];
  const receipts = student?.receipts ?? [];
  const homeworkUpdates = student?.homeworkUpdates ?? [];
  const { classUpdates, individualNotes } = splitParentUpdatesByAudience(homeworkUpdates);
  const pendingStatuses = new Set<InvoiceStatus>([
    InvoiceStatus.ISSUED,
    InvoiceStatus.PARTIALLY_PAID,
    InvoiceStatus.OVERDUE,
  ]);
  const pendingInvoices = invoices.filter((invoice) => pendingStatuses.has(invoice.status)).length;

  const actionCards = [
    {
      title: "View child profile",
      copy: "See admission number, class details, and student profile information.",
      href: "/parent/child",
      icon: NotebookPen,
    },
    {
      title: "Check progress",
      copy: "Review attendance history and teacher observations in one calm screen.",
      href: "/parent/progress",
      icon: CalendarDays,
    },
    {
      title: "Review fees and receipts",
      copy: "Keep track of invoices, payment status, and receipt history from one place.",
      href: "/parent/fees",
      icon: CreditCard,
    },
    {
      title: "Read announcements",
      copy: "See lunch menu, school notices, events, and parent-facing communication.",
      href: "/parent/announcements",
      icon: BellDot,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_58%,#21406b_100%)] px-6 py-10 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Parent Dashboard</p>
        <h1 className="mt-3 font-display text-4xl">Welcome, {parent?.user.name ?? session?.name ?? "Parent"}</h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-white/78">
          This should feel like one trusted family workspace for progress, attendance, fees, lunch menu, announcements, and classroom communication.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Child attendance", value: `${attendanceRate}%` },
          { label: "Announcements", value: schoolUpdates.announcements.length.toString() },
          { label: "Pending invoices", value: pendingInvoices.toString() },
          { label: "Receipts", value: receipts.length.toString() },
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
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Family Workspace</p>
              <h2 className="mt-2 font-display text-3xl text-navy">Where parents should go most often</h2>
            </div>
            <BellDot className="mt-2 h-5 w-5 text-gold" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
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
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Today's Lunch Menu</p>
            <h2 className="mt-3 font-display text-3xl text-navy">{schoolUpdates.lunchMenu.title ?? "Today's Lunch Menu"}</h2>
            <div className="mt-5 grid gap-3">
              {(schoolUpdates.lunchMenu.items ?? []).map((item) => (
                <div key={item} className="rounded-[1.35rem] bg-white px-5 py-4 text-sm text-navy shadow-card">
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-7 text-navy/70">
              Admin updates this from the ERP, and the same menu should reflect here for parents.
            </p>
          </section>

          <section className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Child Snapshot</p>
            <h2 className="mt-3 font-display text-3xl text-navy">
              {student ? `${student.firstName} ${student.lastName ?? ""}` : "Student profile pending"}
            </h2>
            <div className="mt-5 grid gap-3">
              {[ 
                `Class: ${student?.currentClass?.name ?? "Not assigned"}${student?.currentClass?.section ? ` - ${student.currentClass.section}` : ""}`,
                `Admission No: ${student?.admissionNumber ?? "Not assigned"}`,
                `Program: ${currentEnrollment?.program.name ?? "Program pending"}`,
                `Recent teacher notes: ${student?.observations.length ?? 0}`,
              ].map((item) => (
                <div key={item} className="rounded-[1.35rem] bg-cream px-4 py-4 text-sm leading-7 text-navy/74">
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
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Performance and Teacher Notes</p>
              <h2 className="mt-2 font-display text-3xl text-navy">Recent remarks</h2>
            </div>
            <NotebookPen className="h-5 w-5 text-gold" />
          </div>
          <div className="mt-5 space-y-4">
            {student?.observations.length ? (
              student.observations.map((item) => (
                <div key={item.id} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                  <p className="font-semibold text-navy">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">{item.content}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
                Teacher performance notes and developmental remarks will appear here once the classroom workflow is active.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Class Updates</p>
              <h2 className="mt-2 font-display text-3xl text-navy">Homework and class-wide communication</h2>
            </div>
            <BellDot className="h-5 w-5 text-gold" />
          </div>
          <div className="mt-5 space-y-4">
            {classUpdates.length > 0 ? (
              classUpdates.map((entry) => (
                <div key={entry.homeworkUpdateId} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                  <p className="font-semibold text-navy">{entry.homeworkUpdate.title}</p>
                  <p className="mt-2 text-sm text-navy/65">
                    {entry.homeworkUpdate.teacher.user.name} | {formatDate(entry.homeworkUpdate.publishedAt)}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">
                    {entry.homeworkUpdate.content}
                  </p>
                  {entry.homeworkUpdate.attachmentUrl ? (
                    <a href={entry.homeworkUpdate.attachmentUrl} target="_blank" className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                      View attachment
                    </a>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
                Weekly homework and class updates will appear here once the teacher posts them from the classroom workspace.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Individual Notes</p>
        <h2 className="mt-2 font-display text-3xl text-navy">Notes shared only for your child</h2>
        <div className="mt-5 space-y-4">
          {individualNotes.length > 0 ? (
            individualNotes.map((entry) => (
              <div key={entry.homeworkUpdateId} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                <p className="font-semibold text-navy">{entry.homeworkUpdate.title}</p>
                <p className="mt-2 text-sm text-navy/65">
                  {entry.homeworkUpdate.teacher.user.name} | {formatDate(entry.homeworkUpdate.publishedAt)}
                </p>
                <p className="mt-2 text-sm leading-7 text-navy/72">{entry.homeworkUpdate.content}</p>
                {entry.homeworkUpdate.attachmentUrl ? (
                  <a href={entry.homeworkUpdate.attachmentUrl} target="_blank" className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.18em] text-gold">
                    View attachment
                  </a>
                ) : null}
              </div>
            ))
          ) : (
            <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
              Individual teacher notes for your child will appear here when the teacher shares them privately.
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Announcements</p>
          <div className="mt-5 space-y-4">
            {schoolUpdates.announcements.map((item) => (
              <div key={item.id} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                <p className="font-semibold text-navy">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-navy/72">{item.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Upcoming Events</p>
          <div className="mt-5 space-y-4">
            {schoolUpdates.events.map((item) => (
              <div key={item.id} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                <p className="font-semibold text-navy">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-navy/72">{item.description}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-navy/45">{formatDate(item.startsAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ChangePasswordCard
        title="Update portal password"
        description="You can change your parent portal password here any time. If the school shares a temporary password, sign in once and update it from this screen."
      />
    </div>
  );
}
