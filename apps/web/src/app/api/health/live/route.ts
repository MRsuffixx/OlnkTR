import { createHttpHandlers, getContainer } from "@olnktr/api";

export const dynamic = "force-dynamic";

export function GET() {
  return createHttpHandlers(getContainer()).live();
}
