"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdmissionStatus, ApplicationDocumentStatus, DocumentType } from "@prisma/client";
import {
  admissionDocumentTypes,
  admissionPipelineStageLabelMap,
  deriveAdmissionPipelineStage,
  documentStatusLabelMap,
  documentTypeLabelMap,
  formatFamilyAddress,
  getPrimaryParentEmail,
  getPrimaryParentPhone,
  primaryParentLabelMap,
} from "@/lib/admissions";

type ProgramOption = {
  id: string;
  name: string;
};

type ClassOption = {
  id: string;
  label: string;
  leadTeacher?: string;
};

type AdmissionDocumentRecord = {
  id: string;
  documentType: DocumentType;
  status: ApplicationDocumentStatus;
  fileUrl: string;
  fileName: string;
  notes?: string | null;
};

type AdmissionRecordDeskProps = {
  admissionId: string;
  applicationNumber: string;
  currentStatus: AdmissionStatus;
  parentId?: string | null;
  studentId?: string | null;
  enrolledAtLabel?: string | null;
  submittedAtLabel?: string | null;
  approvedAtLabel?: string | null;
  currentProgramId?: string | null;
  currentClassId?: string | null;
  reviewNotes?: string | null;
  programs: ProgramOption[];
  classes: ClassOption[];
  portalAccessSentAtLabel?: string | null;
  preferredStartMonth?: string;
  schoolVisitStatus?: string;
  initialInstallmentCount?: number;
  initialInstallmentDates?: string[];
  documents: AdmissionDocumentRecord[];
  initialValues: {
    parentName: string;
    phone: string;
    email: string;
    childName: string;
    childDob: string;
    childGender: string;
    childBloodGroup: string;
    previousSchool: string;
    previousGrade: string;
    fatherName: string;
    fatherPhone: string;
    motherName: string;
    motherPhone: string;
    guardianName: string;
    guardianPhone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    emergencyRelationship: string;
    preferredStartMonth: string;
    schoolVisitStatus: string;
    parentExpectations: string;
    notes: string;
    primaryParent: string;
  };
};

type EditableSection = "child" | "family" | "address" | "notes";

function valueOrDash(value?: string | null) {
  return value && value.trim().length > 0 ? value : "Not added yet";
}

