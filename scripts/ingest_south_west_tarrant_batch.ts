import { PrismaClient } from "@prisma/client";
import { ingestCityBatch, IngestionFirmInput, IngestionProInput } from "./populate_city_batch";

const prisma = new PrismaClient();

const SOUTH_WEST_BATCH_FIRMS: IngestionFirmInput[] = [
  // --- BURLESON, TX ---
  {
    name: "Michael R. Kurmes, Attorney at Law, PLLC",
    slug: "michael-r-kurmes-burleson",
    attorneyCount: 1,
    managingPartnerName: "Michael R. Kurmes",
    yearEstablished: 2008,
    tagline: "Dedicated Burleson Solo Trial Practice in Family, Criminal & Probate",
    bio: "Michael R. Kurmes provides direct, one-on-one attorney advocacy for Burleson and southern Tarrant County families navigating divorce, criminal defense charges, and estate probate.",
    websiteUrl: "https://lawyerburlesontexas.com",
    phone: "(817) 295-1477",
    address: "835 SW Alsbury Blvd, Suite K",
    zipCode: "76028",
    citySlug: "burleson",
    countySlug: "tarrant-county",
    practiceAreaSlugs: ["family-law", "criminal-defense-dwi", "probate-estate-planning"],
  },
  {
    name: "Law Office of Toni D. Driver, PLLC",
    slug: "law-office-of-toni-d-driver",
    attorneyCount: 1,
    managingPartnerName: "Toni D. Driver",
    yearEstablished: 2012,
    tagline: "Client-Focused Family Law & Criminal Defense in Old Town Burleson",
    bio: "Located in Old Town Burleson, Toni D. Driver delivers individualized, aggressive representation for Tarrant and Johnson County clients facing family disputes or criminal charges.",
    websiteUrl: "https://tonidriverlaw.com",
    phone: "(817) 426-1216",
    address: "124 S Main Street, Suite 203",
    zipCode: "76028",
    citySlug: "burleson",
    countySlug: "tarrant-county",
    practiceAreaSlugs: ["family-law", "criminal-defense-dwi"],
  },
  {
    name: "Killen & Dennis, P.C.",
    slug: "killen-and-dennis-pc",
    attorneyCount: 4,
    managingPartnerName: "Koy Killen",
    yearEstablished: 2005,
    tagline: "Boutique Probate, Estate Planning & Property Law in Burleson",
    bio: "A 4-attorney Burleson boutique led by Koy Killen and Clinton W. Dennis, providing meticulous estate administration, wills, trusts, and probate court representation.",
    websiteUrl: "https://www.kdlawpc.com",
    phone: "(817) 447-0053",
    address: "104 S Main Street",
    zipCode: "76028",
    citySlug: "burleson",
    countySlug: "tarrant-county",
    practiceAreaSlugs: ["probate-estate-planning"],
  },
  {
    name: "McCarty-Larson, PLLC",
    slug: "mccarty-larson-burleson",
    attorneyCount: 3,
    managingPartnerName: "Robin McCarty",
    yearEstablished: 2014,
    tagline: "Trial-Tested DWI, Criminal Defense & Family Advocacy in Burleson",
    bio: "Featuring former police officer and prosecutor Robin McCarty alongside Bria Larson and Dan Morton, McCarty-Larson brings 50+ years of combined courtroom skill to Burleson and Tarrant County.",
    websiteUrl: "https://mccartylarson.com",
    phone: "(817) 686-4863",
    address: "232 NW Tarrant Ave, #104",
    zipCode: "76028",
    citySlug: "burleson",
    countySlug: "tarrant-county",
    practiceAreaSlugs: ["criminal-defense-dwi", "family-law"],
  },

  // --- BENBROOK, TX ---
  {
    name: "Law Office of James D. Schull",
    slug: "law-office-of-james-d-schull",
    attorneyCount: 1,
    managingPartnerName: "James D. Schull",
    yearEstablished: 1996,
    tagline: "Benbrook Personal Injury Trial Lawyer & Probate Counsel",
    bio: "Rooted directly on Benbrook Blvd, solo practitioner James D. Schull offers personal legal representation for serious auto injuries, wrongful death, and Texas wills & probate matters.",
    websiteUrl: "https://jamesdschull.com",
    phone: "(817) 249-5300",
    address: "8507 Highway 377 S, Suite F",
    zipCode: "76126",
    citySlug: "benbrook",
    countySlug: "tarrant-county",
    practiceAreaSlugs: ["personal-injury", "probate-estate-planning"],
  },
  {
    name: "Alan Bowling, Attorney at Law",
    slug: "alan-bowling-attorney-benbrook",
    attorneyCount: 1,
    managingPartnerName: "Alan Bowling",
    yearEstablished: 1994,
    tagline: "Trusted Benbrook Family Law, Wills & Estate Administration",
    bio: "Providing steady, local courtroom representation and private consultations for Benbrook families navigating divorce, custody agreements, and comprehensive estate planning.",
    websiteUrl: "https://www.bowlinglaw.com",
    phone: "(817) 249-2067",
    address: "406 Mercedes Street, Suite A",
    zipCode: "76126",
    citySlug: "benbrook",
    countySlug: "tarrant-county",
    practiceAreaSlugs: ["family-law", "probate-estate-planning"],
  },

  // --- AZLE, TX ---
  {
    name: "The Murphree Law Firm",
    slug: "the-murphree-law-firm-azle",
    attorneyCount: 2,
    managingPartnerName: "D. Brent Murphree",
    yearEstablished: 1995,
    tagline: "Multi-Generational Azle Family Law & Probate Practice",
    bio: "Run by former Justice of the Peace Faye Murphree and former U.S. Army JAG Captain D. Brent Murphree, delivering principled family and probate representation in Azle and Northwest Tarrant County.",
    websiteUrl: "https://murphreelegal.com",
    phone: "(817) 270-0030",
    address: "337 W Main Street",
    zipCode: "76020",
    citySlug: "azle",
    countySlug: "tarrant-county",
    practiceAreaSlugs: ["family-law", "probate-estate-planning"],
  },
  {
    name: "Tyler Harden Law, P.C.",
    slug: "tyler-harden-law-azle",
    attorneyCount: 1,
    managingPartnerName: "Tyler A. Harden",
    yearEstablished: 2016,
    tagline: "Azle Estate Planning, Probate & Property Transaction Counsel",
    bio: "Serving Azle and Tarrant County residents with tailored estate planning, muniment of title probate proceedings, trusts, and real estate guidance.",
    websiteUrl: "https://www.tylerhardenlaw.com",
    phone: "(817) 444-9024",
    address: "415 W Main Street",
    zipCode: "76020",
    citySlug: "azle",
    countySlug: "tarrant-county",
    practiceAreaSlugs: ["probate-estate-planning"],
  },
];

