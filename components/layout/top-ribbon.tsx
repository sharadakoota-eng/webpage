import Link from "next/link";
import { Instagram, MapPin, Phone, Youtube } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function TopRibbon() {
  const instagramHref =
    siteConfig.socialLinks.instagram && siteConfig.socialLinks.instagram !== "#"
      ? siteConfig.socialLinks.instagram
      : "https://www.instagram.com/";
  const youtubeHref =
    siteConfig.socialLinks.youtube && siteConfig.socialLinks.youtube !== "#"
      ? siteConfig.socialLinks.youtube
      : "https://www.youtube.com/";

  return (
    <div className="border-b border-gold/20 bg-ink text-cream">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs sm:px-6 lg:px-8">
        <Link
          href={siteConfig.locationUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 text-cream/80 transition hover:text-white"
        >
          <MapPin className="h-3.5 w-3.5 text-gold" />
          <span>{siteConfig.ribbonLocation}</span>
        </Link>
        <div className="flex items-center gap-3">
          <a href={`tel:${siteConfig.phones[0]}`} className="inline-flex items-center gap-1.5 text-cream/80 transition hover:text-white">
            <Phone className="h-3.5 w-3.5 text-gold" />
            <span>{siteConfig.phones[0]}</span>
          </a>
          <a
            href={instagramHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-cream/80 transition hover:text-white"
          >
            <Instagram className="h-3.5 w-3.5 text-gold" />
            <span>Instagram</span>
          </a>
          <a
            href={youtubeHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-cream/80 transition hover:text-white"
          >
            <Youtube className="h-3.5 w-3.5 text-gold" />
            <span>YouTube</span>
          </a>
        </div>
      </div>
    </div>
  );
}
