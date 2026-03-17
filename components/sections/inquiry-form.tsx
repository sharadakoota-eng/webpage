"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inquirySchema } from "@/lib/validators";
import { programs } from "@/lib/content";

type InquiryFormValues = {
  parentName: string;
  childName?: string;
  childAge?: string;
  phone: string;
  email?: string;
  message?: string;
  programSlug?: string;
};

export function InquiryForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
  });

  const onSubmit = async (values: InquiryFormValues) => {
    try {
      setStatus("loading");
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Unable to submit inquiry");
      }

      reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-[2rem] bg-white p-6 shadow-card sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Start an inquiry</p>
          <h3 className="mt-2 font-display text-2xl text-navy">Let’s plan the right learning journey</h3>
        </div>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-navy">Parent name</span>
          <input {...register("parentName")} className="rounded-2xl border border-navy/10 px-4 py-3 outline-none ring-gold/20 focus:ring" />
          {errors.parentName && <span className="text-sm text-red-600">Parent name is required.</span>}
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-navy">Phone</span>
          <input {...register("phone")} className="rounded-2xl border border-navy/10 px-4 py-3 outline-none ring-gold/20 focus:ring" />
          {errors.phone && <span className="text-sm text-red-600">Valid phone is required.</span>}
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-navy">Child name</span>
          <input {...register("childName")} className="rounded-2xl border border-navy/10 px-4 py-3 outline-none ring-gold/20 focus:ring" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-navy">Child age</span>
          <input {...register("childAge")} className="rounded-2xl border border-navy/10 px-4 py-3 outline-none ring-gold/20 focus:ring" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-navy">Email</span>
          <input {...register("email")} className="rounded-2xl border border-navy/10 px-4 py-3 outline-none ring-gold/20 focus:ring" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-navy">Program</span>
          <select {...register("programSlug")} className="rounded-2xl border border-navy/10 px-4 py-3 outline-none ring-gold/20 focus:ring">
            <option value="">Select a program</option>
            {programs.map((program) => (
              <option key={program.slug} value={program.slug}>
                {program.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 sm:col-span-2">
          <span className="text-sm font-medium text-navy">Message</span>
          <textarea {...register("message")} rows={4} className="rounded-2xl border border-navy/10 px-4 py-3 outline-none ring-gold/20 focus:ring" />
        </label>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink disabled:opacity-60"
        >
          {status === "loading" ? "Submitting..." : "Submit Inquiry"}
        </button>
        {status === "success" && <p className="text-sm text-emerald-700">Inquiry submitted successfully.</p>}
        {status === "error" && <p className="text-sm text-red-600">Something went wrong. Please try again.</p>}
      </div>
    </form>
  );
}
