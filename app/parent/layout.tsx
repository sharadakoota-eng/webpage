import { PortalShell } from "@/components/portal/portal-shell";
import { getPortalSession } from "@/lib/erp-auth";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession();

  return (
    <PortalShell
      roleLabel="Parent Portal"
      title="One calm place for progress, communication, lunch menu, and school payments"
      subtitle="The parent experience should feel simple and reassuring. Families can track attendance, recent updates, fees, receipts, announcements, and child progress from a phone-friendly dashboard."
      userName={session?.name}
      navItems={[
        { label: "Dashboard", href: "/parent/dashboard", description: "Family overview", section: "My Workspace", icon: "dashboard", shortLabel: "Home" },
        { label: "Child Profile", href: "/parent/child", description: "Student info and class details", section: "My Workspace", icon: "child", shortLabel: "Child" },
        { label: "Progress", href: "/parent/progress", description: "Observations and attendance", section: "My Workspace", icon: "progress", shortLabel: "Progress" },
        { label: "Fees", href: "/parent/fees", description: "Invoices and receipts", section: "My Workspace", icon: "finance", shortLabel: "Fees" },
        { label: "Announcements", href: "/parent/announcements", description: "Events, lunch, notices", section: "My Workspace", icon: "announcements" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
