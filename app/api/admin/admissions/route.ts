import bcrypt from "bcryptjs";
import { AdmissionStatus, ApplicationDocumentStatus, RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { defaultAdmissionFormConfig } from "@/lib/admin-config";
import { buildAdmissionNotes, documentTypeLabelMap } from "@/lib/admissions";
import { requirePortalRole } from "@/lib/erp-auth";
import { createProgramInvoiceForStudent, ensureProgramFeeReady } from "@/lib/finance";
import { triggerAdmissionApprovedEvent, triggerDocumentRejectedEvent, triggerParentPortalReadyEvent } from "@/lib/notifications/events";
import { prisma } from "@/lib/prisma";

function createApplicationNumber() {
  const date = new Date();
  return `ADM-${date.getFullYear()}-${Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0")}`;
}

function createAdmissionNumber() {
  const date = new Date();
  return `SKM-${date.getFullYear()}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;
}

const payloadSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("createAdmission"),
    parentName: z.string().min(2),
    fatherName: z.string().optional().or(z.literal("")),
    motherName: z.string().optional().or(z.literal("")),
    childName: z.string().min(2),
    childDob: z.string().min(1),
    childAge: z.string().optional().or(z.literal("")),
    childGender: z.string().optional().or(z.literal("")),
    childBloodGroup: z.string().optional().or(z.literal("")),
    childAadhaar: z.string().optional().or(z.literal("")),
    phone: z.string().min(10),
    fatherPhone: z.string().optional().or(z.literal("")),
    motherPhone: z.string().optional().or(z.literal("")),
    email: z.string().email().optional().or(z.literal("")),
    fatherEmail: z.string().email().optional().or(z.literal("")),
    motherEmail: z.string().email().optional().or(z.literal("")),
    fatherQualification: z.string().optional().or(z.literal("")),
    motherQualification: z.string().optional().or(z.literal("")),
    fatherOccupation: z.string().optional().or(z.literal("")),
    motherOccupation: z.string().optional().or(z.literal("")),
    previousSchool: z.string().optional().or(z.literal("")),
    previousGrade: z.string().optional().or(z.literal("")),
    addressLine1: z.string().optional().or(z.literal("")),
    addressLine2: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
    postalCode: z.string().optional().or(z.literal("")),
    emergencyContactName: z.string().optional().or(z.literal("")),
    emergencyContactPhone: z.string().optional().or(z.literal("")),
    emergencyRelationship: z.string().optional().or(z.literal("")),
    preferredStartMonth: z.string().optional().or(z.literal("")),
    schoolVisitStatus: z.string().optional().or(z.literal("")),
    parentExpectations: z.string().optional().or(z.literal("")),
    medicalNotes: z.string().optional().or(z.literal("")),
    allergies: z.string().optional().or(z.literal("")),
    programId: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
  }),
  z.object({
    action: z.literal("updateStatus"),
    admissionId: z.string().min(1),
    status: z.nativeEnum(AdmissionStatus),
  }),
  z.object({
    action: z.literal("markDocumentsPending"),
    admissionId: z.string().min(1),
  }),
  z.object({
    action: z.literal("approveAdmission"),
    admissionId: z.string().min(1),
  }),
  z.object({
    action: z.literal("deleteAdmission"),
    admissionId: z.string().min(1),
  }),
  z.object({
    action: z.literal("updateReviewNotes"),
    admissionId: z.string().min(1),
    reviewNotes: z.string().optional().or(z.literal("")),
  }),
  z.object({
    action: z.literal("updateAdmissionDetails"),
    admissionId: z.string().min(1),
    parentName: z.string().min(2),
    phone: z.string().min(10),
    email: z.string().optional().or(z.literal("")),
    childName: z.string().min(2),
    childDob: z.string().min(1),
    childGender: z.string().optional().or(z.literal("")),
    childBloodGroup: z.string().optional().or(z.literal("")),
    previousSchool: z.string().optional().or(z.literal("")),
    previousGrade: z.string().optional().or(z.literal("")),
    fatherName: z.string().optional().or(z.literal("")),
    fatherPhone: z.string().optional().or(z.literal("")),
    motherName: z.string().optional().or(z.literal("")),
    motherPhone: z.string().optional().or(z.literal("")),
    guardianName: z.string().optional().or(z.literal("")),
    guardianPhone: z.string().optional().or(z.literal("")),
    primaryParent: z.enum(["FATHER", "MOTHER", "GUARDIAN"]).optional(),
    addressLine1: z.string().optional().or(z.literal("")),
    addressLine2: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
    postalCode: z.string().optional().or(z.literal("")),
    emergencyContactName: z.string().optional().or(z.literal("")),
    emergencyContactPhone: z.string().optional().or(z.literal("")),
    emergencyRelationship: z.string().optional().or(z.literal("")),
    preferredStartMonth: z.string().optional().or(z.literal("")),
    schoolVisitStatus: z.string().optional().or(z.literal("")),
    parentExpectations: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
    programId: z.string().optional().or(z.literal("")),
  }),
  z.object({
    action: z.literal("updateDocumentStatus"),
    admissionId: z.string().min(1),
    documentId: z.string().min(1),
    status: z.nativeEnum(ApplicationDocumentStatus),
    notes: z.string().optional().or(z.literal("")),
  }),
  z.object({
    action: z.literal("convertAdmission"),
    admissionId: z.string().min(1),
    programId: z.string().optional(),
    classId: z.string().optional(),
    parentPassword: z.string().min(6),
  }),
  z.object({
    action: z.literal("saveFormConfig"),
    config: z.any(),
  }),
]);

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());

    if (payload.action === "createAdmission") {
      const admission = await prisma.admission.create({
        data: {
          applicationNumber: createApplicationNumber(),
          shareToken: crypto.randomUUID(),
          parentName: payload.parentName,
          childName: payload.childName,
          childDob: new Date(payload.childDob),
          phone: payload.phone,
          email: payload.email || undefined,
          programId: payload.programId || undefined,
          notes:
            buildAdmissionNotes({
              childAge: payload.childAge || undefined,
              preferredStartMonth: payload.preferredStartMonth || undefined,
              schoolVisitStatus: payload.schoolVisitStatus || undefined,
              previousSchool: payload.previousSchool || undefined,
              parentExpectations: payload.parentExpectations || undefined,
              notes: payload.notes || undefined,
            }) || undefined,
          familyProfile: {
            fatherName: payload.fatherName || undefined,
            motherName: payload.motherName || undefined,
            fatherPhone: payload.fatherPhone || undefined,
            motherPhone: payload.motherPhone || undefined,
            fatherEmail: payload.fatherEmail || undefined,
            motherEmail: payload.motherEmail || undefined,
            fatherQualification: payload.fatherQualification || undefined,
            motherQualification: payload.motherQualification || undefined,
            fatherOccupation: payload.fatherOccupation || undefined,
            motherOccupation: payload.motherOccupation || undefined,
            addressLine1: payload.addressLine1 || undefined,
            addressLine2: payload.addressLine2 || undefined,
            city: payload.city || undefined,
            state: payload.state || undefined,
            postalCode: payload.postalCode || undefined,
            emergencyContactName: payload.emergencyContactName || undefined,
            emergencyContactPhone: payload.emergencyContactPhone || undefined,
            emergencyRelationship: payload.emergencyRelationship || undefined,
          },
          childProfile: {
            ageText: payload.childAge || undefined,
            gender: payload.childGender || undefined,
            bloodGroup: payload.childBloodGroup || undefined,
            aadhaarNumber: payload.childAadhaar || undefined,
            previousSchool: payload.previousSchool || undefined,
            previousGrade: payload.previousGrade || undefined,
            medicalNotes: payload.medicalNotes || undefined,
            allergies: payload.allergies || undefined,
          },
          admissionProfile: {
            preferredStartMonth: payload.preferredStartMonth || undefined,
            schoolVisitStatus: payload.schoolVisitStatus || undefined,
            parentExpectations: payload.parentExpectations || undefined,
            internalNotes: payload.notes || undefined,
            source: "admin_manual",
            feePlanStatus: "Pending",
            portalReady: false,
          },
          status: AdmissionStatus.SUBMITTED,
          submittedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, admissionId: admission.id });
    }

    if (payload.action === "saveFormConfig") {
      await prisma.setting.upsert({
        where: { key: "admission_form_config" },
        update: {
          value: payload.config,
          description: "Admin-controlled admission form configuration.",
        },
        create: {
          key: "admission_form_config",
          description: "Admin-controlled admission form configuration.",
          value: payload.config ?? defaultAdmissionFormConfig,
        },
      });

      return NextResponse.json({ success: true });
    }

    const admission = await prisma.admission.findUnique({
      where: { id: payload.admissionId },
      include: {
        program: true,
        parent: true,
        student: true,
      },
    });

    if (!admission) {
      return NextResponse.json({ success: false, message: "Admission not found." }, { status: 404 });
    }

    if (payload.action === "updateStatus") {
      const updateData: {
        status: AdmissionStatus;
        approvedAt?: Date | null;
        rejectedAt?: Date | null;
      } = { status: payload.status };

      if (payload.status === AdmissionStatus.APPROVED && !admission.approvedAt) {
        updateData.approvedAt = new Date();
      }

      if (payload.status === AdmissionStatus.REJECTED && !admission.rejectedAt) {
        updateData.rejectedAt = new Date();
      }

      await prisma.admission.update({
        where: { id: admission.id },
        data: updateData,
      });

      return NextResponse.json({ success: true });
    }

    if (payload.action === "markDocumentsPending") {
      await prisma.admission.update({
        where: { id: admission.id },
        data: { status: AdmissionStatus.DOCUMENTS_PENDING },
      });

      return NextResponse.json({ success: true });
    }

    if (payload.action === "approveAdmission") {
      if (admission.status === AdmissionStatus.REJECTED) {
        return NextResponse.json({ success: false, message: "Rejected applications cannot be approved directly." }, { status: 400 });
      }

      const programId = admission.programId;
      if (programId) {
        try {
          await ensureProgramFeeReady(programId);
        } catch (error) {
          return NextResponse.json(
            { success: false, message: error instanceof Error ? error.message : "Please set price for this program before proceeding." },
            { status: 400 },
          );
        }
      }

      await prisma.admission.update({
        where: { id: admission.id },
        data: { status: AdmissionStatus.APPROVED, approvedAt: new Date() },
      });

      await triggerAdmissionApprovedEvent({
        admissionId: admission.id,
        parentName: admission.parentName,
        childName: admission.childName,
        phone: admission.phone,
      });

      return NextResponse.json({ success: true });
    }

    if (payload.action === "deleteAdmission") {
      await prisma.admission.delete({
        where: { id: admission.id },
      });

      return NextResponse.json({ success: true });
    }

    if (payload.action === "updateReviewNotes") {
      await prisma.admission.update({
        where: { id: admission.id },
        data: { reviewNotes: payload.reviewNotes || null },
      });

      return NextResponse.json({ success: true });
    }

    if (payload.action === "updateAdmissionDetails") {
      const currentFamilyProfile =
        admission.familyProfile && typeof admission.familyProfile === "object" && !Array.isArray(admission.familyProfile)
          ? (admission.familyProfile as Record<string, unknown>)
          : {};
      const existingPrimaryParent =
        typeof currentFamilyProfile.primaryParent === "string" ? currentFamilyProfile.primaryParent : undefined;
      const currentChildProfile =
        admission.childProfile && typeof admission.childProfile === "object" && !Array.isArray(admission.childProfile)
          ? (admission.childProfile as Record<string, unknown>)
          : {};
      const currentAdmissionProfile =
        admission.admissionProfile && typeof admission.admissionProfile === "object" && !Array.isArray(admission.admissionProfile)
          ? (admission.admissionProfile as Record<string, unknown>)
          : {};

      await prisma.admission.update({
        where: { id: admission.id },
        data: {
          parentName: payload.parentName,
          phone: payload.phone,
          email: payload.email || null,
          childName: payload.childName,
          childDob: new Date(payload.childDob),
          programId: payload.programId || null,
          notes: payload.notes || null,
          familyProfile: {
            ...currentFamilyProfile,
            fatherName: payload.fatherName || undefined,
            fatherPhone: payload.fatherPhone || undefined,
            motherName: payload.motherName || undefined,
            motherPhone: payload.motherPhone || undefined,
            guardianName: payload.guardianName || undefined,
            guardianPhone: payload.guardianPhone || undefined,
            primaryParent: payload.primaryParent || existingPrimaryParent,
            addressLine1: payload.addressLine1 || undefined,
            addressLine2: payload.addressLine2 || undefined,
            city: payload.city || undefined,
            state: payload.state || undefined,
            postalCode: payload.postalCode || undefined,
            emergencyContactName: payload.emergencyContactName || undefined,
            emergencyContactPhone: payload.emergencyContactPhone || undefined,
            emergencyRelationship: payload.emergencyRelationship || undefined,
          },
          childProfile: {
            ...currentChildProfile,
            gender: payload.childGender || undefined,
            bloodGroup: payload.childBloodGroup || undefined,
            previousSchool: payload.previousSchool || undefined,
            previousGrade: payload.previousGrade || undefined,
          },
          admissionProfile: {
            ...currentAdmissionProfile,
            preferredStartMonth: payload.preferredStartMonth || undefined,
            schoolVisitStatus: payload.schoolVisitStatus || undefined,
            parentExpectations: payload.parentExpectations || undefined,
          },
        },
      });

      return NextResponse.json({ success: true });
    }

    if (payload.action === "updateDocumentStatus") {
      const updatedDocument = await prisma.applicationDocument.update({
        where: { id: payload.documentId },
        data: {
          status: payload.status,
          notes: payload.notes || null,
          verifiedAt: payload.status === ApplicationDocumentStatus.VERIFIED ? new Date() : null,
        },
      });

      if (payload.status === ApplicationDocumentStatus.REJECTED) {
        await prisma.admission.update({
          where: { id: admission.id },
          data: { status: AdmissionStatus.DOCUMENTS_PENDING },
        });

        await triggerDocumentRejectedEvent({
          admissionId: admission.id,
          documentLabel: documentTypeLabelMap[updatedDocument.documentType],
          parentName: admission.parentName,
          phone: admission.phone,
          reason: payload.notes || undefined,
        });
      }

      return NextResponse.json({ success: true });
    }

    if (payload.action !== "convertAdmission") {
      return NextResponse.json({ success: false, message: "Unsupported action." }, { status: 400 });
    }

    if (admission.status !== AdmissionStatus.APPROVED) {
      return NextResponse.json(
        { success: false, message: "Only approved admissions can be converted into enrollment and parent portal access." },
        { status: 400 },
      );
    }

    if (admission.studentId || admission.parentId || admission.enrolledAt) {
      return NextResponse.json({ success: false, message: "This admission has already been enrolled." }, { status: 400 });
    }

    const targetProgramId = payload.programId || admission.programId;
    if (!targetProgramId) {
      return NextResponse.json({ success: false, message: "Select a program before completing enrollment." }, { status: 400 });
    }

    try {
      await ensureProgramFeeReady(targetProgramId);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: error instanceof Error ? error.message : "Please set price for this program before proceeding." },
        { status: 400 },
      );
    }

    const parentRole = await prisma.role.findUniqueOrThrow({ where: { type: RoleType.PARENT } });
    const passwordHash = await bcrypt.hash(payload.parentPassword, 10);
    const splitName = admission.childName.trim().split(" ");
    const firstName = splitName.shift() ?? admission.childName;
    const lastName = splitName.join(" ") || undefined;

    const converted = await prisma.$transaction(async (tx) => {
      let parentUser = admission.email
        ? await tx.user.findUnique({
            where: { email: admission.email },
            include: { parentProfile: true },
          })
        : null;

      if (!parentUser) {
        parentUser = await tx.user.create({
          data: {
            name: admission.parentName,
            email: admission.email ?? `parent+${admission.applicationNumber.toLowerCase()}@shaaradakoota.local`,
            phone: admission.phone,
            passwordHash,
            passwordResetRequired: true,
            roleId: parentRole.id,
          },
          include: { parentProfile: true },
        });
      } else {
        parentUser = await tx.user.update({
          where: { id: parentUser.id },
          data: {
            name: admission.parentName,
            phone: admission.phone,
            isActive: true,
          },
          include: { parentProfile: true },
        });
      }

      const parentProfile =
        parentUser.parentProfile ??
        (await tx.parent.create({
          data: {
            userId: parentUser.id,
          },
        }));

      const student =
        admission.student ??
        (await tx.student.create({
          data: {
            admissionNumber: createAdmissionNumber(),
            firstName,
            lastName,
            dateOfBirth: admission.childDob,
            currentClassId: payload.classId || undefined,
          },
        }));

      await tx.parentStudentMap.upsert({
        where: {
          parentId_studentId: {
            parentId: parentProfile.id,
            studentId: student.id,
          },
        },
        update: {
          relation: "Parent",
          isPrimary: true,
        },
        create: {
          parentId: parentProfile.id,
          studentId: student.id,
          relation: "Parent",
          isPrimary: true,
        },
      });

      const existingEnrollment = await tx.enrollment.findFirst({
        where: {
          parentId: parentProfile.id,
          studentId: student.id,
          programId: targetProgramId,
        },
      });

      if (!existingEnrollment) {
        await tx.enrollment.create({
          data: {
            parentId: parentProfile.id,
            studentId: student.id,
            programId: targetProgramId,
            startDate: new Date(),
            notes: `Converted from admission ${admission.applicationNumber}`,
          },
        });
      }

      await createProgramInvoiceForStudent({
        tx,
        studentId: student.id,
        programId: targetProgramId,
        createdBy: "admission_enrollment",
      });

      await tx.admission.update({
        where: { id: admission.id },
        data: {
          status: AdmissionStatus.APPROVED,
          parentId: parentProfile.id,
          studentId: student.id,
          programId: targetProgramId,
          enrolledAt: new Date(),
          portalAccessSentAt: new Date(),
          communicationLog: {
            portalReadyAt: new Date().toISOString(),
            temporaryPasswordIssued: true,
            enrollmentState: "ENROLLED",
          },
        },
      });

      return { parentProfile, student };
    });

    await triggerParentPortalReadyEvent({
      admissionId: admission.id,
      parentName: admission.parentName,
      childName: admission.childName,
      phone: admission.phone,
      temporaryPassword: payload.parentPassword,
    });

    return NextResponse.json({ success: true, ...converted });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid admission payload." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to complete admission workflow." }, { status: 400 });
  }
}
