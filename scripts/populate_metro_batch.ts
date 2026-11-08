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
  citySlug: string;
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
  citySlug: string;
  acceptsLOP?: boolean;
  is24Hours?: boolean;
}

const NEW_METRO_FIRMS: FirmInput[] = [
  // ==========================================
  // ARLINGTON FIRMS
  // ==========================================
  {
    name: "The Garrett Law Office, PLLC",
    slug: "the-garrett-law-office",
    attorneyCount: 2,
    managingPartnerName: "C. Garrett",
    barNumber: "24078512",
    yearEstablished: 2012,
    tagline: "Dedicated Arlington Trial Advocacy in Criminal Defense & Personal Injury",
    bio: "Boutique trial practice on Lamar Blvd in Arlington providing aggressive defense against felony/misdemeanor charges and handling serious personal injury claims.",
    websiteUrl: "https://thegarrettlawoffices.com",
    phone: "(817) 226-4100",
    address: "2000 E Lamar Blvd, Suite 600",
    zipCode: "76006",
    citySlug: "arlington",
    practiceAreaSlugs: ["criminal-defense-dwi", "personal-injury"],
  },
  {
    name: "Willett Law PLLC",
    slug: "willett-law-pllc",
    attorneyCount: 1,
    managingPartnerName: "Brian Willett",
    barNumber: "24042168",
    yearEstablished: 2004,
    tagline: "Double Board-Certified in Criminal Law & Juvenile Law",
    bio: "Brian Willett provides exceptional solo criminal defense, backed by double board certification from the Texas Board of Legal Specialization.",
    websiteUrl: "https://brianwillettlaw.com",
    phone: "(817) 877-3800",
    address: "201 W Main St, Suite 201",
    zipCode: "76010",
    citySlug: "arlington",
    practiceAreaSlugs: ["criminal-defense-dwi"],
  },
  {
    name: "Brandy Austin Law Firm, PLLC",
    slug: "brandy-austin-law-firm",
    attorneyCount: 4,
    managingPartnerName: "Brandy Austin",
    barNumber: "24068370",
    yearEstablished: 2008,
    tagline: "Comprehensive Family Law, Estate Planning, and Injury Solutions in Arlington",
    bio: "Client-centered 4-lawyer boutique offering compassionate divorce counsel, contested child custody representation, and tailored wills & probate administration.",
    websiteUrl: "https://brandyaustinlaw.com",
    phone: "(817) 841-9906",
    address: "2404 Roosevelt Dr",
    zipCode: "76016",
    citySlug: "arlington",
    practiceAreaSlugs: ["family-law", "probate-estate-planning", "personal-injury"],
  },
  {
    name: "Robinson & Smart, P.C.",
    slug: "robinson-and-smart-pc",
    attorneyCount: 3,
    managingPartnerName: "T. Robinson",
    barNumber: "17112000",
    yearEstablished: 1995,
    tagline: "30-Year Established South Arlington Family, Criminal & Probate Advocates",
    bio: "Longstanding Arlington law firm on Little Road assisting individuals and families through contentious divorces, criminal court allegations, and estate settlement.",
    websiteUrl: "https://robinsonandsmartpc.com",
    phone: "(817) 654-2000",
    address: "4214 Little Rd, Suite 2000",
    zipCode: "76016",
    citySlug: "arlington",
    practiceAreaSlugs: ["family-law", "criminal-defense-dwi", "probate-estate-planning"],
  },
  {
    name: "Law Office of Andy Nguyen, PLLC",
    slug: "law-office-of-andy-nguyen",
    attorneyCount: 1,
    managingPartnerName: "Andy Nguyen",
    barNumber: "24088120",
    yearEstablished: 2013,
    tagline: "Accessible Solo Legal Counsel for Family, Probate, and Criminal Matters",
    bio: "Solo practice offering direct attorney consultations, bilingual services, and hands-on guidance for Arlington residents facing family disputes or probate filings.",
    websiteUrl: "https://andynguyenlaw.com",
    phone: "(817) 704-3984",
    address: "1008 W Pioneer Pkwy",
    zipCode: "76013",
    citySlug: "arlington",
    practiceAreaSlugs: ["family-law", "probate-estate-planning"],
  },
  {
    name: "Law Office of Steve Le, PLLC",
    slug: "law-office-of-steve-le",
    attorneyCount: 1,
    managingPartnerName: "Steve Le",
    barNumber: "24079815",
    yearEstablished: 2012,
    tagline: "Dedicated Solo Counsel for Criminal Defense, Family & Estate Planning",
    bio: "Steve Le delivers focused solo legal representation for clients in Arlington municipal and Tarrant County district courts.",
    websiteUrl: "https://stevelelaw.com",
    phone: "(817) 633-9000",
    address: "1317 E Pioneer Pkwy",
    zipCode: "76010",
    citySlug: "arlington",
    practiceAreaSlugs: ["criminal-defense-dwi", "family-law", "probate-estate-planning"],
  },
  {
    name: "The Kafor Law Firm, PLLC",
    slug: "the-kafor-law-firm",
    attorneyCount: 2,
    managingPartnerName: "Y. Kafor",
    barNumber: "24071090",
    yearEstablished: 2010,
    tagline: "Boutique Personal Injury Advocates Protecting Accident Victims in Arlington",
    bio: "Focused boutique litigation firm dedicated to car crashes, pedestrian accidents, and commercial vehicle collisions without assembly line treatment.",
    websiteUrl: "https://thekaforlawfirm.com",
    phone: "(817) 642-8888",
    address: "1600 E Pioneer Pkwy, Suite 520",
    zipCode: "76010",
    citySlug: "arlington",
    practiceAreaSlugs: ["personal-injury"],
  },
  {
    name: "The Family Law Firm of Donna J. Smiedt",
    slug: "donna-smiedt-family-law",
    attorneyCount: 2,
    managingPartnerName: "Donna J. Smiedt",
    barNumber: "18512500",
    yearEstablished: 1986,
    tagline: "Board Certified in Family Law — Serving Arlington for 35+ Years",
    bio: "Renowned Arlington family law boutique specializing in complex custody disputes, contested property division, and collaborative divorce.",
    websiteUrl: "https://arlingtondivorces.com",
    phone: "(817) 572-9900",
    address: "3216 W Park Row Dr",
    zipCode: "76013",
    citySlug: "arlington",
    practiceAreaSlugs: ["family-law"],
  },

  // ==========================================
  // SOUTHLAKE & GRAPEVINE FIRMS
  // ==========================================
  {
    name: "Law Office of Dana L. White, PLLC",
    slug: "dana-white-family-law",
    attorneyCount: 3,
    managingPartnerName: "Dana L. White",
    barNumber: "24003180",
    yearEstablished: 2002,
    tagline: "Premier Southlake Boutique for High-Asset Divorce and Family Law",
    bio: "Boutique Southlake family law firm known for sophisticated representation in complex marital estates, business valuations, and contested child custody.",
    websiteUrl: "https://danawhitefamilylaw.com",
    phone: "(817) 541-7101",
    address: "540 Silicon Dr, Suite 100",
    zipCode: "76092",
    citySlug: "southlake",
    practiceAreaSlugs: ["family-law"],
  },
  {
    name: "The Houser Firm, P.C.",
    slug: "the-houser-firm",
    attorneyCount: 3,
    managingPartnerName: "Mark Houser",
    barNumber: "24035610",
    yearEstablished: 2009,
    tagline: "Sophisticated Estate Planning, Trusts & Probate Administration in Southlake",
    bio: "Southlake boutique firm specializing in high-net-worth estate planning, generation-skipping trusts, asset protection, and formal probate proceedings.",
    websiteUrl: "https://houserfirm.com",
    phone: "(817) 481-2710",
    address: "950 E State Hwy 114, Suite 160",
    zipCode: "76092",
    citySlug: "southlake",
    practiceAreaSlugs: ["probate-estate-planning"],
  },
  {
    name: "Kourosh Law Firm, PLLC",
    slug: "kourosh-law-firm",
    attorneyCount: 1,
    managingPartnerName: "Kourosh Naderi",
    barNumber: "24085430",
    yearEstablished: 2014,
    tagline: "Boutique Estate Planning, Probate and Small Business Succession",
    bio: "Solo practice offering personalized legacy planning, revocable trusts, powers of attorney, and smooth probate court administration for Southlake families.",
    websiteUrl: "https://estatelawyerstx.com",
    phone: "(817) 416-2020",
    address: "1560 E Southlake Blvd, Suite 100",
    zipCode: "76092",
    citySlug: "southlake",
    practiceAreaSlugs: ["probate-estate-planning"],
  },
  {
    name: "Teller Law Firm, P.C.",
    slug: "teller-law-firm",
    attorneyCount: 2,
    managingPartnerName: "Donald E. Teller Jr.",
    barNumber: "19765200",
    yearEstablished: 1998,
    tagline: "Grapevine Family Law Advocates for Custody, Support & Marital Property",
    bio: "Grapevine boutique firm with over two decades handling contested and uncontested divorces, custody modifications, and parenting agreements.",
    websiteUrl: "https://dtellerlaw.com",
    phone: "(817) 612-4298",
    address: "1401 E Ball St",
    zipCode: "76051",
    citySlug: "grapevine",
    practiceAreaSlugs: ["family-law"],
  },
  {
    name: "Traci Hutton, Attorney at Law",
    slug: "traci-hutton-law",
    attorneyCount: 1,
    managingPartnerName: "Traci Hutton",
    barNumber: "24059985",
    yearEstablished: 2007,
    tagline: "Grapevine Solo Practice for Estate Planning, Wills, Trusts & Family Transitions",
    bio: "Traci Hutton provides dedicated, personalized counsel for individuals and families crafting estate plans, navigating probate, and resolving family issues.",
    websiteUrl: "https://tracihutton.com",
    phone: "(817) 870-1333",
    address: "1701 W Northwest Hwy, Suite 100",
    zipCode: "76051",
    citySlug: "grapevine",
    practiceAreaSlugs: ["probate-estate-planning", "family-law"],
  },

  // ==========================================
  // KELLER & COLLEYVILLE FIRMS
  // ==========================================
  {
    name: "HLAW - Howard, Lotspeich, Alexander & Williams, PLLC",
    slug: "hlaw-keller",
    attorneyCount: 4,
    managingPartnerName: "Justin Alexander",
    barNumber: "24068990",
    yearEstablished: 2011,
    tagline: "Premier Keller Boutique for Criminal Trial Defense and Family Law",
    bio: "Dynamic Keller law firm of seasoned trial lawyers handling felony indictments, DWI defense, and complex child custody disputes across Northeast Tarrant County.",
    websiteUrl: "https://bhwlawfirm.com",
    phone: "(817) 382-8000",
    address: "750 Keller Pkwy, Suite 100",
    zipCode: "76248",
    citySlug: "keller",
    practiceAreaSlugs: ["criminal-defense-dwi", "family-law"],
  },
  {
    name: "The Irby Law Firm, PLLC",
    slug: "the-irby-law-firm",
    attorneyCount: 2,
    managingPartnerName: "K. Irby",
    barNumber: "24076500",
    yearEstablished: 2012,
    tagline: "Dedicated Keller Boutique for Estate Planning, Trusts & Texas Probate",
    bio: "Boutique, family-focused firm guiding Keller and Fort Worth residents through wills, healthcare directives, special needs trusts, and estate administration.",
    websiteUrl: "https://kellerlawyer.com",
    phone: "(817) 741-5291",
    address: "101 S Main St, Suite B",
    zipCode: "76248",
    citySlug: "keller",
    practiceAreaSlugs: ["probate-estate-planning"],
  },
  {
    name: "Youngblood Law, PLLC",
    slug: "youngblood-law-pllc",
    attorneyCount: 2,
    managingPartnerName: "Paul Youngblood",
    barNumber: "24089945",
    yearEstablished: 2014,
    tagline: "Compassionate, Strategic Child Custody and Family Law in Keller",
    bio: "Paul Youngblood assists parents with child-first custody modifications, enforcement of divorce decrees, and amicable uncontested divorce resolutions.",
    websiteUrl: "https://youngblood-law.com",
    phone: "(817) 601-5345",
    address: "251 Town Center Ln, Suite 2101",
    zipCode: "76248",
    citySlug: "keller",
    practiceAreaSlugs: ["family-law"],
  },
  {
    name: "Justice Law Firm, PC",
    slug: "justice-law-firm",
    attorneyCount: 2,
    managingPartnerName: "C. Justice",
    barNumber: "24041180",
    yearEstablished: 2005,
    tagline: "Keller Family Law, Estate Planning & Probate Counsel",
    bio: "Serving Keller families for two decades with compassionate, tailored legal strategies for divorce, guardianship, and probate court hearings.",
    websiteUrl: "https://justicelawdfw.com",
    phone: "(817) 431-0009",
    address: "4110 Heritage Trace Pkwy, Suite 300",
    zipCode: "76244",
    citySlug: "keller",
    practiceAreaSlugs: ["family-law", "probate-estate-planning"],
  },
  {
    name: "Law Office of Kate Smith, PLLC",
    slug: "law-office-of-kate-smith",
    attorneyCount: 2,
    managingPartnerName: "Kate Smith",
    barNumber: "24027800",
    yearEstablished: 2003,
    tagline: "Board Certified in Family Law by Texas Board of Legal Specialization",
    bio: "Colleyville family law boutique recognized for board-certified mastery in high-conflict divorce, custody evaluations, and collaborative resolution.",
    websiteUrl: "https://katesmithlaw.com",
    phone: "(817) 479-0565",
    address: "1205 Hall Johnson Rd, Suite 2",
    zipCode: "76034",
    citySlug: "colleyville",
    practiceAreaSlugs: ["family-law"],
  },
  {
    name: "Early Law Firm, PLLC",
    slug: "early-law-firm",
    attorneyCount: 1,
    managingPartnerName: "Stephen Early",
    barNumber: "24056210",
    yearEstablished: 2008,
    tagline: "Colleyville Main Street Estate Planning, Trusts & Probate Practice",
    bio: "Stephen Early provides thorough, tailored estate planning documents, living trusts, and smooth probate court representation on Main Street in Colleyville.",
    websiteUrl: "https://earlylawfirm.com",
    phone: "(817) 500-0192",
    address: "5105 Colleyville Blvd, Suite 220",
    zipCode: "76034",
    citySlug: "colleyville",
    practiceAreaSlugs: ["probate-estate-planning"],
  },

  // ==========================================
  // MANSFIELD FIRMS
  // ==========================================
  {
    name: "Law Office of Michael Muñoz",
    slug: "law-office-of-michael-munoz",
    attorneyCount: 1,
    managingPartnerName: "Michael Muñoz",
    barNumber: "24075210",
    yearEstablished: 2011,
    tagline: "Mansfield Solo Trial Practice for Criminal Defense, Family & Injury",
    bio: "Direct attorney-client advocacy for Mansfield and South Tarrant residents facing criminal charges, child custody disputes, or auto collisions.",
    websiteUrl: "https://munozlawdfw.com",
    phone: "(817) 225-4422",
    address: "1200 S Main St, Suite 100",
    zipCode: "76063",
    citySlug: "mansfield",
    practiceAreaSlugs: ["criminal-defense-dwi", "family-law", "personal-injury"],
  },
  {
    name: "Crocker Russell & Associates",
    slug: "crocker-russell-associates",
    attorneyCount: 3,
    managingPartnerName: "Kimberly Crocker",
    barNumber: "24065090",
    yearEstablished: 2009,
    tagline: "Mansfield Boutique for Divorce, Child Custody & Civil Litigation",
    bio: "Dedicated Mansfield legal team offering strategic advocacy for families in divorce proceedings, custody modifications, and civil dispute resolution.",
    websiteUrl: "https://crockerrusselllaw.com",
    phone: "(817) 482-6570",
    address: "305 Regency Pkwy, Suite 501",
    zipCode: "76063",
    citySlug: "mansfield",
    practiceAreaSlugs: ["family-law"],
  },
  {
    name: "Daniell Law Group",
    slug: "daniell-law-group",
    attorneyCount: 2,
    managingPartnerName: "Sarah Daniell",
    barNumber: "24083040",
    yearEstablished: 2013,
    tagline: "Personalized Family Law & Child Custody Advocates in Tarrant County",
    bio: "Boutique practice guiding parents through contentious divorces, geographic restriction disputes, and child support enforcements across Tarrant County family courts.",
    websiteUrl: "https://danielllawgroup.com",
    phone: "(817) 453-4000",
    address: "1000 Heritage Pkwy",
    zipCode: "76063",
    citySlug: "mansfield",
    practiceAreaSlugs: ["family-law"],
  },
];

