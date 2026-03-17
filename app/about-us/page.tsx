import { PageHero } from "@/components/sections/page-hero";

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="About Us"
        title="A House of Learning crafted for thoughtful early childhood journeys"
        description="Shaarada Kuuta Montessori is envisioned as a premium, warm, elegant environment where children grow through purposeful experiences and parents feel deeply reassured."
      />
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <h2 className="font-display text-3xl text-navy">Our vision</h2>
          <p className="mt-4 text-base leading-8 text-navy/75">
            To create a centre of excellence in holistic child development, blending Montessori principles with communication, culture, emotional confidence, and caring community support.
          </p>
        </div>
        <div className="rounded-[2rem] bg-sky p-8 shadow-card">
          <h2 className="font-display text-3xl text-navy">Our promise to parents</h2>
          <p className="mt-4 text-base leading-8 text-navy/75">
            A school experience that feels premium without being distant, child-friendly without being childish, and operationally dependable from the first inquiry onward.
          </p>
        </div>
      </section>
      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: "Holistic child development",
            copy: "We value intellectual growth, communication, confidence, emotional balance, and cultural awareness as interconnected parts of childhood.",
          },
          {
            title: "Prepared environments",
            copy: "Our spaces are designed to feel calm, orderly, inviting, and rich with opportunity for child-led discovery.",
          },
          {
            title: "Strong parent partnership",
            copy: "From first inquiry to ongoing updates, the school experience is designed to be warm, transparent, and reassuring.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <h2 className="font-display text-2xl text-navy">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-navy/70">{item.copy}</p>
          </div>
        ))}
      </section>
      <section className="rounded-[2rem] bg-cream p-8 shadow-card">
        <h2 className="font-display text-3xl text-navy">What makes Shaarada Kuuta different</h2>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[
            "Premium Montessori identity with a warm, elegant tone",
            "Child-friendly without looking generic or childish",
            "Programs that support routine, care, creativity, and confidence",
            "Mobile-first parent communication and future-ready school operations",
          ].map((item) => (
            <div key={item} className="rounded-3xl bg-white px-5 py-4 text-sm font-medium text-navy shadow-card">
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
