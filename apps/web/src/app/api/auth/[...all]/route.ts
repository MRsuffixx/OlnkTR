import { toNextJsHandler } from "@olnktr/auth/next";
import { getContainer } from "@olnktr/api";

/** Better Auth endpoints (/api/auth/*). Sign-up is refused early when registration is disabled. */
const handler = () => toNextJsHandler(getContainer().auth);

export async function GET(request: Request) {
  return handler().GET(request);
}

export async function POST(request: Request) {
  if (new URL(request.url).pathname.startsWith("/api/auth/sign-up")) {
    const enabled = await getContainer().core.platform.getSetting("registration.enabled");
    if (!enabled)
      return Response.json(
        { code: "REGISTRATION_DISABLED", message: "Registration is currently disabled" },
        { status: 403 },
      );
  }
  return handler().POST(request);
}
