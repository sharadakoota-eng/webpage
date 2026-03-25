import Image from "next/image";
import { Camera, HeartHandshake, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/sections/page-hero";
import galleryHeroImage from "@/assets/gallerypage.png";
import galleryDetailImage from "@/assets/gallerypage1.png";

const galleryMoments = [
  {
    title: "Prepared Montessori spaces",
    image: galleryHeroImage,
    copy: "Calm, orderly, beautiful environments that help families immediately sense intention and care.",
    height: "page-media-tall",
  },
  {
    title: "Classroom discovery",
    image: galleryDetailImage,
    copy: "Hands-on learning moments where curiosity, independence, and concentration become visible.",
    height: "page-media-short",
  },
  {
    title: "Programs in action",
    image: galleryHeroImage,
    copy: "A look at how Montessori, day care, enrichment, and seasonal programs actually feel in the environment.",
    height: "page-media-short",
  },
  {
    title: "Warm educator guidance",
    image: galleryDetailImage,
    copy: "Interactions that reassure parents that children are being guided with calmness, attention, and warmth.",
    height: "page-media-tall",
  },
];

const galleryTypes = [
  "Classroom spaces and Montessori materials",
  "Teacher-child interaction moments",
  "Creative work, enrichment, and events",
  "Seasonal programs and family visit moments",
];

export default function GalleryPage() {
  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Gallery"
        title="A visual story of care, curiosity, and everyday joy"
        description="The gallery helps families experience the atmosphere of Sharada Koota Montessori before they visit, making the website feel more real, emotional, and trustworthy."
      />

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="page-media">
            <Image src={galleryHeroImage} alt="Sharada Koota Montessori gallery hero" fill className="object-cover object-center" />
          </div>
          <div className="flex h-full flex-col justify-center p-8 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Why Gallery Matters</p>
            <h2 className="mt-3 font-display text-4xl text-navy sm:text-5xl">Families often trust what they can feel visually</h2>
            <p className="mt-5 text-base leading-8 text-navy/72">
              A strong school gallery is not just about attractive photographs. It helps parents understand tone, cleanliness, child-friendliness, warmth, and the emotional quality of the environment. Good visuals reduce hesitation and help families imagine their child here with confidence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/contact" className="px-7">
                Book a Visit
              </Button>
              <Button href="/admissions" variant="ghost" className="px-7">
                Start Admissions
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] bg-sky p-8 shadow-card lg:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">What Parents Notice First</p>
          <h2 className="mt-3 font-display text-4xl text-navy">Order, warmth, beauty, and a sense of calm</h2>
          <div className="mt-6 grid gap-4">
            {galleryTypes.map((item, index) => (
              <div
                key={item}
                className="stagger-rise journey-glow rounded-[1.5rem] border border-transparent bg-white px-5 py-4 text-sm leading-7 text-navy shadow-card"
                style={{ animationDelay: `${index * 90}ms` }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft lg:p-10">
          <div className="grid gap-4">
            {[
              {
                title: "Prepared and purposeful",
                copy: "The environment should feel intentional, child-scaled, and beautifully maintained.",
                icon: Sparkles,
              },
              {
                title: "Warm and reassuring",
                copy: "Families should be able to see care, supervision, and respectful interaction in the photographs.",
                icon: HeartHandshake,
              },
              {
                title: "Honest and inviting",
                copy: "A great gallery gives parents a real feel for the school instead of looking like a generic brochure.",
                icon: Camera,
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="stagger-rise rounded-[1.5rem] border border-white/10 bg-white/10 p-5 backdrop-blur"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-gold">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-white/78">{item.copy}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        {galleryMoments.map((item, index) => (
          <div
            key={item.title}
            className="stagger-rise overflow-hidden rounded-[1.9rem] bg-white shadow-card"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`relative overflow-hidden ${item.height}`}>
              <Image src={item.image} alt={item.title} fill className="object-cover object-center transition duration-700 hover:scale-[1.03]" />
            </div>
            <div className="p-6 lg:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Gallery Highlight</p>
              <h2 className="mt-2 font-display text-2xl text-navy">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-navy/65">{item.copy}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
