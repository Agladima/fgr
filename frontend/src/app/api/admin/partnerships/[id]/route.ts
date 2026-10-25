import { NextRequest } from "next/server";
import { authenticateAdmin, hasPermission, recordAuditLog, getClientIp } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { UpdatePartnershipStatusSchema } from "@/lib/server/validation";
import { successResponse, errorResponse } from "@/lib/server/api-response";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "partnerships:read")) {
    return errorResponse("Forbidden. You do not have permission to view this partnership enquiry.", 403, "FORBIDDEN");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const { id } = await params;
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("partnership_enquiries")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return errorResponse("Partnership enquiry record not found.", 404, "NOT_FOUND");
  }

  return successResponse(data);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "partnerships:write")) {
    return errorResponse("Forbidden. You do not have permission to update partnership enquiries.", 403, "FORBIDDEN");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const { id } = await params;
  let rawBody;
  try {
    rawBody = await req.json();
  } catch {
    return errorResponse("Invalid JSON payload.", 400, "INVALID_JSON");
  }

  const validation = UpdatePartnershipStatusSchema.safeParse(rawBody);
  if (!validation.success) {
    return errorResponse(
      "Validation failed.",
      422,
      "VALIDATION_ERROR",
      validation.error.flatten().fieldErrors
    );
  }

  const { status, admin_notes } = validation.data;
  const updatePayload: Record<string, unknown> = { status };
  if (admin_notes !== undefined) updatePayload.admin_notes = admin_notes;

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("partnership_enquiries")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[DB Error] Update partnership:", error);
    return errorResponse("Failed to update partnership status.", 500, "DATABASE_ERROR");
  }

  const ip = getClientIp(req);
  await recordAuditLog({
    actorId: auth.userId,
    actorEmail: auth.email || "staff",
    actorRole: auth.role || "unknown",
    action: "partnerships.update_status",
    resourceType: "partnership_enquiry",
    resourceId: id,
    details: { newStatus: status },
    ipAddress: ip,
  });

  return successResponse(data, "Partnership status updated successfully.");
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (auth.role !== "super_admin" && auth.role !== "admin") {
    return errorResponse("Forbidden. Only Administrators can permanently remove partnership enquiries.", 403, "FORBIDDEN");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const { id } = await params;
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase
    .from("partnership_enquiries")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[DB Error] Delete partnership:", error);
    return errorResponse("Failed to delete partnership enquiry.", 500, "DATABASE_ERROR");
  }

  const ip = getClientIp(req);
  await recordAuditLog({
    actorId: auth.userId,
    actorEmail: auth.email || "staff",
    actorRole: auth.role || "unknown",
    action: "partnerships.delete",
    resourceType: "partnership_enquiry",
    resourceId: id,
    ipAddress: ip,
  });

  return successResponse({ id }, "Partnership enquiry deleted successfully.");
}

