import { NextRequest } from "next/server";
import { z } from "zod";
import { authenticateAdmin, hasPermission, recordAuditLog, getClientIp } from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { successResponse, errorResponse } from "@/lib/server/api-response";
import { sendStaffWelcomeEmail } from "@/lib/server/email";

function getAppOrigin(req: NextRequest): string {
  const origin = req.headers.get("origin");
  if (origin) return origin;
  const host = req.headers.get("host");
  if (host) {
    const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

const InviteStaffSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address."),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters."),
  jobTitle: z.string().trim().optional(),
  role: z.enum([
    "super_admin",
    "admin",
    "training_officer",
    "partnerships_officer",
    "content_manager",
  ]),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .optional(),
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
    let staffList: Record<string, unknown>[] | null = null;
    let dbError: { message?: string; code?: string } | null = null;

    const initialQuery = await supabase
      .from("admin_profiles")
      .select("id, email, full_name, job_title, role, is_active, created_at, updated_at")
      .order("created_at", { ascending: false });

    staffList = initialQuery.data as Record<string, unknown>[] | null;
    dbError = initialQuery.error;

    if (dbError && (dbError.code === "42703" || dbError.message?.includes("job_title"))) {
      const fallback = await supabase
        .from("admin_profiles")
        .select("id, email, full_name, role, is_active, created_at, updated_at")
        .order("created_at", { ascending: false });
      staffList = fallback.data as Record<string, unknown>[] | null;
      dbError = fallback.error;
    }

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

  const { email, fullName, jobTitle, role, temporaryPassword, password } = parsed.data;
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
    const finalPassword =
      password || temporaryPassword || `FgrCareer#${Math.floor(100000 + Math.random() * 900000)}`;

    const { data: createdAuthUser, error: authCreateError } =
      await supabase.auth.admin.createUser({
        email,
        password: finalPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role,
          job_title: jobTitle || "",
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
    const profileInsertData: Record<string, unknown> = {
      id: authUserId,
      email,
      full_name: fullName,
      role,
      is_active: true,
    };
    if (jobTitle) {
      profileInsertData.job_title = jobTitle;
    }

    let { data: profile, error: insertError } = await supabase
      .from("admin_profiles")
      .insert([profileInsertData])
      .select()
      .single();

    // If the database does not have the job_title column yet, gracefully retry without it
    if (insertError && (insertError.code === "42703" || insertError.message?.includes("job_title"))) {
      delete profileInsertData.job_title;
      const retryResult = await supabase
        .from("admin_profiles")
        .insert([profileInsertData])
        .select()
        .single();
      profile = retryResult.data;
      insertError = retryResult.error;
    }

    if (insertError || !profile) {
      // Rollback auth user
      await supabase.auth.admin.deleteUser(authUserId);
      return errorResponse("Failed to create staff profile record.", 500, "PROFILE_INSERT_FAILED", insertError?.message);
    }

    // 4. Generate recovery / password reset link from Supabase Auth
    const origin = getAppOrigin(req);
    const resetRedirectUrl = `${origin}/admin/reset-password`;
    let resetActionLink = resetRedirectUrl;

    try {
      const { data: linkData, error: linkError } =
        await supabase.auth.admin.generateLink({
          type: "recovery",
          email,
          options: {
            redirectTo: resetRedirectUrl,
          },
        });

      if (!linkError && linkData?.properties?.action_link) {
        resetActionLink = linkData.properties.action_link;
      }
    } catch (linkErr) {
      console.warn("[Staff Provision] Recovery link generation note:", linkErr);
    }

    // 5. Send Welcome Email with credentials and reset link
    const emailResult = await sendStaffWelcomeEmail({
      fullName: profile.full_name,
      email: profile.email,
      jobTitle: (profile as Record<string, unknown>).job_title as string || jobTitle,
      role: profile.role,
      temporaryPassword: finalPassword,
      resetUrl: resetActionLink,
      loginUrl: `${origin}/admin/login`,
    });

    // 6. Record audit log
    await recordAuditLog({
      actorId: auth.userId,
      actorEmail: auth.email || "super_admin",
      actorRole: auth.role || "super_admin",
      action: "staff.provision",
      resourceType: "staff",
      resourceId: profile.id,
      details: {
        email: profile.email,
        role: profile.role,
        fullName: profile.full_name,
        emailDelivered: emailResult.delivered,
      },
      ipAddress: ip,
    });

    return successResponse(
      {
        profile,
        provisionalPassword: finalPassword,
        emailDelivered: emailResult.delivered,
      },
      emailResult.delivered
        ? "Staff member provisioned successfully. An onboarding email with login credentials and a password reset link has been dispatched."
        : "Staff member provisioned successfully. (Note: Email service skipped or not configured; temporary credentials provided below).",
      201
    );
  } catch (err) {
    return errorResponse((err as Error).message, 500, "INTERNAL_ERROR");
  }
}
