import { NextRequest } from "next/server";
import { authenticateAdmin, hasPermission, recordAuditLog, getClientIp } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";
import { revalidateContentPaths } from "@/lib/server/content-revalidate";

interface Params {
  params: Promise<{ type: string; id: string }>;
}

const ALLOWED_CONTENT_TABLES: Record<string, string> = {
  programmes: "programmes",
  news: "news_articles",
  events: "events",
  resources: "resources",
  impact: "impact_metrics",
  stories: "success_stories",
};

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "content:write")) {
    return errorResponse("Forbidden. Insufficient permissions to edit content.", 403, "FORBIDDEN");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const { type, id } = await params;
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

  const ip = getClientIp(req);

  try {
    const supabase = getSupabaseServiceClient();
    const { data: updatedRecord, error: dbError } = await supabase
      .from(tableName)
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (dbError || !updatedRecord) {
      return errorResponse(`Failed to update ${type} record.`, 500, "DB_ERROR", dbError?.message);
    }

    await recordAuditLog({
      actorId: auth.userId,
      actorEmail: auth.email || "staff",
      actorRole: auth.role || "staff",
      action: `${type}.update`,
      resourceType: type,
      resourceId: id,
      details: body,
      ipAddress: ip,
    });

    revalidateContentPaths(type);

    return successResponse({ record: updatedRecord }, `${type} updated successfully.`);
  } catch (err) {
    return errorResponse((err as Error).message, 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "content:write")) {
    return errorResponse("Forbidden. Insufficient permissions to delete content.", 403, "FORBIDDEN");
  }

  const { type, id } = await params;
  const tableName = ALLOWED_CONTENT_TABLES[type];
  if (!tableName) {
    return errorResponse(`Invalid content type '${type}'.`, 400, "INVALID_CONTENT_TYPE");
  }

  const ip = getClientIp(req);

  try {
    const supabase = getSupabaseServiceClient();
    const { error: dbError } = await supabase.from(tableName).delete().eq("id", id);

    if (dbError) {
      return errorResponse(`Failed to delete ${type} record.`, 500, "DB_ERROR", dbError.message);
    }

    await recordAuditLog({
      actorId: auth.userId,
      actorEmail: auth.email || "staff",
      actorRole: auth.role || "staff",
      action: `${type}.delete`,
      resourceType: type,
      resourceId: id,
      ipAddress: ip,
    });

    revalidateContentPaths(type);

    return successResponse(null, `${type} record deleted successfully.`);
  } catch (err) {
    return errorResponse((err as Error).message, 500, "INTERNAL_ERROR");
  }
}
