import Image from "next/image";
import { PageHero } from "@/components/sections/page-hero";
import galleryImage from "@/assets/gallery.jpg";

const galleryItems = [
  "Prepared Montessori environment",
  "Circle time and storytelling",
  "Hands-on learning stations",
  "Creative summer activities",
  "Celebration and cultural moments",
  "Parent engagement snapshots",
];

export default function GalleryPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Gallery"
        title="A visual story of learning, care, and joyful discovery"
        description="The gallery module is designed to work with Cloudinary so the school can publish and organize future photos with low operational effort."
      />
      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[22rem]">
            <Image src={galleryImage} alt="Shaarada Kuuta gallery hero" fill className="object-cover" />
          </div>
          <div className="p-8">
            <h2 className="font-display text-3xl text-navy">Moments that help families feel the school</h2>
            <p className="mt-4 text-base leading-8 text-navy/70">
              Strong school photography is one of the biggest trust builders for a new institution. This gallery is designed to highlight learning spaces, child engagement, teacher warmth, and the overall environment.
            </p>
          </div>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {galleryItems.map((item, index) => (
          <div key={item} className="overflow-hidden rounded-[1.75rem] bg-white shadow-card">
            <div className={`h-56 ${index % 3 === 0 ? "bg-gradient-to-br from-sand via-cream to-sky" : index % 3 === 1 ? "bg-gradient-to-br from-sky via-cream to-sage" : "bg-gradient-to-br from-peach via-cream to-sand"}`} />
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Gallery {index + 1}</p>
              <h2 className="mt-2 font-display text-2xl text-navy">{item}</h2>
              <p className="mt-3 text-sm leading-7 text-navy/65">
                This section can later be replaced with actual Cloudinary-powered school photography from your live admin panel.
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
