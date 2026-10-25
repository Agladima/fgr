import { NextRequest } from "next/server";
import { authenticateAdmin, hasPermission } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

export async function GET(req: NextRequest) {
  // 1. Authenticate Admin
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(
      auth.error || "Unauthorized. Administrative privileges required.",
      401,
      "UNAUTHORIZED"
    );
  }

  // 2. Enforce RBAC permission
  if (!hasPermission(auth.role || "", "registrations:read")) {
    return errorResponse(
      "Forbidden. Your staff role does not have permission to view training registrations.",
      403,
      "FORBIDDEN"
    );
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const programme = searchParams.get("programme");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;

  try {
    const supabase = getSupabaseServiceClient();
    let query = supabase
      .from("training_registrations")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (programme && programme !== "all") {
      query = query.eq("programme", programme);
    }

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,location.ilike.%${search}%`
      );
    }

    const { data, count, error } = await query;

    if (error) {
      return errorResponse("Failed to fetch registrations.", 500, "DATABASE_ERROR", error.message);
    }

    return successResponse({
      registrations: data || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    return errorResponse((err as Error).message, 500, "INTERNAL_SERVER_ERROR");
  }
}
