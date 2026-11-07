import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      eventType,
      targetType, // "LAW_FIRM" or "ASSOCIATED_PRO"
      targetId,
      practiceAreaSlug,
      citySlug,
      prospectName,
      prospectPhone,
      prospectEmail,
      prospectIssueSummary,
    } = body;

    const lead = await prisma.leadEvent.create({
      data: {
        eventType: eventType || "PHONE_REVEAL",
        targetType: targetType || "LAW_FIRM",
        lawFirmId: targetType === "LAW_FIRM" ? targetId : null,
        associatedProId: targetType === "ASSOCIATED_PRO" ? targetId : null,
        practiceAreaSlug,
        citySlug,
        prospectName,
        prospectPhone,
        prospectEmail,
        prospectIssueSummary,
        utmSource: "ifyouneedalawyer.com",
        utmMedium: "directory_click",
      },
    });

    // In production: trigger transactional email/SMS alert to the managing partner
    console.log(`[LEAD LOGGED] ${eventType} for ${targetType} ID: ${targetId}`);

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error("Failed to log lead event:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
