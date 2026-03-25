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
    const notes = [
      body.childAge ? `Child age: ${body.childAge}` : null,
      body.preferredStartMonth ? `Preferred start month: ${body.preferredStartMonth}` : null,
      body.schoolVisitStatus ? `School visit status: ${body.schoolVisitStatus}` : null,
      body.previousSchool ? `Previous school: ${body.previousSchool}` : null,
      body.parentExpectations ? `Parent expectations: ${body.parentExpectations}` : null,
      body.notes ? `Additional notes: ${body.notes}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const admission = await prisma.admission.create({
      data: {
        applicationNumber: createApplicationNumber(),
        parentName: body.parentName,
        childName: body.childName,
        childDob: new Date(body.childDob),
        phone: body.phone,
        email: body.email || undefined,
        notes: notes || undefined,
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
