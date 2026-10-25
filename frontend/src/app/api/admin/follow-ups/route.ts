import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateAdmin, hasPermission, recordAuditLog, getClientIp } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

const TaskCreateSchema = z.object({
  title: z.string().trim().min(3, "Task title must be at least 3 characters."),
  description: z.string().trim().optional(),
  assignedTo: z.string().uuid().optional().nullable(),
  relatedType: z.enum(["registration", "partnership", "enquiry", "programme", "event", "general"]),
  relatedId: z.string().uuid().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Authentication required.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "follow_ups:read")) {
    return errorResponse("Forbidden. Insufficient permissions to view follow-up tasks.", 403, "FORBIDDEN");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const assignedTo = searchParams.get("assignedTo");
  const relatedType = searchParams.get("relatedType");

  try {
    const supabase = getSupabaseServiceClient();

    let query = supabase
      .from("follow_up_tasks")
      .select(`
        *,
        assigned_to_profile:admin_profiles!follow_up_tasks_assigned_to_fkey(id, full_name, email, role),
        created_by_profile:admin_profiles!follow_up_tasks_created_by_fkey(id, full_name, email, role)
      `)
      .order("due_date", { ascending: true, nullsFirst: false });

    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (assignedTo) query = query.eq("assigned_to", assignedTo);
    if (relatedType) query = query.eq("related_type", relatedType);

    const { data: tasks, error: dbError } = await query;

    if (dbError) {
      console.error("[FollowUps GET] DB error:", dbError);
      return errorResponse("Failed to fetch follow-up tasks.", 500, "DB_ERROR");
    }

    return successResponse({ tasks: tasks || [] });
  } catch (err) {
    console.error("[FollowUps GET] Internal error:", err);
    return errorResponse("An unexpected error occurred while fetching follow-up tasks.", 500, "INTERNAL_ERROR");
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Authentication required.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "follow_ups:write")) {
    return errorResponse("Forbidden. Insufficient permissions to create tasks.", 403, "FORBIDDEN");
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON payload.", 400, "INVALID_JSON");
  }

  const parsed = TaskCreateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("Validation failed.", 422, "VALIDATION_ERROR", parsed.error.flatten().fieldErrors);
  }

  const data = parsed.data;
  const ip = getClientIp(req);

  try {
    const supabase = getSupabaseServiceClient();

    const { data: createdTask, error: dbError } = await supabase
      .from("follow_up_tasks")
      .insert([
        {
          title: data.title,
          description: data.description || null,
          assigned_to: data.assignedTo || null,
          created_by: auth.userId || null,
          related_type: data.relatedType,
          related_id: data.relatedId || null,
          due_date: data.dueDate || null,
          priority: data.priority,
          status: "pending",
        },
      ])
      .select(`
        *,
        assigned_to_profile:admin_profiles!follow_up_tasks_assigned_to_fkey(id, full_name, email, role)
      `)
      .single();

    if (dbError || !createdTask) {
      console.error("[FollowUps POST] DB error:", dbError);
      return errorResponse("Failed to create follow-up task.", 500, "DB_ERROR");
    }

    await recordAuditLog({
      actorId: auth.userId,
      actorEmail: auth.email || "staff",
      actorRole: auth.role || "staff",
      action: "task.create",
      resourceType: "task",
      resourceId: createdTask.id,
      details: { title: createdTask.title, priority: createdTask.priority },
      ipAddress: ip,
    });

    return successResponse({ task: createdTask }, "Follow-up task created successfully.", 201);
  } catch (err) {
    console.error("[FollowUps POST] Internal error:", err);
    return errorResponse("An unexpected error occurred while creating the task.", 500, "INTERNAL_ERROR");
  }
}
