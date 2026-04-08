import { prisma } from "@/lib/prisma";
import {
  documentStatusLabelMap,
  documentTypeLabelMap,
  formatFamilyAddress,
  primaryParentLabelMap,
  type AdmissionChildProfile,
  type AdmissionFamilyProfile,
  type AdmissionOperationalProfile,
} from "@/lib/admissions";

export function formatPacketDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(value);
}

function asRecord<T>(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as T) : null;
}

function cleanText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function calculateAgeFromDob(dob: Date, referenceDate = new Date()) {
  let years = referenceDate.getFullYear() - dob.getFullYear();
  let months = referenceDate.getMonth() - dob.getMonth();

  if (referenceDate.getDate() < dob.getDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0) {
    return `${Math.max(months, 0)} month${months === 1 ? "" : "s"}`;
  }

  if (months <= 0) {
    return `${years} year${years === 1 ? "" : "s"}`;
  }

  return `${years} year${years === 1 ? "" : "s"} ${months} month${months === 1 ? "" : "s"}`;
}

function pushIfPresent(rows: Array<[string, string]>, label: string, value: string | null | undefined) {
  const clean = cleanText(value);
  if (clean) rows.push([label, clean]);
}

function formatParentLine(name?: string, phone?: string, email?: string) {
  const parts = [cleanText(name), cleanText(phone), cleanText(email)].filter(Boolean);
  return parts.length ? parts.join(" | ") : undefined;
}

export type ParentAdmissionPdfModel = {
  applicationNumber: string;
  submittedOn: string;
  statusLabel: string;
  childProfile: Array<[string, string]>;
  programSelection: Array<[string, string]>;
  parentGuardianDetails: Array<[string, string]>;
  addressDetails: Array<[string, string]>;
  previousSchoolDetails: Array<[string, string]>;
  admissionPreferences: Array<[string, string]>;
  submittedDocuments: string[];
  declaration: string;
};

export type AdminAdmissionReviewModel = {
  applicationNumber: string;
  source: string;
  status: string;
  submittedOn: string;
  approvedOn?: string;
  portalAccessState: string;
  child: Array<[string, string]>;
  parents: Array<[string, string]>;
  address?: string;
  structuredNotes: Array<[string, string]>;
  reviewNotes?: string;
  documents: Array<{ label: string; status: string; notes?: string }>;
};

export type EnrollmentConfirmationPdfModel = {
  applicationNumber: string;
  childName: string;
  programName?: string;
  className?: string;
  joiningMonth?: string;
  feeSummary: string[];
  parentPortalSummary: string[];
  nextSteps: string[];
} | null;

export type AdmissionDocumentBundle = {
  parentApplication: ParentAdmissionPdfModel;
  adminReview: AdminAdmissionReviewModel;
  enrollmentConfirmation: EnrollmentConfirmationPdfModel;
};