const SOUTH_WEST_BATCH_PROS: IngestionProInput[] = [
  {
    businessName: "Quantum Chiropractic — Auto Injury & Rehab",
    slug: "quantum-chiropractic-burleson",
    category: "CHIROPRACTOR_MD",
    linkedPracticeSlug: "personal-injury",
    description: "Dedicated Burleson injury clinic specializing in auto collision whiplash, spinal decompression, and medical documentation under Letter of Protection (LOP) for injured victims.",
    websiteUrl: "https://myquantumchiro.com",
    phone: "(817) 447-1414",
    address: "1001 SW Wilshire Blvd, Suite D",
    zipCode: "76028",
    citySlug: "burleson",
    countySlug: "tarrant-county",
    acceptsLOP: true,
    is24Hours: false,
  },
  {
    businessName: "Essential Wellness of Burleson (Accident Rehab)",
    slug: "essential-wellness-burleson",
    category: "CHIROPRACTOR_MD",
    linkedPracticeSlug: "personal-injury",
    description: "Car accident recovery, musculoskeletal rehab, and injury evaluations coordinating closely with South Tarrant personal injury attorneys.",
    websiteUrl: "https://www.haygoodwellness.com",
    phone: "(817) 371-2551",
    address: "115 NW Newton Drive, Suite A",
    zipCode: "76028",
    citySlug: "burleson",
    countySlug: "tarrant-county",
    acceptsLOP: true,
    is24Hours: false,
  },
  {
    businessName: "A Way Out Bail Bonds (Benbrook & Burleson 24/7)",
    slug: "a-way-out-bail-bonds-tarrant",
    category: "BAIL_BONDS",
    linkedPracticeSlug: "criminal-defense-dwi",
    description: "24/7 rapid mobile bail bond service covering Benbrook, Burleson, Tarrant County Jail, and surrounding municipal holding facilities.",
    websiteUrl: "https://www.awayoutbonds.com",
    phone: "(817) 261-2828",
    address: "Serving Benbrook & South Tarrant County",
    zipCode: "76126",
    citySlug: "benbrook",
    countySlug: "tarrant-county",
    acceptsLOP: false,
    is24Hours: true,
  },
];

async function run() {
  const tarrant = await prisma.county.findUnique({ where: { slug: "tarrant-county" } });
  if (!tarrant) throw new Error("Tarrant County missing from database.");

  const newCities = [
    { name: "Burleson", slug: "burleson", zipCodes: "76028,76097", population: 53000 },
    { name: "Benbrook", slug: "benbrook", zipCodes: "76126,76116", population: 24500 },
    { name: "Azle", slug: "azle", zipCodes: "76020,76098", population: 13800 },
  ];

  for (const c of newCities) {
    await prisma.city.upsert({
      where: { slug: c.slug },
      update: { name: c.name, zipCodes: c.zipCodes, population: c.population },
      create: {
        name: c.name,
        slug: c.slug,
        countyId: tarrant.id,
        zipCodes: c.zipCodes,
        population: c.population,
      },
    });
  }

  console.log("Upserted Burleson, Benbrook, and Azle into database.");
  await ingestCityBatch({
    firms: SOUTH_WEST_BATCH_FIRMS,
    pros: SOUTH_WEST_BATCH_PROS,
  });
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
