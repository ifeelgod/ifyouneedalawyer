import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600; // Revalidate sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ifyouneedalawyer.com";

  // Static & Compliance pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/texas-bar-compliance`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  try {
    const [cities, practiceAreas, firms, courthouses] = await Promise.all([
      prisma.city.findMany({ include: { county: true } }),
      prisma.practiceArea.findMany(),
      prisma.lawFirm.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.courthouse.findMany({ select: { slug: true, updatedAt: true } }),
    ]);

    // City x PracticeArea matrix routes
    const categoryRoutes: MetadataRoute.Sitemap = [];
    for (const city of cities) {
      for (const pa of practiceAreas) {
        categoryRoutes.push({
          url: `${baseUrl}/${city.county.slug}/${city.slug}/${pa.slug}`,
          lastModified: new Date(),
          changeFrequency: "daily",
          priority: 0.9,
        });
      }
    }

    // Individual Law Firm Profiles
    const firmRoutes: MetadataRoute.Sitemap = firms.map((f) => ({
      url: `${baseUrl}/firm/${f.slug}`,
      lastModified: f.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    // Courthouse Guides
    const courthouseRoutes: MetadataRoute.Sitemap = courthouses.map((c) => ({
      url: `${baseUrl}/courthouses/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...categoryRoutes, ...firmRoutes, ...courthouseRoutes];
  } catch (err) {
    console.error("Sitemap DB generation fallback:", err);
    return staticRoutes;
  }
}
