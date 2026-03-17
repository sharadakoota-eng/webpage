import Link from "next/link";
import { Instagram, MapPin, Youtube } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function TopRibbon() {
  return (
    <div className="border-b border-gold/20 bg-ink text-cream">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-cream/80">
          <MapPin className="h-3.5 w-3.5 text-gold" />
          <span>{siteConfig.ribbonLocation}</span>
        </div>
        <div className="flex items-center gap-3">
          <a href={`tel:${siteConfig.phones[0]}`} className="text-cream/80 transition hover:text-white">
            Call: {siteConfig.phones[0]}
          </a>
          <Link href={siteConfig.socialLinks.instagram} className="inline-flex items-center gap-1 text-cream/80 transition hover:text-white">
            <Instagram className="h-3.5 w-3.5 text-gold" />
            <span>Instagram</span>
          </Link>
          <Link href={siteConfig.socialLinks.youtube} className="inline-flex items-center gap-1 text-cream/80 transition hover:text-white">
            <Youtube className="h-3.5 w-3.5 text-gold" />
            <span>YouTube</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
