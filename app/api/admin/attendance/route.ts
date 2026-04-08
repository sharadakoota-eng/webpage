import { RoleType, TeacherAttendanceStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  teacherId: z.string().min(1),
  classId: z.string().optional().or(z.literal("")),
  date: z.string().min(1),
  status: z.nativeEnum(TeacherAttendanceStatus),
  remarks: z.string().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());
    const teacher = await prisma.teacher.findUnique({
      where: { id: payload.teacherId },
    });

    if (!teacher) {
      return NextResponse.json({ success: false, message: "Teacher not found." }, { status: 404 });
    }

    const attendanceDate = new Date(payload.date);
    await prisma.teacherAttendance.upsert({
      where: {
        teacherId_date: {
          teacherId: payload.teacherId,
          date: attendanceDate,
        },
      },
      update: {
        classId: payload.classId || null,
        status: payload.status,
        remarks: payload.remarks || null,
      },
      create: {
        teacherId: payload.teacherId,
        classId: payload.classId || null,
        date: attendanceDate,
        status: payload.status,
        remarks: payload.remarks || null,
      },
    });

    return NextResponse.json({ success: true, message: "Teacher attendance saved successfully." });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid attendance payload." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to save teacher attendance." }, { status: 400 });
  }
}
