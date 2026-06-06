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
      feeCode?: string | null;
      title: string;
      frequency: string;
      amount: string;
      isEnabled?: boolean;
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

const standardFeeTypes = [
  { feeCode: "ADMISSION_FEE", title: "Admission Fee", frequency: "One-time" },
  { feeCode: "MONTHLY_FEE", title: "Monthly Fee", frequency: "Monthly" },
  { feeCode: "HALF_YEARLY_FEE", title: "Half-Yearly Fee", frequency: "Half-yearly" },
  { feeCode: "ANNUAL_FEE", title: "Annual Fee", frequency: "Annual" },
  { feeCode: "BOOK_FEE", title: "Book Fee", frequency: "One-time" },
  { feeCode: "EXAM_FEE", title: "Exam Fee", frequency: "Term" },
  { feeCode: "UNIFORM_FEE", title: "Uniform Fee", frequency: "One-time" },
  { feeCode: "TRANSPORT_FEE", title: "Transport Fee", frequency: "Monthly" },
] as const;

export function ProgramFeeManager({ programs }: ProgramFeeManagerProps) {
  const router = useRouter();
  const recurringPrograms = programs.filter((program) => program.category.toUpperCase() !== "CAMP");
  const campPrograms = programs.filter((program) => program.category.toUpperCase() === "CAMP");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [costValues, setCostValues] = useState({
    programId: recurringPrograms[0]?.id ?? "",
    title: "Lead teacher salary",
    amount: "",
    description: "",
  });
  const [standardProgramId, setStandardProgramId] = useState(recurringPrograms[0]?.id ?? "");
  const [standardFees, setStandardFees] = useState(() => buildStandardFees(recurringPrograms[0]));

  function buildStandardFees(program: ProgramFeeManagerProps["programs"][number] | undefined) {
    return standardFeeTypes.map((feeType) => {
      const existing = program?.feeStructures.find((fee) => fee.feeCode === feeType.feeCode || fee.title.toLowerCase() === feeType.title.toLowerCase());
      return {
        ...feeType,
        enabled: existing?.isEnabled ?? Boolean(existing),
        amount: existing?.amount ?? "",
      };
    });
  }

  function changeStandardProgram(programId: string) {
    const program = recurringPrograms.find((item) => item.id === programId);
    setStandardProgramId(programId);
    setStandardFees(buildStandardFees(program));
  }

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
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Simple Fee Setup</p>
          <h3 className="mt-2 font-display text-3xl text-navy">Configure default fees in one form</h3>
          <p className="mt-3 text-sm leading-7 text-navy/68">
            These defaults apply to new students in the selected program. Student-level overrides should be used only for transport, uniform, admission, or special charges.
          </p>
          <div className="mt-6 grid gap-4">
            <select value={standardProgramId} onChange={(e) => changeStandardProgram(e.target.value)} className="rounded-2xl border border-navy/10 px-4 py-3">
              {recurringPrograms.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
            <div className="grid gap-3">
              {standardFees.map((fee, index) => (
                <div key={fee.feeCode} className="grid gap-3 rounded-[1.15rem] bg-[#fbf7f0] p-4 md:grid-cols-[1fr_160px] md:items-center">
                  <label className="flex items-center gap-3 text-sm font-semibold text-navy">
                    <input
                      type="checkbox"
                      checked={fee.enabled}
                      onChange={(event) =>
                        setStandardFees((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, enabled: event.target.checked } : item)))
                      }
                    />
                    {fee.title}
                    <span className="text-xs font-normal text-navy/55">{fee.frequency}</span>
                  </label>
                  <input
                    value={fee.amount}
                    onChange={(event) =>
                      setStandardFees((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, amount: event.target.value } : item)))
                    }
                    placeholder="Amount"
                    disabled={!fee.enabled}
                    className="rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm disabled:opacity-50"
                  />
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                postAction(
                  {
                    action: "saveStandardFees",
                    programId: standardProgramId,
                    fees: standardFees.map((fee) => ({
                      feeCode: fee.feeCode,
                      title: fee.title,
                      frequency: fee.frequency,
                      enabled: fee.enabled,
                      amount: Number(fee.amount || 0),
                    })),
                  },
                  "Default fee configuration saved.",
                )
              }
              className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white"
            >
              {status === "loading" ? "Saving..." : "Save default fees"}
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
