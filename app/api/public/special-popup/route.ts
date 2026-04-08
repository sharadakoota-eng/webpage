import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const setting = await prisma.setting.findUnique({
    where: { key: "special_event_popup" },
    select: { value: true },
  });

  return NextResponse.json({
    popup:
      (setting?.value as
        | {
            enabled?: boolean;
            title?: string;
            message?: string;
            buttonLabel?: string;
            buttonUrl?: string;
            audience?: string;
          }
        | undefined) ?? null,
  });
}
