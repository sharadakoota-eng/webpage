import { jwtVerify, SignJWT } from "jose";
import { RoleType } from "@prisma/client";

export const ERP_SESSION_COOKIE = "skm_erp_token";

export type PortalSessionPayload = {
  sub: string;
  name: string;
  email: string;
  role: RoleType;
};

function getSecret() {
  return new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "replace-with-a-long-random-secret");
}

export async function signPortalToken(payload: PortalSessionPayload) {
  return new SignJWT({ role: payload.role, name: payload.name, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyPortalToken(token: string) {
  const verified = await jwtVerify(token, getSecret());
  const { payload } = verified;

  return {
    sub: String(payload.sub ?? ""),
    name: String(payload.name ?? ""),
    email: String(payload.email ?? ""),
    role: payload.role as RoleType,
  };
}
