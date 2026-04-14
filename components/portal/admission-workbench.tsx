"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AdmissionStatus, ApplicationDocumentStatus, DocumentType, Prisma } from "@prisma/client";
import { DocumentDownloadButton } from "@/components/portal/document-download-button";
import type { AdmissionFormConfig } from "@/lib/admin-config";
import {
  admissionPipelineStageLabelMap,
  documentTypeLabelMap,
  getPrimaryParentEmail,
  getPrimaryParentName,
  getPrimaryParentPhone,
  primaryParentLabelMap,
  type AdmissionFamilyProfile,
  type AdmissionPipelineStage,
  type AdmissionPrimaryParent,
} from "@/lib/admissions";

type AdmissionRecord = {
  id: string;
  applicationNumber: string;
  shareToken?: string | null;
  parentName: string;
  childName: string;
  phone: string;
  email?: string | null;
  status: AdmissionStatus;
  notes?: string | null;
  reviewNotes?: string | null;
  studentId?: string | null;
  parentId?: string | null;
  createdAtLabel: string;
  submittedAtLabel?: string | null;
  approvedAtLabel?: string | null;
  enrolledAtLabel?: string | null;
  portalAccessSentAtLabel?: string | null;
  programId?: string | null;
  programName?: string | null;
  feePreview: string;
  documentsCount: number;
  verifiedDocumentsCount: number;
  pendingDocumentsCount: number;
  submittedByParent: boolean;
  pipelineStage: AdmissionPipelineStage;
  pipelineStageLabel: string;
  childProfile?: Prisma.JsonValue | null;
  familyProfile?: Prisma.JsonValue | null;
  admissionProfile?: Prisma.JsonValue | null;
  documents: {
    id: string;
    documentType: DocumentType;
    status: ApplicationDocumentStatus;
    fileName: string;
    fileUrl: string;
    notes?: string | null;
    statusLabel: string;
  }[];
};

type ProgramOption = {
  id: string;
  name: string;
  slug: string;
  feeStructures: Array<{
    id: string;
    title: string;
    frequency: string;
    amount: string;
    taxPercentage: string | null;
  }>;
};

type AdmissionWorkbenchProps = {
  admissions: AdmissionRecord[];
  programs: ProgramOption[];
  formConfig: AdmissionFormConfig;
};

type ManualAdmissionState = {
  primaryParent: AdmissionPrimaryParent;
  fatherName: string;
  fatherPhone: string;
  fatherEmail: string;
  fatherQualification: string;
  fatherOccupation: string;
  motherName: string;
  motherPhone: string;
  motherEmail: string;
  motherQualification: string;
  motherOccupation: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianQualification: string;
  guardianOccupation: string;
  childName: string;
  childDob: string;
  childAge: string;
  childGender: string;
  childBloodGroup: string;
  childAadhaar: string;
  programSlug: string;
  preferredStartMonth: string;
  schoolVisitStatus: string;
  previousSchool: string;
  previousGrade: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyRelationship: string;
  medicalNotes: string;
  allergies: string;
  parentExpectations: string;
  notes: string;
};

const requiredDocumentUploadKeys = [
  { key: "birth_certificate", label: "Birth certificate" },
  { key: "child_aadhaar", label: "Child Aadhaar" },
  { key: "father_aadhaar", label: "Father Aadhaar" },
  { key: "mother_aadhaar", label: "Mother Aadhaar" },
  { key: "address_proof", label: "Address proof" },
  { key: "child_photo", label: "Child passport photo" },
  { key: "previous_school_record", label: "Previous school record / marks card" },
  { key: "medical_record", label: "Medical record" },
] as const;

const genderOptions = ["Male", "Female", "Other"] as const;
const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

function addMonths(base: Date, months: number) {
  const date = new Date(base);
  date.setMonth(date.getMonth() + months);
  return date;
}

