import { NextRequest } from "next/server";
import { authenticateAdmin, hasPermission } from "@/lib/server/security";
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

  if (!hasPermission(auth.role || "", "reports:read")) {
    return errorResponse(
      "Forbidden. Your staff role does not have permission to view dashboard statistics.",
      403,
      "FORBIDDEN"
    );
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  try {
    const supabase = getSupabaseServiceClient();

    // Query counts in parallel
    const [
      totalRegistrations,
      pendingRegistrations,
      totalEnquiries,
      unreadEnquiries,
      totalPartnerships,
      newPartnerships,
      totalProgrammes,
      totalArticles,
      totalEvents,
      totalResources,
    ] = await Promise.all([
      supabase.from("training_registrations").select("*", { count: "exact", head: true }),
      supabase.from("training_registrations").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("contact_enquiries").select("*", { count: "exact", head: true }),
      supabase.from("contact_enquiries").select("*", { count: "exact", head: true }).eq("status", "unread"),
      supabase.from("partnership_enquiries").select("*", { count: "exact", head: true }),
      supabase.from("partnership_enquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("programmes").select("*", { count: "exact", head: true }),
      supabase.from("news_articles").select("*", { count: "exact", head: true }),
      supabase.from("events").select("*", { count: "exact", head: true }),
      supabase.from("resources").select("*", { count: "exact", head: true }),
    ]);

    return successResponse({
      registrations: {
        total: totalRegistrations.count || 0,
        pending: pendingRegistrations.count || 0,
      },
      contactEnquiries: {
        total: totalEnquiries.count || 0,
        unread: unreadEnquiries.count || 0,
      },
      partnerships: {
        total: totalPartnerships.count || 0,
        new: newPartnerships.count || 0,
      },
      content: {
        programmes: totalProgrammes.count || 0,
        articles: totalArticles.count || 0,
        events: totalEvents.count || 0,
        resources: totalResources.count || 0,
      },
    });
  } catch (err) {
    return errorResponse((err as Error).message, 500, "INTERNAL_SERVER_ERROR");
  }
}
