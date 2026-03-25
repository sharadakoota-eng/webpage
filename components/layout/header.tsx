"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { navigation } from "@/lib/content";
import { siteConfig } from "@/lib/site";

const primaryNavigation = navigation.filter((item) =>
  [
    "/",
    "/about-us",
    "/montessori-program",
    "/day-care",
    "/after-school-activities",
    "/summer-camp",
    "/kannada-kasturi",
    "/contact",
  ].includes(item.href),
);

const secondaryNavigation = navigation.filter((item) => !primaryNavigation.some((primaryItem) => primaryItem.href === item.href));

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-cream/90 shadow-[0_8px_24px_rgba(16,33,63,0.05)] backdrop-blur">
      <div className="mx-auto grid max-w-[1760px] grid-cols-[1fr_auto] items-center gap-4 px-4 py-4 sm:px-6 xl:grid-cols-[310px_minmax(0,1fr)_220px] xl:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="overflow-hidden rounded-full border border-gold/30 bg-navy/5 p-1 shadow-card">
            <Image src={logo} alt="Sharada Koota Montessori logo" className="h-16 w-16 rounded-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-display text-[18px] leading-tight text-navy">{siteConfig.name}</p>
            <p className="text-[10px] uppercase tracking-[0.28em] text-navy/60">{siteConfig.tagline}</p>
          </div>
        </Link>

        <nav className="relative hidden min-w-0 items-center justify-center xl:flex">
          <div className="flex w-full max-w-[980px] flex-nowrap items-center justify-center gap-4 rounded-full border border-navy/10 bg-white/80 px-6 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            {primaryNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="whitespace-nowrap text-[12.5px] font-semibold tracking-[-0.01em] text-navy/80 transition hover:text-navy"
              >
                {item.label}
              </Link>
            ))}

            <div className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((value) => !value)}
                className="inline-flex items-center gap-1 whitespace-nowrap text-[12.5px] font-semibold tracking-[-0.01em] text-navy/80 transition hover:text-navy"
              >
                More
                <ChevronDown className={`h-4 w-4 transition ${moreOpen ? "rotate-180" : ""}`} />
              </button>

              {moreOpen ? (
                <div className="absolute right-0 top-full mt-4 w-64 rounded-[1.5rem] border border-navy/10 bg-white p-3 shadow-soft">
                  <div className="grid gap-2">
                    {secondaryNavigation.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className="rounded-2xl px-4 py-3 text-sm font-semibold text-navy transition hover:bg-cream"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </nav>

        <div className="hidden items-center justify-end gap-3 xl:flex">
          <Link
            href="/login"
            className="rounded-full border border-navy/10 bg-white/75 px-4 py-3 text-sm font-semibold text-navy transition hover:border-gold/40 hover:text-ink"
          >
            Login
          </Link>
          <Link
            href="/admissions"
            className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-cream transition hover:bg-ink"
          >
            Enroll Now
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-navy/10 bg-white text-navy shadow-card xl:hidden"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-navy/10 bg-cream xl:hidden">
          <div className="mx-auto max-w-[1720px] space-y-4 px-4 py-4 sm:px-6">
            <div className="grid gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-navy shadow-card"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-navy/10 bg-white px-4 py-3 text-sm font-semibold text-navy"
              >
                Login
              </Link>
              <Link
                href="/admissions"
                onClick={() => setMobileOpen(false)}
                className="col-span-2 inline-flex items-center justify-center rounded-full bg-navy px-4 py-3 text-sm font-semibold text-cream"
              >
                Enroll Now
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
