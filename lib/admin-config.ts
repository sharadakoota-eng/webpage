import { prisma } from "@/lib/prisma";

export type AdmissionFormFieldKey =
  | "parentName"
  | "fatherName"
  | "motherName"
  | "phone"
  | "fatherPhone"
  | "motherPhone"
  | "email"
  | "fatherEmail"
  | "motherEmail"
  | "fatherQualification"
  | "motherQualification"
  | "fatherOccupation"
  | "motherOccupation"
  | "childName"
  | "childDob"
  | "childGender"
  | "childBloodGroup"
  | "childAadhaar"
  | "program"
  | "childAge"
  | "preferredStartMonth"
  | "schoolVisitStatus"
  | "previousSchool"
  | "previousGrade"
  | "addressLine1"
  | "addressLine2"
  | "city"
  | "state"
  | "postalCode"
  | "emergencyContactName"
  | "emergencyContactPhone"
  | "emergencyRelationship"
  | "medicalNotes"
  | "allergies"
  | "parentExpectations"
  | "notes";

export type AdmissionFormFieldConfig = {
  key: AdmissionFormFieldKey;
  label: string;
  enabled: boolean;
  required: boolean;
};

export type AdmissionFormConfig = {
  title: string;
  description: string;
  isPublished: boolean;
  fields: AdmissionFormFieldConfig[];
  requiredDocuments: {
    key: string;
    label: string;
    enabled: boolean;
    required: boolean;
  }[];
};

export type ClassBatchProfile = {
  classId: string;
  programId?: string;
  batchName?: string;
  timing?: string;
  status?: "ACTIVE" | "PAUSED" | "FULL";
};

export const defaultAdmissionFormConfig: AdmissionFormConfig = {
  title: "Admissions 2026",
  description: "Primary admission form for Montessori, day care, camp, and enrichment enquiries.",
  isPublished: true,
  fields: [
    { key: "parentName", label: "Primary parent name", enabled: true, required: true },
    { key: "fatherName", label: "Father name", enabled: true, required: true },
    { key: "motherName", label: "Mother name", enabled: true, required: true },
    { key: "phone", label: "Phone", enabled: true, required: true },
    { key: "fatherPhone", label: "Father phone", enabled: true, required: true },
    { key: "motherPhone", label: "Mother phone", enabled: true, required: true },
    { key: "email", label: "Email", enabled: true, required: false },
    { key: "fatherEmail", label: "Father email", enabled: true, required: false },
    { key: "motherEmail", label: "Mother email", enabled: true, required: false },
    { key: "fatherQualification", label: "Father qualification", enabled: true, required: false },
    { key: "motherQualification", label: "Mother qualification", enabled: true, required: false },
    { key: "fatherOccupation", label: "Father occupation", enabled: true, required: false },
    { key: "motherOccupation", label: "Mother occupation", enabled: true, required: false },
    { key: "childName", label: "Child name", enabled: true, required: true },
    { key: "childDob", label: "Child date of birth", enabled: true, required: true },
    { key: "childGender", label: "Child gender", enabled: true, required: false },
    { key: "childBloodGroup", label: "Child blood group", enabled: true, required: false },
    { key: "childAadhaar", label: "Child Aadhaar number", enabled: true, required: false },
    { key: "program", label: "Program interest", enabled: true, required: false },
    { key: "childAge", label: "Child age", enabled: true, required: false },
    { key: "preferredStartMonth", label: "Preferred joining month", enabled: true, required: false },
    { key: "schoolVisitStatus", label: "Visit status", enabled: true, required: false },
    { key: "previousSchool", label: "Previous school", enabled: true, required: false },
    { key: "previousGrade", label: "Previous grade", enabled: true, required: false },
    { key: "addressLine1", label: "Address line 1", enabled: true, required: false },
    { key: "addressLine2", label: "Address line 2", enabled: true, required: false },
    { key: "city", label: "City", enabled: true, required: false },
    { key: "state", label: "State", enabled: true, required: false },
    { key: "postalCode", label: "Postal code", enabled: true, required: false },
    { key: "emergencyContactName", label: "Emergency contact name", enabled: true, required: false },
    { key: "emergencyContactPhone", label: "Emergency contact phone", enabled: true, required: false },
    { key: "emergencyRelationship", label: "Emergency contact relationship", enabled: true, required: false },
    { key: "medicalNotes", label: "Medical notes", enabled: true, required: false },
    { key: "allergies", label: "Allergies", enabled: true, required: false },
    { key: "parentExpectations", label: "Parent expectations", enabled: true, required: false },
    { key: "notes", label: "Additional notes", enabled: true, required: false },
  ],
  requiredDocuments: [
    { key: "birth_certificate", label: "Birth certificate", enabled: true, required: true },
    { key: "child_aadhaar", label: "Child Aadhaar", enabled: true, required: true },
    { key: "father_aadhaar", label: "Father Aadhaar", enabled: true, required: true },
    { key: "mother_aadhaar", label: "Mother Aadhaar", enabled: true, required: true },
    { key: "address_proof", label: "Address proof", enabled: true, required: true },
    { key: "child_photo", label: "Child passport photo", enabled: true, required: true },
    { key: "previous_school_record", label: "Previous school record / marks card", enabled: true, required: false },
    { key: "medical_record", label: "Medical record", enabled: true, required: false },
  ],
};

export async function getAdmissionFormConfig() {
  const setting = await prisma.setting.findUnique({
    where: { key: "admission_form_config" },
  });

  const saved = (setting?.value as Partial<AdmissionFormConfig> | undefined) ?? {};
  const savedFields = Array.isArray(saved.fields) ? saved.fields : [];
  const savedDocuments = Array.isArray(saved.requiredDocuments) ? saved.requiredDocuments : [];

  return {
    title: saved.title ?? defaultAdmissionFormConfig.title,
    description: saved.description ?? defaultAdmissionFormConfig.description,
    isPublished: saved.isPublished ?? defaultAdmissionFormConfig.isPublished,
    fields: defaultAdmissionFormConfig.fields.map((field) => {
      const match = savedFields.find((item) => item?.key === field.key);
      return match ? { ...field, ...match } : field;
    }),
    requiredDocuments: defaultAdmissionFormConfig.requiredDocuments.map((document) => {
      const match = savedDocuments.find((item) => item?.key === document.key);
      return match ? { ...document, ...match } : document;
    }),
  };
}

export async function getClassBatchProfiles() {
  const setting = await prisma.setting.findUnique({
    where: { key: "class_batch_profiles" },
  });

  return (setting?.value as ClassBatchProfile[] | undefined) ?? [];
}

export async function getSchoolProfileSetting() {
  const setting = await prisma.setting.findUnique({
    where: { key: "school_profile" },
  });

  return (
    (setting?.value as
      | {
          name?: string;
          tagline?: string;
          phoneNumbers?: string[];
          email?: string;
          address?: string[];
          academicYear?: string;
          defaultCampus?: string;
        }
      | undefined) ?? {
      name: "Sharada Koota Montessori",
      tagline: "A House of Learning",
      phoneNumbers: ["9880199221"],
      email: "sharadakoota@gmail.com",
      address: ["HSR Layout", "Bengaluru"],
      academicYear: "2026-2027",
      defaultCampus: "HSR Layout",
    }
  );
}
