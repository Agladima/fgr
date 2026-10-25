import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateAdmin, hasPermission, recordAuditLog, getClientIp, PermissionKey } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

const CreateNoteSchema = z.object({
  recordType: z.enum(["registration", "partnership", "enquiry", "task", "general"]),
  recordId: z.string().uuid("Invalid record UUID."),
  content: z.string().trim().min(2, "Note content cannot be empty."),
});

function getRequiredNotePermission(recordType: string, isWrite = false): PermissionKey {
  if (recordType === "registration") return isWrite ? "registrations:write" : "registrations:read";
  if (recordType === "partnership") return isWrite ? "partnerships:write" : "partnerships:read";
  if (recordType === "enquiry") return isWrite ? "enquiries:write" : "enquiries:read";
  return isWrite ? "follow_ups:write" : "follow_ups:read";
}

export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Authentication required.", 401, "UNAUTHORIZED");
  }

  const { searchParams } = new URL(req.url);
  const recordType = searchParams.get("recordType");
  const recordId = searchParams.get("recordId");

  if (!recordType || !recordId) {
    return errorResponse("recordType and recordId query parameters are required.", 400, "MISSING_PARAMS");
  }

  const requiredPerm = getRequiredNotePermission(recordType, false);
  if (!hasPermission(auth.role || "", requiredPerm)) {
    return errorResponse("Forbidden. Insufficient permissions to view notes for this record.", 403, "FORBIDDEN");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  try {
    const supabase = getSupabaseServiceClient();

    const { data: notes, error: dbError } = await supabase
      .from("internal_notes")
      .select("*")
      .eq("record_type", recordType)
      .eq("record_id", recordId)
      .order("created_at", { ascending: false });

    if (dbError) {
      console.error("[Notes GET] DB error:", dbError);
      return errorResponse("Failed to fetch internal notes.", 500, "DB_ERROR");
    }

    return successResponse({ notes: notes || [] });
  } catch (err) {
    console.error("[Notes GET] Internal error:", err);
    return errorResponse("An unexpected error occurred while fetching notes.", 500, "INTERNAL_ERROR");
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Authentication required.", 401, "UNAUTHORIZED");
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON payload.", 400, "INVALID_JSON");
  }

  const parsed = CreateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("Validation failed.", 422, "VALIDATION_ERROR", parsed.error.flatten().fieldErrors);
  }

  const { recordType, recordId, content } = parsed.data;

  const requiredPerm = getRequiredNotePermission(recordType, true);
  if (!hasPermission(auth.role || "", requiredPerm)) {
    return errorResponse("Forbidden. Insufficient permissions to add notes to this record.", 403, "FORBIDDEN");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const ip = getClientIp(req);

  try {
    const supabase = getSupabaseServiceClient();

    const { data: createdNote, error: dbError } = await supabase
      .from("internal_notes")
      .insert([
        {
          author_id: auth.userId || null,
          author_name: auth.fullName || auth.email || "Staff Member",
          record_type: recordType,
          record_id: recordId,
          content,
        },
      ])
      .select()
      .single();

    if (dbError || !createdNote) {
      console.error("[Notes POST] DB error:", dbError);
      return errorResponse("Failed to save internal note.", 500, "DB_ERROR");
    }

    await recordAuditLog({
      actorId: auth.userId,
      actorEmail: auth.email || "staff",
      actorRole: auth.role || "staff",
      action: "note.create",
      resourceType: recordType,
      resourceId: recordId,
      ipAddress: ip,
    });

    return successResponse({ note: createdNote }, "Internal note added successfully.", 201);
  } catch (err) {
    console.error("[Notes POST] Internal error:", err);
    return errorResponse("An unexpected error occurred while saving the note.", 500, "INTERNAL_ERROR");
  }
}
