import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabasePublicClient, getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import { recordAuditLog, getClientIp } from "@/lib/server/security";
import { errorResponse } from "@/lib/server/api-response";

const LoginSchema = z.object({
  email: z.string().trim().email("Please provide a valid staff email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured()) {
    return errorResponse("Database authentication service is not configured.", 503, "SERVICE_UNAVAILABLE");
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON payload.", 400, "INVALID_JSON");
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "Validation failed. Please check your credentials.",
      422,
      "VALIDATION_ERROR",
      parsed.error.flatten().fieldErrors
    );
  }

  const { email, password } = parsed.data;
  const ip = getClientIp(req);

  try {
    const supabase = getSupabasePublicClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user || !authData.session) {
      return errorResponse("Invalid email address or password.", 401, "INVALID_CREDENTIALS");
    }

    const userId = authData.user.id;

    // Verify staff profile in admin_profiles
    const serviceClient = getSupabaseServiceClient();
    const { data: profile, error: profileError } = await serviceClient
      .from("admin_profiles")
      .select("id, email, full_name, role, is_active")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      // User has Auth credentials but is NOT an authorized staff member
      await supabase.auth.signOut();
      return errorResponse("Access denied. You do not have an active staff profile.", 403, "FORBIDDEN");
    }

    if (!profile.is_active) {
      await supabase.auth.signOut();
      return errorResponse("Your staff profile has been deactivated. Please contact an administrator.", 403, "ACCOUNT_DEACTIVATED");
    }

    const token = authData.session.access_token;

    // Record audit event
    await recordAuditLog({
      actorId: profile.id,
      actorEmail: profile.email,
      actorRole: profile.role,
      action: "auth.login",
      resourceType: "session",
      resourceId: profile.id,
      details: { role: profile.role },
      ipAddress: ip,
    });

    // Create response with secure HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      message: "Staff authentication successful.",
      data: {
        user: {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name,
          role: profile.role,
        },
        token,
      },
    });

    response.cookies.set("fgr_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err) {
    console.error("[Login Error]", err);
    return errorResponse("A server error occurred during authentication.", 500, "INTERNAL_ERROR");
  }
}
