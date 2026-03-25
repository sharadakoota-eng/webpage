import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema } from "@/lib/validators";
import { triggerImportantContactEvent } from "@/lib/notifications/events";

export async function POST(request: Request) {
  try {
    const body = contactSchema.parse(await request.json());
    const messageParts = [
      body.message,
      body.childAge ? `Child age: ${body.childAge}` : null,
      body.programInterest ? `Program interested in: ${body.programInterest}` : null,
      body.preferredContactMethod ? `Preferred contact method: ${body.preferredContactMethod}` : null,
    ].filter(Boolean);

    const submission = await prisma.contactSubmission.create({
      data: {
        name: body.name,
        email: body.email || undefined,
        phone: body.phone || undefined,
        subject: body.subject || undefined,
        message: messageParts.join("\n"),
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
