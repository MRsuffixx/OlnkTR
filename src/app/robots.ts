import type { MetadataRoute } from "next";
import { getAppOrigin } from "~/lib/app-url";

export default function robots(): MetadataRoute.Robots {
  const origin = getAppOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/dashboard/",
        "/api/",
        "/go/",
        "/unlock/",
        "/onboarding",
      ],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
