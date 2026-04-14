import { RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("deactivateParent"),
    parentId: z.string().min(1),
  }),
  z.object({
    action: z.literal("deleteParent"),
    parentId: z.string().min(1),
  }),
  z.object({
    action: z.literal("removeStudentLink"),
    parentId: z.string().min(1),
    studentId: z.string().min(1),
  }),
  z.object({
    action: z.literal("reassignStudent"),
    parentId: z.string().min(1),
    studentId: z.string().min(1),
    targetEmail: z.string().email(),
  }),
]);

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());

    if (payload.action === "deactivateParent") {
      const parent = await prisma.parent.findUnique({
        where: { id: payload.parentId },
        include: { user: true },
      });
      if (!parent) {
        return NextResponse.json({ success: false, message: "Parent not found." }, { status: 404 });
      }
      await prisma.user.update({
        where: { id: parent.userId },
        data: { isActive: false, passwordResetRequired: true },
      });
      return NextResponse.json({ success: true, message: "Parent access disabled." });
    }

    if (payload.action === "removeStudentLink") {
      await prisma.parentStudentMap.deleteMany({
        where: {
          parentId: payload.parentId,
          studentId: payload.studentId,
        },
      });
      return NextResponse.json({ success: true, message: "Student unlinked from parent." });
    }

    if (payload.action === "reassignStudent") {
      const targetParent = await prisma.parent.findFirst({
        where: { user: { email: payload.targetEmail } },
      });
      if (!targetParent) {
        return NextResponse.json({ success: false, message: "Target parent not found. Ask the parent to complete admission first." }, { status: 404 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.parentStudentMap.deleteMany({
          where: { parentId: payload.parentId, studentId: payload.studentId },
        });
        await tx.parentStudentMap.upsert({
          where: {
            parentId_studentId: {
              parentId: targetParent.id,
              studentId: payload.studentId,
            },
          },
          update: {
            relation: "Parent",
            isPrimary: true,
          },
          create: {
            parentId: targetParent.id,
            studentId: payload.studentId,
            relation: "Parent",
            isPrimary: true,
          },
        });
      });

      return NextResponse.json({ success: true, message: "Student reassigned to new parent." });
    }

    if (payload.action === "deleteParent") {
      await prisma.$transaction(async (tx) => {
        await tx.admission.updateMany({
          where: { parentId: payload.parentId },
          data: { parentId: null },
        });
        await tx.enrollment.deleteMany({
          where: { parentId: payload.parentId },
        });
        await tx.parentStudentMap.deleteMany({
          where: { parentId: payload.parentId },
        });
        const parent = await tx.parent.delete({
          where: { id: payload.parentId },
        });
        await tx.user.delete({
          where: { id: parent.userId },
        });
      });
      return NextResponse.json({ success: true, message: "Parent record deleted." });
    }

    return NextResponse.json({ success: false, message: "Unsupported action." }, { status: 400 });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid parent payload." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to update parent record." }, { status: 400 });
  }
}
