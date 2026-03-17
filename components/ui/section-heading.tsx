type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={`max-w-3xl ${alignment}`}>
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-gold">{eyebrow}</p>
      <h2 className="mt-4 font-display text-3xl text-navy sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-navy/70">{description}</p>
    </div>
  );
}
