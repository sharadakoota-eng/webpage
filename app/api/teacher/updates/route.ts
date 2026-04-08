import { HomeworkUpdateAudience, RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("createClassUpdate"),
    classId: z.string().min(1),
    title: z.string().min(3),
    content: z.string().min(8),
  }),
  z.object({
    action: z.literal("createIndividualNote"),
    classId: z.string().min(1),
    title: z.string().min(3),
    content: z.string().min(8),
    studentIds: z.array(z.string()).min(1),
  }),
  z.object({
    action: z.literal("createObservation"),
    studentId: z.string().min(1),
    title: z.string().min(3),
    content: z.string().min(8),
  }),
]);

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

    const allowedClasses = new Map(teacher.classes.map((entry) => [entry.classId, entry.class]));
    const allowedStudentIds = new Set(teacher.classes.flatMap((entry) => entry.class.students.map((student) => student.id)));

    if (payload.action === "createClassUpdate" || payload.action === "createIndividualNote") {
      const selectedClass = allowedClasses.get(payload.classId);
      if (!selectedClass) {
        return NextResponse.json({ success: false, message: "You can only post updates for classes assigned to you." }, { status: 403 });
      }

      const targetStudentIds =
        payload.action === "createClassUpdate"
          ? selectedClass.students.map((student) => student.id)
          : payload.studentIds.filter((studentId) => allowedStudentIds.has(studentId));

      if (targetStudentIds.length === 0) {
        return NextResponse.json({ success: false, message: "Choose at least one student for this note." }, { status: 400 });
      }

      await prisma.homeworkUpdate.create({
        data: {
          teacherId: teacher.id,
          classId: payload.classId,
          audienceType:
            payload.action === "createClassUpdate"
              ? HomeworkUpdateAudience.CLASS_UPDATE
              : HomeworkUpdateAudience.INDIVIDUAL_NOTE,
          title: payload.title,
          content: payload.content,
          students: {
            createMany: {
              data: targetStudentIds.map((studentId) => ({ studentId })),
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        message:
          payload.action === "createClassUpdate"
            ? "Class update published for all parents in this class."
            : "Individual parent note published successfully.",
      });
    }

    if (!allowedStudentIds.has(payload.studentId)) {
      return NextResponse.json({ success: false, message: "You can only record observations for assigned students." }, { status: 403 });
    }

    await prisma.studentObservation.create({
      data: {
        teacherId: teacher.id,
        studentId: payload.studentId,
        title: payload.title,
        content: payload.content,
      },
    });

    return NextResponse.json({ success: true, message: "Weekly performance note saved." });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid teacher update payload." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to save teacher updates." }, { status: 400 });
  }
}
