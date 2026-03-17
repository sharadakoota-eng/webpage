import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validators";
import { triggerImportantContactEvent } from "@/lib/notifications/events";

export async function POST(request: Request) {
  try {
    const body = contactSchema.parse(await request.json());
    const submission = await prisma.contactSubmission.create({
      data: {
        ...body,
        email: body.email || undefined,
        phone: body.phone || undefined,
        subject: body.subject || undefined,
        isImportant: Boolean(body.subject?.toLowerCase().includes("admission")),
      },
    });

    await triggerImportantContactEvent({
      submissionId: submission.id,
      name: submission.name,
      subject: submission.subject ?? undefined,
    });

    return NextResponse.json({ success: true, submissionId: submission.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to submit contact request" }, { status: 400 });
  }
}
