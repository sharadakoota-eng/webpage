"use client";

import { useState } from "react";
import type { AdmissionFormConfig } from "@/lib/admin-config";
import { admissionDocumentTypes } from "@/lib/admissions";

type ProgramOption = {
  slug: string;
  title: string;
};

type AdmissionFormProps = {
  formConfig: AdmissionFormConfig;
  programs: ProgramOption[];
};

const initialValues = {
  primaryParent: "FATHER",
  fatherName: "",
  motherName: "",
  guardianName: "",
  fatherPhone: "",
  motherPhone: "",
  guardianPhone: "",
  fatherEmail: "",
  motherEmail: "",
  guardianEmail: "",
  fatherQualification: "",
  motherQualification: "",
  guardianQualification: "",
  fatherOccupation: "",
  motherOccupation: "",
  guardianOccupation: "",
  childName: "",
  childDob: "",
  childAge: "",
  childGender: "",
  childBloodGroup: "",
  childAadhaar: "",
  previousSchool: "",
  previousGrade: "",
  programSlug: "",
  preferredStartMonth: "",
  schoolVisitStatus: "",
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

function labelFor(field: keyof typeof initialValues) {
  const labels: Record<keyof typeof initialValues, string> = {
    primaryParent: "Primary parent for portal access",
    fatherName: "Father name",
    motherName: "Mother name",
    guardianName: "Guardian name",
    fatherPhone: "Father phone",
    motherPhone: "Mother phone",
    guardianPhone: "Guardian phone",
    fatherEmail: "Father email",
    motherEmail: "Mother email",
    guardianEmail: "Guardian email",
    fatherQualification: "Father qualification",
    motherQualification: "Mother qualification",
    guardianQualification: "Guardian qualification",
    fatherOccupation: "Father occupation",
    motherOccupation: "Mother occupation",
    guardianOccupation: "Guardian occupation",
    childName: "Child full name",
    childDob: "Child date of birth",
    childAge: "Child age",
    childGender: "Child gender",
    childBloodGroup: "Child blood group",
    childAadhaar: "Child Aadhaar number",
    previousSchool: "Previous school",
    previousGrade: "Previous grade",
    programSlug: "Program applying for",
    preferredStartMonth: "Preferred joining month",
    schoolVisitStatus: "Visit status",
    addressLine1: "Address line 1",
    addressLine2: "Address line 2",
    city: "City",
    state: "State",
    postalCode: "Postal code",
    emergencyContactName: "Emergency contact name",
    emergencyContactPhone: "Emergency contact phone",
    emergencyRelationship: "Emergency relationship",
    medicalNotes: "Medical notes",
    allergies: "Allergies",
    parentExpectations: "Parent expectations",
    notes: "Additional notes",
  };

  return labels[field];
}

function inputClassName(textarea = false) {
  return `rounded-[1.25rem] border border-navy/10 bg-white px-4 py-3 text-sm text-navy placeholder:text-navy/35 ${textarea ? "min-h-[120px]" : ""}`;
}

export function AdmissionForm({ formConfig, programs }: AdmissionFormProps) {
  const [values, setValues] = useState(initialValues);
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const requiredDocs = formConfig.requiredDocuments.filter((item) => item.enabled);

  function updateValue(key: keyof typeof initialValues, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("loading");
    setMessage("");

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value);
      });
      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const response = await fetch("/api/admissions", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { success?: boolean; message?: string; applicationNumber?: string };
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to submit admission");
      }

      setStatus("success");
      setMessage(`Admission submitted successfully. Application No: ${data.applicationNumber ?? "Pending"}`);
      setValues(initialValues);
      setFiles({});
      formElement.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit admission");
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[2rem] bg-white p-8 shadow-card lg:p-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gold">Admission Form</p>
          <h2 className="mt-2 font-display text-4xl text-navy">{formConfig.title}</h2>
        </div>
        <p className="max-w-2xl text-sm leading-7 text-navy/70">{formConfig.description}</p>
      </div>

      <div className="mt-8 space-y-8">
        <section className="rounded-[1.7rem] bg-[#fbf7f0] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Child Details</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <input required value={values.childName} onChange={(e) => updateValue("childName", e.target.value)} placeholder={labelFor("childName")} className={inputClassName()} />
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-navy/55">DOB of child</p>
              <input required type="date" value={values.childDob} onChange={(e) => updateValue("childDob", e.target.value)} className={inputClassName()} />
            </div>
            <input value={values.childAge} onChange={(e) => updateValue("childAge", e.target.value)} placeholder={labelFor("childAge")} className={inputClassName()} />
            <input value={values.childGender} onChange={(e) => updateValue("childGender", e.target.value)} placeholder={labelFor("childGender")} className={inputClassName()} />
            <input value={values.childBloodGroup} onChange={(e) => updateValue("childBloodGroup", e.target.value)} placeholder={labelFor("childBloodGroup")} className={inputClassName()} />
            <input value={values.childAadhaar} onChange={(e) => updateValue("childAadhaar", e.target.value)} placeholder={labelFor("childAadhaar")} className={inputClassName()} />
            <input value={values.previousSchool} onChange={(e) => updateValue("previousSchool", e.target.value)} placeholder={labelFor("previousSchool")} className={inputClassName()} />
            <input value={values.previousGrade} onChange={(e) => updateValue("previousGrade", e.target.value)} placeholder={labelFor("previousGrade")} className={inputClassName()} />
            <select value={values.programSlug} onChange={(e) => updateValue("programSlug", e.target.value)} className={inputClassName()}>
                <option value="">Select program</option>
                {programs.map((program) => (
                  <option key={program.slug} value={program.slug}>
                    {program.title}
                  </option>
                ))}
              </select>
            <input value={values.preferredStartMonth} onChange={(e) => updateValue("preferredStartMonth", e.target.value)} placeholder={labelFor("preferredStartMonth")} className={inputClassName()} />
            <input value={values.schoolVisitStatus} onChange={(e) => updateValue("schoolVisitStatus", e.target.value)} placeholder={labelFor("schoolVisitStatus")} className={inputClassName()} />
            <textarea value={values.medicalNotes} onChange={(e) => updateValue("medicalNotes", e.target.value)} placeholder={labelFor("medicalNotes")} className={inputClassName(true)} />
            <textarea value={values.allergies} onChange={(e) => updateValue("allergies", e.target.value)} placeholder={labelFor("allergies")} className={inputClassName(true)} />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-[1.7rem] bg-[#fbf7f0] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Father Details</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input required value={values.fatherName} onChange={(e) => updateValue("fatherName", e.target.value)} placeholder={labelFor("fatherName")} className={inputClassName()} />
              <input value={values.fatherPhone} onChange={(e) => updateValue("fatherPhone", e.target.value)} placeholder={labelFor("fatherPhone")} className={inputClassName()} />
              <input value={values.fatherEmail} onChange={(e) => updateValue("fatherEmail", e.target.value)} placeholder={labelFor("fatherEmail")} className={inputClassName()} />
              <input value={values.fatherQualification} onChange={(e) => updateValue("fatherQualification", e.target.value)} placeholder={labelFor("fatherQualification")} className={inputClassName()} />
              <input value={values.fatherOccupation} onChange={(e) => updateValue("fatherOccupation", e.target.value)} placeholder={labelFor("fatherOccupation")} className={inputClassName()} />
            </div>
          </div>

          <div className="rounded-[1.7rem] bg-[#fbf7f0] p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Mother Details</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input required value={values.motherName} onChange={(e) => updateValue("motherName", e.target.value)} placeholder={labelFor("motherName")} className={inputClassName()} />
              <input value={values.motherPhone} onChange={(e) => updateValue("motherPhone", e.target.value)} placeholder={labelFor("motherPhone")} className={inputClassName()} />
              <input value={values.motherEmail} onChange={(e) => updateValue("motherEmail", e.target.value)} placeholder={labelFor("motherEmail")} className={inputClassName()} />
              <input value={values.motherQualification} onChange={(e) => updateValue("motherQualification", e.target.value)} placeholder={labelFor("motherQualification")} className={inputClassName()} />
              <input value={values.motherOccupation} onChange={(e) => updateValue("motherOccupation", e.target.value)} placeholder={labelFor("motherOccupation")} className={inputClassName()} />
            </div>
          </div>
        </section>

        <section className="rounded-[1.7rem] bg-[#fbf7f0] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Guardian Details (if applicable)</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input value={values.guardianName} onChange={(e) => updateValue("guardianName", e.target.value)} placeholder={labelFor("guardianName")} className={inputClassName()} />
            <input value={values.guardianPhone} onChange={(e) => updateValue("guardianPhone", e.target.value)} placeholder={labelFor("guardianPhone")} className={inputClassName()} />
            <input value={values.guardianEmail} onChange={(e) => updateValue("guardianEmail", e.target.value)} placeholder={labelFor("guardianEmail")} className={inputClassName()} />
            <input value={values.guardianQualification} onChange={(e) => updateValue("guardianQualification", e.target.value)} placeholder={labelFor("guardianQualification")} className={inputClassName()} />
            <input value={values.guardianOccupation} onChange={(e) => updateValue("guardianOccupation", e.target.value)} placeholder={labelFor("guardianOccupation")} className={`${inputClassName()} md:col-span-2`} />
          </div>
        </section>

        <section className="rounded-[1.7rem] bg-[#fbf7f0] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Primary Parent, Address & Emergency</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <select value={values.primaryParent} onChange={(e) => updateValue("primaryParent", e.target.value)} className={inputClassName()}>
              <option value="FATHER">Father is the primary parent</option>
              <option value="MOTHER">Mother is the primary parent</option>
              <option value="GUARDIAN">Guardian is the primary parent</option>
            </select>
            <input value={values.addressLine1} onChange={(e) => updateValue("addressLine1", e.target.value)} placeholder={labelFor("addressLine1")} className={inputClassName()} />
            <input value={values.addressLine2} onChange={(e) => updateValue("addressLine2", e.target.value)} placeholder={labelFor("addressLine2")} className={inputClassName()} />
            <input value={values.city} onChange={(e) => updateValue("city", e.target.value)} placeholder={labelFor("city")} className={inputClassName()} />
            <input value={values.state} onChange={(e) => updateValue("state", e.target.value)} placeholder={labelFor("state")} className={inputClassName()} />
            <input value={values.postalCode} onChange={(e) => updateValue("postalCode", e.target.value)} placeholder={labelFor("postalCode")} className={inputClassName()} />
            <input value={values.emergencyContactName} onChange={(e) => updateValue("emergencyContactName", e.target.value)} placeholder={labelFor("emergencyContactName")} className={inputClassName()} />
            <input value={values.emergencyContactPhone} onChange={(e) => updateValue("emergencyContactPhone", e.target.value)} placeholder={labelFor("emergencyContactPhone")} className={inputClassName()} />
            <input value={values.emergencyRelationship} onChange={(e) => updateValue("emergencyRelationship", e.target.value)} placeholder={labelFor("emergencyRelationship")} className={inputClassName()} />
          </div>
        </section>

        <section className="rounded-[1.7rem] bg-[#fbf7f0] p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Parent Notes</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <textarea value={values.parentExpectations} onChange={(e) => updateValue("parentExpectations", e.target.value)} placeholder={labelFor("parentExpectations")} className={inputClassName(true)} />
            <textarea value={values.notes} onChange={(e) => updateValue("notes", e.target.value)} placeholder={labelFor("notes")} className={inputClassName(true)} />
          </div>
        </section>

        <section className="rounded-[1.7rem] bg-[#fbf7f0] p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Documents</p>
              <h3 className="mt-2 font-display text-3xl text-navy">Upload all required proofs in one place</h3>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-navy/68">
              The school office will verify these documents manually before approval. Upload clear copies for faster review.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {requiredDocs.map((document) => {
              const match = admissionDocumentTypes.find((item) => item.key === document.key);
              if (!match) return null;

              return (
                <label key={document.key} className="rounded-[1.2rem] bg-white p-4 shadow-card">
                  <span className="block text-sm font-semibold text-navy">{document.label}</span>
                  <span className="mt-1 block text-xs text-navy/55">{document.required ? "Required" : "Optional"}</span>
                  <input
                    type="file"
                    onChange={(e) => setFiles((current) => ({ ...current, [document.key]: e.target.files?.[0] ?? null }))}
                    className="mt-4 block w-full text-xs text-navy/60 file:mr-3 file:rounded-full file:border-0 file:bg-cream file:px-3 file:py-2 file:text-xs file:font-semibold file:text-gold"
                  />
                </label>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <button className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white">
          {status === "loading" ? "Submitting..." : "Submit admission"}
        </button>
        {message ? (
          <p className={`text-sm ${status === "success" ? "text-emerald-700" : "text-red-600"}`}>{message}</p>
        ) : null}
      </div>
    </form>
  );
}
