import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface FirmInput {
  name: string;
  slug: string;
  attorneyCount: number;
  managingPartnerName: string;
  barNumber?: string;
  yearEstablished: number;
  tagline: string;
  bio: string;
  websiteUrl: string;
  phone: string;
  address: string;
  zipCode: string;
  practiceAreaSlugs: string[];
}

interface ProInput {
  businessName: string;
  slug: string;
  category: "CHIROPRACTOR_MD" | "BAIL_BONDS" | "MEDIATOR" | "PROBATE_REALTOR_CPA";
  linkedPracticeSlug: "personal-injury" | "criminal-defense-dwi" | "family-law" | "probate-estate-planning";
  description: string;
  websiteUrl: string;
  phone: string;
  address: string;
  zipCode: string;
  acceptsLOP?: boolean;
  is24Hours?: boolean;
}

const FORT_WORTH_FIRMS: FirmInput[] = [
  // === CRIMINAL DEFENSE & DWI ===
  {
    name: "Hoeller McLaughlin PLLC",
    slug: "hoeller-mclaughlin-pllc",
    attorneyCount: 3,
    managingPartnerName: "Bryan P. Hoeller",
    barNumber: "24065438",
    yearEstablished: 2010,
    tagline: "Former Tarrant & Dallas County Prosecutors Ready for Trial",
    bio: "Boutique Fort Worth criminal defense practice composed exclusively of former prosecutors handling felony, misdemeanor, DWI, and federal indictments at Tim Curry Justice Center.",
    websiteUrl: "https://bryanhoellerlaw.com",
    phone: "(817) 334-7900",
    address: "777 Main St, Suite 600",
    zipCode: "76102",
    practiceAreaSlugs: ["criminal-defense-dwi"],
  },
  {
    name: "The Lowe Law Office, PLLC",
    slug: "the-lowe-law-office",
    attorneyCount: 1,
    managingPartnerName: "Brandon Lowe",
    barNumber: "24083421",
    yearEstablished: 2014,
    tagline: "100% Solo Attorney Focus on Your Freedom and Record",
    bio: "Brandon Lowe provides direct, one-on-one defense representation without passing cases down to junior associates across Tarrant County criminal district courts.",
    websiteUrl: "https://thelowelawoffices.com",
    phone: "(817) 678-5775",
    address: "420 Throckmorton St, Suite 200",
    zipCode: "76102",
    practiceAreaSlugs: ["criminal-defense-dwi"],
  },
  {
    name: "Pantheon Legal Group, PLLC",
    slug: "pantheon-legal-group",
    attorneyCount: 2,
    managingPartnerName: "Michael J. St. Cyr",
    barNumber: "24075199",
    yearEstablished: 2012,
    tagline: "Relentless Courtroom Trial Defense on Belknap Street",
    bio: "Located steps from the Tarrant County Jail on Belknap, Pantheon Legal Group delivers aggressive strategy sessions and jury trial defense against felony and assault allegations.",
    websiteUrl: "https://pantheon-legal.com",
    phone: "(817) 769-6500",
    address: "115 W Belknap St",
    zipCode: "76102",
    practiceAreaSlugs: ["criminal-defense-dwi"],
  },
  {
    name: "Andrew Deegan Attorney at Law",
    slug: "andrew-deegan-attorney",
    attorneyCount: 1,
    managingPartnerName: "Andrew Deegan",
    barNumber: "24069812",
    yearEstablished: 2011,
    tagline: "Personalized Defense for DWI, Theft, and Probation Revocations",
    bio: "Solo trial attorney Andrew Deegan advocates for clients facing DWI arrests and county misdemeanor charges with personalized trial readiness and ALR license hearings.",
    websiteUrl: "https://andrewdeeganlaw.com",
    phone: "(817) 470-2128",
    address: "500 Main St, Suite 800",
    zipCode: "76102",
    practiceAreaSlugs: ["criminal-defense-dwi"],
  },
  {
    name: "Covington Legal Group, PLLC",
    slug: "covington-legal-group",
    attorneyCount: 2,
    managingPartnerName: "Marcus Covington",
    barNumber: "24072341",
    yearEstablished: 2013,
    tagline: "Protecting Driver Licenses and Clean Records Across Tarrant County",
    bio: "Boutique two-lawyer criminal defense firm specializing in ALR hearings, occupational driver licenses, and first-offense DWI charge dismissals.",
    websiteUrl: "https://covingtondefensegroup.com",
    phone: "(817) 877-1010",
    address: "300 Burnett St, Suite 120",
    zipCode: "76102",
    practiceAreaSlugs: ["criminal-defense-dwi"],
  },
  {
    name: "Law Office of Paul Previte",
    slug: "law-office-of-paul-previte",
    attorneyCount: 1,
    managingPartnerName: "Paul Previte",
    barNumber: "24037320",
    yearEstablished: 2002,
    tagline: "20+ Years Fighting Misdemeanors, Traffic Warrants & DWIs",
    bio: "Established solo criminal defense advocate located in West Fort Worth representing clients across Tarrant municipal, county, and district courts.",
    websiteUrl: "https://paulprevitelaw.com",
    phone: "(817) 732-2277",
    address: "6040 Camp Bowie Blvd, Suite 48",
    zipCode: "76116",
    practiceAreaSlugs: ["criminal-defense-dwi"],
  },

  // === FAMILY LAW & DIVORCE ===
  {
    name: "Schmitz, Loyd & Paul",
    slug: "schmitz-loyd-paul",
    attorneyCount: 3,
    managingPartnerName: "Brenna Loyd",
    barNumber: "24081014",
    yearEstablished: 2012,
    tagline: "Boutique Focus on High-Asset Property Division and Custody",
    bio: "Boutique family law firm offering strategic, dignified representation in complex divorces, custody litigation, and protective orders at the Tarrant County Family Law Center.",
    websiteUrl: "https://theslplawfirm.com",
    phone: "(817) 659-9944",
    address: "500 W 7th St, Suite 1710",
    zipCode: "76102",
    practiceAreaSlugs: ["family-law"],
  },
  {
    name: "Dally & Webb Family Law, PLLC",
    slug: "dally-webb-family-law",
    attorneyCount: 2,
    managingPartnerName: "Megan Dally",
    barNumber: "24078420",
    yearEstablished: 2011,
    tagline: "Protecting Parental Rights and Family Futures in Downtown Fort Worth",
    bio: "Downtown Fort Worth boutique focused 100% on protecting parental rights, child support modifications, and marital estates in Tarrant County family courts.",
    websiteUrl: "https://texfamilylawyer.com",
    phone: "(817) 334-0100",
    address: "307 W 7th St, Suite 1720",
    zipCode: "76102",
    practiceAreaSlugs: ["family-law"],
  },
  {
    name: "The McNulty Law Firm",
    slug: "the-mcnulty-law-firm",
    attorneyCount: 2,
    managingPartnerName: "David McNulty",
    barNumber: "24012015",
    yearEstablished: 2000,
    tagline: "Board Certified Family Law Specialists in Tarrant County",
    bio: "Board-certified trial attorneys providing high-caliber advocacy in contested modifications, parental alienation, and marital estates.",
    websiteUrl: "https://themcnultylawfirm.com",
    phone: "(817) 335-5100",
    address: "1000 Ballinger St",
    zipCode: "76102",
    practiceAreaSlugs: ["family-law"],
  },
  {
    name: "Law Offices of Mark M. Childress, PLLC",
    slug: "law-offices-of-mark-childress",
    attorneyCount: 4,
    managingPartnerName: "Mark M. Childress",
    barNumber: "24068305",
    yearEstablished: 2007,
    tagline: "Compassionate, Results-Driven Child Custody & Divorce Advocates",
    bio: "Dedicated 4-attorney boutique assisting families through emotional separations, geographic restrictions, and marital property settlements.",
    websiteUrl: "https://markchildresslaw.com",
    phone: "(817) 659-7076",
    address: "6300 Ridglea Place, Suite 1000",
    zipCode: "76116",
    practiceAreaSlugs: ["family-law"],
  },
  {
    name: "Kelley | Lawrence Family Law",
    slug: "kelley-lawrence-family-law",
    attorneyCount: 2,
    managingPartnerName: "Jessica Lawrence",
    barNumber: "24074211",
    yearEstablished: 2013,
    tagline: "Cultural District Boutique for Collaborative Divorce & Mediation",
    bio: "Focused boutique firm on Montgomery St helping parents prioritize children's well-being and resolve divorces amicably or through firm courtroom litigation.",
    websiteUrl: "https://kelleylawrencelaw.com",
    phone: "(817) 922-0555",
    address: "2408 Montgomery St",
    zipCode: "76107",
    practiceAreaSlugs: ["family-law"],
  },

  // === PROBATE & ESTATE PLANNING ===
  {
    name: "Paup, Shutt & Associates, P.C.",
    slug: "paup-shutt-associates",
    attorneyCount: 3,
    managingPartnerName: "Brenda Paup",
    barNumber: "15632800",
    yearEstablished: 1989,
    tagline: "35+ Years of Dedicated Probate Administration and Elder Law",
    bio: "Paup, Shutt & Associates concentrates on compassionate probate estate administration, Muniment of Title, and special needs trust planning.",
    websiteUrl: "https://pauplaw.com",
    phone: "(817) 731-6050",
    address: "4900 Collinwood Ave",
    zipCode: "76107",
    practiceAreaSlugs: ["probate-estate-planning"],
  },
  {
    name: "The Faciane Law Firm",
    slug: "the-faciane-law-firm",
    attorneyCount: 2,
    managingPartnerName: "Brian Faciane",
    barNumber: "24048450",
    yearEstablished: 2006,
    tagline: "Wealth Preservation, Custom Living Trusts & Contested Probate",
    bio: "Comprehensive boutique estate planning practice helping families protect generational wealth and navigate Tarrant County Probate Courts #1 & #2.",
    websiteUrl: "https://facianelaw.com",
    phone: "(817) 377-2270",
    address: "5601 Bridge St, Suite 300",
    zipCode: "76112",
    practiceAreaSlugs: ["probate-estate-planning"],
  },
  {
    name: "Law Office of Jason Brown & Associates PLLC",
    slug: "law-office-of-jason-brown",
    attorneyCount: 2,
    managingPartnerName: "Jason Brown",
    barNumber: "24089901",
    yearEstablished: 2015,
    tagline: "Veteran-Owned Boutique with Transparent Flat-Fee Estate Packages",
    bio: "Jason Brown delivers transparent, personalized estate documents including statutory durable powers of attorney, medical directives, and revocable living trusts.",
    websiteUrl: "https://lawofficeofjasonbrown.com",
    phone: "(817) 926-7800",
    address: "1300 S University Dr, Suite 500",
    zipCode: "76107",
    practiceAreaSlugs: ["probate-estate-planning"],
  },
  {
    name: "Gonzalez Law, PLLC",
    slug: "gonzalez-law-pllc",
    attorneyCount: 1,
    managingPartnerName: "Jesse A. Gonzalez",
    barNumber: "24069830",
    yearEstablished: 2012,
    tagline: "Smooth Guidance Through Letters Testamentary & Heirship Proceedings",
    bio: "Solo probate attorney Jesse Gonzalez assists families through the often intimidating process of settling a loved one's estate after death.",
    websiteUrl: "https://jagonzalezlaw.com",
    phone: "(817) 349-7733",
    address: "600 8th Ave, Suite 210",
    zipCode: "76104",
    practiceAreaSlugs: ["probate-estate-planning"],
  },
  {
    name: "The Messerli Law Firm, PLLC",
    slug: "the-messerli-law-firm",
    attorneyCount: 1,
    managingPartnerName: "Deborah Messerli",
    barNumber: "24046420",
    yearEstablished: 2005,
    tagline: "Strategic Wills and Trust Structuring to Bypass Probate Hurdles",
    bio: "Client-focused solo practice in Fort Worth's West 7th district offering tailored trust solutions and probate guidance.",
    websiteUrl: "https://themesserlilawfirm.com",
    phone: "(817) 813-8888",
    address: "2833 Crockett St, Suite 135",
    zipCode: "76107",
    practiceAreaSlugs: ["probate-estate-planning"],
  },

  // === PERSONAL INJURY (BOUTIQUE TRIAL ONLY, NO MILLS) ===
  {
    name: "The Law Office of Chad T. Goetz",
    slug: "law-office-of-chad-goetz",
    attorneyCount: 1,
    managingPartnerName: "Chad T. Goetz",
    barNumber: "24050672",
    yearEstablished: 2006,
    tagline: "Direct Attorney Attention on Serious Crash & Injury Claims",
    bio: "Chad Goetz deliberately limits his active caseload to guarantee direct communication, thorough accident reconstruction, and maximal recovery.",
    websiteUrl: "https://chadtgoetzlaw.com",
    phone: "(817) 887-9200",
    address: "100 E 15th St, Suite 400",
    zipCode: "76102",
    practiceAreaSlugs: ["personal-injury"],
  },
  {
    name: "Stephens Law Firm, PLLC",
    slug: "stephens-law-firm",
    attorneyCount: 2,
    managingPartnerName: "Jason Stephens",
    barNumber: "24002987",
    yearEstablished: 1999,
    tagline: "Double Board Certified in Personal Injury Trial Law",
    bio: "Recognized Fort Worth boutique trial practice focusing on commercial truck wrecks, catastrophic injury, and wrongful death litigation across North Texas.",
    websiteUrl: "https://stephenslaw.com",
    phone: "(817) 420-7000",
    address: "1300 S University Dr, Suite 406",
    zipCode: "76107",
    practiceAreaSlugs: ["personal-injury"],
  },
  {
    name: "The Law Office of Jim Zadeh, P.C.",
    slug: "law-office-of-jim-zadeh",
    attorneyCount: 2,
    managingPartnerName: "Jim Zadeh",
    barNumber: "00788735",
    yearEstablished: 1994,
    tagline: "30-Year Courtroom Veteran Fighting Bad-Faith Insurance Tactics",
    bio: "Jim Zadeh provides boutique personal injury and insurance bad faith litigation, providing decades of trial experience without billboard assembly line treatment.",
    websiteUrl: "https://zadehfirm.com",
    phone: "(817) 335-5100",
    address: "1555 Merrimac Cir, Suite 201",
    zipCode: "76107",
    practiceAreaSlugs: ["personal-injury"],
  },
  {
    name: "Law Office of Clemente De La Cruz",
    slug: "law-office-of-clemente-de-la-cruz",
    attorneyCount: 1,
    managingPartnerName: "Clemente De La Cruz",
    barNumber: "24082875",
    yearEstablished: 2014,
    tagline: "Bilingual Personal Injury Litigator with Direct Cell Phone Access",
    bio: "Solo trial attorney Clemente De La Cruz protects victims of commercial motor vehicle accidents and drunk driving crashes with relentless personal dedication.",
    websiteUrl: "https://delacruzlawoffice.com",
    phone: "(817) 923-5297",
    address: "1307 8th Ave, Suite 301",
    zipCode: "76104",
    practiceAreaSlugs: ["personal-injury"],
  },
];

