"use client";

import { useEffect, useState, useTransition } from "react";
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
    dueDate: string;
    status: string;
    studentLabel: string;
  }>;
};

function makeInvoiceEditState(invoice: AdminPaymentsDeskProps["invoices"][number] | undefined) {
  return {
    invoiceId: invoice?.id ?? "",
    amount: invoice?.amount ?? "",
    dueDate: invoice?.dueDate ?? "",
    status: invoice?.status ?? "ISSUED",
    title: "",
  };
}

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
    paymentStatus: "DUE",
    paymentMethod: "CASH",
    paymentReference: "",
  });
  const [cashPayment, setCashPayment] = useState({
    invoiceId: invoices[0]?.id ?? "",
    amount: "",
    reference: "",
    method: "CASH",
  });
  const [invoiceEdit, setInvoiceEdit] = useState(() => makeInvoiceEditState(invoices[0]));

  useEffect(() => {
    setInvoiceEdit((current) => {
      const selected = invoices.find((invoice) => invoice.id === current.invoiceId);
      return selected ? current : makeInvoiceEditState(invoices[0]);
    });
    setCashPayment((current) => {
      const selected = invoices.find((invoice) => invoice.id === current.invoiceId);
      return selected ? current : { ...current, invoiceId: invoices[0]?.id ?? "" };
    });
  }, [invoices]);

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
        setManualInvoice((current) => ({
          ...current,
          title: "Summer Camp Activity",
          amount: "",
          dueDate: "",
          paymentStatus: "DUE",
          paymentMethod: "CASH",
          paymentReference: "",
        }));
      }
      if (payload.action === "recordCashPayment") {
        setCashPayment((current) => ({ ...current, amount: "", reference: "", method: "CASH" }));
      }
      if (payload.action === "deleteInvoice") {
        const deletedInvoiceId = typeof payload.invoiceId === "string" ? payload.invoiceId : "";
        const nextInvoice = invoices.find((invoice) => invoice.id !== deletedInvoiceId);
        setInvoiceEdit(makeInvoiceEditState(nextInvoice));
        setCashPayment((current) => ({
          ...current,
          invoiceId: current.invoiceId === deletedInvoiceId ? nextInvoice?.id ?? "" : current.invoiceId,
        }));
      }
      router.refresh();
    });
  }

  const campPrograms = programs.filter((program) => program.category === "CAMP");
  const selectedStudent = students.find((student) => student.id === manualInvoice.studentId);
  const selectedInvoice = invoices.find((invoice) => invoice.id === invoiceEdit.invoiceId);

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Summer Camp Invoices</p>
        <h2 className="mt-2 font-display text-3xl text-navy">Create a manual invoice in one step</h2>
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
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={manualInvoice.paymentStatus}
              onChange={(event) => setManualInvoice((current) => ({ ...current, paymentStatus: event.target.value }))}
              className="rounded-2xl border border-navy/10 px-4 py-3 text-sm"
            >
              <option value="DUE">Mark as not paid</option>
              <option value="PAID">Mark as paid now</option>
            </select>
            <select
              value={manualInvoice.paymentMethod}
              onChange={(event) => setManualInvoice((current) => ({ ...current, paymentMethod: event.target.value }))}
              className="rounded-2xl border border-navy/10 px-4 py-3 text-sm"
              disabled={manualInvoice.paymentStatus !== "PAID"}
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="NEFT">NEFT</option>
              <option value="CARD">Card</option>
              <option value="BANK_TRANSFER">Bank transfer</option>
            </select>
          </div>
          {manualInvoice.paymentStatus === "PAID" ? (
            <input
              value={manualInvoice.paymentReference}
              onChange={(event) => setManualInvoice((current) => ({ ...current, paymentReference: event.target.value }))}
              placeholder="Payment reference / UPI / NEFT note"
              className="rounded-2xl border border-navy/10 px-4 py-3"
            />
          ) : null}
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
                paymentStatus: manualInvoice.paymentStatus,
                paymentMethod: manualInvoice.paymentMethod,
                paymentReference: manualInvoice.paymentReference,
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
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Manual Payment Verification</p>
        <h2 className="mt-2 font-display text-3xl text-navy">Record offline payments</h2>
        <p className="mt-3 text-sm leading-7 text-navy/68">
          If a parent pays offline (cash, UPI, NEFT, card), admin can mark it here and release the receipt.
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
          <select
            value={cashPayment.method}
            onChange={(event) => setCashPayment((current) => ({ ...current, method: event.target.value }))}
            className="rounded-2xl border border-navy/10 px-4 py-3 text-sm"
          >
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="NEFT">NEFT</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
          </select>
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
                method: cashPayment.method,
              },
              "Cash payment recorded successfully.",
            )
          }
          className="mt-5 rounded-full border border-navy/10 px-6 py-3 text-sm font-semibold text-navy disabled:opacity-60"
        >
          {isPending ? "Processing..." : "Record cash payment"}
        </button>
      </div>

      <div className="rounded-[2rem] bg-white p-8 shadow-card xl:col-span-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Invoice Editing</p>
        <h2 className="mt-2 font-display text-3xl text-navy">Update invoice amount, due date, or status</h2>
        <p className="mt-3 text-sm leading-7 text-navy/68">
          Changes made here are saved on the invoice record and appear immediately in the parent portal.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <select
            value={invoiceEdit.invoiceId}
            onChange={(event) => {
              const invoice = invoices.find((item) => item.id === event.target.value);
              setInvoiceEdit(makeInvoiceEditState(invoice));
            }}
            className="rounded-2xl border border-navy/10 px-4 py-3 xl:col-span-2"
          >
            {invoices.map((invoice) => (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoiceNumber} - {invoice.studentLabel}
              </option>
            ))}
          </select>
          <input
            value={invoiceEdit.amount}
            onChange={(event) => setInvoiceEdit((current) => ({ ...current, amount: event.target.value }))}
            placeholder="Amount"
            className="rounded-2xl border border-navy/10 px-4 py-3"
          />
          <input
            type="date"
            value={invoiceEdit.dueDate}
            onChange={(event) => setInvoiceEdit((current) => ({ ...current, dueDate: event.target.value }))}
            className="rounded-2xl border border-navy/10 px-4 py-3"
          />
          <select
            value={invoiceEdit.status}
            onChange={(event) => setInvoiceEdit((current) => ({ ...current, status: event.target.value }))}
            className="rounded-2xl border border-navy/10 px-4 py-3"
          >
            {["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"].map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <input
            value={invoiceEdit.title}
            onChange={(event) => setInvoiceEdit((current) => ({ ...current, title: event.target.value }))}
            placeholder="Optional invoice title"
            className="rounded-2xl border border-navy/10 px-4 py-3 md:col-span-2 xl:col-span-4"
          />
          <button
            type="button"
            disabled={isPending || !selectedInvoice || !invoiceEdit.amount || !invoiceEdit.dueDate}
            onClick={() =>
              postAction(
                {
                  action: "updateInvoice",
                  invoiceId: invoiceEdit.invoiceId,
                  amount: Number(invoiceEdit.amount),
                  dueDate: invoiceEdit.dueDate,
                  status: invoiceEdit.status,
                  title: invoiceEdit.title,
                },
                "Invoice updated successfully.",
              )
            }
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Save invoice"}
          </button>
          <button
            type="button"
            disabled={isPending || !selectedInvoice}
            onClick={() => {
              if (
                window.confirm(
                  "Delete this invoice? If it already has payment or receipt history, it will be cancelled instead of hard-deleted.",
                )
              ) {
                postAction(
                  {
                    action: "deleteInvoice",
                    invoiceId: invoiceEdit.invoiceId,
                  },
                  "Invoice removed from active billing.",
                );
              }
            }}
            className="rounded-full border border-rose-200 px-6 py-3 text-sm font-semibold text-rose-700 disabled:opacity-60"
          >
            Delete invoice
          </button>
        </div>
      </div>

      {message ? <p className="xl:col-span-2 text-sm text-navy/72">{message}</p> : null}
    </section>
  );
}
