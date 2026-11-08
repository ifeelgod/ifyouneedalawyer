import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendClaimInvitationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firmId, targetEmail, isTest } = body;

    if (!firmId) {
      return NextResponse.json({ error: "firmId is required" }, { status: 400 });
    }

    const firm = await prisma.lawFirm.findUnique({
      where: { id: firmId },
      include: { city: true },
    });

    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }

    const recipient = targetEmail || firm.partnerEmail || firm.email;
    if (!recipient) {
      return NextResponse.json(
        { error: "No email address found for this firm. Provide targetEmail in request." },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ifyouneedalawyer.com";
    const claimUrl = `${baseUrl}/claim/${firm.claimToken}`;

    const result = await sendClaimInvitationEmail({
      toEmail: recipient,
      partnerName: firm.managingPartnerName,
      firmName: firm.name,
      city: firm.city.name,
      attorneyCount: firm.attorneyCount,
      claimUrl,
    });

    return NextResponse.json({
      success: result.success,
      recipient,
      firm: firm.name,
      isTest: !!isTest,
      error: result.error,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
