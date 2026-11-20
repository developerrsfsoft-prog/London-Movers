import type { MetadataRoute } from "next";
import { articles, regions } from "../../data";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/about",
    "/services",
    "/areas-we-cover",
    "/pricing",
    "/reviews",
    "/faqs",
    "/contact",
    "/quote",
    "/guides",
    "/blog",
    "/moving-checklist",
    "/moving-cost-guide",
    "/accessibility",
    "/legal/privacy",
    "/legal/terms",
    "/legal/cookies",
  ];
  const paths = [
    ...staticPaths,
    ...regions.map((region) => `/areas-we-cover/${region.slug}`),
    ...articles.map((article) => `/guides/${article.slug}`),
    ...articles.map((article) => `/blog/${article.slug}`),
  ];
  return [...new Set(paths)].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: path === "" ? 1 : path === "/quote" ? 0.8 : 0.6,
  }));
}
