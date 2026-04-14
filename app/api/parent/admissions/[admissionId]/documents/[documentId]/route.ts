import { AdmissionStatus, ApplicationDocumentStatus, RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";
import { storeAdmissionUpload } from "@/lib/admission-uploads";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ admissionId: string; documentId: string }> },
) {
  const session = await requirePortalRole([RoleType.PARENT]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { admissionId, documentId } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, message: "Choose a document to upload." }, { status: 400 });
    }

    const parent = await prisma.parent.findUnique({
      where: { userId: session.sub },
      include: {
        parentStudents: {
          select: { studentId: true },
        },
      },
    });

    if (!parent) {
      return NextResponse.json({ success: false, message: "Parent profile not found." }, { status: 404 });
    }

    const document = await prisma.applicationDocument.findUnique({
      where: { id: documentId },
      include: {
        admission: true,
      },
    });

    if (!document || document.admissionId !== admissionId) {
      return NextResponse.json({ success: false, message: "Document not found." }, { status: 404 });
    }

    const allowedStudentIds = new Set(parent.parentStudents.map((entry) => entry.studentId));
    if (document.admission.parentId !== parent.id && (!document.admission.studentId || !allowedStudentIds.has(document.admission.studentId))) {
      return NextResponse.json({ success: false, message: "This document does not belong to your portal." }, { status: 403 });
    }

    if (document.status !== ApplicationDocumentStatus.REJECTED) {
      return NextResponse.json({ success: false, message: "Only rejected documents can be reuploaded from the parent portal." }, { status: 400 });
    }

    const stored = await storeAdmissionUpload({
      file,
      applicationNumber: document.admission.applicationNumber,
      documentKey: document.documentType.toLowerCase(),
    });

    await prisma.applicationDocument.update({
      where: { id: document.id },
      data: {
        status: ApplicationDocumentStatus.UPLOADED,
        notes: null,
        verifiedAt: null,
        fileName: stored.fileName,
        fileUrl: stored.fileUrl,
      },
    });

    await prisma.admission.update({
      where: { id: admissionId },
      data: {
        status: AdmissionStatus.UNDER_REVIEW,
      },
    });

    return NextResponse.json({ success: true, message: "Document reuploaded successfully. The school office will review it again." });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to reupload document." }, { status: 400 });
  }
}
