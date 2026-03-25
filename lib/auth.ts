import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import NextAuth from "next-auth";
import { RoleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials.email as string;
        const password = credentials.password as string;
        let user = await prisma.user.findUnique({
          where: { email },
          include: { role: true },
        });

        const isConfiguredAdmin = email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;

        // Production-safe bootstrap: if the admin user is missing because seed data
        // did not run against the live database, allow the configured admin to be
        // created automatically on first successful login attempt.
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
              email,
              phone: "9880199221",
              passwordHash,
              roleId: adminRole.id,
            },
            include: { role: true },
          });
        }

        if (!user || !user.isActive) {
          return null;
        }

        let valid = await bcrypt.compare(password, user.passwordHash);

        // If the stored admin password hash is stale but the incoming credentials
        // match the currently configured production admin password, self-heal it.
        if (!valid && isConfiguredAdmin) {
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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as RoleType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role as RoleType;
      }
      return session;
    },
  },
});
