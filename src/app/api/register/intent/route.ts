import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { USERNAME_UNAVAILABLE_MESSAGE } from "~/config/username-policy";
import { registerIntentInput } from "~/lib/schemas";
import { isUsernameAvailable } from "~/lib/username";
import { db } from "~/server/db";

export async function POST(request: Request) {
  const parsed = registerIntentInput.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Bilgilerinizi kontrol edin." },
      { status: 400 },
    );
  }

  const { email, username } = parsed.data;
  const result = await isUsernameAvailable(username, undefined, email);
  if (!result.available || !result.validation.ok) {
    return NextResponse.json(
      { message: USERNAME_UNAVAILABLE_MESSAGE },
      { status: 409 },
    );
  }

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  try {
    await db.$transaction(async (tx) => {
      await tx.authIntent.deleteMany({
        where: { expiresAt: { lte: new Date() } },
      });
      await tx.authIntent.upsert({
        where: { email },
        create: {
          email,
          token,
          username: result.validation.username,
          usernameNormalized: result.validation.normalized,
          expiresAt,
        },
        update: {
          token,
          username: result.validation.username,
          usernameNormalized: result.validation.normalized,
          expiresAt,
        },
      });
    });
  } catch {
    return NextResponse.json(
      { message: USERNAME_UNAVAILABLE_MESSAGE },
      { status: 409 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("olnk-signup-intent", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 15 * 60,
  });
  return response;
}
