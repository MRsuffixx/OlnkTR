"use client";

import { inferAdditionalFields, twoFactorClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/** Browser auth client (same-origin; endpoints under /api/auth). */
export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        const locale = window.location.pathname.startsWith("/tr") ? "/tr" : "";
        window.location.href = `${locale}/two-factor`;
      },
    }),
    inferAdditionalFields({
      user: {
        role: { type: "string", required: false, input: false },
        status: { type: "string", required: false, input: false },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
