import { NextRequest } from "next/server";
import { authenticateAdmin } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(
      auth.error || "Unauthorized. Administrative privileges required.",
      401,
      "UNAUTHORIZED"
    );
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const offset = (page - 1) * limit;

  try {
    const supabase = getSupabaseServiceClient();
    let query = supabase
      .from("partnership_enquiries")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (type && type !== "all") {
      query = query.eq("organisation_type", type);
    }

    if (search) {
      query = query.or(
        `organisation_name.ilike.%${search}%,contact_person.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, count, error } = await query;

    if (error) {
      return errorResponse("Failed to fetch partnership enquiries.", 500, "DATABASE_ERROR", error.message);
    }

    return successResponse({
      partnerships: data || [],
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
