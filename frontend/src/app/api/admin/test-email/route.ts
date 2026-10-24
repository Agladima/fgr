import { NextRequest } from "next/server";
import { Resend } from "resend";
import { successResponse, errorResponse } from "@/lib/server/api-response";

/**
 * Diagnostic endpoint to test Resend email connectivity and deliverability.
 * POST /api/admin/test-email with { "to": "your-email@example.com" }
 */
export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "FGR Career Development Center <info@fgrcdc.org.ng>";
    const staffEmail = process.env.STAFF_NOTIFICATION_EMAIL || "admin@fgrcdc.org.ng";

    if (!apiKey || apiKey.startsWith("re_your_api_key") || apiKey.trim() === "") {
      return errorResponse(
        "RESEND_API_KEY is not configured or still contains placeholder value in .env.local",
        400,
        "CONFIG_MISSING",
        {
          hasApiKey: Boolean(apiKey),
          configuredFromEmail: fromEmail,
          configuredStaffEmail: staffEmail,
        }
      );
    }

    let body: { to?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional; fallback to staff email
    }

    const recipient = body.to || staffEmail;

    const resend = new Resend(apiKey.trim());

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [recipient],
      subject: "Test Transmission — FGR Career Development Center",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-top: 0;">FGR Email Delivery Test Successful</h2>
          <p style="color: #334155; line-height: 1.6;">
            This is a verification email from your <strong>FGR Career Development Center</strong> Next.js backend.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; margin: 18px 0; font-size: 14px;">
            <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            <p style="margin: 4px 0;"><strong>Sender:</strong> ${fromEmail}</p>
            <p style="margin: 4px 0;"><strong>Recipient:</strong> ${recipient}</p>
          </div>
          <p style="color: #64748b; font-size: 13px;">
            If you received this message, Resend email routing and API keys are functioning as expected.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("[Email Diagnostic] Delivery failed:", error);
      return errorResponse(
        `Resend rejected the transmission: ${error.message}`,
        502,
        "RESEND_DELIVERY_ERROR",
        error
      );
    }

    return successResponse(
      {
        messageId: data?.id,
        recipient,
        sender: fromEmail,
      },
      "Test email dispatched successfully.",
      200
    );
  } catch (err) {
    console.error("[Email Diagnostic] Unhandled exception:", err);
    return errorResponse(
      (err as Error).message || "Internal server error testing email.",
      500,
      "TEST_EMAIL_EXCEPTION"
    );
  }
}

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  const isConfigured = Boolean(apiKey && !apiKey.startsWith("re_your_api_key") && apiKey.trim() !== "");

  return successResponse(
    {
      configured: isConfigured,
      fromEmail: process.env.RESEND_FROM_EMAIL || "FGR Career Development Center <info@fgrcdc.org.ng>",
      staffNotificationEmail: process.env.STAFF_NOTIFICATION_EMAIL || "admin@fgrcdc.org.ng",
      instructions: "Send a POST request with { 'to': 'your_email@domain.com' } to dispatch a test email.",
    },
    isConfigured ? "Resend is configured." : "Resend API key is not configured."
  );
}
