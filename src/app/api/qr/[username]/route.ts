import QRCode from "qrcode";

import { normalizeUsername } from "~/lib/username";
import { db } from "~/server/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const account = await db.user.findUnique({
    where: { usernameNormalized: normalizeUsername(username) },
    select: { username: true },
  });
  if (!account?.username) return new Response(null, { status: 404 });

  const profileUrl = new URL(`/${account.username}`, request.url).toString();
  const buffer = await QRCode.toBuffer(profileUrl, {
    type: "png",
    width: 720,
    margin: 2,
    color: { dark: "#17211B", light: "#FDFCF7" },
    errorCorrectionLevel: "M",
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Disposition": `inline; filename="${account.username}-qr.png"`,
    },
  });
}
