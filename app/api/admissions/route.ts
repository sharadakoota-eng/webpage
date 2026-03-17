import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { admissionSchema } from "@/lib/validators";
import { triggerAdmissionEvent } from "@/lib/notifications/events";

function createApplicationNumber() {
  const date = new Date();
  return `ADM-${date.getFullYear()}-${Math.floor(Math.random() * 100000)
    .toString()
    .padStart(5, "0")}`;
}

export async function POST(request: Request) {
  try {
    const body = admissionSchema.parse(await request.json());
    const program = body.programSlug
      ? await prisma.program.findUnique({ where: { slug: body.programSlug } })
      : null;

    const admission = await prisma.admission.create({
      data: {
        applicationNumber: createApplicationNumber(),
        parentName: body.parentName,
        childName: body.childName,
        childDob: new Date(body.childDob),
        phone: body.phone,
        email: body.email || undefined,
        notes: body.notes,
        programId: program?.id,
      },
    });

    await triggerAdmissionEvent({
      admissionId: admission.id,
      parentName: admission.parentName,
      childName: admission.childName,
      phone: admission.phone,
    });

    return NextResponse.json({ success: true, admissionId: admission.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to submit admission" }, { status: 400 });
  }
}
