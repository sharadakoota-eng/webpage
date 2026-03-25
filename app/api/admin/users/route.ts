import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { RoleType } from "@prisma/client";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  password: z.string().min(6),
  roleType: z.enum(["ADMIN", "TEACHER", "PARENT"]),
  designation: z.string().optional().or(z.literal("")),
  occupation: z.string().optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.role || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = createUserSchema.parse(await request.json());
    const existingUser = await prisma.user.findUnique({ where: { email: body.email } });

    if (existingUser) {
      return NextResponse.json({ success: false, message: "A user with this email already exists." }, { status: 400 });
    }

    const role = await prisma.role.findUnique({
      where: { type: body.roleType as RoleType },
    });

    if (!role) {
      return NextResponse.json({ success: false, message: "Role is not configured." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        passwordHash,
        roleId: role.id,
      },
    });

    if (body.roleType === "TEACHER") {
      await prisma.teacher.create({
        data: {
          userId: user.id,
          designation: body.designation || "Teacher",
        },
      });
    }

    if (body.roleType === "PARENT") {
      await prisma.parent.create({
        data: {
          userId: user.id,
          occupation: body.occupation || undefined,
        },
      });
    }

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Unable to create user." }, { status: 400 });
  }
}
