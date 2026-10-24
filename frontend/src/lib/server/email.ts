import { Resend } from "resend";
import { TrainingRegistration, ContactEnquiry, PartnershipEnquiry } from "./types";

/**
 * Returns a configured Resend client or null if API key is not configured.
 */
function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_your_api_key") || apiKey.trim() === "") {
    return null;
  }
  return new Resend(apiKey.trim());
}

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "FGR Career Development Center <info@fgrcdc.org.ng>";

const STAFF_EMAIL =
  process.env.STAFF_NOTIFICATION_EMAIL || "admin@fgrcdc.org.ng";

export interface EmailDeliveryResult {
  delivered: boolean;
  messageId?: string;
  error?: string;
  reason?: string;
}

/**
 * Standard branded HTML email layout for FGR Career Development Center
 */
function wrapHtmlEmail(title: string, preheader: string, contentHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #0f172a;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #f1f5f9;
      padding: 32px 12px;
    }
    .main {
      background-color: #ffffff;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      padding: 36px 32px 32px;
      text-align: left;
      border-bottom: 3px solid #d97706;
    }
    .brand-eyebrow {
      color: #f59e0b;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      margin: 0 0 6px 0;
    }
    .brand-title {
      color: #ffffff;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.01em;
      margin: 0;
      line-height: 1.25;
    }
    .brand-subtitle {
      color: #94a3b8;
      font-size: 13px;
      margin: 6px 0 0 0;
    }
    .content {
      padding: 36px 32px;
      font-size: 15px;
      line-height: 1.65;
      color: #334155;
    }
    .content h2 {
      color: #0f172a;
      font-size: 20px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
      line-height: 1.3;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px 24px;
      margin: 24px 0;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
    }
    .info-table td {
      padding: 8px 0;
      font-size: 14px;
      vertical-align: top;
      border-bottom: 1px solid #edf2f7;
    }
    .info-table tr:last-child td {
      border-bottom: none;
    }
    .info-table td.label {
      color: #64748b;
      width: 36%;
      font-weight: 500;
    }
    .info-table td.value {
      color: #0f172a;
      font-weight: 600;
    }
    .callout-box {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      margin: 24px 0;
      font-size: 14px;
      color: #92400e;
    }
    .callout-box strong {
      color: #78350f;
    }
    .quote-box {
      background-color: #f8fafc;
      border-left: 4px solid #0f172a;
      padding: 14px 18px;
      margin: 20px 0;
      font-style: italic;
      color: #475569;
      font-size: 14px;
    }
    .button-wrap {
      margin: 28px 0 16px;
    }
    .button {
      display: inline-block;
      background-color: #0f172a;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      text-align: center;
    }
    .footer {
      background-color: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 24px 32px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.6;
    }
    .footer strong {
      color: #334155;
    }
    .footer a {
      color: #d97706;
      text-decoration: none;
    }
    .footer-divider {
      margin: 12px 0;
      border: 0;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#f1f5f9;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <table class="wrapper" role="presentation" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table class="main" role="presentation" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <div class="brand-eyebrow">CAREER • EMPOWERMENT • GROWTH</div>
              <div class="brand-title">FGR Career Development Center</div>
              <div class="brand-subtitle">Calabar, Cross River State, Nigeria</div>
            </td>
          </tr>
          <tr>
            <td class="content">
              ${contentHtml}
            </td>
          </tr>
          <tr>
            <td class="footer">
              <strong>FGR Career Development Center</strong><br />
              Calabar Hub &bull; Cross River State, Nigeria<br />
              General Enquiries: <a href="mailto:info@fgrcdc.org.ng">info@fgrcdc.org.ng</a><br />
              Official Portal: <a href="https://www.fgrcdc.org.ng">www.fgrcdc.org.ng</a>
              <hr class="footer-divider" />
              <span style="color: #94a3b8;">
                This automated transmission was dispatched by FGR Career Development Center. If you believe you received this in error, please reply to our enquiries desk.
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// ============================================================================
// 1. Training Registration Confirmation & Staff Alert
// ============================================================================

/**
 * Send automated confirmation email to the trainee applicant
 */
export async function sendRegistrationConfirmation(
  registration: TrainingRegistration
): Promise<EmailDeliveryResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(
      "[Email] Resend API key not configured or set to default placeholder. Skipping applicant confirmation."
    );
    return { delivered: false, reason: "RESEND_NOT_CONFIGURED" };
  }

  try {
    const html = wrapHtmlEmail(
      "Training Registration Received — FGR Career Development Center",
      `Your registration for ${registration.programme} has been received.`,
      `
      <h2>Registration Received</h2>
      <p>Dear <strong>${registration.full_name}</strong>,</p>
      <p>
        Thank you for applying to the <strong>FGR Career Development Center</strong>. 
        Your application for the following training programme has been successfully submitted and logged into our admissions registry:
      </p>

      <div class="info-card">
        <table class="info-table" role="presentation">
          <tr>
            <td class="label">Programme:</td>
            <td class="value">${registration.programme}</td>
          </tr>
          <tr>
            <td class="label">Applicant Name:</td>
            <td class="value">${registration.full_name}</td>
          </tr>
          <tr>
            <td class="label">Location:</td>
            <td class="value">${registration.location}</td>
          </tr>
          <tr>
            <td class="label">Application Ref:</td>
            <td class="value"><code style="font-size:12px; background:#e2e8f0; padding:2px 6px; border-radius:4px;">${registration.id}</code></td>
          </tr>
        </table>
      </div>

      <div class="callout-box">
        <strong>What Happens Next:</strong><br />
        Our admissions committee evaluates applications on a rolling cohort basis. Once cohort scheduling, venue details, and trainer allocations are finalized, you will receive an official onboarding notification with your cohort timetable and requirements.
      </div>

      <p>
        Please keep your contact phone number (<strong>${registration.phone}</strong>) and email accessible. If you have any urgent questions or require assistance, please reply directly or reach out to <a href="mailto:info@fgrcdc.org.ng">info@fgrcdc.org.ng</a>.
      </p>

      <p style="margin-top: 24px;">
        Warm regards,<br />
        <strong>Admissions &amp; Training Directorate</strong><br />
        FGR Career Development Center
      </p>
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [registration.email],
      subject: `Registration Confirmed: ${registration.programme} — FGR Career Development Center`,
      html,
    });

    if (error) {
      console.error("[Email Error] Failed to dispatch registration confirmation:", error);
      return { delivered: false, error: error.message };
    }

    console.log(`[Email] Registration confirmation delivered to ${registration.email} (id: ${data?.id})`);
    return { delivered: true, messageId: data?.id };
  } catch (err) {
    console.error("[Email Exception] Registration confirmation dispatch failure:", err);
    return { delivered: false, error: (err as Error).message };
  }
}

/**
 * Send internal notification email to FGR staff regarding a new applicant
 */
export async function sendRegistrationStaffNotification(
  registration: TrainingRegistration
): Promise<EmailDeliveryResult> {
  const resend = getResendClient();
  if (!resend) return { delivered: false, reason: "RESEND_NOT_CONFIGURED" };

  try {
    const html = wrapHtmlEmail(
      `New Applicant: ${registration.full_name}`,
      `New application submitted for ${registration.programme}`,
      `
      <h2>New Trainee Registration Received</h2>
      <p>A new candidate has completed the online registration form on the portal.</p>

      <div class="info-card">
        <table class="info-table" role="presentation">
          <tr><td class="label">Applicant:</td><td class="value">${registration.full_name}</td></tr>
          <tr><td class="label">Programme:</td><td class="value">${registration.programme}</td></tr>
          <tr><td class="label">Email:</td><td class="value"><a href="mailto:${registration.email}">${registration.email}</a></td></tr>
          <tr><td class="label">Phone:</td><td class="value"><a href="tel:${registration.phone}">${registration.phone}</a></td></tr>
          <tr><td class="label">Age Range:</td><td class="value">${registration.age_range}</td></tr>
          <tr><td class="label">Location:</td><td class="value">${registration.location}</td></tr>
          <tr><td class="label">Current Status:</td><td class="value">${registration.current_status}${registration.other_occupation ? ` (${registration.other_occupation})` : ""}</td></tr>
          <tr><td class="label">Previous Training:</td><td class="value">${registration.previous_training || "None specified"}</td></tr>
          <tr><td class="label">Referral Source:</td><td class="value">${registration.referral_source}${registration.other_referral ? ` (${registration.other_referral})` : ""}</td></tr>
          <tr><td class="label">Submission ID:</td><td class="value"><code>${registration.id}</code></td></tr>
        </table>
      </div>

      ${
        registration.additional_info
          ? `
        <p><strong>Applicant Statement / Goals:</strong></p>
        <div class="quote-box">${registration.additional_info}</div>
      `
          : ""
      }

      <div class="button-wrap">
        <a class="button" href="mailto:${registration.email}?subject=Regarding your application to FGR Career Development Center">Reply to Applicant</a>
      </div>
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [STAFF_EMAIL],
      subject: `[Admissions Alert] ${registration.full_name} — ${registration.programme}`,
      html,
    });

    if (error) {
      console.error("[Email Error] Failed to send staff registration alert:", error);
      return { delivered: false, error: error.message };
    }

    return { delivered: true, messageId: data?.id };
  } catch (err) {
    console.error("[Email Exception] Staff registration alert failure:", err);
    return { delivered: false, error: (err as Error).message };
  }
}

