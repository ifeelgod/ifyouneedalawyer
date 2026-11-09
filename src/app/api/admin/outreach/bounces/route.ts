import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendClaimInvitationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rawText, executeSend } = body;

    if (!rawText || typeof rawText !== "string") {
      return NextResponse.json({ error: "rawText is required" }, { status: 400 });
    }

    // 1. Extract all email addresses from the pasted text or CSV
    const emailMatches = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
    const uniqueEmails = [...new Set(emailMatches.map((e) => e.toLowerCase().trim()))];

    if (uniqueEmails.length === 0) {
      return NextResponse.json({
        matchedFirms: [],
        message: "No email addresses recognized in the provided input.",
      });
    }

    // 2. Extract domains from the emails
    const domains = uniqueEmails
      .map((e) => e.split("@")[1]?.toLowerCase())
      .filter(Boolean);

    // 3. Find matching law firms in PostgreSQL
    const allFirms = await prisma.lawFirm.findMany({
      include: { city: true },
    });

    const matched: Array<{
      id: string;
      firmName: string;
      cityName: string;
      bouncedEmail: string;
      newPartnerEmail: string | null;
      canResend: boolean;
      status: string;
    }> = [];

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ifyouneedalawyer.com";

    for (const email of uniqueEmails) {
      const domain = email.split("@")[1]?.toLowerCase();
      const firm = allFirms.find((f) => {
        const firmDomain = f.websiteUrl.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, "").replace(/\/.*$/, "");
        return firmDomain.includes(domain) || f.email?.toLowerCase() === email || f.partnerEmail?.toLowerCase() === email;
      });

      if (firm) {
        const isUpgraded = firm.partnerEmail && !firm.partnerEmail.startsWith("contact@") && !firm.partnerEmail.startsWith("unverified@");

        matched.push({
          id: firm.id,
          firmName: firm.name,
          cityName: firm.city.name,
          bouncedEmail: email,
          newPartnerEmail: firm.partnerEmail,
          canResend: !!isUpgraded,
          status: isUpgraded ? "Ready to Resend" : "Unroutable (No MX or Unverified)",
        });
      }
    }

    // 4. If executeSend is requested, dispatch emails in sequence
    let sentCount = 0;
    let failedCount = 0;

    if (executeSend) {
      for (const item of matched) {
        if (item.canResend && item.newPartnerEmail) {
          const firm = allFirms.find((f) => f.id === item.id);
          if (firm) {
            const claimUrl = `${siteUrl}/claim/${firm.claimToken}`;
            const sendRes = await sendClaimInvitationEmail({
              toEmail: item.newPartnerEmail,
              partnerName: firm.managingPartnerName,
              firmName: firm.name,
              city: firm.city.name,
              attorneyCount: firm.attorneyCount,
              claimUrl,
            });

            if (sendRes.success) {
              sentCount++;
              item.status = `Sent successfully to ${item.newPartnerEmail}`;
              await prisma.leadEvent.create({
                data: {
                  eventType: "OUTREACH_EMAIL_SENT",
                  targetType: "LAW_FIRM",
                  lawFirmId: firm.id,
                  citySlug: firm.city.slug,
                },
              });
            } else {
              failedCount++;
              item.status = `Failed: ${sendRes.error}`;
            }

            // Rate-limiting pause
            await new Promise((r) => setTimeout(r, 600));
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalBouncesProvided: uniqueEmails.length,
      matchedFirmsCount: matched.length,
      matched,
      sentCount,
      failedCount,
    });
  } catch (error: any) {
    console.error("Error processing bounced emails:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
