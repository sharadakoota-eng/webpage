"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BellDot,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileStack,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  NotebookTabs,
  PanelsTopLeft,
  Presentation,
  ReceiptText,
  Settings2,
  School2,
  UserCog,
  UserRoundCog,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PortalLogoutButton } from "@/components/portal/portal-logout-button";

type PortalNavIcon =
  | "dashboard"
  | "leads"
  | "admissions"
  | "users"
  | "students"
  | "teachers"
  | "parents"
  | "academics"
  | "finance"
  | "updates"
  | "programs"
  | "documents"
  | "classes"
  | "attendance"
  | "payments"
  | "notifications"
  | "meal"
  | "revenue"
  | "popups"
  | "cms"
  | "reports"
  | "settings"
  | "access"
  | "child"
  | "progress"
  | "announcements";

type PortalNavItem = {
  label: string;
  href: string;
  description?: string;
  section?: string;
  icon?: PortalNavIcon;
  shortLabel?: string;
};

type PortalShellProps = {
  roleLabel: string;
  title: string;
  subtitle: string;
  navItems: PortalNavItem[];
  children: React.ReactNode;
  userName?: string;
};

const iconMap: Record<PortalNavIcon, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  leads: ClipboardList,
  admissions: ClipboardList,
  users: UserRoundCog,
  students: Users,
  teachers: GraduationCap,
  parents: Users,
  academics: GraduationCap,
  finance: CircleDollarSign,
  updates: Megaphone,
  programs: BriefcaseBusiness,
  documents: FileStack,
  classes: Building2,
  attendance: NotebookTabs,
  payments: ReceiptText,
  notifications: BellDot,
  meal: ClipboardList,
  revenue: CircleDollarSign,
  popups: Megaphone,
  cms: PanelsTopLeft,
  reports: Presentation,
  settings: Settings2,
  access: UserCog,
  child: School2,
  progress: BookOpenCheck,
  announcements: BellDot,
};

function getSectionGroups(items: PortalNavItem[]) {
  const groups = new Map<string, PortalNavItem[]>();

  for (const item of items) {
    const section = item.section ?? "Workspace";
    groups.set(section, [...(groups.get(section) ?? []), item]);
  }

  return Array.from(groups.entries());
}

function normalizePath(path: string) {
  if (path.endsWith("/dashboard")) {
    return path.slice(0, -10) || "/";
  }

  return path;
}

export function PortalShell({ roleLabel, title, subtitle, navItems, children, userName }: PortalShellProps) {
  const pathname = usePathname();
  const groups = getSectionGroups(navItems);

  return (
    <div className="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="hidden xl:flex xl:flex-col">
        <div className="sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col rounded-[2rem] bg-[linear-gradient(180deg,#0f2242_0%,#10294d_100%)] p-4 text-white shadow-soft">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold/90">Sharada Koota</p>
              <p className="mt-2 truncate font-display text-[1.6rem] leading-tight text-white">{title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-white/54">{subtitle}</p>
              <div className="mt-4 rounded-[1rem] border border-white/8 bg-white/6 px-3 py-3">
                <p className="text-sm font-medium text-white/84">{userName ?? "Portal user"}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/38">{roleLabel}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex-1 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-3">
            <div className="max-h-[calc(100vh-15rem)] space-y-5 overflow-y-auto pr-1">
              {groups.map(([section, items]) => (
                <div key={section}>
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40">{section}</p>
                  <div className="mt-2 space-y-2">
                    {items.map((item) => {
                      const isActive = normalizePath(pathname) === normalizePath(item.href);
                      const Icon = item.icon ? iconMap[item.icon] : ChevronRight;

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-[1rem] px-3 py-2.5 transition duration-300",
                            isActive
                              ? "bg-white text-navy shadow-card"
                              : "text-white/72 hover:bg-white/8 hover:text-white",
                          )}
                        >
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                              isActive ? "bg-cream text-gold" : "bg-white/8 text-white/55",
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{item.label}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex flex-1 flex-wrap gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/78 transition hover:bg-white/8 hover:text-white"
              >
                Public website
              </Link>
              <PortalLogoutButton className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy transition hover:bg-cream" />
            </div>
          </div>
        </div>
      </aside>

      <div className="space-y-6">
        <section className="overflow-hidden rounded-[1.8rem] border border-navy/10 bg-white shadow-card xl:hidden">
          <div className="flex gap-3 overflow-x-auto px-4 py-4 sm:px-5">
            {navItems.map((item) => {
              const isActive = normalizePath(pathname) === normalizePath(item.href);
              const Icon = item.icon ? iconMap[item.icon] : ChevronRight;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "min-w-[190px] rounded-[1.35rem] border px-4 py-3 transition duration-300",
                    isActive
                      ? "border-gold/40 bg-cream text-navy shadow-card"
                      : "border-navy/10 bg-white text-navy/70 hover:-translate-y-0.5 hover:border-gold/20 hover:text-navy",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <p className="text-sm font-semibold">{item.label}</p>
                  </div>
                  {item.description ? <p className="mt-2 text-xs leading-5 text-navy/55">{item.description}</p> : null}
                </Link>
              );
            })}
          </div>
        </section>

        <div className="pb-24 md:pb-0">{children}</div>
      </div>

      <div className="fixed inset-x-0 bottom-4 z-40 px-4 md:hidden">
        <div className="mx-auto flex max-w-xl items-center justify-between gap-2 rounded-[1.5rem] border border-navy/10 bg-white/92 p-2 shadow-soft backdrop-blur">
          {navItems.slice(0, 4).map((item) => {
            const isActive = normalizePath(pathname) === normalizePath(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 rounded-[1rem] px-2 py-3 text-center text-[11px] font-semibold transition",
                  isActive ? "bg-navy text-white" : "text-navy/60",
                )}
              >
                {item.shortLabel ?? item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
