import { NextRequest } from "next/server";
import { authenticateAdmin, hasPermission } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Authentication required.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "audit_logs:read")) {
    return errorResponse("Forbidden. Insufficient permissions to view audit logs.", 403, "FORBIDDEN");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
  const actionFilter = searchParams.get("action");
  const resourceFilter = searchParams.get("resource");
  const offset = (page - 1) * limit;

  try {
    const supabase = getSupabaseServiceClient();

    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (actionFilter) query = query.eq("action", actionFilter);
    if (resourceFilter) query = query.eq("resource_type", resourceFilter);

    const { data: logs, count, error: dbError } = await query;

    if (dbError) {
      console.error("[ActivityLogs GET] DB error:", dbError);
      return errorResponse("Failed to fetch audit logs.", 500, "DB_ERROR");
    }

    return successResponse({
      logs: logs || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    console.error("[ActivityLogs GET] Internal error:", err);
    return errorResponse("An unexpected error occurred while fetching audit logs.", 500, "INTERNAL_ERROR");
  }
}
