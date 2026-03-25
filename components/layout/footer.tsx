import { ArrowRight, Instagram, Youtube } from "lucide-react";
import Link from "next/link";
import { navigation } from "@/lib/content";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-navy/10 bg-[linear-gradient(180deg,#0f1f3d_0%,#09162b_100%)] text-cream">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_0.75fr_0.85fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Sharada Koota Montessori</p>
          <p className="mt-3 font-display text-3xl">A warm, premium home for meaningful early learning.</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-cream/75">
            Built for families who value elegance, trust, care, and a deeply thoughtful Montessori-inspired childhood journey.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink">
              Book a Visit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={`https://wa.me/${siteConfig.whatsappNumber}`} className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-cream">
              WhatsApp Us
            </a>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Quick Links</p>
          <div className="mt-4 grid gap-3">
            {navigation.slice(0, 8).map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-cream/80 hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Contact & Social</p>
          <div className="mt-4 space-y-3 text-sm text-cream/80">
            <p>{siteConfig.addressLines.join(", ")}</p>
            <p>{siteConfig.email}</p>
            <p>{siteConfig.phones.join(" / ")}</p>
            <div className="flex items-center gap-3 pt-3">
              <Link href={siteConfig.socialLinks.instagram} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15">
                <Instagram className="h-4 w-4" />
              </Link>
              <Link href={siteConfig.socialLinks.youtube} className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15">
                <Youtube className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-cream/55 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>Sharada Koota Montessori. All rights reserved.</p>
          <p>Designed for a premium, mobile-first parent experience.</p>
        </div>
      </div>
    </footer>
  );
}