// ============================================================================
// 2. Contact Enquiry Acknowledgement & Staff Alert
// ============================================================================

/**
 * Send automated acknowledgement to visitor who submitted a contact form
 */
export async function sendContactAcknowledgement(
  enquiry: ContactEnquiry
): Promise<EmailDeliveryResult> {
  const resend = getResendClient();
  if (!resend) return { delivered: false, reason: "RESEND_NOT_CONFIGURED" };

  try {
    const html = wrapHtmlEmail(
      "Message Received — FGR Career Development Center",
      "Thank you for contacting FGR Career Development Center. We have received your message.",
      `
      <h2>Thank You for Getting in Touch</h2>
      <p>Dear <strong>${enquiry.name}</strong>,</p>
      <p>
        We have received your message submitted through our website. A member of our administrative team will review your query and respond within <strong>24 to 48 business hours</strong>.
      </p>

      <div class="info-card">
        <table class="info-table" role="presentation">
          <tr><td class="label">Sender Name:</td><td class="value">${enquiry.name}</td></tr>
          <tr><td class="label">Contact Phone:</td><td class="value">${enquiry.phone}</td></tr>
          ${enquiry.organisation ? `<tr><td class="label">Organisation:</td><td class="value">${enquiry.organisation}</td></tr>` : ""}
          <tr><td class="label">Interest Area:</td><td class="value">${enquiry.interests && enquiry.interests.length > 0 ? enquiry.interests.join(", ") : "General Enquiry"}</td></tr>
        </table>
      </div>

      <p><strong>Copy of Your Message:</strong></p>
      <div class="quote-box">
        ${enquiry.message}
      </div>

      <p>
        If your request is urgent, you can also reach our hub in Calabar, Cross River State, or contact our central desk at <a href="mailto:info@fgrcdc.org.ng">info@fgrcdc.org.ng</a>.
      </p>

      <p style="margin-top: 24px;">
        Kind regards,<br />
        <strong>Community &amp; Public Relations Team</strong><br />
        FGR Career Development Center
      </p>
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [enquiry.email],
      subject: "Enquiry Received — FGR Career Development Center",
      html,
    });

    if (error) {
      console.error("[Email Error] Failed to send contact acknowledgement:", error);
      return { delivered: false, error: error.message };
    }

    return { delivered: true, messageId: data?.id };
  } catch (err) {
    console.error("[Email Exception] Contact acknowledgement failure:", err);
    return { delivered: false, error: (err as Error).message };
  }
}

/**
 * Send internal notification email to staff for new general enquiry
 */
export async function sendContactStaffNotification(
  enquiry: ContactEnquiry
): Promise<EmailDeliveryResult> {
  const resend = getResendClient();
  if (!resend) return { delivered: false, reason: "RESEND_NOT_CONFIGURED" };

  try {
    const html = wrapHtmlEmail(
      `New Enquiry: ${enquiry.name}`,
      `New website enquiry from ${enquiry.name}`,
      `
      <h2>New Website Contact Enquiry</h2>
      <p>A new visitor enquiry was submitted via the contact page.</p>

      <div class="info-card">
        <table class="info-table" role="presentation">
          <tr><td class="label">Full Name:</td><td class="value">${enquiry.name}</td></tr>
          <tr><td class="label">Email:</td><td class="value"><a href="mailto:${enquiry.email}">${enquiry.email}</a></td></tr>
          <tr><td class="label">Phone:</td><td class="value"><a href="tel:${enquiry.phone}">${enquiry.phone}</a></td></tr>
          <tr><td class="label">Organisation:</td><td class="value">${enquiry.organisation || "Not specified"}</td></tr>
          <tr><td class="label">Interests:</td><td class="value">${enquiry.interests && enquiry.interests.length > 0 ? enquiry.interests.join(", ") : "General Enquiry"}</td></tr>
          <tr><td class="label">Enquiry ID:</td><td class="value"><code>${enquiry.id}</code></td></tr>
        </table>
      </div>

      <p><strong>Message Body:</strong></p>
      <div class="quote-box" style="white-space: pre-wrap;">${enquiry.message}</div>

      <div class="button-wrap">
        <a class="button" href="mailto:${enquiry.email}?subject=Re: Your enquiry to FGR Career Development Center">Reply to Enquiry</a>
      </div>
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [STAFF_EMAIL],
      subject: `[Website Enquiry] ${enquiry.name} — ${enquiry.organisation || "General"}`,
      html,
    });

    if (error) return { delivered: false, error: error.message };
    return { delivered: true, messageId: data?.id };
  } catch (err) {
    return { delivered: false, error: (err as Error).message };
  }
}

