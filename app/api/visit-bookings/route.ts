import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { visitBookingSchema } from "@/lib/validators";
import { triggerVisitBookingEvent } from "@/lib/notifications/events";

export async function POST(request: Request) {
  try {
    const body = visitBookingSchema.parse(await request.json());
    const notesParts = [
      body.notes,
      body.childAge ? `Child age: ${body.childAge}` : null,
      body.programInterest ? `Program interested in: ${body.programInterest}` : null,
      body.preferredTimeSlot ? `Preferred time slot: ${body.preferredTimeSlot}` : null,
    ].filter(Boolean);

    const booking = await prisma.visitBooking.create({
      data: {
        parentName: body.parentName,
        phone: body.phone,
        email: body.email || undefined,
        childName: body.childName,
        visitDate: new Date(body.visitDate),
        notes: notesParts.length ? notesParts.join("\n") : undefined,
      },
    });

    await triggerVisitBookingEvent({
      bookingId: booking.id,
      parentName: booking.parentName,
      phone: booking.phone,
      visitDate: booking.visitDate.toISOString(),
    });

    return NextResponse.json({ success: true, bookingId: booking.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to book visit" }, { status: 400 });
  }
}
