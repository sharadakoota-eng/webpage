import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { RoleType } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePortalRole } from "@/lib/erp-auth";

const updateUserSchema = z.object({
  action: z.enum(["updateProfile", "toggleActive", "resetPassword"]),
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  designation: z.string().optional().or(z.literal("")),
  occupation: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

export async function PATCH(request: Request, context: { params: Promise<{ userId: string }> }) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await context.params;
    const body = updateUserSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { role: true, teacherProfile: true, parentProfile: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    if (body.action === "toggleActive") {
      if (session.sub === userId && body.isActive === false) {
        return NextResponse.json({ success: false, message: "You cannot disable your own account." }, { status: 400 });
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isActive: body.isActive ?? !user.isActive },
      });

      return NextResponse.json({ success: true, user: updated });
    }

    if (body.action === "resetPassword") {
      const passwordHash = await bcrypt.hash(body.password ?? "admin12345", 10);

      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash, passwordResetRequired: true, isActive: true },
      });

      return NextResponse.json({ success: true });
    }

    if (body.email && body.email !== user.email) {
      const duplicate = await prisma.user.findUnique({ where: { email: body.email } });

      if (duplicate) {
        return NextResponse.json({ success: false, message: "Another user already uses this email." }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: body.name ?? user.name,
        email: body.email ?? user.email,
        phone: body.phone ?? user.phone,
      },
      include: { role: true, teacherProfile: true, parentProfile: true },
    });

    if (updatedUser.role.type === RoleType.TEACHER && updatedUser.teacherProfile) {
      await prisma.teacher.update({
        where: { userId: userId },
        data: {
          designation: body.designation ?? updatedUser.teacherProfile.designation,
        },
      });
    }

    if (updatedUser.role.type === RoleType.PARENT && updatedUser.parentProfile) {
      await prisma.parent.update({
        where: { userId: userId },
        data: {
          occupation: body.occupation ?? updatedUser.parentProfile.occupation,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to update user." }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ userId: string }> }) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await context.params;

    if (session.sub === userId) {
      return NextResponse.json({ success: false, message: "You cannot delete your own account." }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to delete user." }, { status: 400 });
  }
}
