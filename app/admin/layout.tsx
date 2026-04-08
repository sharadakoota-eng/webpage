import { PortalShell } from "@/components/portal/portal-shell";
import { getPortalSession } from "@/lib/erp-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession();

  return (
    <PortalShell
      roleLabel="Admin ERP"
      title="Montessori ERP"
      subtitle="Sharada Koota school operations"
      userName={session?.name}
      navItems={[
        { label: "Dashboard", href: "/admin/dashboard", section: "Control Centre", icon: "dashboard", shortLabel: "Home" },
        { label: "Leads", href: "/admin/leads", section: "Control Centre", icon: "leads", shortLabel: "Leads" },
        { label: "Admissions", href: "/admin/admissions", section: "Core Workflow", icon: "admissions", shortLabel: "Admissions" },
        { label: "Students", href: "/admin/students", section: "Core Workflow", icon: "students", shortLabel: "Students" },
        { label: "Parents", href: "/admin/parents", section: "Core Workflow", icon: "parents", shortLabel: "Parents" },
        { label: "Teachers", href: "/admin/teachers", section: "Core Workflow", icon: "teachers", shortLabel: "Teachers" },
        { label: "Classes & Batches", href: "/admin/classes", section: "Academic Operations", icon: "classes", shortLabel: "Classes" },
        { label: "Programs & Fees", href: "/admin/programs", section: "Academic Operations", icon: "programs", shortLabel: "Programs" },
        { label: "Meal Planner", href: "/admin/meal-planner", section: "Academic Operations", icon: "meal", shortLabel: "Meals" },
        { label: "Attendance", href: "/admin/attendance", section: "Academic Operations", icon: "attendance", shortLabel: "Attendance" },
        { label: "Performance", href: "/admin/performance", section: "Academic Operations", icon: "academics", shortLabel: "Performance" },
        { label: "Payments & Receipts", href: "/admin/payments", section: "Finance & Communication", icon: "payments", shortLabel: "Payments" },
        { label: "Revenue", href: "/admin/revenue", section: "Finance & Communication", icon: "revenue", shortLabel: "Revenue" },
        { label: "Popups & Alerts", href: "/admin/popups", section: "Finance & Communication", icon: "popups", shortLabel: "Popups" },
        { label: "Notifications", href: "/admin/notifications", section: "Finance & Communication", icon: "notifications", shortLabel: "Alerts" },
        { label: "Website CMS", href: "/admin/cms", section: "System", icon: "cms", shortLabel: "CMS" },
        { label: "Reports", href: "/admin/reports", section: "System", icon: "reports", shortLabel: "Reports" },
        { label: "Settings", href: "/admin/settings", section: "System", icon: "settings", shortLabel: "Settings" },
        { label: "Access & Staff", href: "/admin/users", section: "System", icon: "access", shortLabel: "Access" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
