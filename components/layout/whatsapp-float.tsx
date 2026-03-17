import { MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${siteConfig.whatsappNumber}`}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-sage text-sm font-bold text-ink shadow-soft transition hover:scale-105 sm:bottom-6"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
