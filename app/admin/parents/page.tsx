import Link from "next/link";
import { InvoiceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function AdminParentsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";

  const parents = await prisma.parent.findMany({
    where: query
      ? {
          OR: [
            { user: { name: { contains: query } } },
            { user: { email: { contains: query } } },
            { user: { phone: { contains: query } } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      parentStudents: {
        include: {
          student: {
            include: {
              currentClass: true,
              invoices: {
                where: {
                  status: {
                    in: [InvoiceStatus.ISSUED, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE],
                  },
                },
                select: { id: true },
              },
            },
          },
        },
      },
      admissions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Parents</p>
        <h1 className="mt-2 font-display text-4xl text-navy">Family directory and portal visibility</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-navy/68">
          Parents come from approved admissions. This page should help admin see linked children quickly, confirm contact details, and understand whether fee communication is clear for each family.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Parent records", value: parents.length.toString() },
          { label: "Linked children", value: parents.reduce((sum, parent) => sum + parent.parentStudents.length, 0).toString() },
          { label: "Portal active", value: parents.filter((parent) => parent.user.isActive).length.toString() },
          { label: "Fees pending", value: parents.filter((parent) => parent.parentStudents.some((entry) => entry.student.invoices.length > 0)).length.toString() },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.5rem] bg-white p-5 shadow-card">
            <p className="text-sm text-navy/60">{item.label}</p>
            <p className="mt-3 font-display text-3xl text-navy">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-card lg:p-8">
        <form className="grid gap-4 lg:grid-cols-[1fr_auto]">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by parent name, email, or phone"
            className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy"
          />
          <div className="flex gap-3">
            <button type="submit" className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
              Search
            </button>
            <Link href="/admin/parents" className="rounded-full border border-navy/10 px-5 py-3 text-sm font-semibold text-navy">
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy/10 text-left">
            <thead className="bg-[#fbf7f0]">
              <tr className="text-xs uppercase tracking-[0.22em] text-navy/45">
                <th className="px-6 py-4 font-semibold">Parent</th>
                <th className="px-6 py-4 font-semibold">Children</th>
                <th className="px-6 py-4 font-semibold">Father / Mother</th>
                <th className="px-6 py-4 font-semibold">Portal</th>
                <th className="px-6 py-4 font-semibold">Fees</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {parents.length > 0 ? (
                parents.map((parent) => {
                  const latestAdmission = parent.admissions[0];
                  const familyProfile = (latestAdmission?.familyProfile as Record<string, string | undefined> | undefined) ?? {};
                  const children = parent.parentStudents.map((entry) => `${entry.student.firstName} ${entry.student.lastName ?? ""}`.trim());
                  return (
                    <tr key={parent.id} className="align-top">
                      <td className="px-6 py-5">
                        <p className="font-semibold text-navy">{parent.user.name}</p>
                        <p className="mt-2 text-sm text-navy/62">{parent.user.phone ?? "Phone pending"}</p>
                        <p className="mt-1 text-sm text-navy/55">{parent.user.email}</p>
                      </td>
                      <td className="px-6 py-5 text-sm text-navy/72">
                        {children.length > 0 ? children.join(", ") : "Child mapping pending"}
                      </td>
                      <td className="px-6 py-5 text-sm text-navy/72">
                        <p>Father: {familyProfile.fatherName ?? "Pending"}</p>
                        <p className="mt-1">Mother: {familyProfile.motherName ?? "Pending"}</p>
                      </td>
                      <td className="px-6 py-5 text-sm">
                        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${parent.user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                          {parent.user.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-navy/72">
                        {parent.parentStudents.some((entry) => entry.student.invoices.length > 0) ? "Pending" : "Clear"}
                      </td>
                      <td className="px-6 py-5">
                        <Link href={`/admin/parents/${parent.id}`} className="rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy">
                          View parent
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm leading-7 text-navy/62">
                    No parent records match this search yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
