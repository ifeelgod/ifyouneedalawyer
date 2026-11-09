import { PrismaClient } from "@prisma/client";
import { ingestCityBatch, IngestionFirmInput, IngestionProInput } from "./populate_city_batch";

const prisma = new PrismaClient();

const NEXT_BATCH_FIRMS: IngestionFirmInput[] = [
  // --- NORTH RICHLAND HILLS (NRH) ---
  {
    name: "The Haslam Firm",
    slug: "the-haslam-firm",
    attorneyCount: 2,
    managingPartnerName: "Robert Haslam",
    yearEstablished: 1986,
    tagline: "Premier Personal Injury & Medical Trial Advocacy in NRH",
    bio: "For four decades, Robert Haslam has fought for catastrophic injury and wrongful death victims across North Richland Hills, Mid-Cities, and Tarrant County courts.",
    websiteUrl: "https://haslamfirm.com",
    phone: "(817) 589-9111",
    address: "5521 Rufe Snow Dr, Suite 100",
    zipCode: "76180",
    citySlug: "north-richland-hills",
    countySlug: "tarrant-county",
    practiceAreaSlugs: ["personal-injury"],
  },
  {
    name: "Law Office of Robert E. Marks",
    slug: "law-office-of-robert-e-marks",
    attorneyCount: 1,
    managingPartnerName: "Robert E. Marks",
    yearEstablished: 1998,
    tagline: "Dedicated Estate Administration, Wills & Probate in Mid-Cities",
    bio: "Robert Marks counsels individuals and legacy families through uncontested and contested probate, complex trusts, asset protection, and estate administration in NRH.",
    websiteUrl: "https://marksfirm.com",
    phone: "(817) 428-4444",
    address: "7500 Davis Blvd, Suite 200",
    zipCode: "76182",
    citySlug: "north-richland-hills",
    countySlug: "tarrant-county",
    practiceAreaSlugs: ["probate-estate-planning"],
  },
  {
    name: "The Law Office of Christopher A. Hesse",
    slug: "law-office-of-christopher-a-hesse",
    attorneyCount: 2,
    managingPartnerName: "Christopher Hesse",
    yearEstablished: 2010,
    tagline: "Tenacious Criminal Defense & Former Marine Corps Trial Attorney",
    bio: "Christopher Hesse brings military discipline and aggressive courtroom strategy to defending clients facing DWIs, felony charges, and domestic violence allegations across Tarrant County.",
    websiteUrl: "https://hesselaw.com",
    phone: "(817) 750-7000",
    address: "8401 Boulevard 26, Suite 150",
    zipCode: "76180",
    citySlug: "north-richland-hills",
    countySlug: "tarrant-county",
    practiceAreaSlugs: ["criminal-defense-dwi"],
  },

  // --- ROANOKE & TROPHY CLUB ---
  {
    name: "Law Office of Jason Amon",
    slug: "law-office-of-jason-amon",
    attorneyCount: 2,
    managingPartnerName: "Jason Amon",
    yearEstablished: 2008,
    tagline: "Commercial Real Estate, Zoning & Business Litigation",
    bio: "Jason Amon provides sophisticated transactional counsel and courtroom representation for real estate developers, property owners, and small businesses throughout northern Tarrant County.",
    websiteUrl: "https://amonlaw.com",
    phone: "(817) 334-0070",
    address: "304 S Oak St, Suite 200",
    zipCode: "76262",
    citySlug: "roanoke",
    countySlug: "tarrant-county",
    practiceAreaSlugs: ["business-law"],
  },
  {
    name: "The Trophy Club Law Group",
    slug: "the-trophy-club-law-group",
    attorneyCount: 2,
    managingPartnerName: "David S. Bouschor, II",
    yearEstablished: 1991,
    tagline: "Board Certified Family Law & High-Asset Asset Protection",
    bio: "Over 30 years of courtroom mastery helping clients protect their parental rights, business assets, and financial legacies through complex marital dissolutions and estate transfers.",
    websiteUrl: "https://bouschorlaw.com",
    phone: "(940) 387-3518",
    address: "22 Rosewood Dr",
    zipCode: "76262",
    citySlug: "trophy-club",
    countySlug: "tarrant-county",
    practiceAreaSlugs: ["family-law", "probate-estate-planning"],
  },

  // --- EULESS / HURST ADDITIONAL EXPANSIONS ---
  {
    name: "Ted Machi & Associates, P.C.",
    slug: "ted-machi-and-associates",
    attorneyCount: 3,
    managingPartnerName: "Ted Machi",
    yearEstablished: 1980,
    tagline: "Consumer Rights, Debt Relief & Disability Representation in HEB",
    bio: "Ted Machi has served DFW and Tarrant County for over 45 years, counseling individuals through financial crises, creditor disputes, and Social Security disability hearings.",
    websiteUrl: "https://tedmachi.com",
    phone: "(817) 335-8880",
    address: "1521 N Cooper St",
    zipCode: "76039",
    citySlug: "euless",
    countySlug: "tarrant-county",
    practiceAreaSlugs: ["business-law"],
  },
];

