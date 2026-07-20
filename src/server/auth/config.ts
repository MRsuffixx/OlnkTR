import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter, AdapterUser } from "next-auth/adapters";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { cookies } from "next/headers";

import { env } from "~/env";
import { normalizeEmail } from "~/lib/email";
import { db } from "~/server/db";
import {
  claimUsername,
  UsernameUnavailableError,
} from "~/server/identity/claim-username";

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
  if (!intent) return;

  try {
    await claimUsername({
      userId,
      email,
      username: intent.username,
      intentToken: token,
    });
    cookieStore.delete("olnk-signup-intent");
  } catch (error) {
    // A unique constraint is the final authority. The user is sent to onboarding
    // to choose another name if this reservation lost a race.
    if (!(error instanceof UsernameUnavailableError)) throw error;
  }
}

const baseAdapter = PrismaAdapter(db);

function toAdapterUser(user: {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
}): AdapterUser {
  if (!user.email) throw new Error("Auth user is missing an email address.");
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
  };
}

const adapter = {
  ...baseAdapter,
  async createUser(user) {
    const email = normalizeEmail(user.email);
    const created = await db.user.create({
      data: { ...user, email, emailNormalized: email },
    });
    return toAdapterUser(created);
  },
  async getUserByEmail(email) {
    const user = await db.user.findUnique({
      where: { emailNormalized: normalizeEmail(email) },
    });
    return user ? toAdapterUser(user) : null;
  },
  async updateUser({ id, ...user }) {
    const email = user.email ? normalizeEmail(user.email) : undefined;
    const updated = await db.user.update({
      where: { id },
      data: {
        ...user,
        ...(email ? { email, emailNormalized: email } : {}),
      },
    });
    return toAdapterUser(updated);
  },
  async createVerificationToken(token) {
    return db.verificationToken.create({
      data: { ...token, identifier: normalizeEmail(token.identifier) },
    });
  },
  async useVerificationToken({ identifier, token }) {
    const key = {
      identifier_token: { identifier: normalizeEmail(identifier), token },
    };
    const existing = await db.verificationToken.findUnique({ where: key });
    if (!existing) return null;
    return db.verificationToken.delete({ where: key });
  },
} satisfies Adapter;

export const authConfig = {
  providers,
  adapter,
  pages: {
    signIn: "/login",
    verifyRequest: "/login?status=email-sent",
    error: "/login",
  },
  session: { strategy: "database" },
  callbacks: {
    signIn: async ({ user }) => {
      if (!user.id) return true;
      const account = await db.user.findUnique({
        where: { id: user.id },
        select: { deletionRequestedAt: true },
      });
      return !account?.deletionRequestedAt;
    },
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
      if (user.email) {
        const email = normalizeEmail(user.email);
        await db.user.update({
          where: { id: user.id },
          data: { email, emailNormalized: email },
        });
      }
      await ensureTheme(user.id);
      await claimSignupIntent(user.id, user.email ?? null);
    },
  },
} satisfies NextAuthConfig;
