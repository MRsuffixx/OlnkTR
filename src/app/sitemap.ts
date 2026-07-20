import type { MetadataRoute } from "next";
import { getAppOrigin } from "~/lib/app-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = getAppOrigin();
  return [
    { url: origin, changeFrequency: "weekly", priority: 1 },
    {
      url: `${origin}/register`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: `${origin}/login`, changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${origin}/privacy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    { url: `${origin}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
