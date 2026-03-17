"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHero } from "@/components/sections/page-hero";
import homeImage from "@/assets/home.jpg";
import { contactSchema, visitBookingSchema } from "@/lib/validators";
import { siteConfig } from "@/lib/site";

type ContactValues = {
  name: string;
  email?: string;
  phone?: string;
  subject?: string;
  message: string;
};

type VisitValues = {
  parentName: string;
  phone: string;
  email?: string;
  childName?: string;
  visitDate: string;
  notes?: string;
};

export default function ContactPage() {
  const [contactStatus, setContactStatus] = useState("idle");
  const [visitStatus, setVisitStatus] = useState("idle");
  const contactForm = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });
  const visitForm = useForm<VisitValues>({ resolver: zodResolver(visitBookingSchema) });

  const submitContact = contactForm.handleSubmit(async (values) => {
    try {
      setContactStatus("loading");
      const response = await fetch("/api/contact-submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error();
      contactForm.reset();
      setContactStatus("success");
    } catch {
      setContactStatus("error");
    }
  });

  const submitVisit = visitForm.handleSubmit(async (values) => {
    try {
      setVisitStatus("loading");
      const response = await fetch("/api/visit-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error();
      visitForm.reset();
      setVisitStatus("success");
    } catch {
      setVisitStatus("error");
    }
  });

  return (
    <div className="space-y-8">
      <PageHero
        eyebrow="Contact Us"
        title="Let's plan a visit, answer your questions, or start an admission journey"
        description="This page is optimized for mobile-first parent behaviour with click-to-call actions, WhatsApp support, and school visit booking."
      />

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-[22rem]">
            <Image src={homeImage} alt="Visit Shaarada Kuuta Montessori" fill className="object-cover" />
          </div>
          <div className="p-8">
            <h2 className="font-display text-3xl text-navy">Visit the school with confidence</h2>
            <p className="mt-4 text-base leading-8 text-navy/70">
              Parents often decide emotionally before they decide operationally. This contact experience is designed to make the school feel approachable, organized, and warm from the very first interaction.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                "Click-to-call support",
                "WhatsApp-first parent convenience",
                "Structured visit booking flow",
                "Front-desk notification triggers",
              ].map((item) => (
                <div key={item} className="rounded-3xl bg-cream px-4 py-4 text-sm font-medium text-navy shadow-card">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <h2 className="font-display text-3xl text-navy">School details</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-navy/75">
            <p>{siteConfig.addressLines.join(", ")}</p>
            <p>Email: {siteConfig.email}</p>
            <p>Phone: {siteConfig.phones.join(" / ")}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={`tel:${siteConfig.phones[0]}`} className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
              Call 1
            </a>
            <a href={`tel:${siteConfig.phones[1]}`} className="rounded-full bg-sky px-5 py-3 text-sm font-semibold text-ink">
              Call 2
            </a>
            <a href={`https://wa.me/${siteConfig.whatsappNumber}`} className="rounded-full bg-sage px-5 py-3 text-sm font-semibold text-ink">
              WhatsApp
            </a>
          </div>
          <div className="mt-8 rounded-[1.75rem] bg-cream p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Map Placeholder</p>
            <div className="mt-4 h-64 rounded-[1.5rem] bg-sand/50" />
          </div>
        </div>

        <div className="grid gap-6">
          <form onSubmit={submitContact} className="rounded-[2rem] bg-white p-8 shadow-card">
            <h2 className="font-display text-3xl text-navy">Inquiry form</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input {...contactForm.register("name")} placeholder="Your name" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input {...contactForm.register("phone")} placeholder="Phone" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input {...contactForm.register("email")} placeholder="Email" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input {...contactForm.register("subject")} placeholder="Subject" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <textarea {...contactForm.register("message")} rows={4} placeholder="Message" className="rounded-2xl border border-navy/10 px-4 py-3 sm:col-span-2" />
            </div>
            <div className="mt-5 flex items-center gap-4">
              <button className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
                {contactStatus === "loading" ? "Submitting..." : "Send message"}
              </button>
              {contactStatus === "success" && <p className="text-sm text-emerald-700">Message sent.</p>}
              {contactStatus === "error" && <p className="text-sm text-red-600">Please try again.</p>}
            </div>
          </form>

          <form onSubmit={submitVisit} className="rounded-[2rem] bg-sky p-8 shadow-card">
            <h2 className="font-display text-3xl text-navy">Book a school visit</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input {...visitForm.register("parentName")} placeholder="Parent name" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input {...visitForm.register("phone")} placeholder="Phone" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input {...visitForm.register("email")} placeholder="Email" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input {...visitForm.register("childName")} placeholder="Child name" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input type="date" {...visitForm.register("visitDate")} className="rounded-2xl border border-navy/10 px-4 py-3 sm:col-span-2" />
              <textarea {...visitForm.register("notes")} rows={3} placeholder="Notes" className="rounded-2xl border border-navy/10 px-4 py-3 sm:col-span-2" />
            </div>
            <div className="mt-5 flex items-center gap-4">
              <button className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
                {visitStatus === "loading" ? "Booking..." : "Book visit"}
              </button>
              {visitStatus === "success" && <p className="text-sm text-emerald-700">Visit booked.</p>}
              {visitStatus === "error" && <p className="text-sm text-red-600">Please try again.</p>}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
