import { PrismaAdapter } from "@auth/prisma-adapter";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { cookies } from "next/headers";

import { env } from "~/env";
import { validateUsernamePolicy } from "~/lib/username";
import { db } from "~/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string | null;
    } & DefaultSession["user"];
  }
}

const googleEnabled = Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);
const emailEnabled = Boolean(env.EMAIL_SERVER && env.EMAIL_FROM);

export const authMethods = { googleEnabled, emailEnabled };

const providers: NextAuthConfig["providers"] = [];

if (googleEnabled) {
  providers.push(
    Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: false,
    }),
  );
}

if (emailEnabled) {
  providers.push(
    Nodemailer({
      server: env.EMAIL_SERVER,
      from: env.EMAIL_FROM,
      maxAge: 10 * 60,
    }),
  );
}

async function ensureTheme(userId: string) {
  await db.theme.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });
}

async function claimSignupIntent(userId: string, email: string | null) {
  if (!email) return;

  const cookieStore = await cookies();
  const token = cookieStore.get("olnk-signup-intent")?.value;
  if (!token) return;

  const intent = await db.authIntent.findUnique({ where: { token } });
  if (
    !intent ||
    intent.expiresAt <= new Date() ||
    intent.email !== email.toLocaleLowerCase("tr-TR")
  ) {
    return;
  }

  const validation = await validateUsernamePolicy(intent.username);
  if (!validation.ok) return;

  try {
    await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: {
          username: validation.username,
          usernameNormalized: validation.normalized,
          onboardedAt: new Date(),
        },
      }),
      db.authIntent.delete({ where: { id: intent.id } }),
    ]);
    cookieStore.delete("olnk-signup-intent");
  } catch {
    // A unique constraint is the final authority. The user is sent to onboarding
    // to choose another name if this reservation lost a race.
  }
}

export const authConfig = {
  providers,
  adapter: PrismaAdapter(db),
  pages: {
    signIn: "/login",
    verifyRequest: "/login?status=email-sent",
    error: "/login",
  },
  session: { strategy: "database" },
  callbacks: {
    session: async ({ session, user }) => {
      const account = await db.user.findUnique({
        where: { id: user.id },
        select: { username: true },
      });
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          username: account?.username ?? null,
        },
      };
    },
  },
  events: {
    createUser: async ({ user }) => {
      if (!user.id) return;
      await ensureTheme(user.id);
    },
    signIn: async ({ user }) => {
      if (!user.id) return;
      await ensureTheme(user.id);
      await claimSignupIntent(user.id, user.email ?? null);
    },
  },
} satisfies NextAuthConfig;
