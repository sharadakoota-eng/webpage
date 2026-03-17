import { siteConfig } from "@/lib/site";

export function StickyMobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-navy/10 bg-cream/95 p-3 backdrop-blur sm:hidden">
      <div className="grid grid-cols-4 gap-2">
        <a href={`tel:${siteConfig.phones[0]}`} className="rounded-full bg-navy px-3 py-3 text-center text-xs font-semibold text-cream">
          Call
        </a>
        <a href={`https://wa.me/${siteConfig.whatsappNumber}`} className="rounded-full bg-sage px-3 py-3 text-center text-xs font-semibold text-ink">
          WhatsApp
        </a>
        <a href="/admissions" className="rounded-full bg-gold px-3 py-3 text-center text-xs font-semibold text-ink">
          Enroll
        </a>
        <a href="/contact" className="rounded-full bg-sky px-3 py-3 text-center text-xs font-semibold text-ink">
          Visit
        </a>
      </div>
    </div>
  );
}
