import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatCurrency(value: number) {
  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export default async function AdminRevenuePage() {
  const [payments, invoices, programs] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "SUCCESS" },
      include: {
        invoice: {
          include: {
            student: {
              include: {
                enrollments: {
                  include: { program: true },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
              },
            },
          },
        },
      },
    }),
    prisma.invoice.findMany({
      include: {
        student: {
          include: {
            enrollments: {
              include: { program: true },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    }),
    prisma.program.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const monthly = new Map<string, number>();
  for (const payment of payments) {
    const key = new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" }).format(payment.paidAt ?? payment.createdAt);
    monthly.set(key, (monthly.get(key) ?? 0) + Number(payment.amount));
  }

  const programRevenue = programs.map((program) => {
    const amount = payments
      .filter((payment) => payment.invoice.student.enrollments[0]?.programId === program.id)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    return { name: program.name, amount };
  });

  const totalCollected = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  const totalExpected = invoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
  const totalDue = Math.max(totalExpected - totalCollected, 0);
  const monthlyBars = Array.from(monthly.entries()).slice(-8);
  const maxMonthly = Math.max(...monthlyBars.map(([, value]) => value), 1);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Revenue</p>
        <h1 className="mt-2 font-display text-4xl text-navy">Collections, dues, and program-wise revenue</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-navy/68">
          This page helps admin see how much revenue is expected, how much has been collected, and where dues or discounts may need action.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Collected", value: formatCurrency(totalCollected) },
          { label: "Expected", value: formatCurrency(totalExpected) },
          { label: "Outstanding", value: formatCurrency(totalDue) },
          { label: "Successful payments", value: payments.length.toString() },
        ].map((item) => (
          <div key={item.label} className="rounded-[1.5rem] bg-white p-5 shadow-card">
            <p className="text-sm text-navy/60">{item.label}</p>
            <p className="mt-3 font-display text-3xl text-navy">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Monthly Revenue Trend</p>
          <div className="mt-6 grid min-h-[260px] items-end gap-4 md:grid-cols-4 xl:grid-cols-8">
            {monthlyBars.length > 0 ? (
              monthlyBars.map(([label, value]) => (
                <div key={label} className="flex flex-col items-center gap-3">
                  <div className="flex h-[190px] w-full items-end rounded-[1.4rem] bg-[#fbf7f0] p-3">
                    <div className="w-full rounded-[1rem] bg-[linear-gradient(180deg,#d7a11e_0%,#132b4d_100%)]" style={{ height: `${Math.max((value / maxMonthly) * 100, 8)}%` }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs uppercase tracking-[0.18em] text-navy/45">{label}</p>
                    <p className="mt-1 text-sm font-medium text-navy">{formatCurrency(value)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.4rem] bg-[#fbf7f0] px-5 py-5 text-sm leading-7 text-navy/68 md:col-span-4 xl:col-span-8">
                Revenue bars will appear as soon as successful payments are logged in the ERP.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Program-wise Revenue</p>
          <div className="mt-5 space-y-4">
            {programRevenue.map((program) => (
              <div key={program.name} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-navy">{program.name}</p>
                  <p className="text-sm font-medium text-navy">{formatCurrency(program.amount)}</p>
                </div>
                <div className="mt-3 h-3 rounded-full bg-[#fbf7f0]">
                  <div
                    className="h-3 rounded-full bg-[linear-gradient(90deg,#132b4d_0%,#d7a11e_100%)]"
                    style={{ width: `${Math.max(totalCollected > 0 ? (program.amount / totalCollected) * 100 : 0, program.amount > 0 ? 8 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