const NEW_METRO_PROS: ProInput[] = [
  // ARLINGTON ANCILLARY PROS
  {
    businessName: "A Way Out Bail Bonds",
    slug: "a-way-out-bail-bonds-arlington",
    category: "BAIL_BONDS",
    linkedPracticeSlug: "criminal-defense-dwi",
    description: "24/7 licensed Tarrant County bail bond agency located directly across from the Arlington City Jail. Instant release coordination on municipal and county warrants.",
    websiteUrl: "https://awayoutbonds.com",
    phone: "(817) 261-2828",
    address: "633 W Division St, Suite A",
    zipCode: "76011",
    citySlug: "arlington",
    is24Hours: true,
  },
  {
    businessName: "Just Bail Bonds Arlington",
    slug: "just-bail-bonds-arlington",
    category: "BAIL_BONDS",
    linkedPracticeSlug: "criminal-defense-dwi",
    description: "Fast, confidential 24-hour bail bondsman stationed on West Division Street. Experienced with Arlington Police Department bookings and Tarrant transfers.",
    websiteUrl: "https://justbailbond.com",
    phone: "(817) 303-3400",
    address: "633 W Division St",
    zipCode: "76011",
    citySlug: "arlington",
    is24Hours: true,
  },
  {
    businessName: "Tricare Chiropractic, P.A.",
    slug: "tricare-chiropractic-arlington",
    category: "CHIROPRACTOR_MD",
    linkedPracticeSlug: "personal-injury",
    description: "Independent auto injury rehabilitation clinic explicitly accepting Letters of Protection (LOP) and working directly with local personal injury trial attorneys.",
    websiteUrl: "https://tricarechiro.com",
    phone: "(817) 465-2225",
    address: "2315 Roosevelt Dr, Suite B",
    zipCode: "76016",
    citySlug: "arlington",
    acceptsLOP: true,
  },
  {
    businessName: "Heal 360 Rehab Arlington",
    slug: "heal-360-rehab-arlington",
    category: "CHIROPRACTOR_MD",
    linkedPracticeSlug: "personal-injury",
    description: "Multi-disciplinary auto collision recovery center providing diagnostic evaluations, spinal rehab, and StemWave therapy under Letters of Protection.",
    websiteUrl: "https://heal360rehab.com",
    phone: "(817) 779-3600",
    address: "3939 W Green Oaks Blvd, Suite 100",
    zipCode: "76016",
    citySlug: "arlington",
    acceptsLOP: true,
  },
  {
    businessName: "Arlington Family Mediation Services",
    slug: "arlington-family-mediation",
    category: "MEDIATOR",
    linkedPracticeSlug: "family-law",
    description: "Independent credentialed dispute resolution group assisting parents and divorce counsel in drafting binding Mediated Settlement Agreements (MSAs).",
    websiteUrl: "https://arlingtonfamilymediation.com",
    phone: "(817) 275-1100",
    address: "2000 E Lamar Blvd, Suite 500",
    zipCode: "76006",
    citySlug: "arlington",
  },

  // SOUTHLAKE & GRAPEVINE ANCILLARY PROS
  {
    businessName: "Southlake Mediation & Collaborative Group",
    slug: "southlake-mediation-group",
    category: "MEDIATOR",
    linkedPracticeSlug: "family-law",
    description: "Specialized high-asset dispute resolution practice providing confidential mediation for complex marital asset division and high-conflict custody matters.",
    websiteUrl: "https://southlakemediation.com",
    phone: "(817) 488-8833",
    address: "1560 E Southlake Blvd, Suite 200",
    zipCode: "76092",
    citySlug: "southlake",
  },
  {
    businessName: "Grapevine Spine & Auto Injury Clinic",
    slug: "grapevine-spine-injury",
    category: "CHIROPRACTOR_MD",
    linkedPracticeSlug: "personal-injury",
    description: "Independent chiropractic trauma practice coordinating directly with North Texas injury counsel under Letters of Protection with full forensic charting.",
    websiteUrl: "https://grapevinespineinjury.com",
    phone: "(817) 481-9800",
    address: "1600 W Northwest Hwy, Suite 105",
    zipCode: "76051",
    citySlug: "grapevine",
    acceptsLOP: true,
  },

  // KELLER & MANSFIELD ANCILLARY PROS
  {
    businessName: "Keller Injury Recovery & Chiro",
    slug: "keller-injury-recovery",
    category: "CHIROPRACTOR_MD",
    linkedPracticeSlug: "personal-injury",
    description: "Local auto accident recovery clinic providing digital X-rays, whiplash therapy, and attorney-approved LOP billing with zero upfront cost to patients.",
    websiteUrl: "https://kellerinjurylop.com",
    phone: "(817) 431-8900",
    address: "801 Keller Pkwy, Suite 120",
    zipCode: "76248",
    citySlug: "keller",
    acceptsLOP: true,
  },
  {
    businessName: "Mansfield Spinal Care & Accident Clinic",
    slug: "mansfield-spinal-care",
    category: "CHIROPRACTOR_MD",
    linkedPracticeSlug: "personal-injury",
    description: "Specialized South Tarrant motor vehicle collision trauma center working under signed Letters of Protection from licensed Texas attorneys.",
    websiteUrl: "https://mansfieldspinalcare.com",
    phone: "(817) 453-2227",
    address: "1720 US 287 Frontage Rd, Suite 106",
    zipCode: "76063",
    citySlug: "mansfield",
    acceptsLOP: true,
  },
  {
    businessName: "Mansfield 24/7 Bail Bonds",
    slug: "mansfield-247-bail-bonds",
    category: "BAIL_BONDS",
    linkedPracticeSlug: "criminal-defense-dwi",
    description: "Immediate response bail bondsman handling bookings at the Mansfield Law Enforcement Center (1601 Heritage Pkwy) and Tarrant county corrections.",
    websiteUrl: "https://mansfieldbailbonds247.com",
    phone: "(817) 473-2245",
    address: "1550 E Broad St, Suite 200",
    zipCode: "76063",
    citySlug: "mansfield",
    is24Hours: true,
  },
];

