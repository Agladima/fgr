import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateAdmin, hasPermission, recordAuditLog, getClientIp } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

interface Params {
  params: Promise<{ id: string }>;
}

const TaskUpdateSchema = z.object({
  title: z.string().trim().min(3).optional(),
  description: z.string().trim().optional().nullable(),
  assignedTo: z.string().uuid().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Authentication required.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "follow_ups:write")) {
    return errorResponse("Forbidden. Insufficient permissions to update tasks.", 403, "FORBIDDEN");
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

  const parsed = TaskUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("Validation failed.", 422, "VALIDATION_ERROR", parsed.error.flatten().fieldErrors);
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.assignedTo !== undefined) updates.assigned_to = parsed.data.assignedTo;
  if (parsed.data.dueDate !== undefined) updates.due_date = parsed.data.dueDate;
  if (parsed.data.priority !== undefined) updates.priority = parsed.data.priority;
  if (parsed.data.status !== undefined) {
    updates.status = parsed.data.status;
    if (parsed.data.status === "completed") {
      updates.completed_at = new Date().toISOString();
    } else {
      updates.completed_at = null;
    }
  }

  const ip = getClientIp(req);

  try {
    const supabase = getSupabaseServiceClient();

    const { data: updatedTask, error: dbError } = await supabase
      .from("follow_up_tasks")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        assigned_to_profile:admin_profiles!follow_up_tasks_assigned_to_fkey(id, full_name, email, role)
      `)
      .single();

    if (dbError || !updatedTask) {
      return errorResponse("Task not found or update failed.", 404, "NOT_FOUND", dbError?.message);
    }

    await recordAuditLog({
      actorId: auth.userId,
      actorEmail: auth.email || "staff",
      actorRole: auth.role || "staff",
      action: "task.update",
      resourceType: "task",
      resourceId: id,
      details: updates,
      ipAddress: ip,
    });

    return successResponse({ task: updatedTask }, "Task updated successfully.");
  } catch (err) {
    return errorResponse((err as Error).message, 500, "INTERNAL_ERROR");
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Authentication required.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "follow_ups:write")) {
    return errorResponse("Forbidden. Insufficient permissions to delete tasks.", 403, "FORBIDDEN");
  }

  const { id } = await params;
  const ip = getClientIp(req);

  try {
    const supabase = getSupabaseServiceClient();

    const { error: dbError } = await supabase
      .from("follow_up_tasks")
      .delete()
      .eq("id", id);

    if (dbError) {
      return errorResponse("Failed to delete task.", 500, "DB_ERROR", dbError.message);
    }

    await recordAuditLog({
      actorId: auth.userId,
      actorEmail: auth.email || "staff",
      actorRole: auth.role || "staff",
      action: "task.delete",
      resourceType: "task",
      resourceId: id,
      ipAddress: ip,
    });

    return successResponse(null, "Task deleted successfully.");
  } catch (err) {
    return errorResponse((err as Error).message, 500, "INTERNAL_ERROR");
  }
}
