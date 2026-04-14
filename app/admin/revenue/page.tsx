import { InvoiceStatus } from "@prisma/client";
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

  const monthlyMap = new Map<string, { label: string; value: number }>();
  for (const payment of payments) {
    const date = payment.paidAt ?? payment.createdAt;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("en-IN", { month: "short", year: "2-digit" }).format(date);
    const entry = monthlyMap.get(key);
    if (entry) {
      entry.value += Number(payment.amount);
    } else {
      monthlyMap.set(key, { label, value: Number(payment.amount) });
    }
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
  const monthlySeries = Array.from(monthlyMap.entries())
    .map(([key, entry]) => ({ key, label: entry.label, value: entry.value }))
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-8);
  const maxMonthly = Math.max(...monthlySeries.map((item) => item.value), 1);
  const linePoints =
    monthlySeries.length > 1
      ? monthlySeries
          .map((item, index) => {
            const x = (index / (monthlySeries.length - 1)) * 100;
            const y = 36 - Math.round((item.value / maxMonthly) * 30);
            return `${x},${y}`;
          })
          .join(" ")
      : "50,18";
  const pendingInvoices = invoices.filter((invoice) => invoice.status !== InvoiceStatus.PAID);
  const dueByProgram = programs.map((program) => {
    const programInvoices = invoices.filter((invoice) => invoice.student.enrollments[0]?.programId === program.id);
    const programPaid = payments
      .filter((payment) => payment.invoice.student.enrollments[0]?.programId === program.id)
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
    const programExpected = programInvoices.reduce((sum, invoice) => sum + Number(invoice.amount), 0);
    return {
      name: program.name,
      expected: programExpected,
      paid: programPaid,
      due: Math.max(programExpected - programPaid, 0),
    };
  });

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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Revenue Performance</p>
              <h2 className="mt-2 font-display text-2xl text-navy">Monthly collection trend</h2>
              <p className="mt-2 text-sm text-navy/60">Track the most recent months of receipts with a cleaner visual trend line.</p>
            </div>
            <div className="rounded-full bg-[#fbf7f0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-navy/60">
              Last {Math.max(monthlySeries.length, 1)} months
            </div>
          </div>

          <div className="mt-6 rounded-[1.6rem] border border-navy/10 bg-[#fbf7f0] p-5">
            {monthlySeries.length > 0 ? (
              <div className="space-y-4">
                <svg viewBox="0 0 100 40" className="h-28 w-full">
                  <defs>
                    <linearGradient id="revenue-line" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#d7a11e" />
                      <stop offset="100%" stopColor="#132b4d" />
                    </linearGradient>
                  </defs>
                  <polyline points={linePoints} fill="none" stroke="url(#revenue-line)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {monthlySeries.map((item, index) => {
                    const x = monthlySeries.length > 1 ? (index / (monthlySeries.length - 1)) * 100 : 50;
                    const y = 36 - Math.round((item.value / maxMonthly) * 30);
                    return <circle key={item.key} cx={x} cy={y} r="2.5" fill="#132b4d" />;
                  })}
                </svg>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {monthlySeries.map((item) => (
                    <div key={item.key} className="rounded-[1rem] bg-white px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-navy/45">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-navy">{formatCurrency(item.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[1.2rem] bg-white px-5 py-5 text-sm leading-7 text-navy/68">
                Revenue trends will appear once successful payments are logged.
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

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Outstanding by Program</p>
          <div className="mt-5 space-y-4">
            {dueByProgram.map((program) => (
              <div key={program.name} className="rounded-[1.35rem] border border-navy/10 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-semibold text-navy">{program.name}</p>
                  <p className="text-sm font-medium text-navy">{formatCurrency(program.due)}</p>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-navy/45">
                  Collected {formatCurrency(program.paid)} / Expected {formatCurrency(program.expected)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Pending Invoices</p>
          <div className="mt-5 space-y-4">
            {pendingInvoices.length > 0 ? (
              pendingInvoices.slice(0, 8).map((invoice) => (
                <div key={invoice.id} className="rounded-[1.3rem] border border-navy/10 px-5 py-4">
                  <p className="font-semibold text-navy">{invoice.invoiceNumber}</p>
                  <p className="mt-2 text-sm text-navy/70">
                    {invoice.student.firstName} {invoice.student.lastName ?? ""} | {formatCurrency(Number(invoice.amount))}
                  </p>
                  <p className="mt-1 text-xs text-navy/50">Due {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(invoice.dueDate)}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[1.3rem] bg-[#fbf7f0] px-5 py-4 text-sm text-navy/68">
                No pending invoices yet.
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
