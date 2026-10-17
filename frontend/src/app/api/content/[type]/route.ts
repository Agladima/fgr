import { NextRequest } from "next/server";
import { getSupabasePublicClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

interface Params {
  params: Promise<{ type: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PUBLIC_TABLE_MAP: Record<string, { table: string; filter?: (q: any) => any }> = {
  programmes: {
    table: "programmes",
    filter: (q) => q.eq("status", "published").order("order_index", { ascending: true }),
  },
  news: {
    table: "news_articles",
    filter: (q) => q.eq("status", "published").order("published_at", { ascending: false }),
  },
  events: {
    table: "events",
    filter: (q) => q.in("status", ["upcoming", "ongoing"]).order("event_date", { ascending: true }),
  },
  resources: {
    table: "resources",
    filter: (q) => q.eq("status", "active").order("order_index", { ascending: true }),
  },
  impact: {
    table: "impact_metrics",
    filter: (q) => q.order("order_index", { ascending: true }),
  },
  stories: {
    table: "success_stories",
    filter: (q) => q.eq("status", "active").order("order_index", { ascending: true }),
  },
};

export async function GET(req: NextRequest, { params }: Params) {
  const { type } = await params;
  const config = PUBLIC_TABLE_MAP[type];

  if (!config) {
    return errorResponse(`Content type '${type}' not recognized.`, 404, "NOT_FOUND");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database service is currently unconfigured.", 503, "DATABASE_UNAVAILABLE");
  }

  try {
    const supabase = getSupabasePublicClient();
    let query = supabase.from(config.table).select("*");
    if (config.filter) {
      query = config.filter(query);
    }

    const { data, error } = await query;
    if (error) {
      return errorResponse(`Failed to fetch ${type}.`, 500, "DATABASE_ERROR", error.message);
    }

    return successResponse(data || []);
  } catch (err) {
    return errorResponse((err as Error).message, 500, "INTERNAL_SERVER_ERROR");
  }
}
