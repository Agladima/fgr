import { NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

interface Params {
  params: Promise<{ type: string }>;
}

const ALLOWED_CONTENT_TABLES: Record<string, string> = {
  programmes: "programmes",
  news: "news_articles",
  events: "events",
  resources: "resources",
  impact: "impact_metrics",
  stories: "success_stories",
};

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const { type } = await params;
  const tableName = ALLOWED_CONTENT_TABLES[type];
  if (!tableName) {
    return errorResponse(`Invalid content type '${type}'.`, 400, "INVALID_CONTENT_TYPE");
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from(tableName)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return errorResponse(`Failed to fetch ${type}.`, 500, "DATABASE_ERROR", error.message);
  }

  return successResponse(data);
}

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const { type } = await params;
  const tableName = ALLOWED_CONTENT_TABLES[type];
  if (!tableName) {
    return errorResponse(`Invalid content type '${type}'.`, 400, "INVALID_CONTENT_TYPE");
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON payload.", 400, "INVALID_JSON");
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from(tableName)
    .upsert([body])
    .select()
    .single();

  if (error) {
    return errorResponse(`Failed to save ${type} content.`, 500, "DATABASE_ERROR", error.message);
  }

  return successResponse(data, `${type} record saved successfully.`, 200);
}
