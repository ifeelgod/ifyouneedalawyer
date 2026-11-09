import { PrismaClient } from "@prisma/client";
import { sendClaimInvitationEmail, sendProInvitationEmail } from "../src/lib/email";
import { discoverSmartEmail, cleanDomain } from "../src/lib/email-discovery";

const prisma = new PrismaClient();

export interface IngestionFirmInput {
  name: string;
  slug: string;
  attorneyCount: number;
  managingPartnerName: string;
  barNumber?: string;
  yearEstablished?: number;
  tagline?: string;
  bio: string;
  websiteUrl: string;
  phone: string;
  address: string;
  zipCode: string;
  citySlug: string;
  countySlug: string;
  practiceAreaSlugs: string[];
}

export interface IngestionProInput {
  businessName: string;
  slug: string;
  category: "CHIROPRACTOR_MD" | "BAIL_BONDS" | "MEDIATOR" | "PROBATE_REALTOR_CPA";
  linkedPracticeSlug: "personal-injury" | "criminal-defense-dwi" | "family-law" | "probate-estate-planning";
  description: string;
  websiteUrl: string;
  phone: string;
  address: string;
  zipCode: string;
  citySlug: string;
  countySlug: string;
  acceptsLOP?: boolean;
  is24Hours?: boolean;
}



