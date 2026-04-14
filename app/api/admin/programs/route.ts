import { ProgramCategory, RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("createProgram"),
    name: z.string().min(2),
    slug: z.string().min(2),
    category: z.nativeEnum(ProgramCategory),
    ageGroup: z.string().min(2),
    schedule: z.string().optional().or(z.literal("")),
    shortIntro: z.string().min(2),
    overview: z.string().min(2),
    ctaLabel: z.string().min(2),
    isPublished: z.boolean().optional(),
  }),
  z.object({
    action: z.literal("updateProgram"),
    programId: z.string().min(1),
    name: z.string().min(2),
    slug: z.string().min(2),
    category: z.nativeEnum(ProgramCategory),
    ageGroup: z.string().min(2),
    schedule: z.string().optional().or(z.literal("")),
    shortIntro: z.string().min(2),
    overview: z.string().min(2),
    ctaLabel: z.string().min(2),
    isPublished: z.boolean().optional(),
  }),
  z.object({
    action: z.literal("deleteProgram"),
    programId: z.string().min(1),
  }),
]);

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());

    if (payload.action === "deleteProgram") {
      const program = await prisma.program.findUnique({
        where: { id: payload.programId },
        include: {
          enrollments: true,
          admissions: true,
          inquiries: true,
        },
      });
      if (!program) {
        return NextResponse.json({ success: false, message: "Program not found." }, { status: 404 });
      }
      if (program.enrollments.length > 0 || program.admissions.length > 0 || program.inquiries.length > 0) {
        return NextResponse.json(
          { success: false, message: "This program already has admissions/enrollments. Disable it instead of deleting." },
          { status: 400 },
        );
      }
      await prisma.program.delete({ where: { id: payload.programId } });
      return NextResponse.json({ success: true });
    }

    if (payload.action === "updateProgram") {
      await prisma.program.update({
        where: { id: payload.programId },
        data: {
          name: payload.name,
          slug: payload.slug,
          category: payload.category,
          ageGroup: payload.ageGroup,
          schedule: payload.schedule || null,
          shortIntro: payload.shortIntro,
          overview: payload.overview,
          ctaLabel: payload.ctaLabel,
          isPublished: payload.isPublished ?? true,
        },
      });
      return NextResponse.json({ success: true });
    }

    await prisma.program.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        category: payload.category,
        ageGroup: payload.ageGroup,
        schedule: payload.schedule || undefined,
        shortIntro: payload.shortIntro,
        overview: payload.overview,
        ctaLabel: payload.ctaLabel,
        benefits: [],
        features: [],
        faqItems: [],
        isPublished: payload.isPublished ?? true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid program payload." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to update program." }, { status: 400 });
  }
}
