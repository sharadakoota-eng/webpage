import { prisma } from "@/lib/prisma";
import { CreateUserForm } from "@/components/portal/create-user-form";
import { ManageUsersTable } from "@/components/portal/manage-users-table";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      role: true,
      teacherProfile: true,
      parentProfile: true,
    },
    where: {
      role: {
        type: {
          in: ["ADMIN", "TEACHER"],
        },
      },
    },
    take: 24,
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-navy px-6 py-10 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Access & Staff Control</p>
        <h1 className="mt-3 font-display text-4xl">Create and manage admin and teacher access</h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-white/78">
          This page is only for staff-facing access. Admin users and teacher accounts can be created directly here. Parent portal accounts must come only through approved admissions or enrollment conversion workflows.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <CreateUserForm />
        <ManageUsersTable
          allowedRoles={["ADMIN", "TEACHER"]}
          users={users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isActive: user.isActive,
            roleType: user.role.type,
            designation: user.teacherProfile?.designation,
            occupation: user.parentProfile?.occupation,
          }))}
        />
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "Admin users",
            copy: "Can manage leads, admissions, users, finance, lunch communication, reports, and school-wide publishing.",
          },
          {
            title: "Teacher users",
            copy: "Can access assigned students, attendance, class updates, observations, and future parent communication workflows.",
          },
          {
            title: "Parent accounts",
            copy: "Must be created only from admissions or student enrollment. Use the Admissions and Parents modules for parent-facing workflows instead of this staff access desk.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <h2 className="font-display text-2xl text-navy">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-navy/70">{item.copy}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