export async function getAdmissionDocumentBundle(admissionId: string): Promise<AdmissionDocumentBundle | null> {
  const admission = await prisma.admission.findUnique({
    where: { id: admissionId },
    include: {
      program: {
        include: {
          feeStructures: true,
        },
      },
      documents: {
        orderBy: { createdAt: "asc" },
      },
      student: {
        include: {
          currentClass: true,
        },
      },
      parent: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!admission) return null;

  const familyProfile = asRecord<AdmissionFamilyProfile>(admission.familyProfile);
  const childProfile = asRecord<AdmissionChildProfile>(admission.childProfile);
  const operationalProfile = asRecord<AdmissionOperationalProfile>(admission.admissionProfile);

  const parentRows: Array<[string, string]> = [];
  pushIfPresent(parentRows, "Primary Parent", cleanText(admission.parentName));
  pushIfPresent(
    parentRows,
    "Primary Portal Contact",
    familyProfile?.primaryParent ? primaryParentLabelMap[familyProfile.primaryParent] : undefined,
  );
  pushIfPresent(parentRows, "Father", formatParentLine(familyProfile?.fatherName, familyProfile?.fatherPhone, familyProfile?.fatherEmail));
  pushIfPresent(parentRows, "Mother", formatParentLine(familyProfile?.motherName, familyProfile?.motherPhone, familyProfile?.motherEmail));
  pushIfPresent(parentRows, "Guardian", formatParentLine(familyProfile?.guardianName, familyProfile?.guardianPhone, familyProfile?.guardianEmail));

  const childRows: Array<[string, string]> = [
    ["Child Name", admission.childName],
    ["Date of Birth", formatPacketDate(admission.childDob)],
    ["Age", calculateAgeFromDob(admission.childDob)],
  ];
  pushIfPresent(childRows, "Gender", childProfile?.gender);
  pushIfPresent(childRows, "Blood Group", childProfile?.bloodGroup);
  pushIfPresent(childRows, "Previous School", childProfile?.previousSchool);
  pushIfPresent(childRows, "Previous Grade", childProfile?.previousGrade);

  const structuredNotes: Array<[string, string]> = [];
  pushIfPresent(structuredNotes, "Preferred Joining Month", operationalProfile?.preferredStartMonth);
  pushIfPresent(structuredNotes, "Visit Status", operationalProfile?.schoolVisitStatus);
  pushIfPresent(structuredNotes, "Previous School", childProfile?.previousSchool);
  pushIfPresent(structuredNotes, "Special Notes", admission.notes);

  const statusLabelMap: Record<string, string> = {
    NEW: "Application Submitted",
    CONTACTED: "Family Contacted",
    DOCUMENTS_PENDING: "Documents Pending",
    APPROVED: "Approved",
    REJECTED: "Not Approved",
    ENROLLED: "Enrolled",
  };

  const parentAdmission: ParentAdmissionPdfModel = {
    applicationNumber: admission.applicationNumber,
    submittedOn: admission.submittedAt ? formatPacketDate(admission.submittedAt) : formatPacketDate(admission.createdAt),
    statusLabel: statusLabelMap[admission.status] ?? "Application Submitted",
    childProfile: childRows,
    programSelection: [
      ["Selected Program", admission.program?.name ?? "Program selection pending"],
      ["Application Type", admission.submittedByParent ? "Parent application" : "School front desk application"],
    ],
    parentGuardianDetails: parentRows,
    addressDetails: [
      ["Family Address", cleanText(formatFamilyAddress(familyProfile)) ?? "Address to be confirmed"],
      ["Emergency Contact", formatParentLine(familyProfile?.emergencyContactName, familyProfile?.emergencyContactPhone) ?? "Not provided"],
      ["Emergency Relationship", cleanText(familyProfile?.emergencyRelationship) ?? "Not provided"],
    ],
    previousSchoolDetails: [
      ["Previous School", cleanText(childProfile?.previousSchool) ?? "Not Applicable"],
      ["Previous Grade", cleanText(childProfile?.previousGrade) ?? "Not Applicable"],
    ],
    admissionPreferences: [
      ["Preferred Joining Month", cleanText(operationalProfile?.preferredStartMonth) ?? "To be confirmed"],
      ["Visit Status", cleanText(operationalProfile?.schoolVisitStatus) ?? "Not recorded"],
      ["Medical Notes", cleanText(childProfile?.medicalNotes) ?? "None recorded"],
      ["Allergies", cleanText(childProfile?.allergies) ?? "None recorded"],
      ["Special Notes", cleanText(admission.notes) ?? "None recorded"],
    ],
    submittedDocuments: admission.documents.map((document) => documentTypeLabelMap[document.documentType]),
    declaration:
      "I confirm that the information provided in this admission application is true to the best of my knowledge and that the submitted documents belong to the applicant family.",
  };

  const adminReview: AdminAdmissionReviewModel = {
    applicationNumber: admission.applicationNumber,
    source: admission.submittedByParent ? "Parent web form" : "Front desk entry",
    status: admission.status.replaceAll("_", " "),
    submittedOn: admission.submittedAt ? formatPacketDate(admission.submittedAt) : formatPacketDate(admission.createdAt),
    approvedOn: admission.approvedAt ? formatPacketDate(admission.approvedAt) : undefined,
    portalAccessState: admission.portalAccessSentAt ? `Created on ${formatPacketDate(admission.portalAccessSentAt)}` : "Not created",
    child: childRows,
    parents: parentRows,
    address: cleanText(formatFamilyAddress(familyProfile)),
    structuredNotes,
    reviewNotes: cleanText(admission.reviewNotes),
    documents: admission.documents.map((document) => ({
      label: documentTypeLabelMap[document.documentType],
      status: documentStatusLabelMap[document.status],
      notes: cleanText(document.notes),
    })),
  };

  const enrollmentConfirmation: EnrollmentConfirmationPdfModel =
    admission.status === "APPROVED" || admission.student || admission.parent
      ? {
          applicationNumber: admission.applicationNumber,
          childName: admission.childName,
          programName: admission.program?.name,
          className: admission.student?.currentClass
            ? `${admission.student.currentClass.name}${admission.student.currentClass.section ? ` - ${admission.student.currentClass.section}` : ""}`
            : undefined,
          joiningMonth: cleanText(operationalProfile?.preferredStartMonth),
          feeSummary:
            admission.program?.feeStructures.map((fee) => `${fee.title}: Rs. ${fee.amount.toString()}`) ?? [],
          parentPortalSummary: [
            admission.parent?.user?.email ? `Portal email: ${admission.parent.user.email}` : "",
            admission.portalAccessSentAt ? `Portal activated on ${formatPacketDate(admission.portalAccessSentAt)}` : "Portal activation pending",
          ].filter(Boolean),
          nextSteps: [
            "Please complete any pending fee formalities before the joining date.",
            "Carry one printed copy of the admission form and original documents for verification.",
            "The school office will guide you through classroom orientation and portal onboarding.",
          ],
        }
      : null;

  return {
    parentApplication: parentAdmission,
    adminReview,
    enrollmentConfirmation,
  };
}
