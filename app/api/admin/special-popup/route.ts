import { NextResponse } from "next/server";
import { RoleType } from "@prisma/client";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  await prisma.setting.upsert({
    where: { key: "special_event_popup" },
    update: {
      description: "Admin-controlled special event popup across website and portals.",
      value: body,
    },
    create: {
      key: "special_event_popup",
      description: "Admin-controlled special event popup across website and portals.",
      value: body,
    },
  });

  return NextResponse.json({ ok: true });
}
