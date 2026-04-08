import Link from "next/link";
import { ArrowRight, Bell, ClipboardList, CreditCard, NotebookTabs, School2, Soup, Sparkles, TrendingUp, UserRoundCog, Users } from "lucide-react";
import { InvoiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminDashboardData, getSchoolUpdatesSnapshot } from "@/lib/erp-data";
import { getPortalSession } from "@/lib/erp-auth";
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

export default async function AdminPage() {
  const session = await getPortalSession();
  const { stats, leadFeed } = await getAdminDashboardData();
  const updates = await getSchoolUpdatesSnapshot();
  const [studentCount, classCount, programCount, pendingDocuments, outstandingInvoices, todayAttendanceCount, activeTeachers, approvedAdmissions] = await Promise.all([
    prisma.student.count(),
    prisma.class.count(),
    prisma.program.count(),
    prisma.admission.count({ where: { status: "DOCUMENTS_PENDING" } }),
    prisma.invoice.count({
      where: {
        status: {
          in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE],
        },
      },
    }),
    prisma.attendance.count({
      where: {
        date: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.teacher.count({
      where: {
        user: {
          isActive: true,
        },
      },
    }),
    prisma.admission.count({ where: { status: "APPROVED" } }),
  ]);

  const adminName = session?.name ?? "Admin";

  const topStats = [
    { label: "Pending admissions", value: stats.admissionCount, icon: ClipboardList },
    { label: "Approved", value: approvedAdmissions, icon: NotebookTabs },
    { label: "Students", value: studentCount, icon: Users },
    { label: "Teachers", value: activeTeachers, icon: School2 },
  ];

  const compactStats = [
    { label: "Documents pending", value: pendingDocuments.toString() },
    { label: "Outstanding invoices", value: outstandingInvoices.toString() },
    { label: "Today's attendance", value: todayAttendanceCount.toString() },
    { label: "Programs", value: programCount.toString() },
  ];

  const quickLinks = [
    { label: "Students", href: "/admin/students" },
    { label: "Teachers", href: "/admin/teachers" },
    { label: "Parents", href: "/admin/parents" },
    { label: "Leads", href: "/admin/leads" },
    { label: "Meals", href: "/admin/meal-planner" },
    { label: "Popups", href: "/admin/popups" },
  ];

  const actionCards = [
    {
      title: "Admissions",
      copy: "Review applications and convert approved admissions into parent and student records.",
      href: "/admin/admissions",
      icon: ClipboardList,
    },
    {
      title: "Staff access",
      copy: "Create teacher or admin accounts, reset passwords, and manage access safely.",
      href: "/admin/users",
      icon: UserRoundCog,
    },
    {
      title: "Classes",
      copy: "Create classes, assign teachers, and keep batch capacity visible.",
      href: "/admin/classes",
      icon: School2,
    },
    {
      title: "Programs & fees",
      copy: "Set pricing once so admissions, parent portal, and payments stay aligned.",
      href: "/admin/programs",
      icon: CreditCard,
    },
    {
      title: "Meal planner",
      copy: "Publish course-wise menus so only the right parents see the right food menu.",
      href: "/admin/meal-planner",
      icon: Soup,
    },
    {
      title: "Revenue",
      copy: "Track collections, dues, and program-wise revenue from one finance view.",
      href: "/admin/revenue",
      icon: TrendingUp,
    },
    {
      title: "Popups & alerts",
      copy: "Run admissions, holiday, or emergency popup campaigns without touching the website.",
      href: "/admin/popups",
      icon: Sparkles,
    },
  ];

  const watchlist = [
    `${stats.inquiryCount} new lead(s) need follow-up from the public website.`,
    `${stats.admissionCount} admission record(s) still need approval or enrollment conversion.`,
    `${pendingDocuments} admission record(s) still need document completion or verification.`,
    `${outstandingInvoices} invoice(s) need payment follow-up or parent clarification.`,
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_58%,#21406b_100%)] px-6 py-7 text-white shadow-soft">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Admin Command Centre</p>
            <h1 className="mt-3 font-display text-[2.7rem] leading-none">Welcome, {adminName}</h1>
            <div className="mt-5 flex flex-wrap gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/88 transition hover:bg-white/16"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px]">
            {topStats.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-[1.3rem] border border-white/12 bg-white/10 p-4 backdrop-blur">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-white/74">{item.label}</p>
                    <Icon className="h-4 w-4 text-gold" />
                  </div>
                  <p className="mt-3 font-display text-3xl text-white">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {compactStats.map((stat) => (
          <div key={stat.label} className="rounded-[1.5rem] bg-white p-5 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-3xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] bg-white p-7 shadow-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Core Workflows</p>
              <h2 className="mt-2 font-display text-2xl text-navy">Office actions</h2>
            </div>
            <Bell className="mt-2 h-5 w-5 text-gold" />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {actionCards.map((action) => {
              const Icon = action.icon;

              return (
                <Link key={action.title} href={action.href} className="group rounded-[1.35rem] border border-navy/10 bg-[#fcfaf6] p-5 transition duration-300 hover:-translate-y-1 hover:border-gold/25">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-gold shadow-card">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="font-display text-xl text-navy">{action.title}</p>
                    <ArrowRight className="h-4 w-4 text-gold transition group-hover:translate-x-1" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-navy/68">{action.copy}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] bg-white p-7 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Watchlist</p>
            <div className="mt-5 space-y-3">
              {watchlist.map((item) => (
                <div key={item} className="rounded-[1.2rem] bg-cream px-4 py-3 text-sm leading-6 text-navy/74">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] bg-sky p-7 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Today's Lunch Menu</p>
            <h2 className="mt-3 font-display text-2xl text-navy">{updates.lunchMenu.title ?? "Today's Lunch Menu"}</h2>
            <div className="mt-5 grid gap-3">
              {(updates.lunchMenu.items ?? []).slice(0, 3).map((item) => (
                <div key={item} className="rounded-[1.2rem] bg-white px-4 py-3 text-sm text-navy shadow-card">
                  {item}
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-navy/70">{updates.lunchMenu.note ?? "This menu reflects in the parent portal."}</p>
            <Link href="/admin/meal-planner" className="mt-4 inline-flex rounded-full border border-gold/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gold transition hover:border-gold/35">
              Open meal planner
            </Link>
          </section>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-[2rem] bg-white p-7 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Lead Feed</p>
              <h2 className="mt-2 font-display text-2xl text-navy">Fresh website activity</h2>
            </div>
            <Link href="/admin/leads" className="text-sm font-semibold text-gold">
              Open leads
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {leadFeed.length > 0 ? (
              leadFeed.slice(0, 4).map((lead) => (
                <div key={`${lead.type}-${lead.id}`} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold">{lead.type}</p>
                      <h3 className="mt-1 font-semibold text-navy">{lead.parentName}</h3>
                      <p className="mt-2 text-sm leading-6 text-navy/70">
                        {lead.title}
                        {lead.childName ? ` | ${lead.childName}` : ""}
                        {lead.phone ? ` | ${lead.phone}` : ""}
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
              <div className="rounded-[1.4rem] bg-cream px-5 py-4 text-sm leading-6 text-navy/70">
                No leads yet. Website inquiries, visit requests, and admissions will appear here automatically.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-7 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">ERP Shortcuts</p>
          <div className="mt-5 grid gap-4">
            {[
              {
                title: "Student records",
                copy: "Open student profiles, linked parents, program placement, and attendance.",
                href: "/admin/students",
              },
              {
                title: "Classes & teachers",
                copy: "Review teacher mapping, class timing, and batch capacity.",
                href: "/admin/classes",
              },
              {
                title: "Programs & fees",
                copy: "Manage pricing, admissions visibility, and billing logic from one place.",
                href: "/admin/programs",
              },
            ].map((item) => (
              <Link key={item.title} href={item.href} className="group rounded-[1.35rem] bg-[#fbf7f0] px-5 py-5 transition hover:-translate-y-0.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-display text-xl text-navy">{item.title}</p>
                  <ArrowRight className="h-4 w-4 text-gold transition group-hover:translate-x-1" />
                </div>
                <p className="mt-3 text-sm leading-6 text-navy/68">{item.copy}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ChangePasswordCard
        title="Admin password"
        description="Update your admin portal password here. If another admin issues a temporary password, sign in and replace it immediately from this section."
      />
    </div>
  );
}
