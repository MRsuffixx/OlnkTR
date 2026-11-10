import { createHttpHandlers, getContainer } from "@olnktr/api";

/** Local development checkout (only when the `dev` billing provider is enabled). */
export function GET(request: Request) {
  return createHttpHandlers(getContainer()).devCheckoutPage(request);
}

export function POST(request: Request) {
  return createHttpHandlers(getContainer()).devCheckoutSubmit(request);
}
