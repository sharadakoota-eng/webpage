type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,rgba(214,164,54,0.25),transparent_26%),linear-gradient(135deg,#09162b_0%,#10213f_55%,#1b355d_100%)] px-6 py-12 text-white shadow-soft sm:px-10 sm:py-16">
      <div className="absolute -right-10 top-6 h-36 w-36 rounded-full border border-white/10" />
      <div className="absolute bottom-6 right-20 h-24 w-24 rounded-full border border-gold/20" />
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
      <h1 className="mt-5 max-w-3xl font-display text-4xl sm:text-5xl">{title}</h1>
      <p className="mt-5 max-w-3xl text-base leading-8 text-white/75">{description}</p>
    </section>
  );
}
