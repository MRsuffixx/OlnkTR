import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://olnk.tr", changeFrequency: "weekly", priority: 1 },
    { url: "https://olnk.tr/kayit", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://olnk.tr/giris", changeFrequency: "monthly", priority: 0.6 },
    { url: "https://olnk.tr/gizlilik", changeFrequency: "yearly", priority: 0.2 },
    { url: "https://olnk.tr/kosullar", changeFrequency: "yearly", priority: 0.2 },
  ];
}
