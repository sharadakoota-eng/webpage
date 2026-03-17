import { PageHero } from "@/components/sections/page-hero";

const testimonials = [
  {
    quote:
      "The school feels warm, thoughtful, and beautifully organized. We immediately felt it was built with care for both children and parents.",
    parent: "Ritika N.",
    child: "Parent of Vihaan",
  },
  {
    quote:
      "We loved the balance of structure, creativity, and communication. The overall environment feels premium and reassuring.",
    parent: "Karthik R.",
    child: "Parent of Anika",
  },
  {
    quote:
      "Our child became more expressive and excited about learning. The school feels like a true house of learning, not just a daycare.",
    parent: "Maya S.",
    child: "Parent of Aarav",
  },
];

export default function TestimonialsPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Testimonials"
        title="Trust is built through warmth, responsiveness, and visible child growth"
        description="The testimonial module is CMS-ready so the admin team can feature parent voices and stories from the school community."
      />
      <section className="grid gap-6 lg:grid-cols-3">
        {testimonials.map((item) => (
          <div key={item.parent} className="rounded-[1.75rem] bg-white p-6 shadow-card">
            <p className="text-base leading-8 text-navy/75">"{item.quote}"</p>
            <p className="mt-4 text-sm font-semibold text-gold">{item.parent}</p>
            <p className="text-sm text-navy/55">{item.child}</p>
          </div>
        ))}
      </section>
      <section className="rounded-[2rem] bg-cream p-8 shadow-card">
        <h2 className="font-display text-3xl text-navy">Why this page matters</h2>
        <p className="mt-4 text-base leading-8 text-navy/70">
          For a new school, testimonials create emotional trust. This page is designed so real parent stories can later be managed through the admin panel and featured across the website.
        </p>
      </section>
    </div>
  );
}