function DetailGrid({
  title,
  badge,
  items,
  onEdit,
  editing,
  children,
}: {
  title: string;
  badge?: string;
  items: { label: string; value: string }[];
  onEdit: () => void;
  editing: boolean;
  children?: React.ReactNode;
}) {
  return (
    <section className="rounded-[1.75rem] border border-navy/8 bg-white p-6 shadow-[0_18px_50px_rgba(14,30,62,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">{title}</p>
          {badge ? <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-navy/48">{badge}</p> : null}
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-navy/72 transition hover:border-navy/20 hover:bg-[#f7f8fb]"
        >
          {editing ? "Close" : "Edit"}
        </button>
      </div>

      {!editing ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <div key={`${title}-${item.label}`} className="rounded-[1.2rem] bg-cream px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{item.label}</p>
              <p className="mt-2 text-sm leading-7 text-navy">{item.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5">{children}</div>
      )}
    </section>
  );
}

export function AdmissionRecordDesk({
  admissionId,
  applicationNumber,
  currentStatus,
  parentId,
  studentId,
  enrolledAtLabel,
  submittedAtLabel,
  approvedAtLabel,
  currentProgramId,
  currentClassId,
  reviewNotes,
  programs,
  classes,
  portalAccessSentAtLabel,
  preferredStartMonth,
  schoolVisitStatus,
  initialInstallmentCount,
  initialInstallmentDates,
  documents,
  initialValues,
}: AdmissionRecordDeskProps) {
  const router = useRouter();
  const [status, setStatus] = useState<AdmissionStatus>(currentStatus);
  const [notes, setNotes] = useState(reviewNotes ?? "");
  const [programId, setProgramId] = useState(currentProgramId ?? "");
  const [classId, setClassId] = useState(currentClassId ?? "");
  const [parentPassword, setParentPassword] = useState("parent123");
  const [installmentCount, setInstallmentCount] = useState(initialInstallmentCount ?? 1);
  const [installmentDates, setInstallmentDates] = useState<string[]>(() => {
    const count = initialInstallmentCount ?? 1;
    const base = initialInstallmentDates ?? [];
    const seeded = base.slice(0, count);
    while (seeded.length < count) {
      seeded.push("");
    }
    return seeded.length > 0 ? seeded : [""];
  });
  const [editValues, setEditValues] = useState(initialValues);
  const [editingSection, setEditingSection] = useState<EditableSection | null>(null);
  const [uploadingDocumentId, setUploadingDocumentId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const selectedClass = useMemo(() => classes.find((entry) => entry.id === classId), [classId, classes]);
  const pipelineStage = deriveAdmissionPipelineStage({ status, parentId, studentId, enrolledAt: enrolledAtLabel });
  const isApproved = pipelineStage === "APPROVED";
  const isEnrolled = pipelineStage === "ENROLLED";

  function syncInstallmentDates(count: number) {
    setInstallmentDates((current) => {
      const next = [...current];
      if (next.length < count) {
        while (next.length < count) {
          next.push("");
        }
      } else if (next.length > count) {
        next.length = count;
      }
      return next;
    });
  }

  const childItems = [
    { label: "Child name", value: valueOrDash(editValues.childName) },
    { label: "Date of birth", value: valueOrDash(editValues.childDob) },
    { label: "Gender", value: valueOrDash(editValues.childGender) },
    { label: "Blood group", value: valueOrDash(editValues.childBloodGroup) },
    { label: "Program", value: valueOrDash(programs.find((item) => item.id === programId)?.name) },
    { label: "Previous grade", value: valueOrDash(editValues.previousGrade) },
  ];

  const familyItems = [
    { label: "Primary parent", value: valueOrDash(editValues.parentName) },
    { label: "Portal contact", value: primaryParentLabelMap[(editValues.primaryParent as "FATHER" | "MOTHER" | "GUARDIAN") ?? "FATHER"] ?? "Father" },
    { label: "Primary phone", value: valueOrDash(editValues.phone) },
    { label: "Primary email", value: valueOrDash(editValues.email) },
    { label: "Father", value: [editValues.fatherName, editValues.fatherPhone].filter(Boolean).join(" | ") || "Not added yet" },
    { label: "Mother", value: [editValues.motherName, editValues.motherPhone].filter(Boolean).join(" | ") || "Not added yet" },
    { label: "Guardian", value: [editValues.guardianName, editValues.guardianPhone].filter(Boolean).join(" | ") || "Not added yet" },
  ];

  const addressItems = [
    { label: "Family address", value: formatFamilyAddress(editValues as never) },
    { label: "Preferred joining month", value: valueOrDash(editValues.preferredStartMonth || preferredStartMonth) },
    { label: "School visit", value: valueOrDash(editValues.schoolVisitStatus || schoolVisitStatus) },
    { label: "Previous school", value: valueOrDash(editValues.previousSchool) },
    { label: "Emergency contact", value: [editValues.emergencyContactName, editValues.emergencyContactPhone].filter(Boolean).join(" | ") || "Not added yet" },
    { label: "Emergency relation", value: valueOrDash(editValues.emergencyRelationship) },
  ];

  const documentCards = admissionDocumentTypes.map((type) => {
    const existing = documents.find((document) => document.documentType === type.type);
    return {
      key: type.key,
      label: type.label,
      documentType: type.type,
      existing,
    };
  });

  const workflowItems = [
    { label: "Application number", value: applicationNumber },
    { label: "Pipeline stage", value: admissionPipelineStageLabelMap[pipelineStage] },
    { label: "Submitted on", value: valueOrDash(submittedAtLabel) },
    { label: "Approved on", value: valueOrDash(approvedAtLabel) },
    { label: "Portal access", value: valueOrDash(portalAccessSentAtLabel) },
    { label: "Lead teacher", value: valueOrDash(selectedClass?.leadTeacher) },
    { label: "Assigned class", value: valueOrDash(selectedClass?.label) },
    { label: "Enrollment state", value: isEnrolled ? `Enrolled${enrolledAtLabel ? ` on ${enrolledAtLabel}` : ""}` : isApproved ? "Approved and ready for enrollment" : "Waiting for approval" },
  ];

  async function postAction(payload: Record<string, unknown>, successMessage: string) {
    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/admin/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update admission.");
      }

      setState("success");
      setMessage(successMessage);
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to update admission.");
    }
  }

  async function uploadReplacement(documentId: string | null, documentType: DocumentType, file: File | null) {
    if (!file) return;
    setUploadingDocumentId(documentId ?? documentType);
    setState("loading");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);
      const response = await fetch(`/api/admin/admissions/${admissionId}/documents/${documentId ?? "new"}`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to replace document.");
      }
      setState("success");
      setMessage("Document reuploaded successfully.");
      router.refresh();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Unable to replace document.");
    } finally {
      setUploadingDocumentId(null);
    }
  }

  function renderTextInput(
    key: keyof typeof initialValues,
    placeholder: string,
    options?: { type?: string; rows?: number; full?: boolean },
  ) {
    if (options?.rows) {
      return (
        <textarea
          value={editValues[key]}
          rows={options.rows}
          onChange={(event) => setEditValues((current) => ({ ...current, [key]: event.target.value }))}
          placeholder={placeholder}
          className={`rounded-[1rem] border border-navy/10 bg-[#fcfcfd] px-4 py-3 text-sm text-navy outline-none transition focus:border-navy/25 ${options.full ? "md:col-span-2" : ""}`}
        />
      );
    }

    return (
      <input
        type={options?.type ?? "text"}
        value={editValues[key]}
        onChange={(event) => setEditValues((current) => ({ ...current, [key]: event.target.value }))}
        placeholder={placeholder}
        className={`rounded-[1rem] border border-navy/10 bg-[#fcfcfd] px-4 py-3 text-sm text-navy outline-none transition focus:border-navy/25 ${options?.full ? "md:col-span-2" : ""}`}
      />
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] bg-white p-7 shadow-card">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Admission Record</p>
            <h2 className="mt-2 font-display text-3xl text-navy">Review, update, and complete enrollment from one desk</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-navy/68">
              Keep the record readable first. Edit only the section you need, reupload documents in place, and complete enrollment only after approval.
            </p>
          </div>
          <span
            className={`inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
              pipelineStage === "ENROLLED"
                ? "bg-emerald-50 text-emerald-700"
                : pipelineStage === "APPROVED"
                  ? "bg-sky-50 text-sky-700"
                  : pipelineStage === "REJECTED"
                    ? "bg-rose-50 text-rose-700"
                    : pipelineStage === "UNDER_REVIEW"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-[#f5f7fb] text-navy/70"
            }`}
          >
            {admissionPipelineStageLabelMap[pipelineStage]}
          </span>
        </div>

        {message ? (
          <div className={`mt-5 rounded-[1rem] px-4 py-3 text-sm ${state === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
            {message}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.45fr_0.85fr]">
        <div className="space-y-6">
          <DetailGrid
            title="Child Profile"
            badge="Application-ready details"
            items={childItems}
            editing={editingSection === "child"}
            onEdit={() => setEditingSection((current) => (current === "child" ? null : "child"))}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {renderTextInput("childName", "Child name")}
              {renderTextInput("childDob", "DOB of child", { type: "date" })}
              {renderTextInput("childGender", "Child gender")}
              {renderTextInput("childBloodGroup", "Blood group")}
              <select
                value={programId}
                onChange={(event) => setProgramId(event.target.value)}
                className="rounded-[1rem] border border-navy/10 bg-[#fcfcfd] px-4 py-3 text-sm text-navy outline-none transition focus:border-navy/25"
              >
                <option value="">Select program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
              {renderTextInput("previousGrade", "Previous grade")}
              {renderTextInput("previousSchool", "Previous school", { full: true })}
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() =>
                  postAction(
                    { action: "updateAdmissionDetails", admissionId, ...editValues, programId: programId || undefined },
                    "Child profile updated.",
                  ).then(() => setEditingSection(null))
                }
                className="rounded-full bg-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
              >
                Save child details
              </button>
            </div>
          </DetailGrid>

          <DetailGrid
            title="Parent & Guardian"
            badge="Portal contact and family mapping"
            items={familyItems}
            editing={editingSection === "family"}
            onEdit={() => setEditingSection((current) => (current === "family" ? null : "family"))}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {renderTextInput("parentName", "Primary parent name")}
              <select
                value={editValues.primaryParent}
                onChange={(event) => setEditValues((current) => ({ ...current, primaryParent: event.target.value }))}
                className="rounded-[1rem] border border-navy/10 bg-[#fcfcfd] px-4 py-3 text-sm text-navy outline-none transition focus:border-navy/25"
              >
                <option value="FATHER">Father</option>
                <option value="MOTHER">Mother</option>
                <option value="GUARDIAN">Guardian</option>
              </select>
              {renderTextInput("phone", "Primary phone")}
              {renderTextInput("email", "Primary email")}
              {renderTextInput("fatherName", "Father name")}
              {renderTextInput("fatherPhone", "Father phone")}
              {renderTextInput("motherName", "Mother name")}
              {renderTextInput("motherPhone", "Mother phone")}
              {renderTextInput("guardianName", "Guardian name")}
              {renderTextInput("guardianPhone", "Guardian phone")}
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() =>
                  postAction(
                    { action: "updateAdmissionDetails", admissionId, ...editValues, programId: programId || undefined },
                    "Family details updated.",
                  ).then(() => setEditingSection(null))
                }
                className="rounded-full bg-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
              >
                Save family details
              </button>
            </div>
          </DetailGrid>

          <DetailGrid
            title="Address & Admission Preferences"
            badge="Residence and joining preferences"
            items={addressItems}
            editing={editingSection === "address"}
            onEdit={() => setEditingSection((current) => (current === "address" ? null : "address"))}
          >
            <div className="grid gap-3 md:grid-cols-2">
              {renderTextInput("addressLine1", "Address line 1", { full: true })}
              {renderTextInput("addressLine2", "Address line 2", { full: true })}
              {renderTextInput("city", "City")}
              {renderTextInput("state", "State")}
              {renderTextInput("postalCode", "Postal code")}
              {renderTextInput("emergencyContactName", "Emergency contact name")}
              {renderTextInput("emergencyContactPhone", "Emergency contact phone")}
              {renderTextInput("emergencyRelationship", "Emergency relationship")}
              {renderTextInput("preferredStartMonth", "Preferred joining month")}
              {renderTextInput("schoolVisitStatus", "Visit status", { full: true })}
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() =>
                  postAction(
                    { action: "updateAdmissionDetails", admissionId, ...editValues, programId: programId || undefined },
                    "Address and preference details updated.",
                  ).then(() => setEditingSection(null))
                }
                className="rounded-full bg-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
              >
                Save address details
              </button>
            </div>
          </DetailGrid>

          <DetailGrid
            title="Notes & Expectations"
            badge="Review context and parent inputs"
            items={[
              { label: "Parent expectations", value: valueOrDash(editValues.parentExpectations) },
              { label: "Admission notes", value: valueOrDash(editValues.notes) },
              { label: "Review notes", value: valueOrDash(notes) },
            ]}
            editing={editingSection === "notes"}
            onEdit={() => setEditingSection((current) => (current === "notes" ? null : "notes"))}
          >
            <div className="grid gap-3">
              {renderTextInput("parentExpectations", "Parent expectations", { rows: 4, full: true })}
              {renderTextInput("notes", "Admission notes", { rows: 4, full: true })}
              <textarea
                rows={5}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Internal review notes"
                className="rounded-[1rem] border border-navy/10 bg-[#fcfcfd] px-4 py-3 text-sm text-navy outline-none transition focus:border-navy/25"
              />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  postAction(
                    { action: "updateAdmissionDetails", admissionId, ...editValues, programId: programId || undefined },
                    "Admission notes updated.",
                  )
                }
                className="rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-navy/72"
              >
                Save visible notes
              </button>
              <button
                type="button"
                onClick={() =>
                  postAction({ action: "updateReviewNotes", admissionId, reviewNotes: notes }, "Review notes updated.").then(() => setEditingSection(null))
                }
                className="rounded-full bg-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white"
              >
                Save review notes
              </button>
            </div>
          </DetailGrid>

          <section className="rounded-[1.75rem] border border-navy/8 bg-white p-6 shadow-[0_18px_50px_rgba(14,30,62,0.05)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Documents</p>
                <p className="mt-2 text-sm leading-7 text-navy/62">View the current file, verify it, reject it, or reupload a corrected copy from the same admission desk.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {documentCards.map(({ key, label, documentType, existing }) => (
                <div key={key} className="rounded-[1.25rem] border border-navy/10 bg-[#fcfcfd] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-navy">{label}</p>
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                      existing ? "bg-[#eef6ff] text-[#2452b6]" : "bg-[#f5f7fb] text-navy/55"
                    }`}>
                      {existing ? documentStatusLabelMap[existing.status] : "Missing"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-navy/55">{existing ? existing.fileName : "No file uploaded yet."}</p>
                  <p className="mt-1 text-sm leading-6 text-navy/62">{existing?.notes ?? "Upload a document or replace the current file from here."}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {existing ? (
                      <>
                        <a href={existing.fileUrl} target="_blank" rel="noreferrer" className="rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-navy/72">
                          Open
                        </a>
                        <button
                          type="button"
                          onClick={() => postAction({ action: "updateDocumentStatus", admissionId, documentId: existing.id, status: "VERIFIED" }, "Document marked as verified.")}
                          className="rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700"
                        >
                          Verify
                        </button>
                        <button
                          type="button"
                          onClick={() => postAction({ action: "updateDocumentStatus", admissionId, documentId: existing.id, status: "REJECTED" }, "Document marked for reupload.")}
                          className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-700"
                        >
                          Reject
                        </button>
                      </>
                    ) : null}
                    <label className="cursor-pointer rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-navy/72">
                      {uploadingDocumentId === (existing?.id ?? documentType) ? "Uploading..." : existing ? "Reupload" : "Upload"}
                      <input
                        type="file"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          void uploadReplacement(existing?.id ?? null, existing?.documentType ?? documentType, file);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-[1.75rem] border border-navy/8 bg-white p-6 shadow-[0_18px_50px_rgba(14,30,62,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Workflow Snapshot</p>
            <div className="mt-5 grid gap-3">
              {workflowItems.map((item) => (
                <div key={item.label} className="rounded-[1.2rem] bg-cream px-4 py-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">{item.label}</p>
                  <p className="mt-2 text-sm leading-7 text-navy">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-navy/8 bg-white p-6 shadow-[0_18px_50px_rgba(14,30,62,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Record Actions</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => postAction({ action: "updateStatus", admissionId, status: "UNDER_REVIEW" }, "Admission moved to review.")}
                className="rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-navy/72"
              >
                Mark under review
              </button>
              <button
                type="button"
                onClick={() => postAction({ action: "approveAdmission", admissionId }, "Admission approved.")}
                disabled={isApproved || isEnrolled}
                className="rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => postAction({ action: "updateStatus", admissionId, status: "REJECTED" }, "Admission marked as withdrawn.")}
                className="rounded-full border border-amber-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-amber-700"
              >
                Mark withdrawn
              </button>
              <button
                type="button"
                onClick={() => postAction({ action: "deleteAdmission", admissionId }, "Admission deleted.")}
                className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-700"
              >
                Delete
              </button>
            </div>
            <div className="mt-4">
              <select
                value={status}
                onChange={(event) => {
                  const nextStatus = event.target.value as AdmissionStatus;
                  setStatus(nextStatus);
                  void postAction({ action: "updateStatus", admissionId, status: nextStatus }, "Admission status updated.");
                }}
                className="w-full rounded-[1rem] border border-navy/10 bg-[#fcfcfd] px-4 py-3 text-sm text-navy outline-none transition focus:border-navy/25"
              >
                {["DRAFT", "SUBMITTED", "UNDER_REVIEW", "DOCUMENTS_PENDING", "APPROVED", "REJECTED", "WAITLISTED"].map((option) => (
                  <option key={option} value={option}>
                    {option.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-navy/8 bg-white p-6 shadow-[0_18px_50px_rgba(14,30,62,0.05)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Enrollment Setup</p>
            <div className="mt-5 grid gap-3">
              <select
                value={programId}
                onChange={(event) => setProgramId(event.target.value)}
                className="rounded-[1rem] border border-navy/10 bg-[#fcfcfd] px-4 py-3 text-sm text-navy outline-none transition focus:border-navy/25"
              >
                <option value="">Select program</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
              <select
                value={classId}
                onChange={(event) => setClassId(event.target.value)}
                className="rounded-[1rem] border border-navy/10 bg-[#fcfcfd] px-4 py-3 text-sm text-navy outline-none transition focus:border-navy/25"
              >
                <option value="">Select class</option>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.label}
                  </option>
                ))}
              </select>
              <select
                value={installmentCount}
                onChange={(event) => {
                  const nextCount = Number(event.target.value);
                  setInstallmentCount(nextCount);
                  syncInstallmentDates(nextCount);
                }}
                className="rounded-[1rem] border border-navy/10 bg-[#fcfcfd] px-4 py-3 text-sm text-navy outline-none transition focus:border-navy/25"
              >
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <option key={count} value={count}>
                    {count} installment{count > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
              {installmentCount > 1 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {installmentDates.map((value, index) => (
                    <div key={`installment-${index}`} className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-navy/45">
                        Installment {index + 1} due date
                      </label>
                      <input
                        type="date"
                        value={value}
                        onChange={(event) =>
                          setInstallmentDates((current) => current.map((item, i) => (i === index ? event.target.value : item)))
                        }
                        className="w-full rounded-[1rem] border border-navy/10 bg-[#fcfcfd] px-4 py-3 text-sm text-navy outline-none transition focus:border-navy/25"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
              <input
                value={parentPassword}
                onChange={(event) => setParentPassword(event.target.value)}
                placeholder="Temporary parent password"
                className="rounded-[1rem] border border-navy/10 bg-[#fcfcfd] px-4 py-3 text-sm text-navy outline-none transition focus:border-navy/25"
              />
            </div>
            <div className="mt-5 rounded-[1.2rem] bg-cream px-4 py-4 text-sm leading-7 text-navy/68">
              Parent portal is created only after approval. Class and program selected here will be carried into enrollment.
            </div>
            <div className="mt-5">
              <button
                type="button"
                onClick={() =>
                  postAction(
                    {
                      action: "convertAdmission",
                      admissionId,
                      programId: programId || undefined,
                      classId: classId || undefined,
                      parentPassword,
                      installmentCount,
                      installmentDates: installmentDates.filter((value) => value),
                    },
                    "Enrollment completed and parent portal created.",
                  )
                }
                disabled={!isApproved || isEnrolled}
                className="w-full rounded-full bg-navy px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Complete enrollment
              </button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
