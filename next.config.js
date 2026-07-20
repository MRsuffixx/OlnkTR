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
};

export default config;
