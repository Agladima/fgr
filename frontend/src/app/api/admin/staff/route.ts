import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateAdmin, hasPermission, recordAuditLog, getClientIp } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";

const InviteStaffSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  jobTitle: z.string().trim().min(1, "Job title is required."),
  role: z.enum([
    "super_admin",
    "admin",
    "training_officer",
    "partnerships_officer",
    "content_manager",
  ]),
  temporaryPassword: z
    .string()
    .min(8, "Temporary password must be at least 8 characters long.")
    .optional(),
});

/**
 * GET /api/admin/staff
 * Lists all staff profiles. Restricted to super_admin.
 */
export async function GET(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Authentication required.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "staff:manage")) {
    return errorResponse("Forbidden. Only Super Administrators can view and manage staff.", 403, "FORBIDDEN");
  }

  if (!isSupabaseConfigured()) {
    return errorResponse("Database is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { data: staffList, error: dbError } = await supabase
      .from("admin_profiles")
      .select("id, email, full_name, role, is_active, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (dbError) {
      return errorResponse("Failed to fetch staff members.", 500, "DB_ERROR", dbError.message);
    }

    return successResponse({ staff: staffList || [] });
  } catch (err) {
    return errorResponse((err as Error).message, 500, "INTERNAL_ERROR");
  }
}

/**
 * POST /api/admin/staff
 * Invites or provisions a new staff member. Restricted to super_admin.
 */
export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin(req);
  if (!auth.isAuthenticated) {
    return errorResponse(auth.error || "Authentication required.", 401, "UNAUTHORIZED");
  }

  if (!hasPermission(auth.role || "", "staff:manage")) {
    return errorResponse("Forbidden. Only Super Administrators can invite staff.", 403, "FORBIDDEN");
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON payload.", 400, "INVALID_JSON");
  }

  const parsed = InviteStaffSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "Validation failed.",
      422,
      "VALIDATION_ERROR",
      parsed.error.flatten().fieldErrors
    );
  }

  const { email, fullName, jobTitle, role, temporaryPassword } = parsed.data;
  const ip = getClientIp(req);

  try {
    const supabase = getSupabaseServiceClient();

    // 1. Check if user already exists in admin_profiles
    const { data: existingProfile } = await supabase
      .from("admin_profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (existingProfile) {
      return errorResponse("A staff member with this email address already exists.", 409, "STAFF_EXISTS");
    }

    // 2. Create the user in Supabase Auth via Admin API
    const defaultPassword = temporaryPassword || `FgrCareer#${Math.floor(100000 + Math.random() * 900000)}`;

    const { data: createdAuthUser, error: authCreateError } =
      await supabase.auth.admin.createUser({
        email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role,
        },
      });

    if (authCreateError || !createdAuthUser.user) {
      return errorResponse(
        `Failed to provision authentication account: ${authCreateError?.message || "Unknown error"}`,
        400,
        "AUTH_PROVISION_FAILED"
      );
    }

    const authUserId = createdAuthUser.user.id;

    // 3. Insert into admin_profiles
    const { data: profile, error: insertError } = await supabase
      .from("admin_profiles")
      .insert([
        {
          id: authUserId,
          email,
          full_name: fullName,
          job_title: jobTitle,
          role,
          is_active: true,
        },
      ])
      .select()
      .single();

    if (insertError || !profile) {
      // Rollback auth user
      await supabase.auth.admin.deleteUser(authUserId);
      return errorResponse("Failed to create staff profile record.", 500, "PROFILE_INSERT_FAILED", insertError?.message);
    }

    // 4. Record audit log
    await recordAuditLog({
      actorId: auth.userId,
      actorEmail: auth.email || "super_admin",
      actorRole: auth.role || "super_admin",
      action: "staff.provision",
      resourceType: "staff",
      resourceId: profile.id,
      details: { email: profile.email, role: profile.role, fullName: profile.full_name },
      ipAddress: ip,
    });

    return successResponse(
      {
        profile,
        provisionalPassword: defaultPassword,
      },
      "Staff member successfully provisioned.",
      201
    );
  } catch (err) {
    return errorResponse((err as Error).message, 500, "INTERNAL_ERROR");
  }
}
