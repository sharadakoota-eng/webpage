import { AttendanceStatus, RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.object({
  classId: z.string().min(1),
  date: z.string().min(1),
  entries: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.nativeEnum(AttendanceStatus),
      remarks: z.string().optional().or(z.literal("")),
    }),
  ),
});

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.TEACHER]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());
    const teacher = await prisma.teacher.findUnique({
      where: { userId: session.sub },
      include: {
        classes: {
          include: {
            class: {
              include: {
                students: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json({ success: false, message: "Teacher profile not found." }, { status: 404 });
    }

    const selectedClass = teacher.classes.find((entry) => entry.classId === payload.classId)?.class;
    if (!selectedClass) {
      return NextResponse.json({ success: false, message: "You can only mark attendance for your assigned classes." }, { status: 403 });
    }

    const allowedStudentIds = new Set(selectedClass.students.map((student) => student.id));
    const validEntries = payload.entries.filter((entry) => allowedStudentIds.has(entry.studentId));

    if (validEntries.length === 0) {
      return NextResponse.json({ success: false, message: "No valid students selected for attendance." }, { status: 400 });
    }

    const attendanceDate = new Date(payload.date);

    await prisma.$transaction(
      validEntries.map((entry) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: entry.studentId,
              date: attendanceDate,
            },
          },
          update: {
            classId: payload.classId,
            status: entry.status,
            remarks: entry.remarks || null,
          },
          create: {
            studentId: entry.studentId,
            classId: payload.classId,
            date: attendanceDate,
            status: entry.status,
            remarks: entry.remarks || null,
          },
        }),
      ),
    );

    return NextResponse.json({ success: true, message: "Attendance saved and ready for parent visibility." });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid attendance payload." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to save attendance." }, { status: 400 });
  }
}
