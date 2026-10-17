import { NextRequest } from "next/server";
import { PartnershipEnquirySchema, sanitizeText } from "@/lib/server/validation";
import {
  checkRateLimit,
  checkDuplicateSubmission,
  getClientIp,
  isSpamSubmission,
} from "@/lib/server/security";
import { getSupabaseServiceClient, isSupabaseConfigured } from "@/lib/server/supabase";
import {
  sendPartnershipAcknowledgement,
  sendPartnershipStaffNotification,
} from "@/lib/server/email";
import { successResponse, errorResponse } from "@/lib/server/api-response";
import { PartnershipEnquiry } from "@/lib/server/types";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // 1. Rate limiting (max 5 partnership submissions per 10 minutes per IP)
    const rateLimit = checkRateLimit(ip, "partnership", 5, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return errorResponse(
        `Too many requests. Please wait ${rateLimit.resetInSeconds} seconds before submitting another partnership enquiry.`,
        429,
        "RATE_LIMIT_EXCEEDED"
      );
    }

    // 2. Parse JSON body
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
        "Partnership proposal received.",
        200
      );
    }

    // 4. Validate with Zod
    const validation = PartnershipEnquirySchema.safeParse(rawBody);
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

    // 5. Duplicate check
    const duplicateKey = `partner:${data.email}:${data.organisationName.toLowerCase()}`;
    if (checkDuplicateSubmission(duplicateKey, 180)) {
      return errorResponse(
        "You have recently submitted a partnership proposal for this organisation. Our team is already reviewing your details.",
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
      organisation_name: sanitizeText(data.organisationName),
      contact_person: sanitizeText(data.contactPerson),
      email: data.email,
      phone: data.phone,
      organisation_type: sanitizeText(data.organisationType),
      other_org_type: sanitizeText(data.otherOrgType),
      interests: data.interests.map((i) => sanitizeText(i)),
      other_interest_details: sanitizeText(data.otherInterestDetails),
      message: sanitizeText(data.message),
      status: "new" as const,
      ip_address: ip,
    };

    // 8. Insert into Supabase
    const supabase = getSupabaseServiceClient();
    const { data: inserted, error: dbError } = await supabase
      .from("partnership_enquiries")
      .insert([sanitizedRecord])
      .select()
      .single();

    if (dbError || !inserted) {
      console.error("[DB Error] Failed to insert partnership enquiry:", dbError);
      return errorResponse(
        "Failed to save your partnership enquiry. Please try again or reach out directly at contact@fgrcareer.org.",
        500,
        "DATABASE_ERROR",
        dbError?.message
      );
    }

    const partnershipRecord = inserted as PartnershipEnquiry;

    // 9. Dispatch emails non-blockingly
    Promise.allSettled([
      sendPartnershipAcknowledgement(partnershipRecord),
      sendPartnershipStaffNotification(partnershipRecord),
    ])
      .then(async (results) => {
        const errors: string[] = [];
        results.forEach((res, idx) => {
          const type = idx === 0 ? "partner_acknowledgement" : "staff_notification";
          if (res.status === "rejected") {
            errors.push(`${type}: ${res.reason}`);
          } else if (!res.value.delivered && res.value.reason !== "RESEND_NOT_CONFIGURED") {
            errors.push(`${type}: ${res.value.error || res.value.reason}`);
          }
        });

        if (errors.length > 0) {
          console.warn(`[Email Notification Notice] ${errors.join("; ")}`);
          await supabase
            .from("partnership_enquiries")
            .update({ admin_notes: `[Email delivery issue: ${errors.join("; ")}]` })
            .eq("id", partnershipRecord.id);
        }
      })
      .catch((emailErr) => {
        console.error("[Email] Background error in partnership notifications:", emailErr);
      });

    // 10. Return success response
    return successResponse(
      {
        id: partnershipRecord.id,
        organisationName: partnershipRecord.organisation_name,
        contactPerson: partnershipRecord.contact_person,
        email: partnershipRecord.email,
      },
      "Partnership enquiry received successfully.",
      201
    );
  } catch (error) {
    console.error("[API Error] Partnership endpoint exception:", error);
    return errorResponse(
      "A server error occurred while processing your proposal.",
      500,
      "INTERNAL_SERVER_ERROR"
    );
  }
}