const NEXT_BATCH_PROS: IngestionProInput[] = [
  {
    businessName: "NRH Injury Rehab & Chiropractic",
    slug: "nrh-injury-rehab-chiropractic",
    category: "CHIROPRACTOR_MD",
    linkedPracticeSlug: "personal-injury",
    description: "Accident diagnostics, comprehensive therapeutic rehabilitation, and clear billing narratives working in coordination with trial attorneys under Letters of Protection (LOP).",
    websiteUrl: "https://nrhrehabspine.com",
    phone: "(817) 485-9922",
    address: "8515 Davis Blvd",
    zipCode: "76182",
    citySlug: "north-richland-hills",
    countySlug: "tarrant-county",
    acceptsLOP: true,
  },
  {
    businessName: "Alliance 24/7 Bail Bonds",
    slug: "alliance-24-7-bail-bonds",
    category: "BAIL_BONDS",
    linkedPracticeSlug: "criminal-defense-dwi",
    description: "Licensed Tarrant County bail agents stationed near Alliance Corridor serving Roanoke, Trophy Club, Keller, and Fort Worth jail bookings with rapid 24/7 turnaround.",
    websiteUrl: "https://alliance247bail.com",
    phone: "(817) 847-5245",
    address: "201 N US-377",
    zipCode: "76262",
    citySlug: "roanoke",
    countySlug: "tarrant-county",
    is24Hours: true,
  },
  {
    businessName: "Crossroads Family Dispute Resolution",
    slug: "crossroads-family-dispute-resolution",
    category: "MEDIATOR",
    linkedPracticeSlug: "family-law",
    description: "Credentialed domestic mediator providing structured, impartial resolution for contested custody, parenting plans, and marital property division outside of court.",
    websiteUrl: "https://crossroadsmediationdfw.com",
    phone: "(817) 503-7200",
    address: "7410 Boulevard 26",
    zipCode: "76180",
    citySlug: "north-richland-hills",
    countySlug: "tarrant-county",
  },
];

async function main() {
  const tarrant = await prisma.county.findUnique({ where: { slug: "tarrant-county" } });
  if (!tarrant) throw new Error("Tarrant county not found!");

  // Ensure new cities exist
  await prisma.city.upsert({
    where: { slug: "north-richland-hills" },
    update: {},
    create: {
      name: "North Richland Hills",
      slug: "north-richland-hills",
      countyId: tarrant.id,
      population: 71000,
      zipCodes: "76180, 76182",
    },
  });

  await prisma.city.upsert({
    where: { slug: "roanoke" },
    update: {},
    create: {
      name: "Roanoke",
      slug: "roanoke",
      countyId: tarrant.id,
      population: 10000,
      zipCodes: "76262",
    },
  });

  await prisma.city.upsert({
    where: { slug: "trophy-club" },
    update: {},
    create: {
      name: "Trophy Club",
      slug: "trophy-club",
      countyId: tarrant.id,
      population: 14000,
      zipCodes: "76262",
    },
  });

  console.log("Upserted North Richland Hills, Roanoke, and Trophy Club cities into database.");

  await ingestCityBatch({
    firms: NEXT_BATCH_FIRMS,
    pros: NEXT_BATCH_PROS,
    autoSendEmails: true,
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
