import { RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getClassBatchProfiles } from "@/lib/admin-config";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("createClass"),
    id: z.string().min(2),
    name: z.string().min(2),
    section: z.string().optional().or(z.literal("")),
    ageGroup: z.string().optional().or(z.literal("")),
    capacity: z.coerce.number().int().positive().optional(),
    roomLabel: z.string().optional().or(z.literal("")),
    programId: z.string().optional().or(z.literal("")),
    batchName: z.string().optional().or(z.literal("")),
    timing: z.string().optional().or(z.literal("")),
  }),
  z.object({
    action: z.literal("assignTeacher"),
    classId: z.string().min(1),
    teacherId: z.string().min(1),
    isLead: z.boolean().optional(),
  }),
  z.object({
    action: z.literal("deleteClass"),
    classId: z.string().min(1),
  }),
]);

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());

    if (payload.action === "assignTeacher") {
      await prisma.teacherClassMap.upsert({
        where: {
          teacherId_classId: {
            teacherId: payload.teacherId,
            classId: payload.classId,
          },
        },
        update: {
          isLead: payload.isLead ?? true,
        },
        create: {
          teacherId: payload.teacherId,
          classId: payload.classId,
          isLead: payload.isLead ?? true,
        },
      });

      return NextResponse.json({ success: true });
    }

    if (payload.action === "deleteClass") {
      const classRecord = await prisma.class.findUnique({
        where: { id: payload.classId },
        include: { students: { select: { id: true } } },
      });
      if (!classRecord) {
        return NextResponse.json({ success: false, message: "Class not found." }, { status: 404 });
      }
      if (classRecord.students.length > 0) {
        return NextResponse.json(
          { success: false, message: "Remove students from this class before deleting it." },
          { status: 400 },
        );
      }

      await prisma.teacherClassMap.deleteMany({
        where: { classId: payload.classId },
      });

      await prisma.class.delete({
        where: { id: payload.classId },
      });

      const currentProfiles = await getClassBatchProfiles();
      const nextProfiles = currentProfiles.filter((item) => item.classId !== payload.classId);
      await prisma.setting.upsert({
        where: { key: "class_batch_profiles" },
        update: {
          value: nextProfiles,
          description: "Batch timing and program mapping for classes.",
        },
        create: {
          key: "class_batch_profiles",
          description: "Batch timing and program mapping for classes.",
          value: nextProfiles,
        },
      });

      return NextResponse.json({ success: true });
    }

    await prisma.class.create({
      data: {
        id: payload.id,
        name: payload.name,
        section: payload.section || undefined,
        ageGroup: payload.ageGroup || undefined,
        capacity: payload.capacity || undefined,
        roomLabel: payload.roomLabel || undefined,
      },
    });

    const currentProfiles = await getClassBatchProfiles();
    const nextProfiles = [
      ...currentProfiles.filter((item) => item.classId !== payload.id),
      {
        classId: payload.id,
        programId: payload.programId || undefined,
        batchName: payload.batchName || undefined,
        timing: payload.timing || undefined,
        status: "ACTIVE" as const,
      },
    ];

    await prisma.setting.upsert({
      where: { key: "class_batch_profiles" },
      update: {
        value: nextProfiles,
        description: "Batch timing and program mapping for classes.",
      },
      create: {
        key: "class_batch_profiles",
        description: "Batch timing and program mapping for classes.",
        value: nextProfiles,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid class payload." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to update class workflow." }, { status: 400 });
  }
}
