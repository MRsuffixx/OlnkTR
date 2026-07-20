import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/api/", "/go/", "/onboarding"],
    },
    sitemap: "https://olnk.tr/sitemap.xml",
  };
}
