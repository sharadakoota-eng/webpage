import { PortalShell } from "@/components/portal/portal-shell";
import { getPortalSession } from "@/lib/erp-auth";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getPortalSession();

  return (
    <PortalShell
      roleLabel="Teacher Portal"
      title="Manage classroom performance, attendance, and daily parent-facing updates"
      subtitle="Teachers should see only the students and classes assigned to them. This workspace is built for focused classroom execution: attendance, observations, homework updates, and student progress tracking."
      userName={session?.name}
      navItems={[
        { label: "Dashboard", href: "/teacher/dashboard", description: "Teaching day overview", section: "My Workspace", icon: "dashboard", shortLabel: "Home" },
        { label: "Students", href: "/teacher/students", description: "Assigned student roster", section: "My Workspace", icon: "students", shortLabel: "Students" },
        { label: "Attendance", href: "/teacher/attendance", description: "Daily attendance workflow", section: "My Workspace", icon: "academics", shortLabel: "Attend" },
        { label: "Updates", href: "/teacher/updates", description: "Homework and observation history", section: "My Workspace", icon: "updates", shortLabel: "Updates" },
      ]}
    >
      {children}
    </PortalShell>
  );
}
