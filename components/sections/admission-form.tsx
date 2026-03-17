"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { admissionSchema } from "@/lib/validators";
import { programs } from "@/lib/content";

type AdmissionFormValues = {
  parentName: string;
  childName: string;
  childDob: string;
  phone: string;
  email?: string;
  notes?: string;
  programSlug?: string;
};

export function AdmissionForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
  });

  const onSubmit = async (values: AdmissionFormValues) => {
    try {
      setStatus("loading");
      const response = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error();
      reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-[2rem] bg-white p-8 shadow-card">
      <h2 className="font-display text-3xl text-navy">Start admission</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <input {...register("parentName")} placeholder="Parent name" className="rounded-2xl border border-navy/10 px-4 py-3" />
        <input {...register("phone")} placeholder="Phone" className="rounded-2xl border border-navy/10 px-4 py-3" />
        <input {...register("childName")} placeholder="Child name" className="rounded-2xl border border-navy/10 px-4 py-3" />
        <input type="date" {...register("childDob")} className="rounded-2xl border border-navy/10 px-4 py-3" />
        <input {...register("email")} placeholder="Email" className="rounded-2xl border border-navy/10 px-4 py-3" />
        <select {...register("programSlug")} className="rounded-2xl border border-navy/10 px-4 py-3">
          <option value="">Select program</option>
          {programs.map((program) => (
            <option key={program.slug} value={program.slug}>
              {program.title}
            </option>
          ))}
        </select>
        <textarea {...register("notes")} rows={4} placeholder="Notes" className="rounded-2xl border border-navy/10 px-4 py-3 sm:col-span-2" />
      </div>
      <div className="mt-4 space-y-1">
        {Object.keys(errors).length > 0 ? (
          <p className="text-sm text-red-600">Please complete all required admission details correctly.</p>
        ) : null}
      </div>
      <div className="mt-5 flex items-center gap-4">
        <button className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
          {status === "loading" ? "Submitting..." : "Submit admission form"}
        </button>
        {status === "success" && <p className="text-sm text-emerald-700">Admission submitted successfully.</p>}
        {status === "error" && <p className="text-sm text-red-600">Please try again.</p>}
      </div>
    </form>
  );
}