// ============================================================================
// 3. Partnership Enquiry Acknowledgement & Staff Alert
// ============================================================================

/**
 * Send automated acknowledgement to partner representative
 */
export async function sendPartnershipAcknowledgement(
  partnership: PartnershipEnquiry
): Promise<EmailDeliveryResult> {
  const resend = getResendClient();
  if (!resend) return { delivered: false, reason: "RESEND_NOT_CONFIGURED" };

  try {
    const html = wrapHtmlEmail(
      "Partnership Proposal Received — FGR Career Development Center",
      `Thank you for reaching out on behalf of ${partnership.organisation_name}.`,
      `
      <h2>Partnership Proposal Received</h2>
      <p>Dear <strong>${partnership.contact_person}</strong>,</p>
      <p>
        Thank you for submitting a partnership proposal to <strong>FGR Career Development Center</strong> on behalf of <strong>${partnership.organisation_name}</strong>.
      </p>

      <div class="info-card">
        <table class="info-table" role="presentation">
          <tr><td class="label">Organisation:</td><td class="value">${partnership.organisation_name}</td></tr>
          <tr><td class="label">Contact Person:</td><td class="value">${partnership.contact_person}</td></tr>
          <tr><td class="label">Sector/Type:</td><td class="value">${partnership.organisation_type}</td></tr>
          <tr><td class="label">Interest Areas:</td><td class="value">${partnership.interests && partnership.interests.length > 0 ? partnership.interests.join(", ") : "Institutional Collaboration"}</td></tr>
          <tr><td class="label">Proposal Ref:</td><td class="value"><code>${partnership.id}</code></td></tr>
        </table>
      </div>

      <div class="callout-box">
        <strong>Strategic Partnerships Directorate Review:</strong><br />
        We actively partner with government bodies, private industry leaders, NGOs, development institutions, and academic bodies. Our leadership team will review your proposal details and reach out to schedule an exploratory discussion.
      </div>

      <p>
        Should you wish to supplement your submission with documentation or corporate profiles, please send them directly to <a href="mailto:info@fgrcdc.org.ng">info@fgrcdc.org.ng</a> citing reference <code>${partnership.id}</code>.
      </p>

      <p style="margin-top: 24px;">
        Sincerely,<br />
        <strong>Directorate of Strategic Partnerships &amp; Alliances</strong><br />
        FGR Career Development Center
      </p>
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [partnership.email],
      subject: `Partnership Proposal Received: ${partnership.organisation_name} — FGR Career Development Center`,
      html,
    });

    if (error) {
      console.error("[Email Error] Failed to send partnership acknowledgement:", error);
      return { delivered: false, error: error.message };
    }

    return { delivered: true, messageId: data?.id };
  } catch (err) {
    console.error("[Email Exception] Partnership acknowledgement failure:", err);
    return { delivered: false, error: (err as Error).message };
  }
}

/**
 * Send internal notification email to staff for new partnership proposal
 */
export async function sendPartnershipStaffNotification(
  partnership: PartnershipEnquiry
): Promise<EmailDeliveryResult> {
  const resend = getResendClient();
  if (!resend) return { delivered: false, reason: "RESEND_NOT_CONFIGURED" };

  try {
    const html = wrapHtmlEmail(
      `New Partnership Proposal: ${partnership.organisation_name}`,
      `New partnership request from ${partnership.organisation_name}`,
      `
      <h2>New Strategic Partnership Proposal</h2>
      <p>A new partnership proposal has been submitted on the portal.</p>

      <div class="info-card">
        <table class="info-table" role="presentation">
          <tr><td class="label">Organisation:</td><td class="value"><strong>${partnership.organisation_name}</strong></td></tr>
          <tr><td class="label">Contact Person:</td><td class="value">${partnership.contact_person}</td></tr>
          <tr><td class="label">Official Email:</td><td class="value"><a href="mailto:${partnership.email}">${partnership.email}</a></td></tr>
          <tr><td class="label">Phone:</td><td class="value"><a href="tel:${partnership.phone}">${partnership.phone}</a></td></tr>
          <tr><td class="label">Sector/Type:</td><td class="value">${partnership.organisation_type}</td></tr>
          <tr><td class="label">Interest Areas:</td><td class="value">${partnership.interests && partnership.interests.length > 0 ? partnership.interests.join(", ") : "General Partnership"}</td></tr>
          <tr><td class="label">Submission Ref:</td><td class="value"><code>${partnership.id}</code></td></tr>
        </table>
      </div>

      <p><strong>Proposal Overview / Message:</strong></p>
      <div class="quote-box" style="white-space: pre-wrap;">${partnership.message}</div>

      <div class="button-wrap">
        <a class="button" href="mailto:${partnership.email}?subject=Partnership Proposal: ${encodeURIComponent(partnership.organisation_name)} — FGR Career Development Center">Initiate Contact</a>
      </div>
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [STAFF_EMAIL],
      subject: `[Partnership Proposal] ${partnership.organisation_name} (${partnership.organisation_type})`,
      html,
    });

    if (error) return { delivered: false, error: error.message };
    return { delivered: true, messageId: data?.id };
  } catch (err) {
    return { delivered: false, error: (err as Error).message };
  }
}

