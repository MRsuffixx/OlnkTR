import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://olnk.tr", changeFrequency: "weekly", priority: 1 },
    {
      url: "https://olnk.tr/register",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    { url: "https://olnk.tr/login", changeFrequency: "monthly", priority: 0.6 },
    {
      url: "https://olnk.tr/privacy",
      changeFrequency: "yearly",
      priority: 0.2,
    },
    { url: "https://olnk.tr/terms", changeFrequency: "yearly", priority: 0.2 },
  ];
}
