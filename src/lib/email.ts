import { Resend } from "resend";
import dns from "dns/promises";

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface ClaimEmailPayload {
  toEmail: string;
  partnerName: string;
  firmName: string;
  city: string;
  attorneyCount: number;
  claimUrl: string;
}

export interface ProEmailPayload {
  toEmail: string;
  businessName: string;
  category: string;
  city: string;
  claimUrl: string;
}

/**
 * Validates whether the recipient domain has active MX records.
 * Prevents catastrophic bounce rates on unconfigured domains.
 */
export async function verifyDomainMx(email: string): Promise<boolean> {
  try {
    const domain = email.split("@")[1]?.toLowerCase().trim();
    if (!domain) return false;
    const records = await dns.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false;
  }
}

export async function sendClaimInvitationEmail({
  toEmail,
  partnerName,
  firmName,
  city,
  attorneyCount,
  claimUrl,
}: ClaimEmailPayload) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not configured. Email skipped for", toEmail);
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  // 1. Pre-flight Deliverability Check: Reject unroutable or placeholder emails
  if (toEmail.startsWith("unverified@") || toEmail.startsWith("contact@")) {
    console.warn(`[DELIVERABILITY SAFEGUARD] Skipping low-reputation email: ${toEmail}`);
    return { success: false, error: "Email address skipped to protect sender reputation (no MX or generic contact@ fallback)" };
  }

  const hasMx = await verifyDomainMx(toEmail);
  if (!hasMx) {
    console.warn(`[DELIVERABILITY SAFEGUARD] Domain has no active MX records: ${toEmail}`);
    return { success: false, error: `Domain has no active MX records (${toEmail})` };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "IfYouNeedALawyer <directory@ifyouneedalawyer.com>";
  const cleanPartner = partnerName.replace(/,\s*(Esq|PC|JD|PLLC|LLC)\.?/gi, "").trim();
  const firstName = cleanPartner.split(/\s+/)[0] || cleanPartner;

  // Clean, professional, high-deliverability subject line that passes Microsoft 365 / Google Workspace spam filters
  const subject = `Tarrant County Directory: ${firmName} (${firstName})`;

  // High-deliverability conversational HTML (looks authentic and executive, not a promotional spam blast)
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: #111827; border-radius: 16px; padding: 32px; border: 1px solid #1f2937; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
        .badge { display: inline-block; background: #f59e0b; color: #0f172a; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; }
        h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 16px; line-height: 1.3; }
        p { font-size: 14px; color: #cbd5e1; margin-bottom: 16px; }
        .card { background: #1f2937; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #e5e7eb; }
        .scarcity { background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 10px; padding: 14px; margin: 20px 0; font-size: 13px; color: #fde68a; }
        .btn { display: inline-block; background: #f59e0b; color: #0f172a !important; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; margin: 20px 0; }
        .footer { font-size: 11px; color: #64748b; margin-top: 32px; border-top: 1px solid #1f2937; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="badge">Strictly 1–5 Attorney Cap</span>
        <h1>Dear ${firstName},</h1>
        <p>
          Your practice, <strong>${firmName}</strong> in ${city}, has been vetted and added to <strong>IfYouNeedALawyer.com</strong>.
        </p>
        <div class="card">
          <strong>Why Small Practices Choose Us:</strong><br>
          High-intent legal consumers in Tarrant County are tired of billboard mega-firms where clients get handed off to call centers. We built this platform strictly for 1 to 5 attorney practices so local clients connect directly with trial-tested partners.
        </div>
        <div class="scarcity">
          <strong>Founders Rate Notice:</strong><br>
          Your baseline verified listing is active at no charge. We also reserve strictly <strong>3 Featured Sponsor Slots</strong> per city. As an early partner, you can lock in our Founders Launch rate before the top spots in ${city} are claimed.
        </div>
        <div style="text-align: center;">
          <a href="${claimUrl}" class="btn">View & Claim Your Practice Listing &rarr;</a>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          Direct link: <a href="${claimUrl}" style="color: #f59e0b;">${claimUrl}</a>
        </p>
        <div class="footer">
          IfYouNeedALawyer.com • Tarrant County Vetted Legal Directory<br>
          Non-lawyer flat advertising directory operating strictly within Texas Disciplinary Rules of Professional Conduct (TDRPC) 5.04 & 7.03.<br>
          To opt out or update your listing preferences, reply to this email or visit your claim link.
        </div>
      </div>
    </body>
    </html>
  `;

  // Multipart text version dramatically lowers spam scores in Outlook & Gmail
  const emailText = `Dear ${firstName},

Your practice, ${firmName} in ${city}, has been vetted and added to IfYouNeedALawyer.com.

Why Small Practices Choose Us:
High-intent legal consumers in Tarrant County are tired of billboard mega-firms where clients get handed off to call centers. We built this platform strictly for 1 to 5 attorney practices so local clients connect directly with trial-tested partners.

Founders Rate Notice:
Your baseline verified listing is active at no charge. We also reserve strictly 3 Featured Sponsor Slots per city. As an early partner, you can lock in our Founders Launch rate before the top spots in ${city} are claimed.

View & Claim Your Practice Listing:
${claimUrl}

--
IfYouNeedALawyer.com • Tarrant County Vetted Legal Directory
Non-lawyer flat advertising directory operating strictly within TDRPC 5.04 & 7.03.
To opt out or update your listing preferences, reply directly to this email.`;

  try {
    let { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: "support@ifyouneedalawyer.com",
      subject: subject,
      html: emailHtml,
      text: emailText,
      headers: {
        "List-Unsubscribe": `<${claimUrl}?action=optout>`,
      },
    });

    if (error && error.message && error.message.includes("not verified") && !fromEmail.includes("resend.dev")) {
      const fallback = await resend.emails.send({
        from: "IfYouNeedALawyer <onboarding@resend.dev>",
        to: [toEmail],
        replyTo: "support@ifyouneedalawyer.com",
        subject: subject,
        html: emailHtml,
        text: emailText,
      });

      if (!fallback.error) {
        return { success: true, data: fallback.data, usedFallback: true };
      }
      error = fallback.error;
    }

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Email send exception:", err);
    return { success: false, error: err.message };
  }
}

export async function sendProInvitationEmail({
  toEmail,
  businessName,
  category,
  city,
  claimUrl,
}: ProEmailPayload) {
  if (!resend) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  if (toEmail.startsWith("unverified@") || toEmail.startsWith("contact@")) {
    return { success: false, error: "Email address skipped to protect sender reputation" };
  }

  const hasMx = await verifyDomainMx(toEmail);
  if (!hasMx) {
    return { success: false, error: `Domain has no active MX records (${toEmail})` };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "IfYouNeedALawyer <directory@ifyouneedalawyer.com>";
  const categoryLabel = category.replace(/_/g, " ");
  const subject = `Local Referral Partner: ${businessName} (${city})`;

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: #111827; border-radius: 16px; padding: 32px; border: 1px solid #1f2937; }
        .badge { display: inline-block; background: #10b981; color: #0f172a; font-weight: 800; font-size: 11px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 20px; }
        h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 16px; }
        p { font-size: 14px; color: #cbd5e1; margin-bottom: 16px; }
        .card { background: #1f2937; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #e5e7eb; }
        .btn { display: inline-block; background: #10b981; color: #0f172a !important; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; margin: 20px 0; }
        .footer { font-size: 11px; color: #64748b; margin-top: 32px; border-top: 1px solid #1f2937; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="badge">Local Professional Network</span>
        <h1>Hello ${businessName},</h1>
        <p>
          Your business in ${city} has been added as a recommended local <strong>${categoryLabel}</strong> partner on <strong>IfYouNeedALawyer.com</strong>.
        </p>
        <div class="card">
          <strong>Direct Attorney Referrals:</strong><br>
          We connect vetted solo and small practice trial lawyers with trusted local specialists (auto accident chiropractors accepting Letters of Protection, 24/7 bail bondsmen, mediators, and probate specialists).
        </div>
        <p>
          Your verified listing is live at no charge. You can review and claim your profile below:
        </p>
        <div style="text-align: center;">
          <a href="${claimUrl}" class="btn">View & Claim Your Profile &rarr;</a>
        </div>
        <div class="footer">
          IfYouNeedALawyer.com • Tarrant County Legal & Professional Network
        </div>
      </div>
    </body>
    </html>
  `;

  const emailText = `Hello ${businessName},

Your business in ${city} has been added as a recommended local ${categoryLabel} partner on IfYouNeedALawyer.com.

Direct Attorney Referrals:
We connect vetted solo and small practice trial lawyers with trusted local specialists (auto accident chiropractors accepting Letters of Protection, 24/7 bail bondsmen, mediators, and probate specialists).

Your verified listing is live at no charge. You can review and claim your profile below:
${claimUrl}

--
IfYouNeedALawyer.com • Tarrant County Legal & Professional Network`;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: "support@ifyouneedalawyer.com",
      subject: subject,
      html: emailHtml,
      text: emailText,
      headers: {
        "List-Unsubscribe": `<${claimUrl}?action=optout>`,
      },
    });

    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
