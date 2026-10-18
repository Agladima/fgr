import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateAdmin, hasPermission, recordAuditLog, getClientIp } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

interface Params {
  params: Promise<{ id: string }>;
}

const UpdateStaffSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  jobTitle: z.string().trim().min(1).optional(),
  role: z
    .enum([
      "super_admin",
      "admin",
      "training_officer",
      "partnerships_officer",
      "content_manager",
    ])
    .optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Authentication required.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "staff:manage")) {
    return errorResponse("Forbidden. Only Super Administrators can modify staff accounts.", 403, "FORBIDDEN");
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

  const parsed = UpdateStaffSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("Validation failed.", 422, "VALIDATION_ERROR", parsed.error.flatten().fieldErrors);
  }

  // Prevent super admin from demoting or deactivating their own account
  if (auth.userId === id && parsed.data.isActive === false) {
    return errorResponse("You cannot deactivate your own Super Admin account.", 400, "SELF_DEACTIVATION_PREVENTED");
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.fullName !== undefined) updates.full_name = parsed.data.fullName;
  if (parsed.data.jobTitle !== undefined) updates.job_title = parsed.data.jobTitle;
  if (parsed.data.role !== undefined) updates.role = parsed.data.role;
  if (parsed.data.isActive !== undefined) updates.is_active = parsed.data.isActive;

  const ip = getClientIp(req);

  try {
    const supabase = getSupabaseServiceClient();
    let { data: updatedProfile, error: dbError } = await supabase
      .from("admin_profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (dbError && (dbError.code === "42703" || dbError.message?.includes("job_title"))) {
      delete updates.job_title;
      const retry = await supabase
        .from("admin_profiles")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      updatedProfile = retry.data;
      dbError = retry.error;
    }

    if (dbError) {
      if (dbError.code === "23514") {
        return errorResponse(
          "This role is not allowed by the database check constraint. Please run the SQL migration in Supabase to update admin_profiles_role_check.",
          400,
          "ROLE_CONSTRAINT_VIOLATION",
          dbError.message
        );
      }
      return errorResponse("Failed to update staff record.", 500, "DB_ERROR", dbError.message);
    }

    if (!updatedProfile) {
      return errorResponse("Staff member not found.", 404, "NOT_FOUND");
    }

    // Keep Supabase Auth user metadata in sync
    if (updates.role) {
      try {
        await supabase.auth.admin.updateUserById(id, {
          user_metadata: { role: updates.role },
        });
      } catch (authSyncErr) {
        console.warn("[Staff Update] Auth metadata sync warning:", authSyncErr);
      }
    }

    await recordAuditLog({
      actorId: auth.userId,
      actorEmail: auth.email || "super_admin",
      actorRole: auth.role || "super_admin",
      action: parsed.data.isActive === false ? "staff.deactivate" : "staff.update",
      resourceType: "staff",
      resourceId: id,
      details: updates,
      ipAddress: ip,
    });

    return successResponse({ profile: updatedProfile }, "Staff profile updated successfully.");
  } catch (err) {
    return errorResponse((err as Error).message, 500, "INTERNAL_ERROR");
  }
}