async function main() {
  console.log("Starting Metro Expansion Ingestion (Arlington, Southlake, Keller, Mansfield, Grapevine, Colleyville)...");

  const tarrant = await prisma.county.findUnique({ where: { slug: "tarrant-county" } });
  if (!tarrant) throw new Error("Tarrant county missing!");

  // Cache cities
  const cities = await prisma.city.findMany({ where: { countyId: tarrant.id } });
  const cityMap = new Map(cities.map((c) => [c.slug, c.id]));

  // Cache practice areas
  const pas = await prisma.practiceArea.findMany();
  const paMap = new Map(pas.map((pa) => [pa.slug, pa.id]));

  // 1. Populate Law Firms
  let firmCount = 0;
  for (const f of NEW_METRO_FIRMS) {
    const cityId = cityMap.get(f.citySlug);
    if (!cityId) {
      console.warn(`City slug ${f.citySlug} not found in DB! Skipping ${f.name}`);
      continue;
    }

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
        cityId: cityId,
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
  for (const p of NEW_METRO_PROS) {
    const cityId = cityMap.get(p.citySlug);
    if (!cityId) {
      console.warn(`City slug ${p.citySlug} not found in DB! Skipping ${p.businessName}`);
      continue;
    }

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
        cityId: cityId,
      },
    });
    proCount++;
  }

  console.log(`Successfully ingested Metro Batch: ${firmCount} law firms and ${proCount} ancillary service companies!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
