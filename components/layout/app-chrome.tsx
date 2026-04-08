"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StickyMobileBar } from "@/components/layout/sticky-mobile-bar";
import { TopRibbon } from "@/components/layout/top-ribbon";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { SpecialEventPopup } from "@/components/layout/special-event-popup";

const HIDE_CHROME_PREFIXES = ["/login", "/portal", "/admin", "/teacher", "/parent", "/admission-form"];

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = HIDE_CHROME_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (hideChrome) {
    return (
      <>
        <main>{children}</main>
        <SpecialEventPopup />
      </>
    );
  }

  return (
    <>
      <TopRibbon />
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      <Footer />
      <WhatsAppFloat />
      <SpecialEventPopup />
      <StickyMobileBar />
    </>
  );
}