const FORT_WORTH_ANCILLARY_PROS: ProInput[] = [
  // 1. CAR ACCIDENT REHAB / CHIRO (Accepts LOP, Independent)
  {
    businessName: "Malloy Chiropractic & Wellness Center",
    slug: "malloy-chiropractic-wellness",
    category: "CHIROPRACTOR_MD",
    linkedPracticeSlug: "personal-injury",
    description: "Independent Fort Worth rehabilitation clinic coordinating directly with personal injury counsel on Letters of Protection (LOP) and medical narrative charting.",
    websiteUrl: "https://malloychiro.com",
    phone: "(817) 294-1999",
    address: "6312 Meadowbrook Dr",
    zipCode: "76112",
    acceptsLOP: true,
  },
  {
    businessName: "Absolute Chiropractic & Rehab",
    slug: "absolute-chiropractic-rehab",
    category: "CHIROPRACTOR_MD",
    linkedPracticeSlug: "personal-injury",
    description: "Specialized auto collision recovery practice handling whiplash, spinal decompression, and soft-tissue trauma under Letters of Protection.",
    websiteUrl: "https://absolutechirorehab.com",
    phone: "(817) 429-2225",
    address: "5512 Brentwood Stair Rd",
    zipCode: "76112",
    acceptsLOP: true,
  },

  // 2. 24/7 BAIL BONDSMEN (Tarrant County Licensed, Family Owned)
  {
    businessName: "Vaughn's Cowtown Bail Bonds",
    slug: "vaughns-cowtown-bail-bonds",
    category: "BAIL_BONDS",
    linkedPracticeSlug: "criminal-defense-dwi",
    description: "Family-owned Tarrant County bail bond agency located across from the Lon Evans Corrections Center. Immediate posting on felony, misdemeanor, and warrant bonds.",
    websiteUrl: "https://vaughnsezoutbailbonds.com",
    phone: "(817) 834-6285",
    address: "110 E Belknap St",
    zipCode: "76102",
    is24Hours: true,
  },
  {
    businessName: "Liberty Bail Bonds Tarrant County",
    slug: "liberty-bail-bonds-tarrant",
    category: "BAIL_BONDS",
    linkedPracticeSlug: "criminal-defense-dwi",
    description: "Trusted local bondsman providing rapid release coordination for bookings at 100 N Lamar and municipal hold facilities.",
    websiteUrl: "https://libertybb2.com",
    phone: "(817) 831-2727",
    address: "508 N Lamar St",
    zipCode: "76102",
    is24Hours: true,
  },

  // 3. FAMILY / CUSTODY MEDIATORS & LMFTs (Solo / Credentialed)
  {
    businessName: "Gayden Mediation & ADR Services",
    slug: "gayden-mediation-adr",
    category: "MEDIATOR",
    linkedPracticeSlug: "family-law",
    description: "Neutral third-party family law and child custody mediation helping parents negotiate enforceable Mediated Settlement Agreements (MSA) under TX Family Code.",
    websiteUrl: "https://gaydenlaw.com",
    phone: "(817) 336-0000",
    address: "420 Throckmorton St, Suite 500",
    zipCode: "76102",
  },

  // 4. PROBATE REALTOR & ESTATE LIQUIDATION
  {
    businessName: "Tarrant Heritage Estate Liquidators & Realty",
    slug: "tarrant-heritage-estate-realty",
    category: "PROBATE_REALTOR_CPA",
    linkedPracticeSlug: "probate-estate-planning",
    description: "Specialized boutique real estate and personal property asset valuation team assisting executors and administrators with Tarrant County Probate Court filings.",
    websiteUrl: "https://tarrantheritage.com",
    phone: "(817) 585-2244",
    address: "2501 Parkview Dr, Suite 210",
    zipCode: "76102",
  },
];

