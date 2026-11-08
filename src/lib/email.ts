import { Resend } from "resend";

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

  const fromEmail = process.env.RESEND_FROM_EMAIL || "IfYouNeedALawyer <directory@ifyouneedalawyer.com>";

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `Free Inclusion Notice: ${firmName} verified on IfYouNeedALawyer.com (${city})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 16px; padding: 32px; border: 1px solid #334155; }
            .badge { display: inline-block; background: #f59e0b; color: #0f172a; font-weight: bold; font-size: 11px; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
            h1 { font-size: 22px; color: #ffffff; margin-bottom: 16px; }
            p { font-size: 14px; color: #cbd5e1; margin-bottom: 16px; }
            .callout { background: #0f172a; border-left: 4px solid #f59e0b; padding: 14px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #e2e8f0; }
            .btn { display: inline-block; background: #f59e0b; color: #0f172a; font-weight: bold; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; margin: 16px 0; }
            .footer { font-size: 11px; color: #64748b; margin-top: 32px; border-top: 1px solid #334155; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <span class="badge">Verified 1–5 Attorney Practice</span>
            <h1>Dear ${partnerName},</h1>
            <p>
              I am writing to inform you that <strong>${firmName}</strong> in ${city}, Texas has been independently reviewed and included as a verified 1 to 5 attorney practice (${attorneyCount} attorneys verified) on <strong>IfYouNeedALawyer.com</strong>.
            </p>
            <div class="callout">
              <strong>Why your practice was selected:</strong><br>
              We built IfYouNeedALawyer.com to strictly cap listings at 1 to 5 attorneys, filtering out large TV billboard settlement mills and directing Tarrant County clients directly to trial-ready partners.
            </div>
            <p>
              Your standard listing is active at zero cost. You can preview your live profile, review prospect inquiry activity, and grab your free "Verified Small Firm" SEO trust badge below:
            </p>
            <div style="text-align: center;">
              <a href="${claimUrl}" class="btn">Preview & Claim Your Verified Listing</a>
            </div>
            <p style="font-size: 12px; color: #94a3b8;">
              Direct link: <a href="${claimUrl}" style="color: #f59e0b;">${claimUrl}</a>
            </p>
            <div class="footer">
              IfYouNeedALawyer.com • Tarrant County Legal Directory<br>
              Non-lawyer flat advertising directory operating in compliance with Texas Disciplinary Rules of Professional Conduct 5.04 & 7.03.
            </div>
          </div>
        </body>
        </html>
      `,
    });

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
