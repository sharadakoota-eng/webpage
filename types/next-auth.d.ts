import { RoleType } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    role?: RoleType;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role?: RoleType;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: RoleType;
  }
}