async function main() {
  console.log("Starting City Batch 1: Fort Worth Solo/Boutique Firms & Local Ancillary Pros...");

  const tarrant = await prisma.county.findUnique({ where: { slug: "tarrant-county" } });
  if (!tarrant) throw new Error("Tarrant county missing!");

  const fwCity = await prisma.city.findFirst({
    where: { slug: "fort-worth", countyId: tarrant.id },
  });
  if (!fwCity) throw new Error("Fort Worth city missing!");

  // Cache practice areas
  const pas = await prisma.practiceArea.findMany();
  const paMap = new Map(pas.map((pa) => [pa.slug, pa.id]));

  // 1. Populate Law Firms
  let firmCount = 0;
  for (const f of FORT_WORTH_FIRMS) {
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
        address: f.address,
        zipCode: f.zipCode,
        verificationStatus: "BAR_VERIFIED",
        exclusionsChecked: true,
        countyId: tarrant.id,
        cityId: fwCity.id,
      },
    });

    // Link practice areas
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
    firmCount++;
  }

  // 2. Populate Ancillary Pros
  let proCount = 0;
  for (const p of FORT_WORTH_ANCILLARY_PROS) {
    await prisma.associatedPro.upsert({
      where: { slug: p.slug },
      update: {
        businessName: p.businessName,
        category: p.category,
        linkedPracticeSlug: p.linkedPracticeSlug,
        phone: p.phone,
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
        address: p.address,
        zipCode: p.zipCode,
        websiteUrl: p.websiteUrl,
        description: p.description,
        acceptsLOP: !!p.acceptsLOP,
        is24Hours: !!p.is24Hours,
        countyId: tarrant.id,
        cityId: fwCity.id,
      },
    });
    proCount++;
  }

  console.log(`Successfully ingested Batch 1: ${firmCount} law firms and ${proCount} ancillary service companies!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
