import { NextResponse } from "next/server";
import { RoleType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalRole } from "@/lib/erp-auth";

const teacherUpdateSchema = z.object({
  action: z.enum(["assignClass", "toggleActive"]),
  classId: z.string().optional().or(z.literal("")),
  isLead: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ teacherId: string }> }) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { teacherId } = await context.params;
    const payload = teacherUpdateSchema.parse(await request.json());
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: { user: true },
    });

    if (!teacher) {
      return NextResponse.json({ success: false, message: "Teacher not found." }, { status: 404 });
    }

    if (payload.action === "toggleActive") {
      await prisma.user.update({
        where: { id: teacher.userId },
        data: { isActive: payload.isActive ?? !teacher.user.isActive },
      });

      return NextResponse.json({ success: true });
    }

    if (!payload.classId) {
      return NextResponse.json({ success: false, message: "Select a class to assign." }, { status: 400 });
    }

    await prisma.teacherClassMap.upsert({
      where: {
        teacherId_classId: {
          teacherId,
          classId: payload.classId,
        },
      },
      update: {
        isLead: payload.isLead ?? true,
      },
      create: {
        teacherId,
        classId: payload.classId,
        isLead: payload.isLead ?? true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid teacher update." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to update teacher record." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ teacherId: string }> }) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { teacherId } = await context.params;
    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      include: {
        user: true,
        homeworkUpdates: { select: { id: true } },
        observationNotes: { select: { id: true } },
      },
    });

    if (!teacher) {
      return NextResponse.json({ success: false, message: "Teacher not found." }, { status: 404 });
    }

    if (teacher.homeworkUpdates.length > 0 || teacher.observationNotes.length > 0) {
      return NextResponse.json(
        { success: false, message: "Teacher history exists. Disable the account instead of deleting the record." },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.teacherClassMap.deleteMany({ where: { teacherId } });
      await tx.teacher.delete({ where: { id: teacherId } });
      await tx.user.delete({ where: { id: teacher.userId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to delete teacher record." }, { status: 400 });
  }
}
