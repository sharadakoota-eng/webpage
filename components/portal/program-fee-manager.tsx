"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ProgramFeeManagerProps = {
  programs: Array<{
    id: string;
    name: string;
    category: string;
    ageGroup: string;
    schedule?: string | null;
    isPublished: boolean;
    feeStructures: Array<{
      id: string;
      title: string;
      frequency: string;
      amount: string;
      taxPercentage?: string;
      description?: string | null;
    }>;
    programCosts: Array<{
      id: string;
      title: string;
      amount: string;
      costType: string;
      description?: string | null;
    }>;
  }>;
};

export function ProgramFeeManager({ programs }: ProgramFeeManagerProps) {
  const router = useRouter();
  const recurringPrograms = programs.filter((program) => program.category.toUpperCase() !== "CAMP");
  const campPrograms = programs.filter((program) => program.category.toUpperCase() === "CAMP");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [values, setValues] = useState({
    programId: recurringPrograms[0]?.id ?? "",
    title: "Monthly Fee",
    frequency: "Monthly",
    amount: "",
    taxPercentage: "",
    description: "",
  });
  const [costValues, setCostValues] = useState({
    programId: recurringPrograms[0]?.id ?? "",
    title: "Lead teacher salary",
    amount: "",
    description: "",
  });

  async function postAction(payload: Record<string, unknown>, successMessage: string) {
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/admin/programs-fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update program pricing.");
      }

      setStatus("success");
      setMessage(successMessage);
      setValues((current) => ({ ...current, amount: "", taxPercentage: "", description: "" }));
      setCostValues((current) => ({ ...current, amount: "", description: "" }));
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to update program pricing.");
    }
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className={`rounded-[1.3rem] px-4 py-3 text-sm ${status === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Fee Configuration</p>
          <h3 className="mt-2 font-display text-3xl text-navy">Set prices for every program and category</h3>
          <p className="mt-3 text-sm leading-7 text-navy/68">
            These fee structures should reflect back into admissions, parent portal pricing, and payment records. Use separate plans for monthly fee, full fee, admission fee, or material fee.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <select value={values.programId} onChange={(e) => setValues((c) => ({ ...c, programId: e.target.value }))} className="rounded-2xl border border-navy/10 px-4 py-3">
              {recurringPrograms.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
            <input value={values.title} onChange={(e) => setValues((c) => ({ ...c, title: e.target.value }))} placeholder="Fee title" className="rounded-2xl border border-navy/10 px-4 py-3" />
            <select value={values.frequency} onChange={(e) => setValues((c) => ({ ...c, frequency: e.target.value }))} className="rounded-2xl border border-navy/10 px-4 py-3">
              {["Monthly", "Quarterly", "Half-yearly", "Yearly", "One-time", "Term"].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <input value={values.amount} onChange={(e) => setValues((c) => ({ ...c, amount: e.target.value }))} placeholder="Amount" className="rounded-2xl border border-navy/10 px-4 py-3" />
            <select
              value={values.taxPercentage}
              onChange={(e) => setValues((c) => ({ ...c, taxPercentage: e.target.value }))}
              className="rounded-2xl border border-navy/10 px-4 py-3"
            >
              <option value="">No tax</option>
              <option value="5">GST 5%</option>
              <option value="12">GST 12%</option>
              <option value="18">GST 18%</option>
            </select>
            <input value={values.description} onChange={(e) => setValues((c) => ({ ...c, description: e.target.value }))} placeholder="Description" className="rounded-2xl border border-navy/10 px-4 py-3" />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                postAction(
                  {
                    action: "createFeeStructure",
                    ...values,
                    amount: Number(values.amount || 0),
                    taxPercentage: values.taxPercentage ? Number(values.taxPercentage) : undefined,
                  },
                  "Fee structure saved and linked to the selected program.",
                )
              }
              className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white"
            >
              {status === "loading" ? "Saving..." : "Add fee structure"}
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Program Pricing Snapshot</p>
          {campPrograms.length > 0 ? (
            <div className="mt-4 rounded-[1.25rem] bg-[#fff4e5] px-4 py-3 text-sm leading-7 text-[#9a6700]">
              Summer camp is excluded from recurring fee setup. Create summer-camp or one-off activity charges from the
              <span className="font-semibold text-navy"> Payments & Receipts </span>
              desk using manual invoices.
            </div>
          ) : null}
          <div className="mt-5 space-y-4">
            {programs.map((program) => (
              <div key={program.id} className="rounded-[1.4rem] border border-navy/10 px-5 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-navy">{program.name}</p>
                    <p className="mt-2 text-sm leading-7 text-navy/65">
                      {program.category} | {program.ageGroup} | {program.schedule ?? "Schedule pending"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      postAction(
                        { action: "toggleProgramVisibility", programId: program.id, isPublished: !program.isPublished },
                        `Program ${program.isPublished ? "hidden" : "published"} successfully.`,
                      )
                    }
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${program.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
                  >
                    {program.isPublished ? "Admission open" : "Admission closed"}
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {program.category.toUpperCase() === "CAMP" ? (
                    <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1d4ed8]">
                      Manual invoice only
                    </span>
                  ) : program.feeStructures.length > 0 ? (
                    program.feeStructures.map((fee) => (
                      <span key={fee.id} className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                        {fee.title}: Rs. {fee.amount}
                        {fee.taxPercentage ? ` + ${fee.taxPercentage}% GST` : ""}
                        {fee.description ? ` | ${fee.description}` : ""}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1d4ed8]">
                      No fee structure configured yet
                    </span>
                  )}
                  {program.programCosts.length > 0
                    ? program.programCosts.map((cost) => (
                        <span key={cost.id} className="rounded-full bg-[#f4f1ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b21a8]">
                          {cost.title}: Rs. {cost.amount}
                        </span>
                      ))
                    : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Program Salary & Cost Tracking</p>
        <h3 className="mt-2 font-display text-3xl text-navy">Track program salaries and operating costs</h3>
        <p className="mt-3 text-sm leading-7 text-navy/68">
          Use this for Montessori staff salaries or program-specific costs. These are internal-only and do not impact parent invoices.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <select value={costValues.programId} onChange={(e) => setCostValues((c) => ({ ...c, programId: e.target.value }))} className="rounded-2xl border border-navy/10 px-4 py-3">
            {recurringPrograms.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
          <input value={costValues.title} onChange={(e) => setCostValues((c) => ({ ...c, title: e.target.value }))} placeholder="Salary / Cost title" className="rounded-2xl border border-navy/10 px-4 py-3" />
          <input value={costValues.amount} onChange={(e) => setCostValues((c) => ({ ...c, amount: e.target.value }))} placeholder="Amount" className="rounded-2xl border border-navy/10 px-4 py-3" />
          <input value={costValues.description} onChange={(e) => setCostValues((c) => ({ ...c, description: e.target.value }))} placeholder="Notes (optional)" className="rounded-2xl border border-navy/10 px-4 py-3" />
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              postAction(
                {
                  action: "createProgramCost",
                  programId: costValues.programId,
                  title: costValues.title,
                  amount: Number(costValues.amount || 0),
                  description: costValues.description,
                },
                "Program cost saved successfully.",
              )
            }
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white"
          >
            {status === "loading" ? "Saving..." : "Add program cost"}
          </button>
        </div>
      </section>
    </div>
  );
}
