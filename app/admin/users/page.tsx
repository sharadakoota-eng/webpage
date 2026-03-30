import { prisma } from "@/lib/prisma";
import { CreateUserForm } from "@/components/portal/create-user-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { role: true },
    take: 12,
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-navy px-6 py-10 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Admin / User Management</p>
        <h1 className="mt-3 font-display text-4xl">Create and manage portal users</h1>
        <p className="mt-3 max-w-3xl text-base leading-8 text-white/78">
          Admin can create portal logins here for school staff and families. This is the starting point for teacher assignments, parent access, and future daily ERP workflows.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
        <CreateUserForm />

        <section className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Current Users</p>
          <div className="mt-5 space-y-4">
            {users.map((user) => (
              <div key={user.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-navy">{user.name}</p>
                    <p className="mt-1 text-sm text-navy/70">{user.email}</p>
                    <p className="mt-1 text-sm text-navy/60">{user.phone ?? "Phone not set"}</p>
                  </div>
                  <div className="rounded-full bg-cream px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                    {user.role.type.replaceAll("_", " ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "Admin users",
            copy: "Can manage leads, admissions, users, fees, reports, and school-wide content updates.",
          },
          {
            title: "Teacher users",
            copy: "Can access assigned students, attendance, class updates, and performance observations.",
          },
          {
            title: "Parent users",
            copy: "Can access child profile, attendance, announcements, lunch menu, fees, and receipts.",
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
