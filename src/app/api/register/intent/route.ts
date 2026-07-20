import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

import { USERNAME_UNAVAILABLE_MESSAGE } from "~/config/username-policy";
import { registerIntentInput } from "~/lib/schemas";
import { isUsernameAvailable } from "~/lib/username";
import { db } from "~/server/db";
import { getTrustedClientAddress } from "~/server/security/client-identity";
import { consumeRateLimit } from "~/server/security/rate-limit";

const MAX_BODY_BYTES = 4_096;

function throttled(retryAfterSeconds: number) {
  return NextResponse.json(
    { message: "Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}

export async function POST(request: NextRequest) {
  const address = getTrustedClientAddress(request.headers);
  const ipLimit = await consumeRateLimit({
    key: `register:client:${address}`,
    limit: 12,
    windowMs: 15 * 60 * 1000,
    blockMs: 30 * 60 * 1000,
  });
  if (!ipLimit.allowed) return throttled(ipLimit.retryAfterSeconds);

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES)
    return NextResponse.json({ message: "İstek çok büyük." }, { status: 413 });
  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES)
    return NextResponse.json({ message: "İstek çok büyük." }, { status: 413 });
  const parsed = registerIntentInput.safeParse(
    (() => {
      try {
        return JSON.parse(raw) as unknown;
      } catch {
        return null;
      }
    })(),
  );
  if (!parsed.success)
    return NextResponse.json(
      { message: "Bilgilerinizi kontrol edin." },
      { status: 400 },
    );

  const { email, username } = parsed.data;
  const [emailLimit, usernameLimit] = await Promise.all([
    consumeRateLimit({
      key: `register:email:${email}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
      blockMs: 60 * 60 * 1000,
    }),
    consumeRateLimit({
      key: `register:username:${username.toLowerCase()}`,
      limit: 10,
      windowMs: 60 * 60 * 1000,
      blockMs: 30 * 60 * 1000,
    }),
  ]);
  if (!emailLimit.allowed || !usernameLimit.allowed)
    return throttled(
      Math.max(emailLimit.retryAfterSeconds, usernameLimit.retryAfterSeconds),
    );

  const result = await isUsernameAvailable(username);
  if (!result.available || !result.validation.ok)
    return NextResponse.json(
      { message: USERNAME_UNAVAILABLE_MESSAGE },
      { status: 409 },
    );

  const existingToken = request.cookies.get("olnk-signup-intent")?.value;
  const token = existingToken ?? randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  try {
    await db.$transaction(async (tx) => {
      await tx.$executeRaw`
        DELETE FROM "AuthIntent"
        WHERE "id" IN (
          SELECT "id" FROM "AuthIntent"
          WHERE "expiresAt" <= CURRENT_TIMESTAMP
          ORDER BY "expiresAt" ASC
          LIMIT 250
        )
      `;
      const updated = existingToken
        ? await tx.authIntent.updateMany({
            where: { token: existingToken, expiresAt: { gt: new Date() } },
            data: {
              email,
              emailNormalized: email,
              username: result.validation.username,
              usernameNormalized: result.validation.normalized,
              expiresAt,
            },
          })
        : { count: 0 };
      if (updated.count === 0)
        await tx.authIntent.create({
          data: {
            email,
            emailNormalized: email,
            token,
            username: result.validation.username,
            usernameNormalized: result.validation.normalized,
            expiresAt,
          },
        });
    });
  } catch {
    return NextResponse.json(
      { message: "Kayıt isteği oluşturulamadı. Lütfen tekrar deneyin." },
      { status: 503 },
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
