import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { RoleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ERP_SESSION_COOKIE, signPortalToken, verifyPortalToken, type PortalSessionPayload } from "@/lib/portal-token";

export async function authenticatePortalUser(identifier: string, password: string, allowedRoles: RoleType[]) {
  const value = identifier.trim();
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ email: value }, { phone: value }],
    },
    include: { role: true },
  });

  const isConfiguredAdmin =
    allowedRoles.includes(RoleType.ADMIN) &&
    (allowedRoles.includes(RoleType.SUPER_ADMIN) || true) &&
    (value === process.env.ADMIN_EMAIL || value === "admin@shaaradakoota.com" || value === "admin@shaaradakuuta.com") &&
    password === process.env.ADMIN_PASSWORD;

  if (!user && isConfiguredAdmin) {
    const adminRole = await prisma.role.upsert({
      where: { type: RoleType.ADMIN },
      update: { name: "Admin" },
      create: {
        type: RoleType.ADMIN,
        name: "Admin",
      },
    });

    const passwordHash = await bcrypt.hash(password, 10);

    user = await prisma.user.create({
      data: {
        name: "Sharada Koota Admin",
        email: process.env.ADMIN_EMAIL ?? "admin@shaaradakoota.com",
        phone: "9880199221",
        passwordHash,
        roleId: adminRole.id,
      },
      include: { role: true },
    });
  }

  if (!user || !user.isActive || !allowedRoles.includes(user.role.type)) {
    return null;
  }

  let valid = await bcrypt.compare(password, user.passwordHash);

  if (!valid && isConfiguredAdmin && user.role.type === RoleType.ADMIN) {
    const passwordHash = await bcrypt.hash(password, 10);
    user = await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
      include: { role: true },
    });
    valid = true;
  }

  if (!valid) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.type,
    phone: user.phone,
  };
}

export async function createPortalSession(payload: PortalSessionPayload, rememberMe = false) {
  const token = await signPortalToken(payload);
  const store = await cookies();
  store.set(ERP_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
  });
}

export async function clearPortalSession() {
  const store = await cookies();
  store.set(ERP_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function getPortalSession() {
  const store = await cookies();
  const token = store.get(ERP_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    return await verifyPortalToken(token);
  } catch {
    return null;
  }
}

export async function requirePortalRole(roles: RoleType[]) {
  const session = await getPortalSession();

  if (!session || !roles.includes(session.role)) {
    return null;
  }

  return session;
}