function getNextDueLabel(frequency: string) {
  const normalized = frequency.trim().toLowerCase();
  if (normalized.includes("one")) return "Due today";
  if (normalized.includes("month")) return "Next due in 1 month";
  if (normalized.includes("quarter")) return "Next due in 3 months";
  if (normalized.includes("half")) return "Next due in 6 months";
  if (normalized.includes("year")) return "Next due in 12 months";
  return "Due date as per schedule";
}

function getNextDueDate(frequency: string) {
  const today = new Date();
  const normalized = frequency.trim().toLowerCase();
  if (normalized.includes("one")) return today;
  if (normalized.includes("month")) return addMonths(today, 1);
  if (normalized.includes("quarter")) return addMonths(today, 3);
  if (normalized.includes("half")) return addMonths(today, 6);
  if (normalized.includes("year")) return addMonths(today, 12);
  return null;
}

function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

function getAgeLabel(dobValue: string) {
  if (!dobValue) return "";
  const dob = new Date(dobValue);
  if (Number.isNaN(dob.getTime())) return "";
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  if (today.getDate() < dob.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return "";
  if (years === 0) return `${months} months`;
  if (months === 0) return `${years} years`;
  return `${years} years ${months} months`;
}

const initialManualAdmission: ManualAdmissionState = {
  primaryParent: "FATHER",
  fatherName: "",
  fatherPhone: "",
  fatherEmail: "",
  fatherQualification: "",
  fatherOccupation: "",
  motherName: "",
  motherPhone: "",
  motherEmail: "",
  motherQualification: "",
  motherOccupation: "",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianQualification: "",
  guardianOccupation: "",
  childName: "",
  childDob: "",
  childAge: "",
  childGender: "",
  childBloodGroup: "",
  childAadhaar: "",
  programSlug: "",
  preferredStartMonth: "",
  schoolVisitStatus: "",
  previousSchool: "",
  previousGrade: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyRelationship: "",
  medicalNotes: "",
  allergies: "",
  parentExpectations: "",
  notes: "",
};

function asRecord<T>(value: Prisma.JsonValue | null | undefined) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as T) : null;
}

function stageTone(stage: AdmissionPipelineStage) {
  if (stage === "ENROLLED") return "bg-emerald-50 text-emerald-700";
  if (stage === "APPROVED") return "bg-sky-50 text-sky-700";
  if (stage === "REJECTED") return "bg-rose-50 text-rose-700";
  if (stage === "UNDER_REVIEW") return "bg-amber-50 text-amber-700";
  return "bg-[#f5f7fb] text-navy/70";
}

function inputClassName(textarea = false) {
  return `w-full rounded-[1.15rem] border border-navy/10 bg-white px-4 py-3 text-sm text-navy placeholder:text-navy/35 ${textarea ? "min-h-[118px]" : ""}`;
}

