import { ApplicationDocumentStatus, DocumentType, RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";
import { storeAdmissionUpload } from "@/lib/admission-uploads";

export async function POST(
  request: Request,
  context: { params: Promise<{ admissionId: string; documentId: string }> },
) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.FRONT_DESK]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { admissionId, documentId } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");
    const documentType = formData.get("documentType");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, message: "Please choose a file to upload." }, { status: 400 });
    }

    const admission = await prisma.admission.findUnique({
      where: { id: admissionId },
      include: {
        documents: true,
      },
    });

    if (!admission) {
      return NextResponse.json({ success: false, message: "Admission not found." }, { status: 404 });
    }

    const existingDocument =
      documentId === "new"
        ? null
        : admission.documents.find((document) => document.id === documentId) ?? null;

    if (!existingDocument && (typeof documentType !== "string" || !(documentType in DocumentType))) {
      return NextResponse.json({ success: false, message: "Document type is required for new uploads." }, { status: 400 });
    }

    const resolvedDocumentType = existingDocument?.documentType ?? (documentType as DocumentType);
    const stored = await storeAdmissionUpload({
      file,
      applicationNumber: admission.applicationNumber,
      documentKey: resolvedDocumentType.toLowerCase(),
    });

    if (existingDocument) {
      await prisma.applicationDocument.update({
        where: { id: existingDocument.id },
        data: {
          status: ApplicationDocumentStatus.UPLOADED,
          fileName: stored.fileName,
          fileUrl: stored.fileUrl,
          verifiedAt: null,
          notes: "Replacement file uploaded for review.",
        },
      });
    } else {
      await prisma.applicationDocument.create({
        data: {
          admissionId,
          documentType: resolvedDocumentType,
          status: ApplicationDocumentStatus.UPLOADED,
          fileName: stored.fileName,
          fileUrl: stored.fileUrl,
          notes: "Document uploaded from admission record.",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to replace document." }, { status: 400 });
  }
}
