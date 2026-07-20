/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // iyzipay discovers its official resource modules at runtime; keeping the
  // provider SDK external preserves that supported Node.js loading model.
  serverExternalPackages: ["iyzipay", "@adyen/api-library"],
  async headers() {
    const scriptPolicy =
      process.env.NODE_ENV === "development"
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'";
    const contentSecurityPolicy = [
      "default-src 'self'",
      scriptPolicy,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "media-src 'self' blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.adyen.com",
      "frame-src https://www.paytr.com https://*.iyzipay.com https://*.iyzico.com https://www.youtube-nocookie.com https://open.spotify.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://www.paytr.com https://*.iyzipay.com https://*.iyzico.com",
      "frame-ancestors 'none'",
      ...(process.env.NODE_ENV === "production"
        ? ["upgrade-insecure-requests"]
        : []),
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default config;
