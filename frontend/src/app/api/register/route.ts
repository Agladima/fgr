import { NextRequest } from "next/server";
import { TrainingRegistrationSchema, sanitizeText } from "@/lib/server/validation";
import {
  checkRateLimit,
  checkDuplicateSubmission,
  getClientIp,
  isSpamSubmission,
} from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import {
  sendRegistrationConfirmation,
  sendRegistrationStaffNotification,
} from "@/lib/server/email";
import { successResponse, errorResponse } from "@/lib/server/api-response";
import { TrainingRegistration } from "@/lib/server/types";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // 1. Rate limiting (max 5 registration submissions per 10 minutes per IP)
    const rateLimit = checkRateLimit(ip, "register", 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return errorResponse(
        `Too many registration requests. Please wait ${rateLimit.resetInSeconds} seconds before trying again.`,
        429,
        "RATE_LIMIT_EXCEEDED"
      );
    }

    // 2. Parse request body
    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return errorResponse("Invalid JSON payload.", 400, "INVALID_JSON");
    }

    // 3. Honeypot spam protection
    if (isSpamSubmission(rawBody.hp_field)) {
      // Silently accept without processing to fool bots
      return successResponse(
        { id: "mock-bot-id" },
        "Registration received successfully.",
        200
      );
    }

    // 4. Validate with Zod
    const validation = TrainingRegistrationSchema.safeParse(rawBody);
    if (!validation.success) {
      const formattedErrors = validation.error.flatten().fieldErrors;
      return errorResponse(
        "Validation failed. Please correct the highlighted errors.",
        422,
        "VALIDATION_ERROR",
        formattedErrors
      );
    }

    const data = validation.data;

    // 5. Duplicate submission check (cooldown window of 3 minutes per email + programme)
    const duplicateKey = `reg:${data.email}:${data.programme}`;
    if (checkDuplicateSubmission(duplicateKey, 180)) {
      return errorResponse(
        "You have already submitted a registration for this programme recently. Please wait a few moments before resubmitting.",
        409,
        "DUPLICATE_SUBMISSION"
      );
    }

    // 6. Verify Database Configuration
    if (!isSupabaseConfigured()) {
      return errorResponse(
        "Database service is currently unconfigured. Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        503,
        "DATABASE_UNAVAILABLE"
      );
    }

    // 7. Sanitize inputs
    const sanitizedRecord = {
      full_name: sanitizeText(data.fullName),
      phone: data.phone,
      email: data.email,
      age_range: data.age,
      location: sanitizeText(data.location),
      programme: sanitizeText(data.programme),
      current_status: sanitizeText(data.currentStatus),
      other_occupation: sanitizeText(data.otherOccupation),
      previous_training: sanitizeText(data.previousTraining),
      training_preference: sanitizeText(data.trainingPreference) || "Admin Assigned",
      referral_source: sanitizeText(data.referralSource),
      other_referral: sanitizeText(data.otherReferral),
      additional_info: sanitizeText(data.additionalInfo),
      status: "pending" as const,
      ip_address: ip,
    };

    // 8. Insert into Supabase database
    const supabase = getSupabaseServiceClient();
    const { data: inserted, error: dbError } = await supabase
      .from("training_registrations")
      .insert([sanitizedRecord])
      .select()
      .single();

    if (dbError || !inserted) {
      console.error("[DB Error] Failed to insert training registration:", dbError);
      return errorResponse(
        "An unexpected error occurred while saving your registration. Please try again or contact support.",
        500,
        "DATABASE_ERROR",
        dbError?.message
      );
    }

    const registrationRecord = inserted as TrainingRegistration;

    // 9. Asynchronously trigger emails without failing the registration on delivery errors
    Promise.allSettled([
      sendRegistrationConfirmation(registrationRecord),
      sendRegistrationStaffNotification(registrationRecord),
    ])
      .then(async (results) => {
        const errors: string[] = [];
        results.forEach((res, idx) => {
          const type = idx === 0 ? "applicant_confirmation" : "staff_notification";
          if (res.status === "rejected") {
            errors.push(`${type}: ${res.reason}`);
          } else if (!res.value.delivered && res.value.reason !== "RESEND_NOT_CONFIGURED") {
            errors.push(`${type}: ${res.value.error || res.value.reason}`);
          }
        });

        if (errors.length > 0) {
          console.warn(`[Email Notification Notice] ${errors.join("; ")}`);
          await supabase
            .from("training_registrations")
            .update({ admin_notes: `[Email delivery issue: ${errors.join("; ")}]` })
            .eq("id", registrationRecord.id);
        }
      })
      .catch((emailErr) => {
        console.error("[Email] Background error in registration notifications:", emailErr);
      });

    // 10. Return success response
    return successResponse(
      {
        id: registrationRecord.id,
        fullName: registrationRecord.full_name,
        programme: registrationRecord.programme,
        email: registrationRecord.email,
      },
      "Registration submitted successfully.",
      201
    );
  } catch (error) {
    console.error("[API Error] Registration endpoint exception:", error);
    return errorResponse(
      "A server error occurred while processing your request.",
      500,
      "INTERNAL_SERVER_ERROR"
    );
  }
}
