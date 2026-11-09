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

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; padding: 24px; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; background: #0f172a; border-radius: 20px; padding: 36px; border: 1px solid #1e293b; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        .badge { display: inline-block; background: #f59e0b; color: #090d16; font-weight: 900; font-size: 11px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; }
        h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin-bottom: 16px; line-height: 1.3; }
        p { font-size: 14px; color: #cbd5e1; margin-bottom: 16px; }
        .callout { background: #1e293b; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #e2e8f0; }
        .alert-box { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 14px; margin: 20px 0; font-size: 12px; color: #fca5a5; }
        .btn { display: inline-block; background: linear-gradient(135deg, #f59e0b, #d97706); color: #090d16 !important; font-weight: 900; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-size: 14px; margin: 20px 0; text-transform: uppercase; letter-spacing: 0.03em; box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3); }
        .footer { font-size: 11px; color: #64748b; margin-top: 36px; border-top: 1px solid #1e293b; padding-top: 18px; }
      </style>
    </head>
    <body>
      <div class="container">
        <span class="badge">Strictly 1–5 Attorney Cap Verified</span>
        <h1>Dear ${partnerName},</h1>
        <p>
          Your practice, <strong>${firmName}</strong> in ${city}, has been independently vetted and selected for inclusion in <strong>IfYouNeedALawyer.com</strong>.
        </p>
        <div class="callout">
          <strong>The Problem We Solve for Small Practices:</strong><br>
          High-intent clients facing divorces, criminal charges, or serious injuries are tired of calling TV billboard mega-firms only to be passed off to junior paralegals. We built IfYouNeedALawyer.com to ban 6+ lawyer billboard mills and connect clients directly with vetted, trial-ready partners.
        </div>
        <div class="alert-box">
          <strong>Limited Early Adopter Inventory:</strong><br>
          Your basic listing is 100% active at no cost. We also cap each city to strictly <strong>3 Featured Sponsor Slots</strong>. As an early adopter, you can lock in our deeply discounted Founders Rate before direct competitors in ${city} claim the top slots.
        </div>
        <div style="text-align: center;">
          <a href="${claimUrl}" class="btn">Preview & Claim Your Verified Listing &rarr;</a>
        </div>
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          Direct access link: <a href="${claimUrl}" style="color: #f59e0b;">${claimUrl}</a>
        </p>
        <div class="footer">
          IfYouNeedALawyer.com • Tarrant County Vetted Legal Directory<br>
          Non-lawyer flat advertising directory operating strictly within Texas Disciplinary Rules of Professional Conduct (TDRPC) 5.04 & 7.03.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    let { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: `[Verified Notice] ${firmName} selected for IfYouNeedALawyer.com (${city})`,
      html: emailHtml,
    });

    // Auto-fallback to onboarding@resend.dev for test sends if custom domain is pending verification
    if (error && error.message && error.message.includes("not verified") && !fromEmail.includes("resend.dev")) {
      const fallback = await resend.emails.send({
        from: "IfYouNeedALawyer <onboarding@resend.dev>",
        to: [toEmail],
        subject: `[Verified Notice] ${firmName} selected for IfYouNeedALawyer.com (${city})`,
        html: emailHtml,
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
