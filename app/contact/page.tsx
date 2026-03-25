"use client";

import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHero } from "@/components/sections/page-hero";
import contactHeroImage from "@/assets/contact.png";
import contactVisitImage from "@/assets/contact1.png";
import { contactSchema, visitBookingSchema } from "@/lib/validators";
import { siteConfig } from "@/lib/site";

type ContactValues = {
  name: string;
  email?: string;
  phone?: string;
  childAge?: string;
  programInterest?: string;
  preferredContactMethod?: string;
  subject?: string;
  message: string;
};

type VisitValues = {
  parentName: string;
  phone: string;
  email?: string;
  childName?: string;
  childAge?: string;
  programInterest?: string;
  preferredTimeSlot?: string;
  visitDate: string;
  notes?: string;
};

const quickActions = [
  { label: "Call Admissions", value: "Direct front desk support" },
  { label: "WhatsApp Support", value: "Fast parent-friendly guidance" },
  { label: "Book a Visit", value: "Choose a convenient visit flow" },
  { label: "Send an Inquiry", value: "Structured follow-up from the team" },
];

export default function ContactPage() {
  const mapQuery = encodeURIComponent([...siteConfig.addressLines, "Karnataka, India"].join(", "));
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
        title="Plan a visit, speak with the front desk, or begin your admissions journey"
        description="This page is designed for mobile-first parent convenience with click-to-call access, WhatsApp support, visit booking, and structured inquiry follow-up."
      />

      <section className="overflow-hidden rounded-[2rem] bg-white shadow-card">
        <div className="grid gap-0 lg:grid-cols-[0.96fr_1.04fr]">
          <div className="page-media-tall">
            <Image src={contactHeroImage} alt="Sharada Koota Montessori contact and visit" fill className="object-cover object-center" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.08),rgba(16,33,63,0.42))]" />
          </div>
          <div className="flex h-full flex-col justify-center p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Visit With Confidence</p>
            <h2 className="mt-3 font-display text-4xl text-navy">A warm, responsive first experience for every family</h2>
            <p className="mt-4 text-base leading-8 text-navy/72">
              Parents often decide emotionally before they decide operationally. Our contact experience is designed to feel approachable, trustworthy, and beautifully organized from the very first interaction.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {quickActions.map((item) => (
                <div key={item.label} className="rounded-[1.5rem] bg-cream p-4 shadow-card">
                  <p className="text-xs uppercase tracking-[0.22em] text-gold">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-navy">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`tel:${siteConfig.phones[0]}`} className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink">
                Call Now
              </a>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-sage px-5 py-3 text-sm font-semibold text-ink transition hover:brightness-95"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[2rem] bg-white shadow-card">
            <div className="page-media">
              <Image src={contactVisitImage} alt="Parent visit at Sharada Koota Montessori" fill className="object-cover object-center" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,33,63,0.08),rgba(16,33,63,0.38))]" />
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">School Details</p>
            <h2 className="mt-3 font-display text-3xl text-navy">Find us in HSR Layout</h2>
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
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-sage px-5 py-3 text-sm font-semibold text-ink"
              >
                WhatsApp
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] bg-[linear-gradient(135deg,#0f2242_0%,#18325b_55%,#21406b_100%)] p-8 text-white shadow-soft">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Before You Visit</p>
            <div className="mt-5 grid gap-4">
              {[
                "Bring your child along if you would like them to experience the environment.",
                "Use the visit form below to request a preferred date and time.",
                "Our team will guide you through programs, admissions, and next steps.",
              ].map((item, index) => (
                <div
                  key={item}
                  className="stagger-rise rounded-[1.5rem] border border-white/10 bg-white/10 p-4 text-sm leading-7 text-white/82 backdrop-blur"
                  style={{ animationDelay: `${index * 120}ms` }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-cream p-6 shadow-card">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">School Location</p>
              <a
                href={siteConfig.locationUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-navy shadow-card transition hover:-translate-y-0.5"
              >
                Open in Google Maps
              </a>
            </div>
            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-navy/10 bg-white">
              <iframe
                title="Sharada Koota Montessori location"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="h-80 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <form onSubmit={submitContact} className="rounded-[2rem] bg-white p-8 shadow-card">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Inquiry Form</p>
            <h2 className="mt-3 font-display text-3xl text-navy">Tell us how we can help</h2>
            <p className="mt-3 text-sm leading-7 text-navy/70">
              Share your question, preferred program, or admissions interest and our team will respond with the right guidance.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Best for", value: "Admissions questions" },
                { label: "Response", value: "Warm guided follow-up" },
                { label: "Convenience", value: "Call or WhatsApp support" },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.35rem] bg-cream p-4 shadow-card">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gold">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-navy">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input {...contactForm.register("name")} placeholder="Your name" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input {...contactForm.register("phone")} placeholder="Phone" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input {...contactForm.register("email")} placeholder="Email" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input {...contactForm.register("subject")} placeholder="Subject" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input {...contactForm.register("childAge")} placeholder="Child age" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <select {...contactForm.register("programInterest")} className="rounded-2xl border border-navy/10 px-4 py-3 text-navy/75">
                <option value="">Program interested in</option>
                <option value="Montessori Program">Montessori Program</option>
                <option value="Day Care">Day Care</option>
                <option value="After School Activities">After School Activities</option>
                <option value="Summer Camp">Summer Camp</option>
                <option value="Kannada Kasturi">Kannada Kasturi</option>
                <option value="Admissions">Admissions</option>
              </select>
              <select {...contactForm.register("preferredContactMethod")} className="rounded-2xl border border-navy/10 px-4 py-3 text-navy/75 sm:col-span-2">
                <option value="">Preferred contact method</option>
                <option value="Phone call">Phone call</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
              </select>
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
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">School Visit Booking</p>
            <h2 className="mt-3 font-display text-3xl text-navy">Book a school visit</h2>
            <p className="mt-3 text-sm leading-7 text-navy/70">
              Choose a preferred date and tell us a little about your child so we can make the visit more helpful and personal.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Visit type", value: "Guided school walkthrough" },
                { label: "Includes", value: "Program and admissions guidance" },
                { label: "Good for", value: "First-time parent visits" },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.35rem] bg-white/80 p-4 shadow-card">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gold">{item.label}</p>
                  <p className="mt-2 text-sm font-medium text-navy">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input {...visitForm.register("parentName")} placeholder="Parent name" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input {...visitForm.register("phone")} placeholder="Phone" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input {...visitForm.register("email")} placeholder="Email" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input {...visitForm.register("childName")} placeholder="Child name" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <input {...visitForm.register("childAge")} placeholder="Child age" className="rounded-2xl border border-navy/10 px-4 py-3" />
              <select {...visitForm.register("programInterest")} className="rounded-2xl border border-navy/10 px-4 py-3 text-navy/75">
                <option value="">Program interested in</option>
                <option value="Montessori Program">Montessori Program</option>
                <option value="Day Care">Day Care</option>
                <option value="After School Activities">After School Activities</option>
                <option value="Summer Camp">Summer Camp</option>
                <option value="Kannada Kasturi">Kannada Kasturi</option>
              </select>
              <select {...visitForm.register("preferredTimeSlot")} className="rounded-2xl border border-navy/10 px-4 py-3 text-navy/75 sm:col-span-2">
                <option value="">Preferred time slot</option>
                <option value="Morning">Morning</option>
                <option value="Midday">Midday</option>
                <option value="Afternoon">Afternoon</option>
              </select>
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
