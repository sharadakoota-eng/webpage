import { ProgramCategory, RoleType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";

const payloadSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("createFeeStructure"),
    programId: z.string().min(1),
    title: z.string().min(2),
    frequency: z.string().min(2),
    amount: z.coerce.number().positive(),
    taxPercentage: z.coerce.number().min(0).optional(),
    description: z.string().optional().or(z.literal("")),
  }),
  z.object({
    action: z.literal("createProgramCost"),
    programId: z.string().min(1),
    title: z.string().min(2),
    amount: z.coerce.number().positive(),
    description: z.string().optional().or(z.literal("")),
  }),
  z.object({
    action: z.literal("toggleProgramVisibility"),
    programId: z.string().min(1),
    isPublished: z.boolean(),
  }),
]);

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());

    if (payload.action === "toggleProgramVisibility") {
      await prisma.program.update({
        where: { id: payload.programId },
        data: { isPublished: payload.isPublished },
      });

      return NextResponse.json({ success: true });
    }

    if (payload.action === "createProgramCost") {
      await prisma.programCost.create({
        data: {
          programId: payload.programId,
          title: payload.title,
          amount: payload.amount,
          description: payload.description || undefined,
        },
      });

      return NextResponse.json({ success: true });
    }

    const program = await prisma.program.findUnique({
      where: { id: payload.programId },
      select: { category: true, name: true },
    });

    if (!program) {
      return NextResponse.json({ success: false, message: "Program not found." }, { status: 404 });
    }

    if (program.category === ProgramCategory.CAMP) {
      return NextResponse.json(
        {
          success: false,
          message: "Summer camp uses manual activity invoices. Add camp charges from Payments & Receipts instead of recurring fee structures.",
        },
        { status: 400 },
      );
    }

    await prisma.feeStructure.create({
      data: {
        programId: payload.programId,
        title: payload.title,
        frequency: payload.frequency,
        amount: payload.amount,
        taxPercentage: payload.taxPercentage ?? undefined,
        description: payload.description || undefined,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid pricing payload." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to update program fees." }, { status: 400 });
  }
}