export async function ingestCityBatch({
  firms,
  pros,
  autoSendEmails = true,
}: {
  firms: IngestionFirmInput[];
  pros: IngestionProInput[];
  autoSendEmails?: boolean;
}) {
  console.log(`\n=== INGESTING CITY BATCH: ${firms.length} Firms, ${pros.length} Ancillary Pros ===`);

  // Cache practice areas
  const pas = await prisma.practiceArea.findMany();
  const paMap = new Map(pas.map((p) => [p.slug, p.id]));

  let ingestedFirms = 0;
  let emailsSent = 0;

  for (const f of firms) {
    // 1. Strict 1-5 Headcount Audit Cap
    if (f.attorneyCount < 1 || f.attorneyCount > 5) {
      console.warn(`[REJECTED] ${f.name} exceeds strict 1 to 5 headcount rule (${f.attorneyCount} attorneys).`);
      continue;
    }

    const city = await prisma.city.findFirst({ where: { slug: f.citySlug } });
    const county = await prisma.county.findUnique({ where: { slug: f.countySlug } });

    if (!city || !county) {
      console.warn(`City ${f.citySlug} or County ${f.countySlug} not found in DB! Skipping ${f.name}`);
      continue;
    }

    // 2. Discover & Enrich Emails with Smart MX Validation & Partner First-Name Priority
    const discovery = await discoverSmartEmail({
      websiteUrl: f.websiteUrl,
      partnerName: f.managingPartnerName,
    });
    const deskEmail = discovery.deskEmail;
    const partnerEmail = discovery.partnerEmail;

    // 3. Upsert Firm
    const firm = await prisma.lawFirm.upsert({
      where: { slug: f.slug },
      update: {
        name: f.name,
        attorneyCount: f.attorneyCount,
        sizeTier: f.attorneyCount === 1 ? "SOLO" : "BOUTIQUE",
        managingPartnerName: f.managingPartnerName,
        barNumber: f.barNumber,
        yearEstablished: f.yearEstablished,
        tagline: f.tagline,
        bio: f.bio,
        websiteUrl: f.websiteUrl,
        phone: f.phone,
        email: deskEmail,
        partnerEmail: partnerEmail,
        address: f.address,
        zipCode: f.zipCode,
        verificationStatus: "BAR_VERIFIED",
        exclusionsChecked: true,
      },
      create: {
        name: f.name,
        slug: f.slug,
        attorneyCount: f.attorneyCount,
        sizeTier: f.attorneyCount === 1 ? "SOLO" : "BOUTIQUE",
        managingPartnerName: f.managingPartnerName,
        barNumber: f.barNumber,
        yearEstablished: f.yearEstablished,
        tagline: f.tagline,
        bio: f.bio,
        websiteUrl: f.websiteUrl,
        phone: f.phone,
        email: deskEmail,
        partnerEmail: partnerEmail,
        address: f.address,
        zipCode: f.zipCode,
        verificationStatus: "BAR_VERIFIED",
        exclusionsChecked: true,
        countyId: county.id,
        cityId: city.id,
      },
    });

    // 4. Link Practice Areas
    for (const paSlug of f.practiceAreaSlugs) {
      const paId = paMap.get(paSlug);
      if (paId) {
        await prisma.lawFirmPracticeArea.upsert({
          where: {
            lawFirmId_practiceAreaId: {
              lawFirmId: firm.id,
              practiceAreaId: paId,
            },
          },
          update: {},
          create: {
            lawFirmId: firm.id,
            practiceAreaId: paId,
          },
        });
      }
    }

    ingestedFirms++;
    console.log(`[INGESTED] ${firm.name} (${city.name}) => Email: ${partnerEmail}`);

    // 5. Automated Outreach Dispatch for Law Firms
    if (autoSendEmails && partnerEmail) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ifyouneedalawyer.com";
      const claimUrl = `${siteUrl}/claim/${firm.claimToken}`;

      const res = await sendClaimInvitationEmail({
        toEmail: partnerEmail,
        partnerName: firm.managingPartnerName,
        firmName: firm.name,
        city: city.name,
        attorneyCount: firm.attorneyCount,
        claimUrl,
      });

      if (res.success) {
        emailsSent++;
        await prisma.leadEvent.create({
          data: {
            eventType: "OUTREACH_EMAIL_SENT",
            targetType: "LAW_FIRM",
            lawFirmId: firm.id,
          },
        });
        console.log(`  -> [OUTREACH DISPATCHED] Sent Founders invite to ${partnerEmail}`);
      } else {
        console.warn(`  -> [OUTREACH QUEUED] Email ready for ${partnerEmail} (${res.error})`);
      }

      // 600ms rate limiting delay
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  // 6. Ingest Associated Pros
  let ingestedPros = 0;
  for (const p of pros) {
    const city = await prisma.city.findFirst({ where: { slug: p.citySlug } });
    const county = await prisma.county.findUnique({ where: { slug: p.countySlug } });

    if (!city || !county) continue;

    const domain = cleanDomain(p.websiteUrl);
    const deskEmail = domain ? `info@${domain}` : "referrals@ifyouneedalawyer.com";

    const pro = await prisma.associatedPro.upsert({
      where: { slug: p.slug },
      update: {
        businessName: p.businessName,
        category: p.category,
        linkedPracticeSlug: p.linkedPracticeSlug,
        phone: p.phone,
        email: deskEmail,
        address: p.address,
        zipCode: p.zipCode,
        websiteUrl: p.websiteUrl,
        description: p.description,
        acceptsLOP: !!p.acceptsLOP,
        is24Hours: !!p.is24Hours,
      },
      create: {
        businessName: p.businessName,
        slug: p.slug,
        category: p.category,
        linkedPracticeSlug: p.linkedPracticeSlug,
        phone: p.phone,
        email: deskEmail,
        address: p.address,
        zipCode: p.zipCode,
        websiteUrl: p.websiteUrl,
        description: p.description,
        acceptsLOP: !!p.acceptsLOP,
        is24Hours: !!p.is24Hours,
        countyId: county.id,
        cityId: city.id,
      },
    });

    ingestedPros++;
    console.log(`[INGESTED PRO] ${pro.businessName} (${city.name}) => Email: ${deskEmail}`);

    if (autoSendEmails && deskEmail) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ifyouneedalawyer.com";
      const claimUrl = `${siteUrl}/claim/${pro.claimToken}`;

      const res = await sendProInvitationEmail({
        toEmail: deskEmail,
        businessName: pro.businessName,
        category: pro.category,
        city: city.name,
        claimUrl,
      });

      if (res.success) {
        emailsSent++;
        await prisma.leadEvent.create({
          data: {
            eventType: "OUTREACH_EMAIL_SENT",
            targetType: "ASSOCIATED_PRO",
            associatedProId: pro.id,
          },
        });
        console.log(`  -> [PRO OUTREACH DISPATCHED] Sent Partner invite to ${deskEmail}`);
      }

      await new Promise((r) => setTimeout(r, 600));
    }
  }

  console.log(`\nBatch Finished! Ingested ${ingestedFirms} firms, ${ingestedPros} pros. Total emails dispatched: ${emailsSent}.`);
}
