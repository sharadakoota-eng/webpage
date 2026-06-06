import { NextResponse } from "next/server";
import { RoleType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalRole } from "@/lib/erp-auth";
import { deleteStudentRecordCascade } from "@/lib/student-record-cleanup";

const updateStudentSchema = z.object({
  action: z.enum(["assign"]),
  classId: z.string().optional().or(z.literal("")),
  programId: z.string().optional().or(z.literal("")),
});

export async function PATCH(request: Request, context: { params: Promise<{ studentId: string }> }) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { studentId } = await context.params;
    const payload = updateStudentSchema.parse(await request.json());

    if (payload.action !== "assign") {
      return NextResponse.json({ success: false, message: "Unsupported action." }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!student) {
      return NextResponse.json({ success: false, message: "Student not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.student.update({
        where: { id: studentId },
        data: {
          currentClassId: payload.classId || null,
        },
      });

      if (payload.programId && student.enrollments[0]) {
        await tx.enrollment.update({
          where: { id: student.enrollments[0].id },
          data: {
            programId: payload.programId,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid student update." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to update student record." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ studentId: string }> }) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { studentId } = await context.params;

    await prisma.$transaction(
      async (tx) => {
        await deleteStudentRecordCascade(tx, studentId);
        await tx.auditLog.create({
          data: {
            userId: session.sub,
            action: "STUDENT_DELETED",
            entityType: "Student",
            entityId: studentId,
            details: {
              removedLinkedAdmissionAndOrphanParents: true,
            },
          },
        });
      },
      { timeout: 20000 },
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to delete student record." }, { status: 400 });
  }
}
