import { NextResponse } from "next/server";
import { RoleType } from "@prisma/client";
import { createPortalSession, authenticatePortalUser } from "@/lib/erp-auth";

export async function POST(request: Request) {
  const body = await request.json();
  const identifier = String(body.identifier ?? "");
  const password = String(body.password ?? "");
  const rememberMe = Boolean(body.rememberMe);

  const user = await authenticatePortalUser(identifier, password, [RoleType.ADMIN, RoleType.SUPER_ADMIN]);

  if (!user) {
    return NextResponse.json({ success: false, message: "Invalid login credentials." }, { status: 401 });
  }

  await createPortalSession(
    {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    rememberMe,
  );

  return NextResponse.json({ success: true, redirectTo: "/admin/dashboard" });
}