export function AdmissionWorkbench({ admissions, programs, formConfig }: AdmissionWorkbenchProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [search, setSearch] = useState("");
  const [manualAdmission, setManualAdmission] = useState(initialManualAdmission);
  const [manualFiles, setManualFiles] = useState<Record<string, File | null>>({});
  const visibleAdmissions = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return admissions;
    return admissions.filter((item) =>
      [item.childName, item.parentName, item.applicationNumber, item.phone, item.email ?? "", item.programName ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [admissions, search]);

  const publicFormUrl = typeof window !== "undefined" ? `${window.location.origin}/admissions` : "/admissions";
  const isLocalhostLink = publicFormUrl.includes("localhost");
  const requiredDocuments = formConfig.requiredDocuments.filter((item) => item.enabled);
  const selectedProgram = manualAdmission.programSlug
    ? programs.find((program) => program.slug === manualAdmission.programSlug)
    : undefined;
  const stageSummary = useMemo(
    () =>
      (["SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "ENROLLED"] as AdmissionPipelineStage[]).map((stage) => ({
        stage,
        label: admissionPipelineStageLabelMap[stage],
        count: visibleAdmissions.filter((item) => item.pipelineStage === stage).length,
      })),
    [visibleAdmissions],
  );

  async function postAction(payload: Record<string, unknown>, successMessage: string) {
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/admin/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as { success?: boolean; message?: string };
      if (!response.ok || !data.success) throw new Error(data.message || "Unable to update admission workflow.");
      setStatus("success");
      setMessage(successMessage);
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to update admission workflow.");
    }
  }

  async function copyPublicLink() {
    try {
      await navigator.clipboard.writeText(publicFormUrl);
      setStatus("success");
      setMessage("Admission form link copied.");
    } catch {
      setStatus("error");
      setMessage("Unable to copy the admission form link.");
    }
  }

  async function submitManualAdmission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("loading");
    setMessage("");

    try {
      const formData = new FormData();
      Object.entries(manualAdmission).forEach(([key, value]) => formData.append(key, value));
      Object.entries(manualFiles).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const response = await fetch("/api/admin/admissions/manual", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { success?: boolean; message?: string; admissionId?: string; applicationNumber?: string };
      if (!response.ok || !data.success || !data.admissionId) {
        throw new Error(data.message || "Unable to create admission.");
      }

      setStatus("success");
      setMessage(`Admission created successfully. Application no: ${data.applicationNumber ?? "Saved"}.`);
      setManualAdmission(initialManualAdmission);
      setManualFiles({});
      formElement.reset();
      router.refresh();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to create admission.");
    }
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className={`rounded-[1.15rem] px-4 py-3 text-sm ${status === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}>
          {message}
        </div>
      ) : null}

      <section className="rounded-[1.8rem] bg-white p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Admission Form Sharing</p>
              <h3 className="mt-2 font-display text-3xl text-navy">One parent form, one school process</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-navy/68">
                Families should fill one standard admission form. Admin can share it, receive submissions, verify documents, approve, and archive the printable packet.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyPublicLink} className="rounded-full border border-navy/10 px-4 py-2 text-sm font-semibold text-navy">
                Copy form link
              </button>
              <Link href="/admissions" target="_blank" className="rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white">
                Open parent form
              </Link>
            </div>
          </div>
          <div className="mt-5 rounded-[1.3rem] bg-[#fbf7f0] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Public link</p>
            <p className="mt-2 break-all text-sm text-navy/72">{publicFormUrl}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1rem] bg-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-navy/45">Published</p>
                <p className="mt-1 text-sm font-semibold text-navy">{formConfig.isPublished ? "Yes" : "No"}</p>
              </div>
              <div className="rounded-[1rem] bg-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-navy/45">Workflow states</p>
                <p className="mt-1 text-sm font-semibold text-navy">Submission to Review to Approval to Enrollment</p>
              </div>
              <div className="rounded-[1rem] bg-white px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-navy/45">Form type</p>
                <p className="mt-1 text-sm font-semibold text-navy">Fixed admission workflow</p>
              </div>
            </div>
            {isLocalhostLink ? (
              <p className="mt-4 text-xs leading-6 text-navy/58">
                This link works only on your machine right now. Use a deployed URL or a tunnel like ngrok/localtunnel to test parent submissions externally.
              </p>
            ) : null}
          </div>
      </section>

      <section className="rounded-[1.8rem] bg-white p-6 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Front Desk Admission Entry</p>
            <h3 className="mt-2 font-display text-3xl text-navy">Create a full application from the office desk</h3>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-navy/68">
              Capture child details, father/mother details, choose the primary portal parent, upload all required documents, and open a printable admission packet immediately after saving.
            </p>
          </div>
        </div>

        <form onSubmit={submitManualAdmission} className="mt-6 space-y-6">
          <div className="grid gap-4 xl:grid-cols-3">
            <section className="rounded-[1.4rem] bg-[#fbf7f0] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Primary Portal Contact</p>
              <div className="mt-4 space-y-3">
                {(["FATHER", "MOTHER", "GUARDIAN"] as AdmissionPrimaryParent[]).map((option) => (
                  <label key={option} className="flex items-center gap-3 rounded-[1rem] border border-navy/10 bg-white px-4 py-3 text-sm font-semibold text-navy">
                    <input
                      type="radio"
                      name="primaryParent"
                      value={option}
                      checked={manualAdmission.primaryParent === option}
                      onChange={(e) => setManualAdmission((current) => ({ ...current, primaryParent: e.target.value as AdmissionPrimaryParent }))}
                    />
                    {primaryParentLabelMap[option]} will receive portal access, SMS, and official communication
                  </label>
                ))}
              </div>
            </section>

            <section className="rounded-[1.4rem] bg-[#fbf7f0] p-5 xl:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Child details</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <input value={manualAdmission.childName} onChange={(e) => setManualAdmission((current) => ({ ...current, childName: e.target.value }))} placeholder="Child full name" className={inputClassName()} />
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy/55">DOB of child</p>
                  <input
                    type="date"
                    value={manualAdmission.childDob}
                    onChange={(e) =>
                      setManualAdmission((current) => ({
                        ...current,
                        childDob: e.target.value,
                        childAge: getAgeLabel(e.target.value),
                      }))
                    }
                    className={inputClassName()}
                  />
                </div>
                <input
                  value={manualAdmission.childAge}
                  readOnly
                  placeholder="Child age (auto)"
                  className={`${inputClassName()} bg-[#fbf7f0]`}
                />
                <select value={manualAdmission.childGender} onChange={(e) => setManualAdmission((current) => ({ ...current, childGender: e.target.value }))} className={inputClassName()}>
                  <option value="">Select gender</option>
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <select value={manualAdmission.childBloodGroup} onChange={(e) => setManualAdmission((current) => ({ ...current, childBloodGroup: e.target.value }))} className={inputClassName()}>
                  <option value="">Select blood group</option>
                  {bloodGroupOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <input value={manualAdmission.childAadhaar} onChange={(e) => setManualAdmission((current) => ({ ...current, childAadhaar: e.target.value }))} placeholder="Child Aadhaar number" className={inputClassName()} />
                <select value={manualAdmission.programSlug} onChange={(e) => setManualAdmission((current) => ({ ...current, programSlug: e.target.value }))} className={inputClassName()}>
                  <option value="">Select program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.slug}>
                      {program.name}
                    </option>
                  ))}
                </select>
                <input value={manualAdmission.preferredStartMonth} onChange={(e) => setManualAdmission((current) => ({ ...current, preferredStartMonth: e.target.value }))} placeholder="Preferred joining month" className={inputClassName()} />
                <input value={manualAdmission.schoolVisitStatus} onChange={(e) => setManualAdmission((current) => ({ ...current, schoolVisitStatus: e.target.value }))} placeholder="Visit status" className={inputClassName()} />
                <input value={manualAdmission.previousSchool} onChange={(e) => setManualAdmission((current) => ({ ...current, previousSchool: e.target.value }))} placeholder="Previous school" className={inputClassName()} />
                <input value={manualAdmission.previousGrade} onChange={(e) => setManualAdmission((current) => ({ ...current, previousGrade: e.target.value }))} placeholder="Previous grade" className={inputClassName()} />
              </div>
              <div className="mt-5 rounded-[1.2rem] border border-navy/10 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">Program fee preview</p>
                {selectedProgram && selectedProgram.feeStructures.length > 0 ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {selectedProgram.feeStructures.map((fee) => {
                      const nextDue = getNextDueDate(fee.frequency);
                      const firstPaymentDate = new Date();
                      return (
                        <div key={fee.id} className="rounded-[1rem] bg-[#fbf7f0] px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-navy/50">{fee.frequency}</p>
                          <p className="mt-2 text-sm font-semibold text-navy">{fee.title}</p>
                          <p className="mt-1 text-sm text-navy/70">
                            Rs. {fee.amount}
                            {fee.taxPercentage ? ` + ${fee.taxPercentage}% GST` : ""}
                          </p>
                          <p className="mt-2 text-xs text-navy/55">
                            First payment: {formatShortDate(firstPaymentDate)}
                          </p>
                          <p className="mt-1 text-xs text-navy/55">
                            Next payment: {getNextDueLabel(fee.frequency)}
                            {nextDue ? ` • ${formatShortDate(nextDue)}` : ""}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-navy/60">Select a program to preview the fee schedule and upcoming due date.</p>
                )}
              </div>
            </section>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-[1.4rem] bg-[#fbf7f0] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Father details</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input value={manualAdmission.fatherName} onChange={(e) => setManualAdmission((current) => ({ ...current, fatherName: e.target.value }))} placeholder="Father full name" className={inputClassName()} />
                <input value={manualAdmission.fatherPhone} onChange={(e) => setManualAdmission((current) => ({ ...current, fatherPhone: e.target.value }))} placeholder="Father phone" className={inputClassName()} />
                <input value={manualAdmission.fatherEmail} onChange={(e) => setManualAdmission((current) => ({ ...current, fatherEmail: e.target.value }))} placeholder="Father email" className={inputClassName()} />
                <input value={manualAdmission.fatherQualification} onChange={(e) => setManualAdmission((current) => ({ ...current, fatherQualification: e.target.value }))} placeholder="Qualification" className={inputClassName()} />
                <input value={manualAdmission.fatherOccupation} onChange={(e) => setManualAdmission((current) => ({ ...current, fatherOccupation: e.target.value }))} placeholder="Occupation / designation" className={`${inputClassName()} md:col-span-2`} />
              </div>
            </section>

            <section className="rounded-[1.4rem] bg-[#fbf7f0] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Mother details</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input value={manualAdmission.motherName} onChange={(e) => setManualAdmission((current) => ({ ...current, motherName: e.target.value }))} placeholder="Mother full name" className={inputClassName()} />
                <input value={manualAdmission.motherPhone} onChange={(e) => setManualAdmission((current) => ({ ...current, motherPhone: e.target.value }))} placeholder="Mother phone" className={inputClassName()} />
                <input value={manualAdmission.motherEmail} onChange={(e) => setManualAdmission((current) => ({ ...current, motherEmail: e.target.value }))} placeholder="Mother email" className={inputClassName()} />
                <input value={manualAdmission.motherQualification} onChange={(e) => setManualAdmission((current) => ({ ...current, motherQualification: e.target.value }))} placeholder="Qualification" className={inputClassName()} />
                <input value={manualAdmission.motherOccupation} onChange={(e) => setManualAdmission((current) => ({ ...current, motherOccupation: e.target.value }))} placeholder="Occupation / designation" className={`${inputClassName()} md:col-span-2`} />
              </div>
            </section>
          </div>

          <section className="rounded-[1.4rem] bg-[#fbf7f0] p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Guardian details (if applicable)</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input value={manualAdmission.guardianName} onChange={(e) => setManualAdmission((current) => ({ ...current, guardianName: e.target.value }))} placeholder="Guardian full name" className={inputClassName()} />
              <input value={manualAdmission.guardianPhone} onChange={(e) => setManualAdmission((current) => ({ ...current, guardianPhone: e.target.value }))} placeholder="Guardian phone" className={inputClassName()} />
              <input value={manualAdmission.guardianEmail} onChange={(e) => setManualAdmission((current) => ({ ...current, guardianEmail: e.target.value }))} placeholder="Guardian email" className={inputClassName()} />
              <input value={manualAdmission.guardianQualification} onChange={(e) => setManualAdmission((current) => ({ ...current, guardianQualification: e.target.value }))} placeholder="Guardian qualification" className={inputClassName()} />
              <input value={manualAdmission.guardianOccupation} onChange={(e) => setManualAdmission((current) => ({ ...current, guardianOccupation: e.target.value }))} placeholder="Guardian occupation / designation" className={`${inputClassName()} md:col-span-2`} />
            </div>
          </section>

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-[1.4rem] bg-[#fbf7f0] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Address & emergency</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <input value={manualAdmission.addressLine1} onChange={(e) => setManualAdmission((current) => ({ ...current, addressLine1: e.target.value }))} placeholder="Address line 1" className={`${inputClassName()} md:col-span-2`} />
                <input value={manualAdmission.addressLine2} onChange={(e) => setManualAdmission((current) => ({ ...current, addressLine2: e.target.value }))} placeholder="Address line 2" className={`${inputClassName()} md:col-span-2`} />
                <input value={manualAdmission.city} onChange={(e) => setManualAdmission((current) => ({ ...current, city: e.target.value }))} placeholder="City" className={inputClassName()} />
                <input value={manualAdmission.state} onChange={(e) => setManualAdmission((current) => ({ ...current, state: e.target.value }))} placeholder="State" className={inputClassName()} />
                <input value={manualAdmission.postalCode} onChange={(e) => setManualAdmission((current) => ({ ...current, postalCode: e.target.value }))} placeholder="Postal code" className={inputClassName()} />
                <input value={manualAdmission.emergencyContactName} onChange={(e) => setManualAdmission((current) => ({ ...current, emergencyContactName: e.target.value }))} placeholder="Emergency contact name" className={inputClassName()} />
                <input value={manualAdmission.emergencyContactPhone} onChange={(e) => setManualAdmission((current) => ({ ...current, emergencyContactPhone: e.target.value }))} placeholder="Emergency contact phone" className={inputClassName()} />
                <input value={manualAdmission.emergencyRelationship} onChange={(e) => setManualAdmission((current) => ({ ...current, emergencyRelationship: e.target.value }))} placeholder="Emergency relationship" className={inputClassName()} />
              </div>
            </section>

            <section className="rounded-[1.4rem] bg-[#fbf7f0] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Review & medical notes</p>
              <div className="mt-4 grid gap-4">
                <textarea value={manualAdmission.medicalNotes} onChange={(e) => setManualAdmission((current) => ({ ...current, medicalNotes: e.target.value }))} placeholder="Medical notes" className={inputClassName(true)} />
                <textarea value={manualAdmission.allergies} onChange={(e) => setManualAdmission((current) => ({ ...current, allergies: e.target.value }))} placeholder="Allergies" className={inputClassName(true)} />
                <textarea value={manualAdmission.parentExpectations} onChange={(e) => setManualAdmission((current) => ({ ...current, parentExpectations: e.target.value }))} placeholder="Parent expectations" className={inputClassName(true)} />
                <textarea value={manualAdmission.notes} onChange={(e) => setManualAdmission((current) => ({ ...current, notes: e.target.value }))} placeholder="Internal review note" className={inputClassName(true)} />
              </div>
            </section>
          </div>

          <section className="rounded-[1.4rem] bg-[#fbf7f0] p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-gold">Required documents</p>
                <p className="mt-2 text-sm leading-7 text-navy/68">Upload all supporting proofs now so the record is ready for verification, printing, and hard-copy backup.</p>
              </div>
              <p className="text-xs text-navy/55">These uploads are stored with the admission record.</p>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {requiredDocumentUploadKeys.map((document) => (
                <label key={document.key} className="rounded-[1rem] bg-white p-4 shadow-card">
                  <span className="block text-sm font-semibold text-navy">{document.label}</span>
                  <input
                    type="file"
                    onChange={(e) => setManualFiles((current) => ({ ...current, [document.key]: e.target.files?.[0] ?? null }))}
                    className="mt-4 block w-full text-xs text-navy/60 file:mr-3 file:rounded-full file:border-0 file:bg-cream file:px-3 file:py-2 file:text-xs file:font-semibold file:text-gold"
                  />
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
              {status === "loading" ? "Saving..." : "Create admission"}
            </button>
            <button type="button" onClick={() => { setManualAdmission(initialManualAdmission); setManualFiles({}); }} className="rounded-full border border-navy/10 px-5 py-3 text-sm font-semibold text-navy">
              Clear form
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[1.8rem] bg-white p-6 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Admissions Register</p>
            <h3 className="mt-2 font-display text-3xl text-navy">Track applications across the full enrollment pipeline</h3>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-navy/68">
              Parents submit first. Admin reviews and verifies next. Approval happens before enrollment. Parent portal creation and student creation happen only at the enrollment step after approval.
            </p>
          </div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by admission no, child, parent, phone" className="w-full rounded-[1rem] border border-navy/10 px-4 py-3 text-sm lg:max-w-sm" />
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {stageSummary.map((item) => (
            <span key={item.stage} className={`rounded-full px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] ${stageTone(item.stage)}`}>
              {item.label}: {item.count}
            </span>
          ))}
        </div>
        <div className="mt-6 overflow-hidden rounded-[1.4rem] border border-navy/10">
          <div className="grid grid-cols-[1.05fr_1.2fr_0.85fr_0.7fr_1.15fr] border-b border-navy/10 bg-[#fbf7f0] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy/52">
            <span>Admission</span>
            <span>Child & family</span>
            <span>Stage</span>
            <span>Docs</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-navy/8">
            {visibleAdmissions.map((item) => {
              const familyProfile = asRecord<AdmissionFamilyProfile>(item.familyProfile);
              const primaryName = getPrimaryParentName(familyProfile, item.parentName);
              const primaryPhone = getPrimaryParentPhone(familyProfile, item.phone);
              const primaryEmail = getPrimaryParentEmail(familyProfile, item.email);

              return (
                <div key={item.id} className="grid gap-4 px-5 py-5 xl:grid-cols-[1.05fr_1.2fr_0.85fr_0.7fr_1.15fr]">
                  <div>
                    <p className="font-semibold text-navy">{item.applicationNumber}</p>
                    <p className="mt-1 text-xs text-navy/52">Created {item.createdAtLabel}</p>
                    <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${stageTone(item.pipelineStage)}`}>
                      {item.pipelineStageLabel}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-navy">{item.childName}</p>
                    <p className="mt-1 text-sm text-navy/72">{primaryName}</p>
                    <p className="mt-1 text-xs leading-6 text-navy/55">{primaryPhone} {primaryEmail !== "Pending" ? `| ${primaryEmail}` : ""}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-navy">{item.programName ?? "Program pending"}</p>
                    <p className="mt-1 text-xs text-navy/52">{item.submittedByParent ? "Parent submitted" : "Front desk submitted"}</p>
                    <p className="mt-2 text-xs leading-6 text-navy/55">
                      {item.pipelineStage === "ENROLLED"
                        ? `Enrolled ${item.enrolledAtLabel ?? ""}`.trim()
                        : item.pipelineStage === "APPROVED"
                          ? `Approved ${item.approvedAtLabel ?? ""}`.trim()
                          : item.pipelineStage === "UNDER_REVIEW"
                            ? "Pending review decision"
                            : item.pipelineStage === "REJECTED"
                              ? "Application closed"
                              : "Waiting for review"}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-navy">{item.verifiedDocumentsCount}/{item.documentsCount}</p>
                    <p className="mt-1 text-xs text-navy/52">verified</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/admin/admissions/${item.id}`} className="rounded-full border border-navy/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-navy/72">
                      Open record
                    </Link>
                    <DocumentDownloadButton
                      href={`/api/admin/admissions/${item.id}/pdf`}
                      filename={`${item.applicationNumber}-application.pdf`}
                    >
                      Application PDF
                    </DocumentDownloadButton>
                    {item.pipelineStage === "ENROLLED" ? (
                      <DocumentDownloadButton
                        href={`/api/admin/admissions/${item.id}/confirmation-pdf`}
                        filename={`${item.applicationNumber}-confirmation.pdf`}
                      >
                        Confirmation PDF
                      </DocumentDownloadButton>
                    ) : null}
                    {item.pipelineStage === "ENROLLED" ? (
                      <button
                        type="button"
                        onClick={() => postAction({ action: "readmitNextYear", admissionId: item.id }, "New admission created for next academic year.")}
                        className="rounded-full border border-emerald-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700"
                      >
                        Re-admit next year
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => postAction({ action: "deleteAdmission", admissionId: item.id }, "Admission deleted.")}
                      className="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-rose-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
            {visibleAdmissions.length === 0 ? <div className="px-5 py-10 text-sm text-navy/60">No admissions match the current search.</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
