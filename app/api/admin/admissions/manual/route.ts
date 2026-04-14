import crypto from "node:crypto";
import { AdmissionStatus, ApplicationDocumentStatus, RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { admissionDocumentTypes, buildAdmissionNotes, type AdmissionPrimaryParent } from "@/lib/admissions";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";
import { admissionSchema } from "@/lib/validators";
import { storeAdmissionUpload } from "@/lib/admission-uploads";

type UploadedAdmissionDocument = {
  documentType: (typeof admissionDocumentTypes)[number]["type"];
  status: "UPLOADED";
  fileName: string;
  fileUrl: string;
};

function createApplicationNumber() {
  const date = new Date();
  return `ADM-${date.getFullYear()}-${Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0")}`;
}

function createShareToken() {
  return crypto.randomBytes(12).toString("hex");
}

async function saveDocumentUploads(applicationNumber: string, formData: FormData): Promise<UploadedAdmissionDocument[]> {
  const uploads = await Promise.all(
    admissionDocumentTypes.map(async (document) => {
      const file = formData.get(document.key);
      if (!(file instanceof File) || file.size === 0) {
        return null;
      }
      const stored = await storeAdmissionUpload({
        file,
        applicationNumber,
        documentKey: document.key,
      });
      return {
        documentType: document.type,
        status: ApplicationDocumentStatus.UPLOADED,
        fileName: stored.fileName,
        fileUrl: stored.fileUrl,
      };
    }),
  );

  return uploads.filter((item): item is UploadedAdmissionDocument => item !== null);
}

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.FRONT_DESK]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const raw = Object.fromEntries(
      Array.from(formData.entries()).filter(([, value]) => typeof value === "string"),
    ) as Record<string, string>;

    const body = admissionSchema.parse(raw);
    const primaryParent = body.primaryParent as AdmissionPrimaryParent;
    const primaryParentName =
      primaryParent === "MOTHER"
        ? body.motherName
        : primaryParent === "GUARDIAN"
          ? body.guardianName || body.fatherName || body.motherName
          : body.fatherName;
    const primaryPhone =
      primaryParent === "MOTHER"
        ? body.motherPhone
        : primaryParent === "GUARDIAN"
          ? body.guardianPhone
          : body.fatherPhone;
    const primaryEmail =
      primaryParent === "MOTHER"
        ? body.motherEmail
        : primaryParent === "GUARDIAN"
          ? body.guardianEmail
          : body.fatherEmail;

    if (!primaryPhone) {
      return NextResponse.json({ success: false, message: "Primary parent phone is required." }, { status: 400 });
    }

    const program = body.programSlug
      ? await prisma.program.findUnique({ where: { slug: body.programSlug } })
      : null;
    const applicationNumber = createApplicationNumber();
    const uploadedDocuments = await saveDocumentUploads(applicationNumber, formData);
    const notes = buildAdmissionNotes({
      childAge: body.childAge,
      preferredStartMonth: body.preferredStartMonth,
      schoolVisitStatus: body.schoolVisitStatus,
      previousSchool: body.previousSchool,
      parentExpectations: body.parentExpectations,
      notes: body.notes,
    });

    const admission = await prisma.admission.create({
      data: {
        applicationNumber,
        shareToken: createShareToken(),
        parentName: primaryParentName,
        childName: body.childName,
        childDob: new Date(body.childDob),
        phone: primaryPhone,
        email: primaryEmail || undefined,
        notes: notes || undefined,
        status: AdmissionStatus.UNDER_REVIEW,
        submittedByParent: false,
        programId: program?.id,
        familyProfile: {
          primaryParent,
          fatherName: body.fatherName,
          motherName: body.motherName,
          guardianName: body.guardianName || undefined,
          fatherPhone: body.fatherPhone || undefined,
          motherPhone: body.motherPhone || undefined,
          guardianPhone: body.guardianPhone || undefined,
          fatherEmail: body.fatherEmail || undefined,
          motherEmail: body.motherEmail || undefined,
          guardianEmail: body.guardianEmail || undefined,
          fatherQualification: body.fatherQualification || undefined,
          motherQualification: body.motherQualification || undefined,
          guardianQualification: body.guardianQualification || undefined,
          fatherOccupation: body.fatherOccupation || undefined,
          motherOccupation: body.motherOccupation || undefined,
          guardianOccupation: body.guardianOccupation || undefined,
          addressLine1: body.addressLine1 || undefined,
          addressLine2: body.addressLine2 || undefined,
          city: body.city || undefined,
          state: body.state || undefined,
          postalCode: body.postalCode || undefined,
          emergencyContactName: body.emergencyContactName || undefined,
          emergencyContactPhone: body.emergencyContactPhone || undefined,
          emergencyRelationship: body.emergencyRelationship || undefined,
        },
        childProfile: {
          gender: body.childGender || undefined,
          bloodGroup: body.childBloodGroup || undefined,
          aadhaarNumber: body.childAadhaar || undefined,
          ageText: body.childAge || undefined,
          previousSchool: body.previousSchool || undefined,
          previousGrade: body.previousGrade || undefined,
          medicalNotes: body.medicalNotes || undefined,
          allergies: body.allergies || undefined,
        },
        admissionProfile: {
          preferredStartMonth: body.preferredStartMonth || undefined,
          schoolVisitStatus: body.schoolVisitStatus || undefined,
          parentExpectations: body.parentExpectations || undefined,
          internalNotes: body.notes || undefined,
          source: "Front Desk Entry",
          feePlanStatus: program ? "Program selected" : "Program pending",
          portalReady: false,
        },
        documents: uploadedDocuments.length
          ? {
              create: uploadedDocuments,
            }
          : undefined,
      },
    });

    return NextResponse.json(
      {
        success: true,
        admissionId: admission.id,
        applicationNumber: admission.applicationNumber,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to create admission." }, { status: 400 });
  }
}
