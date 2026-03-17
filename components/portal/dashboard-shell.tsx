import Link from "next/link";

type DashboardShellProps = {
  title: string;
  subtitle: string;
  stats: { label: string; value: string }[];
  cards: { title: string; description: string; href?: string }[];
};

export function DashboardShell({ title, subtitle, stats, cards }: DashboardShellProps) {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-navy px-6 py-10 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">Portal</p>
        <h1 className="mt-3 font-display text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-white/75">{subtitle}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-sm text-navy/60">{stat.label}</p>
            <p className="mt-3 font-display text-3xl text-navy">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {cards.map((card) => (
          <div key={card.title} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <h2 className="font-display text-2xl text-navy">{card.title}</h2>
            <p className="mt-3 text-sm leading-7 text-navy/70">{card.description}</p>
            {card.href ? (
              <Link href={card.href} className="mt-4 inline-flex text-sm font-semibold text-gold">
                Open module
              </Link>
            ) : null}
          </div>
        ))}
      </section>
    </div>
  );
}
