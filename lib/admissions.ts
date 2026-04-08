import { AdmissionStatus, ApplicationDocumentStatus, DocumentType } from "@prisma/client";

export type AdmissionPrimaryParent = "FATHER" | "MOTHER" | "GUARDIAN";

export type AdmissionChildProfile = {
  gender?: string;
  bloodGroup?: string;
  aadhaarNumber?: string;
  ageText?: string;
  previousSchool?: string;
  previousGrade?: string;
  medicalNotes?: string;
  allergies?: string;
};

export type AdmissionFamilyProfile = {
  primaryParent?: AdmissionPrimaryParent;
  fatherName?: string;
  motherName?: string;
  guardianName?: string;
  fatherPhone?: string;
  motherPhone?: string;
  guardianPhone?: string;
  fatherEmail?: string;
  motherEmail?: string;
  guardianEmail?: string;
  fatherQualification?: string;
  motherQualification?: string;
  guardianQualification?: string;
  fatherOccupation?: string;
  motherOccupation?: string;
  guardianOccupation?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelationship?: string;
};

export type AdmissionOperationalProfile = {
  preferredStartMonth?: string;
  schoolVisitStatus?: string;
  parentExpectations?: string;
  internalNotes?: string;
  source?: string;
  feePlanStatus?: string;
  portalReady?: boolean;
  parentSubmittedAt?: string;
};

export const admissionDocumentTypes = [
  { key: "birth_certificate", label: "Birth certificate", type: DocumentType.BIRTH_CERTIFICATE },
  { key: "child_aadhaar", label: "Child Aadhaar", type: DocumentType.CHILD_AADHAAR },
  { key: "father_aadhaar", label: "Father Aadhaar", type: DocumentType.FATHER_AADHAAR },
  { key: "mother_aadhaar", label: "Mother Aadhaar", type: DocumentType.MOTHER_AADHAAR },
  { key: "address_proof", label: "Address proof", type: DocumentType.ADDRESS_PROOF },
  { key: "child_photo", label: "Child passport photo", type: DocumentType.PHOTO },
  { key: "previous_school_record", label: "Previous school record / marks card", type: DocumentType.PREVIOUS_SCHOOL_RECORD },
  { key: "medical_record", label: "Medical record", type: DocumentType.MEDICAL_RECORD },
] as const;

export const documentTypeLabelMap: Record<DocumentType, string> = {
  BIRTH_CERTIFICATE: "Birth certificate",
  CHILD_AADHAAR: "Child Aadhaar",
  FATHER_AADHAAR: "Father Aadhaar",
  MOTHER_AADHAAR: "Mother Aadhaar",
  ID_PROOF: "ID proof",
  ADDRESS_PROOF: "Address proof",
  MEDICAL_RECORD: "Medical record",
  PHOTO: "Child photo",
  PREVIOUS_SCHOOL_RECORD: "Previous school record / marks card",
  OTHER: "Other",
};

export const documentStatusLabelMap: Record<ApplicationDocumentStatus, string> = {
  REQUESTED: "Requested",
  UPLOADED: "Uploaded",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

export const primaryParentLabelMap: Record<AdmissionPrimaryParent, string> = {
  FATHER: "Father",
  MOTHER: "Mother",
  GUARDIAN: "Guardian",
};

export type AdmissionPipelineStage = "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "ENROLLED";

export const admissionPipelineStageLabelMap: Record<AdmissionPipelineStage, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ENROLLED: "Enrolled",
};

export function deriveAdmissionPipelineStage(input: {
  status: AdmissionStatus;
  studentId?: string | null;
  parentId?: string | null;
  enrolledAt?: Date | string | null;
}) {
  if (input.studentId || input.parentId || input.enrolledAt) return "ENROLLED" satisfies AdmissionPipelineStage;
  if (input.status === AdmissionStatus.REJECTED) return "REJECTED" satisfies AdmissionPipelineStage;
  if (input.status === AdmissionStatus.APPROVED) return "APPROVED" satisfies AdmissionPipelineStage;
  if (input.status === AdmissionStatus.UNDER_REVIEW || input.status === AdmissionStatus.DOCUMENTS_PENDING || input.status === AdmissionStatus.WAITLISTED) {
    return "UNDER_REVIEW" satisfies AdmissionPipelineStage;
  }
  return "SUBMITTED" satisfies AdmissionPipelineStage;
}

export function buildAdmissionNotes(input: {
  childAge?: string;
  preferredStartMonth?: string;
  schoolVisitStatus?: string;
  previousSchool?: string;
  parentExpectations?: string;
  notes?: string;
}) {
  return [
    input.childAge ? `Child age: ${input.childAge}` : null,
    input.preferredStartMonth ? `Preferred start month: ${input.preferredStartMonth}` : null,
    input.schoolVisitStatus ? `School visit status: ${input.schoolVisitStatus}` : null,
    input.previousSchool ? `Previous school: ${input.previousSchool}` : null,
    input.parentExpectations ? `Parent expectations: ${input.parentExpectations}` : null,
    input.notes ? `Additional notes: ${input.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function formatFamilyAddress(familyProfile?: AdmissionFamilyProfile | null) {
  if (!familyProfile) return "Address pending";

  const parts = [
    familyProfile.addressLine1,
    familyProfile.addressLine2,
    familyProfile.city,
    familyProfile.state,
    familyProfile.postalCode,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Address pending";
}

export function getPrimaryParentName(
  familyProfile: AdmissionFamilyProfile | null | undefined,
  fallbackName: string,
) {
  if (!familyProfile?.primaryParent) return fallbackName;
  if (familyProfile.primaryParent === "MOTHER") {
    return familyProfile.motherName || fallbackName;
  }
  if (familyProfile.primaryParent === "GUARDIAN") {
    return familyProfile.guardianName || fallbackName;
  }
  return familyProfile.fatherName || fallbackName;
}

export function getPrimaryParentPhone(
  familyProfile: AdmissionFamilyProfile | null | undefined,
  fallbackPhone?: string | null,
) {
  if (!familyProfile?.primaryParent) return fallbackPhone ?? "Pending";
  if (familyProfile.primaryParent === "MOTHER") {
    return familyProfile.motherPhone || fallbackPhone || "Pending";
  }
  if (familyProfile.primaryParent === "GUARDIAN") {
    return familyProfile.guardianPhone || fallbackPhone || "Pending";
  }
  return familyProfile.fatherPhone || fallbackPhone || "Pending";
}

export function getPrimaryParentEmail(
  familyProfile: AdmissionFamilyProfile | null | undefined,
  fallbackEmail?: string | null,
) {
  if (!familyProfile?.primaryParent) return fallbackEmail ?? "Pending";
  if (familyProfile.primaryParent === "MOTHER") {
    return familyProfile.motherEmail || fallbackEmail || "Pending";
  }
  if (familyProfile.primaryParent === "GUARDIAN") {
    return familyProfile.guardianEmail || fallbackEmail || "Pending";
  }
  return familyProfile.fatherEmail || fallbackEmail || "Pending";
}
