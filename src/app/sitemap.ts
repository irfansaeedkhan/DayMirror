import type { MetadataRoute } from "next";

function getSiteUrl(): string {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];
}
