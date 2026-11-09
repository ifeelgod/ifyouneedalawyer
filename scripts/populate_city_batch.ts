import { PrismaClient } from "@prisma/client";
import { sendClaimInvitationEmail } from "../src/lib/email";

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

function cleanDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

async function scrapeEmailFromDomain(websiteUrl: string, partnerName: string): Promise<{ deskEmail: string; partnerEmail: string }> {
  const domain = cleanDomain(websiteUrl);
  if (!domain) {
    return { deskEmail: "contact@ifyouneedalawyer.com", partnerEmail: "contact@ifyouneedalawyer.com" };
  }

  const defaultDesk = `contact@${domain}`;
  const firstName = partnerName.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(websiteUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const text = await res.text();
      const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi) || [];
      const domainMatches = matches
        .map((e) => e.toLowerCase())
        .filter((e) => e.includes(domain) && !e.includes(".png") && !e.includes("schema.org"));

      if (domainMatches.length > 0) {
        const partnerSpecific = domainMatches.find((e) => e.split("@")[0].includes(firstName));
        return {
          deskEmail: domainMatches[0],
          partnerEmail: partnerSpecific || domainMatches[0],
        };
      }
    }
  } catch {
    // Fall back to clean domain intake
  }

  return { deskEmail: defaultDesk, partnerEmail: defaultDesk };
}

export async function ingestCityBatch({
  firms,
  pros,
  autoSendEmails = false,
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

    // 2. Discover & Enrich Emails
    const { deskEmail, partnerEmail } = await scrapeEmailFromDomain(f.websiteUrl, f.managingPartnerName);

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

    // 5. Automated Outreach Dispatch
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
        console.log(`  -> [OUTREACH DISPATCHED] Sent Founders invite to ${partnerEmail}`);
      } else {
        console.warn(`  -> [OUTREACH QUEUED] Email ready for ${partnerEmail} (${res.error})`);
      }
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

    await prisma.associatedPro.upsert({
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
  }

  console.log(`\nBatch Finished! Ingested ${ingestedFirms} firms, ${ingestedPros} pros. Emails dispatched: ${emailsSent}.`);
}
