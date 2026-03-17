import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inquirySchema } from "@/lib/validators";
import { triggerNewInquiryEvent } from "@/lib/notifications/events";

export async function POST(request: Request) {
  try {
    const body = inquirySchema.parse(await request.json());
    const program = body.programSlug
      ? await prisma.program.findUnique({ where: { slug: body.programSlug } })
      : null;

    const inquiry = await prisma.inquiry.create({
      data: {
        parentName: body.parentName,
        childName: body.childName,
        childAge: body.childAge,
        phone: body.phone,
        email: body.email || undefined,
        message: body.message,
        programId: program?.id,
      },
    });

    await triggerNewInquiryEvent({
      inquiryId: inquiry.id,
      parentName: inquiry.parentName,
      phone: inquiry.phone,
      programName: program?.name,
    });

    return NextResponse.json({ success: true, inquiryId: inquiry.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to save inquiry" }, { status: 400 });
  }
}
