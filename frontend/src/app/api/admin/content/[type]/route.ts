import { NextRequest } from "next/server";
import { authenticateAdmin, hasPermission, recordAuditLog, getClientIp } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";
import { CONTENT_SCHEMAS, slugify } from "@/lib/server/content-validation";
import { revalidateContentPaths } from "@/lib/server/content-revalidate";

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

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status");
  const searchQuery = searchParams.get("search");

  const supabase = getSupabaseServiceClient();
  let query = supabase.from(tableName).select("*");

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  // Choose sensible default ordering
  if (tableName === "impact_metrics" || tableName === "resources" || tableName === "success_stories") {
    query = query.order("order_index", { ascending: true }).order("created_at", { ascending: false });
  } else if (tableName === "events") {
    query = query.order("event_date", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return errorResponse(`Failed to fetch ${type}.`, 500, "DATABASE_ERROR", error.message);
  }

  let results = data || [];
  if (searchQuery && searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    results = results.filter((item: Record<string, unknown>) => {
      const title = String(item.title || item.name || item.label || "").toLowerCase();
      const desc = String(item.summary || item.description || item.story || item.quote || "").toLowerCase();
      const cat = String(item.category || item.pillar_name || item.programme_name || "").toLowerCase();
      return title.includes(q) || desc.includes(q) || cat.includes(q);
    });
  }

  return successResponse(results);
}

export async function POST(req: NextRequest, { params }: Params) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "content:write")) {
    return errorResponse("Forbidden. Insufficient permissions to create or modify content.", 403, "FORBIDDEN");
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

  // Auto-slugify if slug is empty or missing on news/programmes
  if ((type === "news" || type === "programmes") && (!body.slug || body.slug.trim().length === 0) && body.title) {
    body.slug = slugify(body.title);
  }

  // Validate with Zod schema
  const schema = CONTENT_SCHEMAS[type];
  if (schema) {
    const parseResult = schema.safeParse(body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return errorResponse(issue ? `${issue.path.join(".")}: ${issue.message}` : "Validation failed.", 400, "VALIDATION_ERROR");
    }
    body = parseResult.data;
  }

  const supabase = getSupabaseServiceClient();

  // Check duplicate slugs for news and programmes
  if ((type === "news" || type === "programmes") && body.slug) {
    let checkQuery = supabase.from(tableName).select("id").eq("slug", body.slug);
    if (body.id) {
      checkQuery = checkQuery.neq("id", body.id);
    }
    const { data: existingSlug } = await checkQuery.maybeSingle();
    if (existingSlug) {
      return errorResponse(`A ${type} record with the slug "${body.slug}" already exists. Please choose a unique title or slug.`, 409, "DUPLICATE_SLUG");
    }
  }

  const { data, error } = await supabase
    .from(tableName)
    .upsert([body])
    .select()
    .single();

  if (error) {
    return errorResponse(`Failed to save ${type} content: ${error.message}`, 500, "DATABASE_ERROR", error.message);
  }

  const ip = getClientIp(req);
  await recordAuditLog({
    actorId: auth.userId,
    actorEmail: auth.email || "staff",
    actorRole: auth.role || "staff",
    action: `${type}.upsert`,
    resourceType: type,
    resourceId: data.id,
    details: { title: data.title || data.name || data.label, status: data.status },
    ipAddress: ip,
  });

  // Revalidate public cache
  revalidateContentPaths(type);

  return successResponse(data, `${type} record saved successfully.`, 200);
}
