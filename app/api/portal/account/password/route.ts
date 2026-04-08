import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalRole } from "@/lib/erp-auth";
import { RoleType } from "@prisma/client";

const payloadSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .superRefine((value, ctx) => {
    if (value.newPassword !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New password and confirm password must match.",
        path: ["confirmPassword"],
      });
    }
    if (value.currentPassword === value.newPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New password must be different from the current password.",
        path: ["newPassword"],
      });
    }
  });

export async function PATCH(request: Request) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN, RoleType.TEACHER, RoleType.PARENT]);
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = payloadSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    const validPassword = await bcrypt.compare(payload.currentPassword, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ success: false, message: "Current password is incorrect." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(payload.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetRequired: false,
      },
    });

    return NextResponse.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message ?? "Invalid password payload." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to update password." }, { status: 400 });
  }
}
