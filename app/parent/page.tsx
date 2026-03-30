import { AttendanceStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { getParentPortalData, getSchoolUpdatesSnapshot } from "@/lib/erp-data";

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
  const session = await auth();
  const parent = await getParentPortalData(session?.user?.id);
  const schoolUpdates = await getSchoolUpdatesSnapshot();
  const studentMap = parent?.parentStudents[0];
  const student = studentMap?.student;
  const attendance = student?.attendance ?? [];
  const presentDays = attendance.filter((item) => item.status === AttendanceStatus.PRESENT).length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentDays / attendance.length) * 100) : 0;
  const invoices = student?.invoices ?? [];
  const receipts = student?.receipts ?? [];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_58%,#21406b_100%)] px-6 py-10 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Parent Portal</p>
        <h1 className="mt-3 font-display text-4xl">Welcome, {parent?.user.name ?? "Parent"}</h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-white/78">
          This dashboard is designed to give families one trusted place for child progress, attendance, school communication, lunch menu, fees, receipts, and upcoming updates.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Child attendance", value: `${attendanceRate}%` },
          { label: "Announcements", value: schoolUpdates.announcements.length.toString() },
          { label: "Receipts", value: receipts.length.toString() },
          { label: "Invoices", value: invoices.length.toString() },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-4xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Student Profile</p>
          <h2 className="mt-3 font-display text-3xl text-navy">
            {student ? `${student.firstName} ${student.lastName ?? ""}` : "Student profile will appear here"}
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              { label: "Admission No", value: student?.admissionNumber ?? "Not assigned" },
              { label: "Class", value: student?.currentClass?.name ?? "Not assigned" },
              { label: "Section", value: student?.currentClass?.section ?? "Not assigned" },
              { label: "Date of birth", value: student ? formatDate(student.dateOfBirth) : "Not available" },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.35rem] bg-cream px-5 py-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.2em] text-navy/45">{item.label}</p>
                <p className="mt-2 text-sm font-medium text-navy">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-sky p-8 shadow-card">
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
            Admin can update this daily from the ERP, and the same menu will reflect here for parents.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Performance & Teacher Notes</p>
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
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Fees, Payments & Receipts</p>
          <div className="mt-5 space-y-4">
            {invoices.length > 0 ? (
              invoices.map((invoice) => (
                <div key={invoice.id} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                  <p className="font-semibold text-navy">{invoice.invoiceNumber}</p>
                  <p className="mt-2 text-sm text-navy/65">Due: {formatDate(invoice.dueDate)}</p>
                  <p className="mt-2 text-sm leading-7 text-navy/72">
                    Amount: Rs. {invoice.amount.toString()} • Status: {invoice.status.replaceAll("_", " ")}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.35rem] bg-cream px-5 py-4 text-sm leading-7 text-navy/70">
                Fee invoices and receipts will appear here as soon as admin activates the finance workflow for this student.
              </div>
            )}
          </div>
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
    </div>
  );
}
