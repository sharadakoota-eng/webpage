import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  searchParams?: Promise<{
    q?: string;
    type?: string;
  }>;
};

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const query = params.q?.trim() ?? "";
  const type = params.type?.trim() ?? "";

  const [inquiries, visits, contacts, admissions] = await Promise.all([
    prisma.inquiry.findMany({
      where: query
        ? {
            OR: [
              { parentName: { contains: query } },
              { childName: { contains: query } },
              { phone: { contains: query } },
              { email: { contains: query } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.visitBooking.findMany({
      where: query
        ? {
            OR: [
              { parentName: { contains: query } },
              { childName: { contains: query } },
              { phone: { contains: query } },
              { email: { contains: query } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.contactSubmission.findMany({
      where: query
        ? {
            OR: [
              { name: { contains: query } },
              { phone: { contains: query } },
              { email: { contains: query } },
              { subject: { contains: query } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.admission.findMany({
      where: query
        ? {
            OR: [
              { parentName: { contains: query } },
              { childName: { contains: query } },
              { phone: { contains: query } },
              { email: { contains: query } },
              { applicationNumber: { contains: query } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
  ]);

  const rows = [
    ...inquiries.map((item) => ({
      id: item.id,
      type: "Inquiry",
      parentName: item.parentName,
      childName: item.childName ?? "-",
      phone: item.phone,
      source: item.source ?? "Website",
      status: item.status.replaceAll("_", " "),
      createdAt: item.createdAt,
    })),
    ...visits.map((item) => ({
      id: item.id,
      type: "Visit",
      parentName: item.parentName,
      childName: item.childName ?? "-",
      phone: item.phone,
      source: "Visit booking",
      status: "Visit scheduled",
      createdAt: item.createdAt,
    })),
    ...contacts.map((item) => ({
      id: item.id,
      type: "Contact",
      parentName: item.name,
      childName: "-",
      phone: item.phone ?? "-",
      source: item.subject ?? "Contact form",
      status: item.isImportant ? "Important" : "New message",
      createdAt: item.createdAt,
    })),
    ...admissions.map((item) => ({
      id: item.id,
      type: "Admission",
      parentName: item.parentName,
      childName: item.childName,
      phone: item.phone,
      source: item.submittedByParent ? "Parent submitted" : "Front desk submitted",
      status: item.status.replaceAll("_", " "),
      createdAt: item.createdAt,
    })),
  ]
    .filter((row) => (type ? row.type === type : true))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Leads</p>
        <h1 className="mt-2 font-display text-4xl text-navy">Inquiry and admissions capture desk</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-navy/68">
          This page should give the office a single place to review website leads, visit requests, contact submissions, and admissions that are moving toward enrollment.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Inquiries", value: inquiries.length.toString() },
          { label: "Visit bookings", value: visits.length.toString() },
          { label: "Contact submissions", value: contacts.length.toString() },
          { label: "Admission leads", value: admissions.length.toString() },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.5rem] bg-white p-5 shadow-card">
            <p className="text-sm text-navy/60">{item.label}</p>
            <p className="mt-3 font-display text-3xl text-navy">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] bg-white p-6 shadow-card lg:p-8">
        <form className="grid gap-4 lg:grid-cols-[1fr_220px_auto]">
          <input
            name="q"
            defaultValue={query}
            placeholder="Search by parent, child, phone, email, or admission no"
            className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy"
          />
          <select name="type" defaultValue={type} className="rounded-2xl border border-navy/10 px-4 py-3 text-sm text-navy">
            <option value="">All lead types</option>
            <option value="Inquiry">Inquiry</option>
            <option value="Visit">Visit</option>
            <option value="Contact">Contact</option>
            <option value="Admission">Admission</option>
          </select>
          <div className="flex gap-3">
            <button type="submit" className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
              Filter
            </button>
            <a href="/admin/leads" className="rounded-full border border-navy/10 px-5 py-3 text-sm font-semibold text-navy">
              Reset
            </a>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-navy/10 text-left">
            <thead className="bg-[#fbf7f0]">
              <tr className="text-xs uppercase tracking-[0.22em] text-navy/45">
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Parent / Lead</th>
                <th className="px-6 py-4 font-semibold">Child</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">Source</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/10">
              {rows.length > 0 ? (
                rows.map((row) => (
                  <tr key={`${row.type}-${row.id}`}>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                        {row.type}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-navy">{row.parentName}</td>
                    <td className="px-6 py-5 text-sm text-navy/72">{row.childName}</td>
                    <td className="px-6 py-5 text-sm text-navy/72">{row.phone}</td>
                    <td className="px-6 py-5 text-sm text-navy/72">{row.source}</td>
                    <td className="px-6 py-5 text-sm text-navy/72">{row.status}</td>
                    <td className="px-6 py-5 text-sm text-navy/72">{formatDate(row.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm leading-7 text-navy/62">
                    No leads match this search right now.
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
