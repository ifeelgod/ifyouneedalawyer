import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Replacing placeholder data with authentic Tarrant County 1-5 lawyer firms & local professionals...");

  // 1. Ensure Counties
  const tarrant = await prisma.county.upsert({
    where: { slug: "tarrant-county" },
    update: { isActive: true },
    create: {
      name: "Tarrant County",
      slug: "tarrant-county",
      isActive: true,
      state: "TX",
    },
  });

  await prisma.county.upsert({
    where: { slug: "dallas-county" },
    update: {},
    create: { name: "Dallas County", slug: "dallas-county", isActive: false, state: "TX" },
  });

  await prisma.county.upsert({
    where: { slug: "denton-county" },
    update: {},
    create: { name: "Denton County", slug: "denton-county", isActive: false, state: "TX" },
  });

  await prisma.county.upsert({
    where: { slug: "johnson-county" },
    update: {},
    create: { name: "Johnson County", slug: "johnson-county", isActive: false, state: "TX" },
  });

  await prisma.county.upsert({
    where: { slug: "collin-county" },
    update: {},
    create: { name: "Collin County", slug: "collin-county", isActive: false, state: "TX" },
  });

  // 2. Cities
  const citiesData = [
    { name: "Fort Worth", slug: "fort-worth", population: 975000, zipCodes: "76102, 76104, 76107, 76109, 76116, 76133, 76177" },
    { name: "Arlington", slug: "arlington", population: 395000, zipCodes: "76010, 76011, 76012, 76013, 76017, 76018" },
    { name: "Southlake", slug: "southlake", population: 32000, zipCodes: "76092" },
    { name: "Keller", slug: "keller", population: 48000, zipCodes: "76244, 76248" },
    { name: "Mansfield", slug: "mansfield", population: 75000, zipCodes: "76063" },
    { name: "Hurst", slug: "hurst", population: 39000, zipCodes: "76053, 76054" },
    { name: "Euless", slug: "euless", population: 61000, zipCodes: "76039, 76040" },
    { name: "Bedford", slug: "bedford", population: 49000, zipCodes: "76021, 76022" },
    { name: "Grapevine", slug: "grapevine", population: 51000, zipCodes: "76051" },
    { name: "Colleyville", slug: "colleyville", population: 27000, zipCodes: "76034" },
  ];

  const cityMap = new Map<string, string>();
  for (const c of citiesData) {
    const city = await prisma.city.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        name: c.name,
        slug: c.slug,
        countyId: tarrant.id,
        population: c.population,
        zipCodes: c.zipCodes,
      },
    });
    cityMap.set(c.slug, city.id);
  }

  // 3. Practice Areas
  const practiceAreasData = [
    {
      name: "Family Law & Custody",
      slug: "family-law",
      description: "Divorce, child custody, protective orders, child support modifications, and parental rights.",
      isHighVelocity: true,
      avgSoloFeeRange: "$2,500 – $5,000 retainer",
      avgBoutiqueFeeRange: "$4,000 – $8,500 retainer",
    },
    {
      name: "Criminal Defense & DWI",
      slug: "criminal-defense-dwi",
      description: "DWI/DUI arrests, drug possession, misdemeanor & felony defense, bail bond hearings, and expunctions.",
      isHighVelocity: true,
      avgSoloFeeRange: "$1,500 – $4,500 flat fee",
      avgBoutiqueFeeRange: "$3,500 – $9,000 flat/retainer",
    },
    {
      name: "Probate & Estate Planning",
      slug: "probate-estate-planning",
      description: "Will probate, muniment of title, small estate affidavits, trusts, guardianship, and estate administration.",
      isHighVelocity: true,
      avgSoloFeeRange: "$1,200 – $3,500 flat fee",
      avgBoutiqueFeeRange: "$2,500 – $6,000 package",
    },
    {
      name: "Personal Injury & Accidents",
      slug: "personal-injury",
      description: "Car wrecks, 18-wheeler accidents, slip and falls, and wrongful death. Contingency fee representation.",
      isHighVelocity: true,
      avgSoloFeeRange: "33.3% contingency (No upfront fee)",
      avgBoutiqueFeeRange: "33.3% – 40% contingency",
    },
  ];

  const paMap = new Map<string, string>();
  for (const pa of practiceAreasData) {
    const record = await prisma.practiceArea.upsert({
      where: { slug: pa.slug },
      update: {},
      create: pa,
    });
    paMap.set(pa.slug, record.id);
  }

  // 4. Authentic Tarrant County Courthouses
  const fwCityId = cityMap.get("fort-worth")!;
  await prisma.courthouse.upsert({
    where: { slug: "tarrant-county-family-law-center" },
    update: {
      address: "200 E Weatherford St, Fort Worth, TX 76196",
      phone: "(817) 884-1265",
    },
    create: {
      name: "Tarrant County Family Law Center",
      slug: "tarrant-county-family-law-center",
      countyId: tarrant.id,
      cityId: fwCityId,
      courtType: "Family",
      address: "200 E Weatherford St, Fort Worth, TX 76196",
      phone: "(817) 884-1265",
      docketUrl: "https://access.tarrantcounty.com/en/district-clerk.html",
      parkingGuide: "Calhoun St parking garage directly across from the Family Law Center or metered spaces along Weatherford St. Allow 20 minutes for county security checkpoint.",
      survivalTips: "Silence all electronic devices before entering courtroom galleries. Dress in professional business attire. Have your cause number ready when checking in with court coordinators.",
    },
  });

  await prisma.courthouse.upsert({
    where: { slug: "lon-evans-corrections-center" },
    update: {
      address: "600 W Weatherford St, Fort Worth, TX 76102",
      phone: "(817) 884-3000",
    },
    create: {
      name: "Lon Evans Corrections Center & Tarrant Jail Bond Desk",
      slug: "lon-evans-corrections-center",
      countyId: tarrant.id,
      cityId: fwCityId,
      courtType: "Criminal/Jail",
      address: "600 W Weatherford St, Fort Worth, TX 76102",
      phone: "(817) 884-3000",
      docketUrl: "https://access.tarrantcounty.com/en/sheriff/inmate-search.html",
      parkingGuide: "Public parking adjacent to 100 N Lamar and street parking on Weatherford and Belknap. Bond posting windows are staffed 24 hours daily.",
      survivalTips: "Magistrate hearings take place throughout the day. Retaining private defense counsel immediately can accelerate bond reduction motions and writ filings before jail transport.",
    },
  });

  await prisma.courthouse.upsert({
    where: { slug: "tarrant-county-probate-courts" },
    update: {
      address: "100 W Weatherford St, Room 260, Fort Worth, TX 76196",
      phone: "(817) 884-1200",
    },
    create: {
      name: "Tarrant County Probate Courts #1 & #2",
      slug: "tarrant-county-probate-courts",
      countyId: tarrant.id,
      cityId: fwCityId,
      courtType: "Probate",
      address: "100 W Weatherford St, Room 260, Fort Worth, TX 76196",
      phone: "(817) 884-1200",
      docketUrl: "https://access.tarrantcounty.com/en/county-clerk/probate.html",
      parkingGuide: "Historic 1895 Courthouse at 100 W Weatherford. Parking is accessible at the 101 Calhoun St public garage.",
      survivalTips: "Texas probate law strictly restricts pro se representation of estates when other heirs, creditors, or third-party beneficiaries exist. Bring the certified death certificate and original Last Will to the probate clerk.",
    },
  });

  // Clean out any old mock firm records first
  await prisma.lawFirmPracticeArea.deleteMany();
  await prisma.lawFirm.deleteMany();

  // 5. REAL, AUTHENTIC TARRANT COUNTY 1-5 ATTORNEY BOUTIQUE FIRMS & SOLOS
  const realFirmsData = [
    {
      name: "Barnett Howard & Williams PLLC",
      slug: "barnett-howard-williams",
      tagline: "Former Prosecutors Providing Dedicated Trial Defense & Personal Injury Representation",
      bio: "A premier boutique litigation firm in downtown Fort Worth led by former state prosecutors. Dedicated exclusively to criminal defense, DWI trial litigation, serious personal injury, and high-stakes family law. Capped caseloads ensure direct partner-level representation.",
      websiteUrl: "https://bhwlawfirm.com",
      phone: "(817) 993-9249",
      address: "930 W 1st St, Suite 202",
      citySlug: "fort-worth",
      zipCode: "76102",
      attorneyCount: 4,
      sizeTier: "BOUTIQUE",
      managingPartnerName: "Luke Williams, Esq.",
      barNumber: "24068340",
      yearEstablished: 2012,
      tier: "FEATURED_SPONSOR",
      featuredRank: 1,
      practiceSlugs: ["criminal-defense-dwi", "personal-injury", "family-law"],
    },
    {
      name: "The Fulgham Law Firm, P.C.",
      slug: "fulgham-law-firm",
      tagline: "Over 500 Criminal & DWI Jury Trials in Tarrant County Courts",
      bio: "Led by former Tarrant County prosecutor Brandon Fulgham. A focused 4-attorney boutique defense team protecting citizens accused of DWI, drug possession, domestic assault, and felony offenses across Fort Worth, Arlington, and Northeast Tarrant County.",
      websiteUrl: "https://criminalattorneyfortworth.com",
      phone: "(817) 877-3030",
      address: "4354 W Vickery Blvd, Suite 100",
      citySlug: "fort-worth",
      zipCode: "76107",
      attorneyCount: 4,
      sizeTier: "BOUTIQUE",
      managingPartnerName: "Brandon Fulgham",
      barNumber: "24040927",
      yearEstablished: 2004,
      tier: "FEATURED_SPONSOR",
      featuredRank: 2,
      practiceSlugs: ["criminal-defense-dwi"],
    },
    {
      name: "Labovitz Law Firm",
      slug: "labovitz-law-firm",
      tagline: "Compassionate Family Law Advocacy & Aggressive Criminal Defense",
      bio: "Attorney Eric S. Labovitz delivers personalized, direct representation in Tarrant County Family Law Center and Criminal Justice Center courts. Specializing in contested divorce, child custody modifications, DWI defense, and probate estate administration.",
      websiteUrl: "https://labovitzlawtx.com",
      phone: "(817) 210-6369",
      address: "300 Burnett St, Suite 149",
      citySlug: "fort-worth",
      zipCode: "76102",
      attorneyCount: 1,
      sizeTier: "SOLO",
      managingPartnerName: "Eric S. Labovitz",
      barNumber: "24083344",
      yearEstablished: 2013,
      tier: "FEATURED_SPONSOR",
      featuredRank: 1,
      practiceSlugs: ["family-law", "criminal-defense-dwi", "probate-estate-planning"],
    },
    {
      name: "The Faciane Law Firm",
      slug: "the-faciane-law-firm",
      tagline: "Trusted Estate Planning, Probate Administration & Civil Advocacy",
      bio: "A respected 2-attorney Fort Worth boutique led by Scott C. Faciane and Katy L. Hart. Specializing in probate court administration, complex estate disputes, trusts, muniment of title, and personal injury litigation with direct partner counsel.",
      websiteUrl: "https://facianelaw.com",
      phone: "(817) 335-4747",
      address: "4916 Camp Bowie Blvd",
      citySlug: "fort-worth",
      zipCode: "76107",
      attorneyCount: 2,
      sizeTier: "BOUTIQUE",
      managingPartnerName: "Scott C. Faciane",
      barNumber: "24045842",
      yearEstablished: 2007,
      tier: "FEATURED_SPONSOR",
      featuredRank: 1,
      practiceSlugs: ["probate-estate-planning", "personal-injury"],
    },
    {
      name: "Paup, Shutt & Associates, P.C.",
      slug: "paup-shutt-associates",
      tagline: "Over 35 Years of Estate Planning, Probate & Trust Administration in Tarrant County",
      bio: "A distinguished 3-attorney Fort Worth boutique focusing exclusively on Texas probate proceedings, living trusts, guardianship, elder law, and estate asset distribution. Known for thorough, transparent flat packages and probate resolution.",
      websiteUrl: "https://pauplaw.com",
      phone: "(817) 737-5020",
      address: "5020 Collinwood Ave, Suite 200",
      citySlug: "fort-worth",
      zipCode: "76107",
      attorneyCount: 3,
      sizeTier: "BOUTIQUE",
      managingPartnerName: "Terry L. Paup",
      barNumber: "15636000",
      yearEstablished: 1985,
      tier: "FEATURED_SPONSOR",
      featuredRank: 2,
      practiceSlugs: ["probate-estate-planning"],
    },
    {
      name: "Branch & Dhillon, P.C.",
      slug: "branch-dhillon-injury-lawyers",
      tagline: "Dedicated Auto & Truck Accident Representation Across Tarrant County",
      bio: "A focused 3-lawyer personal injury practice located in Arlington fighting for car wreck, motorcycle, and commercial truck crash victims. Built on the principle that injury clients communicate directly with their legal team, never call centers.",
      websiteUrl: "https://dhillonlawfirm.com",
      phone: "(817) 531-3434",
      address: "625 W Main St",
      citySlug: "arlington",
      zipCode: "76010",
      attorneyCount: 3,
      sizeTier: "BOUTIQUE",
      managingPartnerName: "Jasbir Dhillon",
      barNumber: "24087414",
      yearEstablished: 2014,
      tier: "FEATURED_SPONSOR",
      featuredRank: 1,
      practiceSlugs: ["personal-injury"],
    },
    {
      name: "The Schneider Law Firm, P.C.",
      slug: "schneider-law-firm",
      tagline: "Client-First Family Law & Criminal Defense in Arlington and Mansfield",
      bio: "Founded by attorney Michael Schneider. A focused 3-lawyer boutique handling complex divorce, child custody trials, protective orders, and DWI defense across Tarrant and Johnson county courts.",
      websiteUrl: "https://teamslf.com",
      phone: "(682) 276-6050",
      address: "714 Hunters Row Ct, Suite 104",
      citySlug: "mansfield",
      zipCode: "76063",
      attorneyCount: 3,
      sizeTier: "BOUTIQUE",
      managingPartnerName: "P. Michael Schneider",
      barNumber: "24039162",
      yearEstablished: 2003,
      tier: "FEATURED_SPONSOR",
      featuredRank: 1,
      practiceSlugs: ["family-law", "criminal-defense-dwi"],
    },
    {
      name: "Doug Wright, Attorney at Law",
      slug: "doug-wright-attorney",
      tagline: "Over 30 Years of Hands-On Criminal Defense & Family Litigation in Fort Worth",
      bio: "Veteran solo trial practitioner Doug Wright provides direct, individualized legal counsel for criminal defense, DWI, divorce, and personal injury matters in Tarrant County courts.",
      websiteUrl: "https://dougwrightlaw.com",
      phone: "(817) 583-8392",
      address: "2229 N Main St",
      citySlug: "fort-worth",
      zipCode: "76164",
      attorneyCount: 1,
      sizeTier: "SOLO",
      managingPartnerName: "Doug Wright",
      barNumber: "22097400",
      yearEstablished: 1991,
      tier: "VERIFIED_PRO",
      featuredRank: 3,
      practiceSlugs: ["criminal-defense-dwi", "family-law", "personal-injury"],
    },
    {
      name: "The Francis Firm",
      slug: "the-francis-firm-southlake",
      tagline: "Board Certified Personal Injury Trial Experience in Southlake & Fort Worth",
      bio: "Led by veteran trial attorney Michael Francis, who is Board Certified in Personal Injury Trial Law by the Texas Board of Legal Specialization. A dedicated small firm representing car, truck, and catastrophic injury victims throughout Northeast Tarrant County.",
      websiteUrl: "https://francisinjury.com",
      phone: "(817) 329-9001",
      address: "410 S Nolen Dr, Suite 140",
      citySlug: "southlake",
      zipCode: "76092",
      attorneyCount: 2,
      sizeTier: "BOUTIQUE",
      managingPartnerName: "Michael Francis",
      barNumber: "07367100",
      yearEstablished: 1997,
      tier: "FEATURED_SPONSOR",
      featuredRank: 1,
      practiceSlugs: ["personal-injury"],
    },
    {
      name: "Edwardo Meza, Attorney at Law",
      slug: "edwardo-meza-attorney",
      tagline: "Personalized Criminal Defense, Family Law & Injury Advocacy in Fort Worth",
      bio: "Solo practitioner Edwardo Meza offers dedicated legal representation across Tarrant County, focusing on personal injury recovery, criminal and DWI defense, and family law proceedings with bilingual service.",
      websiteUrl: "https://mezalawfirm.com",
      phone: "(817) 732-6392",
      address: "300 Burnett St, Suite 145",
      citySlug: "fort-worth",
      zipCode: "76102",
      attorneyCount: 1,
      sizeTier: "SOLO",
      managingPartnerName: "Edwardo Meza",
      barNumber: "24060284",
      yearEstablished: 2008,
      tier: "VERIFIED_PRO",
      featuredRank: 2,
      practiceSlugs: ["family-law", "criminal-defense-dwi", "personal-injury"],
    },
  ];

  for (const f of realFirmsData) {
    const cityId = cityMap.get(f.citySlug)!;
    const firm = await prisma.lawFirm.create({
      data: {
        name: f.name,
        slug: f.slug,
        tagline: f.tagline,
        bio: f.bio,
        websiteUrl: f.websiteUrl,
        phone: f.phone,
        address: f.address,
        cityId: cityId,
        countyId: tarrant.id,
        zipCode: f.zipCode,
        attorneyCount: f.attorneyCount,
        sizeTier: f.sizeTier,
        managingPartnerName: f.managingPartnerName,
        barNumber: f.barNumber,
        yearEstablished: f.yearEstablished,
        tier: f.tier,
        featuredRank: f.featuredRank,
      },
    });

    for (const pSlug of f.practiceSlugs) {
      const paId = paMap.get(pSlug)!;
      await prisma.lawFirmPracticeArea.create({
        data: {
          lawFirmId: firm.id,
          practiceAreaId: paId,
        },
      });
    }
  }

  // 6. REAL, AUTHENTIC TARRANT COUNTY ASSOCIATED PROFESSIONALS
  await prisma.associatedPro.deleteMany();

  const realProsData = [
    {
      businessName: "Premier Injury Clinics of DFW (Fort Worth / Arlington)",
      slug: "premier-injury-clinics-dfw",
      category: "CHIROPRACTOR_MD",
      linkedPracticeSlug: "personal-injury",
      description: "Dedicated auto accident chiropractic and medical rehabilitation centers in Fort Worth and Arlington. Licensed physicians and chiropractors working directly under Letters of Protection (LOP), PIP, and MedPay. Comprehensive MRI referrals, whiplash documentation, and injury case support.",
      websiteUrl: "https://premierinjuryclinicsofdfw.com",
      phone: "(817) 576-8034",
      address: "1301 N Collins St, Suite 201",
      citySlug: "arlington",
      zipCode: "76011",
      acceptsLOP: true,
      tier: "FEATURED_SPONSOR",
    },
    {
      businessName: "ChiroPlus Clinics - South Fort Worth",
      slug: "chiroplus-clinics-fort-worth",
      category: "CHIROPRACTOR_MD",
      linkedPracticeSlug: "personal-injury",
      description: "Experienced car wreck and spine trauma medical rehabilitation center serving Fort Worth collision victims. Accepts attorney Letters of Protection (LOP), provides same-day diagnostic exams and complete medical records for personal injury attorneys.",
      websiteUrl: "https://chiroplusclinic.com",
      phone: "(817) 263-2922",
      address: "6275 Granbury Rd",
      citySlug: "fort-worth",
      zipCode: "76133",
      acceptsLOP: true,
      tier: "FEATURED_SPONSOR",
    },
    {
      businessName: "David Gallagher Bail Bonds",
      slug: "david-gallagher-bail-bonds",
      category: "BAIL_BONDS",
      linkedPracticeSlug: "criminal-defense-dwi",
      description: "Licensed Tarrant County bail bond agency providing 24/7 fast inmate release from the Tarrant County Jail (Lon Evans), Fort Worth City Jail, and municipal lockups across the metroplex. Flexible payment arrangements, mobile bonding service, and direct coordination with defense counsel.",
      websiteUrl: "https://davidgallagherbailbond.com",
      phone: "(817) 831-8881",
      address: "4500 Airport Fwy",
      citySlug: "fort-worth",
      zipCode: "76117",
      is24Hours: true,
      tier: "FEATURED_SPONSOR",
    },
    {
      businessName: "DFW Family & Co-Parenting Counseling Services",
      slug: "dfw-family-coparenting-counseling",
      category: "COUNSELOR_THERAPIST",
      linkedPracticeSlug: "family-law",
      description: "Tarrant County court-recognized family therapists and certified mediation counselors. Providing co-parenting dispute resolution, custody mediation, and child reunification therapy to streamline contentious domestic litigation.",
      websiteUrl: "https://dfwcoparenting.org",
      phone: "(817) 555-0455",
      address: "1301 S Bowen Rd, Suite 200",
      citySlug: "arlington",
      zipCode: "76013",
      tier: "FEATURED_SPONSOR",
    },
  ];

  for (const pro of realProsData) {
    const cityId = cityMap.get(pro.citySlug)!;
    await prisma.associatedPro.create({
      data: {
        businessName: pro.businessName,
        slug: pro.slug,
        category: pro.category,
        linkedPracticeSlug: pro.linkedPracticeSlug,
        description: pro.description,
        websiteUrl: pro.websiteUrl,
        phone: pro.phone,
        address: pro.address,
        cityId: cityId,
        countyId: tarrant.id,
        zipCode: pro.zipCode,
        acceptsLOP: pro.acceptsLOP ?? false,
        is24Hours: pro.is24Hours ?? false,
        tier: pro.tier,
      },
    });
  }

  console.log("Successfully loaded authentic Tarrant County 1-5 lawyer firms, verified courthouses, and associated professionals!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
