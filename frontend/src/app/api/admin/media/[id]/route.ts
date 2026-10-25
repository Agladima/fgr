import { NextRequest } from "next/server";
import { authenticateAdmin, hasPermission, recordAuditLog, getClientIp } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "content:write")) {
    return errorResponse("Forbidden. Insufficient permissions to update media metadata.", 403, "FORBIDDEN");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON payload.", 400, "INVALID_JSON");
  }

  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("media_files")
    .update({ alt_text: body.alt_text })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return errorResponse("Failed to update media record.", 500, "DB_ERROR", error?.message);
  }

  const ip = getClientIp(req);
  await recordAuditLog({
    actorId: auth.userId,
    actorEmail: auth.email || "staff",
    actorRole: auth.role || "staff",
    action: "media.update",
    resourceType: "media",
    resourceId: id,
    details: { alt_text: body.alt_text },
    ipAddress: ip,
  });

  return successResponse(data, "Media metadata updated successfully.");
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Unauthorized.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "content:write")) {
    return errorResponse("Forbidden. Insufficient permissions to delete media.", 403, "FORBIDDEN");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const { id } = await params;
  const supabase = getSupabaseServiceClient();

  // Find record first to get file path
  const { data: mediaRecord } = await supabase
    .from("media_files")
    .select("id, bucket_name, file_path, file_name")
    .eq("id", id)
    .single();

  if (!mediaRecord) {
    return errorResponse("Media file record not found.", 404, "NOT_FOUND");
  }

  // Remove from storage bucket
  await supabase.storage
    .from(mediaRecord.bucket_name || "public-assets")
    .remove([mediaRecord.file_path]);

  // Remove database row
  const { error: dbError } = await supabase
    .from("media_files")
    .delete()
    .eq("id", id);

  if (dbError) {
    return errorResponse("Failed to delete media record.", 500, "DB_ERROR", dbError.message);
  }

  const ip = getClientIp(req);
  await recordAuditLog({
    actorId: auth.userId,
    actorEmail: auth.email || "staff",
    actorRole: auth.role || "staff",
    action: "media.delete",
    resourceType: "media",
    resourceId: id,
    details: { file_name: mediaRecord.file_name, file_path: mediaRecord.file_path },
    ipAddress: ip,
  });

  return successResponse(null, "Media item deleted successfully.");
}
