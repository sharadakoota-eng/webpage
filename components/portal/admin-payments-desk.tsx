"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type AdminPaymentsDeskProps = {
  students: Array<{
    id: string;
    label: string;
    parentLabel: string;
    classLabel?: string;
  }>;
  programs: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    amount: string;
    studentLabel: string;
  }>;
};

export function AdminPaymentsDesk({ students, programs, invoices }: AdminPaymentsDeskProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [manualInvoice, setManualInvoice] = useState({
    studentId: students[0]?.id ?? "",
    programId: "",
    title: "Summer Camp Activity",
    amount: "",
    dueDate: "",
  });
  const [cashPayment, setCashPayment] = useState({
    invoiceId: invoices[0]?.id ?? "",
    amount: "",
    reference: "",
  });

  function postAction(payload: Record<string, unknown>, successMessage: string) {
    setMessage("");
    startTransition(async () => {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string };
      if (!response.ok || !result.success) {
        setMessage(result.message ?? "Unable to update finance desk.");
        return;
      }

      setMessage(result.message ?? successMessage);
      if (payload.action === "createManualInvoice") {
        setManualInvoice((current) => ({ ...current, title: "Summer Camp Activity", amount: "", dueDate: "" }));
      }
      if (payload.action === "recordCashPayment") {
        setCashPayment((current) => ({ ...current, amount: "", reference: "" }));
      }
      router.refresh();
    });
  }

  const campPrograms = programs.filter((program) => program.category === "CAMP");
  const selectedStudent = students.find((student) => student.id === manualInvoice.studentId);

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Manual Invoice Desk</p>
        <h2 className="mt-2 font-display text-3xl text-navy">Create summer camp or special activity invoices</h2>
        <p className="mt-3 text-sm leading-7 text-navy/68">
          Summer camp and ad-hoc activities should not depend on recurring program fee rules. Create them manually here.
        </p>

        <div className="mt-6 grid gap-4">
          <select
            value={manualInvoice.studentId}
            onChange={(event) => setManualInvoice((current) => ({ ...current, studentId: event.target.value }))}
            className="rounded-2xl border border-navy/10 px-4 py-3"
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.label}
              </option>
            ))}
          </select>
          {selectedStudent ? (
            <div className="rounded-[1.35rem] bg-[#fbf7f0] px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Billing preview</p>
              <div className="mt-3 space-y-2 text-sm text-navy/72">
                <p className="font-semibold text-navy">{selectedStudent.label}</p>
                <p>Parent: {selectedStudent.parentLabel}</p>
                <p>Class: {selectedStudent.classLabel ?? "Pending assignment"}</p>
              </div>
            </div>
          ) : null}
          <select
            value={manualInvoice.programId}
            onChange={(event) => setManualInvoice((current) => ({ ...current, programId: event.target.value }))}
            className="rounded-2xl border border-navy/10 px-4 py-3"
          >
            <option value="">No linked program</option>
            {campPrograms.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
          <input
            value={manualInvoice.title}
            onChange={(event) => setManualInvoice((current) => ({ ...current, title: event.target.value }))}
            placeholder="Activity name"
            className="rounded-2xl border border-navy/10 px-4 py-3"
          />
          <div className="grid gap-4 md:grid-cols-2">
            <input
              value={manualInvoice.amount}
              onChange={(event) => setManualInvoice((current) => ({ ...current, amount: event.target.value }))}
              placeholder="Amount"
              className="rounded-2xl border border-navy/10 px-4 py-3"
            />
            <input
              type="date"
              value={manualInvoice.dueDate}
              onChange={(event) => setManualInvoice((current) => ({ ...current, dueDate: event.target.value }))}
              className="rounded-2xl border border-navy/10 px-4 py-3"
            />
          </div>
        </div>

        <button
          type="button"
          disabled={isPending || !manualInvoice.studentId || !manualInvoice.title.trim() || !manualInvoice.amount}
          onClick={() =>
            postAction(
              {
                action: "createManualInvoice",
                studentId: manualInvoice.studentId,
                programId: manualInvoice.programId,
                title: manualInvoice.title,
                amount: Number(manualInvoice.amount),
                dueDate: manualInvoice.dueDate,
              },
              "Manual invoice created successfully.",
            )
          }
          className="mt-5 rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Create invoice"}
        </button>
      </div>

      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Cash Payment Approval</p>
        <h2 className="mt-2 font-display text-3xl text-navy">Record manual cash collections</h2>
        <p className="mt-3 text-sm leading-7 text-navy/68">
          If a parent pays offline, admin can mark the amount here and release the receipt without using Razorpay.
        </p>

        <div className="mt-6 grid gap-4">
          <select
            value={cashPayment.invoiceId}
            onChange={(event) => setCashPayment((current) => ({ ...current, invoiceId: event.target.value }))}
            className="rounded-2xl border border-navy/10 px-4 py-3"
          >
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoiceNumber} - {invoice.studentLabel}
              </option>
            ))}
          </select>
          <input
            value={cashPayment.amount}
            onChange={(event) => setCashPayment((current) => ({ ...current, amount: event.target.value }))}
            placeholder="Amount received"
            className="rounded-2xl border border-navy/10 px-4 py-3"
          />
          <input
            value={cashPayment.reference}
            onChange={(event) => setCashPayment((current) => ({ ...current, reference: event.target.value }))}
            placeholder="Cash note / receipt reference"
            className="rounded-2xl border border-navy/10 px-4 py-3"
          />
        </div>

        <button
          type="button"
          disabled={isPending || !cashPayment.invoiceId}
          onClick={() =>
            postAction(
              {
                action: "recordCashPayment",
                invoiceId: cashPayment.invoiceId,
                amount: cashPayment.amount ? Number(cashPayment.amount) : undefined,
                reference: cashPayment.reference,
              },
              "Cash payment recorded successfully.",
            )
          }
          className="mt-5 rounded-full border border-navy/10 px-6 py-3 text-sm font-semibold text-navy disabled:opacity-60"
        >
          {isPending ? "Processing..." : "Record cash payment"}
        </button>
      </div>

      {message ? <p className="xl:col-span-2 text-sm text-navy/72">{message}</p> : null}
    </section>
  );
}
