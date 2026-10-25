import { MetadataRoute } from "next";
import { getSupabasePublicClient, isSupabaseConfigured } from "@/lib/server/supabase";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.fgrcdc.org.ng";

  // 1. Core static public pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/programmes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news-events`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/impact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/partnerships`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/partnership-enquiry`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/professional-services`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  if (!isSupabaseConfigured()) {
    return staticRoutes;
  }

  try {
    const supabase = getSupabasePublicClient();

    // 2. Published News Articles ONLY (drafts & archived strictly excluded)
    const { data: articles } = await supabase
      .from("news_articles")
      .select("slug, updated_at, published_at")
      .eq("status", "published");

    const articleRoutes: MetadataRoute.Sitemap = (articles || []).map((art) => ({
      url: `${baseUrl}/news-events#${art.slug}`,
      lastModified: new Date(art.updated_at || art.published_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    // 3. Published Programmes ONLY (drafts & archived strictly excluded)
    const { data: programmes } = await supabase
      .from("programmes")
      .select("slug, updated_at")
      .in("status", ["published", "open", "closing_soon"]);

    const programmeRoutes: MetadataRoute.Sitemap = (programmes || []).map((prog) => ({
      url: `${baseUrl}/programmes#${prog.slug}`,
      lastModified: new Date(prog.updated_at || Date.now()),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...articleRoutes, ...programmeRoutes];
  } catch {
    return staticRoutes;
  }
}