// ============================================================================
// 4. Staff Provisioning Welcome & Password Reset Notification
// ============================================================================

const STAFF_ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Administrator (Full System Control)",
  admin: "Administrator (CRM & Operations)",
  training_officer: "Training Officer (Registrations & Cohorts)",
  partnerships_officer: "Partnerships Officer (Enquiries & Partners)",
  content_manager: "Content Manager (Programmes & Website Content)",
};

export interface StaffWelcomePayload {
  fullName: string;
  email: string;
  jobTitle?: string;
  role: string;
  temporaryPassword?: string;
  resetUrl: string;
  loginUrl: string;
}

/**
 * Dispatches an official onboarding email to a newly created staff member
 * containing their assigned role, temporary password, and direct password reset link.
 */
export async function sendStaffWelcomeEmail(
  payload: StaffWelcomePayload
): Promise<EmailDeliveryResult> {
  const resend = getResendClient();
  if (!resend) {
    console.warn(
      `[Email] Resend API key not configured. Staff welcome credentials for ${payload.email}: Temp Password: ${payload.temporaryPassword}, Reset URL: ${payload.resetUrl}`
    );
    return { delivered: false, reason: "RESEND_NOT_CONFIGURED" };
  }

  const roleLabel =
    STAFF_ROLE_LABELS[payload.role] || payload.role.replace(/_/g, " ").toUpperCase();

  try {
    const html = wrapHtmlEmail(
      "Welcome to FGR Career Development Center Staff Portal",
      `Your staff account has been provisioned. Access credentials and security reset instructions enclosed.`,
      `
      <div class="badge">Internal Staff Access Provisioned</div>
      <h1 class="heading">Welcome to the Team, ${payload.fullName}!</h1>
      <p>
        An official staff account has been set up for you on the <strong>FGR Career Development Center Operations CRM</strong>.
        You can now access your dashboard to manage programmes, training cohorts, enquiries, and organizational data.
      </p>

      <div class="info-card">
        <table class="info-table" role="presentation">
          <tr><td class="label">Staff Name:</td><td class="value"><strong>${payload.fullName}</strong></td></tr>
          <tr><td class="label">Official Email:</td><td class="value"><code>${payload.email}</code></td></tr>
          ${payload.jobTitle ? `<tr><td class="label">Job Title / Position:</td><td class="value"><strong>${payload.jobTitle}</strong></td></tr>` : ""}
          <tr><td class="label">Permission Level:</td><td class="value">${roleLabel}</td></tr>
        </table>
      </div>

      ${payload.temporaryPassword ? `
      <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px 20px; margin: 24px 0;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #475569; margin-bottom: 6px;">
          Your Temporary Password
        </div>
        <div style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: 0.05em; background: #ffffff; padding: 10px 14px; border-radius: 6px; border: 1px dashed #94a3b8; display: inline-block;">
          ${payload.temporaryPassword}
        </div>
        <p style="font-size: 12px; color: #64748b; margin: 8px 0 0 0;">
          Please use this temporary password on your first sign-in, or click the direct password reset link below.
        </p>
      </div>
      ` : ""}

      <div class="button-wrap" style="margin: 28px 0 16px 0;">
        <a class="button" href="${payload.resetUrl}">Set Your Permanent Password</a>
      </div>

      <p style="font-size: 13px; color: #64748b; text-align: center; margin: 0 0 24px 0;">
        Or sign in directly to the CRM: <a href="${payload.loginUrl}" style="color: #c49a45; font-weight: 600;">${payload.loginUrl}</a>
      </p>

      <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px 16px; margin-top: 24px;">
        <strong style="color: #92400e; font-size: 13px; display: block; margin-bottom: 4px;">Security Notice</strong>
        <span style="color: #78350f; font-size: 12.5px; line-height: 1.5; display: block;">
          Do not share this email or your temporary password with anyone. For your security, this password reset link is one-time use and will expire. If you did not expect this invitation, please immediately contact our system administrators at <a href="mailto:admin@fgrcdc.org.ng" style="color: #92400e;">admin@fgrcdc.org.ng</a>.
        </span>
      </div>
      `
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [payload.email],
      subject: `Welcome to FGR Career Center — Staff Account Credentials & Password Setup`,
      html,
    });

    if (error) {
      console.error("[Email] Failed to send staff welcome email:", error);
      return { delivered: false, error: error.message };
    }
    return { delivered: true, messageId: data?.id };
  } catch (err) {
    console.error("[Email] Error dispatching staff welcome email:", err);
    return { delivered: false, error: (err as Error).message };
  }
}

