"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero1 from "@/assets/hero1.jpg";
import hero2 from "@/assets/hero2.jpg";
import hero3 from "@/assets/hero3.jpg";
import hero4 from "@/assets/hero4.jpg";
import { siteConfig } from "@/lib/site";

const heroSlides = [hero1, hero2, hero3, hero4];

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroSlides.length);
    }, 4500);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden rounded-[2.25rem] bg-navy shadow-soft">
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <Image
            key={slide.src}
            src={slide}
            alt={`Shaarada Kuuta hero banner ${index + 1}`}
            fill
            priority={index === 0}
            className={`object-cover transition-all duration-1000 ${activeIndex === index ? "scale-100 opacity-100" : "scale-105 opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,22,43,0.88)_0%,rgba(9,22,43,0.72)_42%,rgba(9,22,43,0.38)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,164,54,0.28),transparent_30%)]" />
      </div>

      <div className="relative grid gap-10 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-14 lg:py-20">
        <div className="max-w-3xl">
          <p className="inline-flex rounded-full border border-gold/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-gold backdrop-blur">
            Premium Montessori in HSR Layout
          </p>
          <h1 className="mt-6 font-display text-4xl leading-tight text-white sm:text-5xl lg:text-6xl">
            Centre of Excellence in
            <span className="block text-gold">Holistic Child Development</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
            A warm, elegant learning house where young minds grow through Montessori-inspired experiences, emotional confidence, language-rich interactions, and purposeful care.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/admissions">Enroll Now</Button>
            <Button href="/contact" variant="secondary">Book a Visit</Button>
            <Button href={`tel:${siteConfig.phones[0]}`} variant="secondary">Call Now</Button>
            <Button href={`https://wa.me/${siteConfig.whatsappNumber}`} variant="secondary" className="inline-flex gap-2">
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button href="/parent" variant="ghost" className="text-ink">Parent Portal</Button>
          </div>
          <div className="mt-8 flex gap-2">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${activeIndex === index ? "w-10 bg-gold" : "w-2.5 bg-white/50"}`}
                aria-label={`View hero slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-4 self-end">
          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Programs at a glance</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Montessori Program",
                "Day Care",
                "After School Activities",
                "Summer Camp",
                "Creative Achievers",
                "Kannada Kasturi",
              ].map((item) => (
                <div key={item} className="rounded-3xl bg-white/10 px-4 py-4 text-sm font-medium text-white">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="ml-auto max-w-md rounded-[2rem] border border-gold/20 bg-cream p-6 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Parent-first experience</p>
            <p className="mt-3 text-sm leading-7 text-navy/75">
              Fast enquiries, visit booking, WhatsApp-first contact, and a scalable school platform built to grow into parent and teacher portals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
