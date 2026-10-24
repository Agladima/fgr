import { NextRequest } from "next/server";
import { ContactEnquirySchema, sanitizeText } from "@/lib/server/validation";
import {
  checkRateLimit,
  checkDuplicateSubmission,
  getClientIp,
  isSpamSubmission,
} from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import {
  sendContactAcknowledgement,
  sendContactStaffNotification,
} from "@/lib/server/email";
import { successResponse, errorResponse } from "@/lib/server/api-response";
import { ContactEnquiry } from "@/lib/server/types";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // 1. Rate limiting (max 5 contact submissions per 10 minutes per IP)
    const rateLimit = checkRateLimit(ip, "contact", 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return errorResponse(
        `Too many requests. Please wait ${rateLimit.resetInSeconds} seconds before sending another message.`,
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

    // 3. Honeypot check
    if (isSpamSubmission(rawBody.hp_field)) {
      return successResponse(
        { id: "mock-bot-id" },
        "Your message has been received.",
        200
      );
    }

    // 4. Validate with Zod
    const validation = ContactEnquirySchema.safeParse(rawBody);
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

    // 5. Duplicate check (prevent rapid double submit of identical message within 2 minutes)
    const duplicateKey = `contact:${data.email}:${data.message.slice(0, 30)}`;
    if (checkDuplicateSubmission(duplicateKey, 120)) {
      return errorResponse(
        "You have recently sent this message. Please wait a few moments before resubmitting.",
        409,
        "DUPLICATE_SUBMISSION"
      );
    }

    // 6. Verify Database
    if (!isSupabaseConfigured()) {
      return errorResponse(
        "Database service is currently unconfigured. Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        503,
        "DATABASE_UNAVAILABLE"
      );
    }

    // 7. Sanitize inputs
    const sanitizedRecord = {
      name: sanitizeText(data.name),
      organisation: sanitizeText(data.organisation),
      email: data.email,
      phone: data.phone,
      interests: data.interests.map((i) => sanitizeText(i)),
      other_interest: sanitizeText(data.otherInterest),
      message: sanitizeText(data.message),
      status: "unread" as const,
      ip_address: ip,
    };

    // 8. Insert into Supabase
    const supabase = getSupabaseServiceClient();
    const { data: inserted, error: dbError } = await supabase
      .from("contact_enquiries")
      .insert([sanitizedRecord])
      .select()
      .single();

    if (dbError || !inserted) {
      console.error("[DB Error] Failed to insert contact enquiry:", dbError);
      return errorResponse(
        "Failed to save your enquiry. Please try again or contact us directly at info@fgrcdc.org.ng.",
        500,
        "DATABASE_ERROR",
        dbError?.message
      );
    }

    const enquiryRecord = inserted as ContactEnquiry;

    // 9. Dispatch emails non-blockingly
    Promise.allSettled([
      sendContactAcknowledgement(enquiryRecord),
      sendContactStaffNotification(enquiryRecord),
    ])
      .then(async (results) => {
        const errors: string[] = [];
        results.forEach((res, idx) => {
          const type = idx === 0 ? "visitor_acknowledgement" : "staff_notification";
          if (res.status === "rejected") {
            errors.push(`${type}: ${res.reason}`);
          } else if (!res.value.delivered && res.value.reason !== "RESEND_NOT_CONFIGURED") {
            errors.push(`${type}: ${res.value.error || res.value.reason}`);
          }
        });

        if (errors.length > 0) {
          console.warn(`[Email Notification Notice] ${errors.join("; ")}`);
          await supabase
            .from("contact_enquiries")
            .update({ admin_notes: `[Email delivery issue: ${errors.join("; ")}]` })
            .eq("id", enquiryRecord.id);
        }
      })
      .catch((emailErr) => {
        console.error("[Email] Background error in contact notifications:", emailErr);
      });

    // 10. Return success response
    return successResponse(
      {
        id: enquiryRecord.id,
        name: enquiryRecord.name,
        email: enquiryRecord.email,
      },
      "Enquiry received successfully.",
      201
    );
  } catch (error) {
    console.error("[API Error] Contact endpoint exception:", error);
    return errorResponse(
      "A server error occurred while processing your message.",
      500,
      "INTERNAL_SERVER_ERROR"
    );
  }
}
