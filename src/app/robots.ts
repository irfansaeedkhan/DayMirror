import type { MetadataRoute } from "next";

function getSiteUrl(): string {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/planner", "/tracker", "/analytics"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
