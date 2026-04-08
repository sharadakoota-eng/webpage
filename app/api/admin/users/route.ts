import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { RoleType } from "@prisma/client";
import { z } from "zod";
import { requirePortalRole } from "@/lib/erp-auth";
import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(8),
  roleType: z.enum(["ADMIN", "TEACHER"]),
  designation: z.string().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const session = await requirePortalRole([RoleType.ADMIN, RoleType.SUPER_ADMIN]);

  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = createUserSchema.parse(await request.json());
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: body.email }, { phone: body.phone }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ success: false, message: "A user with this email or phone already exists." }, { status: 400 });
    }

    const role = await prisma.role.findUnique({
      where: { type: body.roleType as RoleType },
    });

    if (!role) {
      return NextResponse.json({ success: false, message: "Role is not configured." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: body.name,
          email: body.email,
          phone: body.phone,
          passwordHash,
          passwordResetRequired: true,
          roleId: role.id,
        },
      });

      if (body.roleType === "TEACHER") {
        await tx.teacher.create({
          data: {
            userId: createdUser.id,
            designation: body.designation || "Teacher",
          },
        });
      }

      return createdUser;
    });

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        message: `${body.roleType === "TEACHER" ? "Teacher" : "Admin"} account created successfully. Ask the user to change the temporary password after first login.`,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, message: error.issues[0]?.message || "Invalid form values." }, { status: 400 });
    }

    if (error instanceof Error) {
      return NextResponse.json({ success: false, message: error.message || "Unable to create user." }, { status: 400 });
    }

    return NextResponse.json({ success: false, message: "Unable to create user." }, { status: 400 });
  }
}
