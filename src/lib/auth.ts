import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { parseSuperAdminEmails, toSessionUser } from "@/lib/permissions";
import type { SessionUser } from "@/lib/permissions";

declare module "next-auth" {
  interface Session {
    user: SessionUser;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        if (user.status === "disabled") return null;

        const superEmails = parseSuperAdminEmails(process.env.SUPERADMIN_EMAILS);
        if (
          superEmails.includes(email) &&
          (user.role !== "superadmin" || user.status !== "active")
        ) {
          const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
              role: "superadmin",
              status: "active",
              permPeople: true,
              permMeetups: true,
              permInsights: true,
              permContact: true,
              permSettings: true,
            },
          });
          await prisma.user.update({
            where: { id: updated.id },
            data: { lastLoginAt: new Date() },
          });
          return toSessionUser(updated);
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return toSessionUser(user);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as SessionUser;
        token.id = u.id;
        token.email = u.email;
        token.name = u.name;
        token.role = u.role;
        token.status = u.status;
        token.permPeople = u.permPeople;
        token.permMeetups = u.permMeetups;
        token.permInsights = u.permInsights;
        token.permContact = u.permContact;
        token.permSettings = u.permSettings;
      }
      return token;
    },
    async session({ session, token }) {
      const user: SessionUser = {
        id: String(token.id ?? ""),
        email: String(token.email ?? ""),
        name: (token.name as string | null | undefined) ?? null,
        role: token.role as SessionUser["role"],
        status: token.status as SessionUser["status"],
        permPeople: Boolean(token.permPeople),
        permMeetups: Boolean(token.permMeetups),
        permInsights: Boolean(token.permInsights),
        permContact: Boolean(token.permContact),
        permSettings: Boolean(token.permSettings),
      };
      return { ...session, user };
    },
  },
});
