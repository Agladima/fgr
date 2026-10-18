import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateAdmin, recordAuditLog, getClientIp } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

const CreateNoteSchema = z.object({
  recordType: z.enum(["registration", "partnership", "enquiry", "task", "general"]),
  recordId: z.string().uuid("Invalid record UUID."),
  content: z.string().trim().min(2, "Note content cannot be empty."),
});

export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Authentication required.", 401, "UNAUTHORIZED");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const { searchParams } = new URL(req.url);
  const recordType = searchParams.get("recordType");
  const recordId = searchParams.get("recordId");

  if (!recordType || !recordId) {
    return errorResponse("recordType and recordId query parameters are required.", 400, "MISSING_PARAMS");
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
      return errorResponse("Failed to fetch internal notes.", 500, "DB_ERROR", dbError.message);
    }

    return successResponse({ notes: notes || [] });
  } catch (err) {
    return errorResponse((err as Error).message, 500, "INTERNAL_ERROR");
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
      return errorResponse("Failed to save internal note.", 500, "DB_ERROR", dbError?.message);
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
    return errorResponse((err as Error).message, 500, "INTERNAL_ERROR");
  }
}
