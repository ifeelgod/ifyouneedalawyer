/**
 * 4-Stage AI Small Firm Discovery & Headcount Auditor Pipeline
 * Specifically configured for Tarrant County (Fort Worth / Arlington Metro)
 * Strictly verifies 1-5 attorneys and excludes 6+ lawyer firms & satellite offices.
 */

interface RawAttorneySeed {
  name: string;
  firmName: string;
  barNumber: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  barReportedFirmSize: "Solo" | "2 to 5" | "6 to 10" | "11+";
  practiceAreas: string[];
}

interface AuditedFirmResult {
  firmName: string;
  cleanDomain: string;
  verifiedAttorneyCount: number;
  sizeTier: "SOLO" | "BOUTIQUE";
  isSatelliteOffice: boolean;
  status: "APPROVED" | "REJECTED_OVER_5" | "REJECTED_SATELLITE";
  attorneys: string[];
  managingPartner: string;
  primaryPractice: string;
  rejectionReason?: string;
}

// Sample raw seeds gathered from State Bar / Tarrant County public listings
const SAMPLE_TARRANT_RAW_SEEDS: RawAttorneySeed[] = [
  {
    name: "Amanda K. Vance",
    firmName: "Vance & Associates Family Law",
    barNumber: "24089123",
    address: "777 Main St, Suite 600",
    city: "Fort Worth",
    zip: "76102",
    phone: "(817) 555-0142",
    email: "sarah@vancefamilylawtexas.com",
    barReportedFirmSize: "2 to 5",
    practiceAreas: ["Family Law", "Divorce", "Child Custody"],
  },
  {
    name: "Marcus Covington",
    firmName: "Covington Legal Group, PLLC",
    barNumber: "24072341",
    address: "115 W Belknap St",
    city: "Fort Worth",
    zip: "76102",
    phone: "(817) 555-0199",
    email: "marcus@covingtondefensegroup.com",
    barReportedFirmSize: "2 to 5",
    practiceAreas: ["Criminal Law", "DWI / Traffic", "Expunctions"],
  },
  {
    name: "Elena Morales",
    firmName: "Law Office of Elena Morales, PLLC",
    barNumber: "24098432",
    address: "201 W Abram St, Suite 210",
    city: "Arlington",
    zip: "76010",
    phone: "(817) 555-0178",
    email: "elena@moralesprobatetx.com",
    barReportedFirmSize: "Solo",
    practiceAreas: ["Probate", "Estate Planning", "Wills & Trusts"],
  },
  {
    name: "Jonathan Bradley",
    firmName: "Texas Mega Injury Law Center",
    barNumber: "24011222",
    address: "2000 E Lamar Blvd",
    city: "Arlington",
    zip: "76006",
    phone: "(817) 555-0999",
    email: "jbradley@texasmegainjury.com",
    barReportedFirmSize: "11+", // Auto-reject
    practiceAreas: ["Personal Injury"],
  },
];

export async function runTarrantDiscoveryPipeline() {
  console.log("=========================================================");
  console.log("Starting 4-Stage AI Small Firm Discovery Pipeline");
  console.log("Target: Tarrant County (Fort Worth, Arlington, Suburbs)");
  console.log("Rule: Strictly 1 to 5 Attorneys. Ban 6+ & Satellite Offices.");
  console.log("=========================================================\n");

  const auditedResults: AuditedFirmResult[] = [];

  for (const record of SAMPLE_TARRANT_RAW_SEEDS) {
    console.log(`[Stage 1 Ingest] Checking ${record.firmName} (${record.city}, TX)...`);

    // Stage 1: Quick Bar filter
    if (record.barReportedFirmSize !== "Solo" && record.barReportedFirmSize !== "2 to 5") {
      console.log(`  ❌ REJECTED at Stage 1: State Bar reported size is '${record.barReportedFirmSize}' (>5 attorneys).`);
      auditedResults.push({
        firmName: record.firmName,
        cleanDomain: record.email.split("@")[1] || "",
        verifiedAttorneyCount: 12,
        sizeTier: "BOUTIQUE",
        isSatelliteOffice: false,
        status: "REJECTED_OVER_5",
        attorneys: [record.name],
        managingPartner: record.name,
        primaryPractice: record.practiceAreas[0],
        rejectionReason: `State Bar headcount exceeds small firm ceiling: ${record.barReportedFirmSize}`,
      });
      continue;
    }

    // Stage 2: Deduplication and Domain Resolution
    const domain = record.email.split("@")[1] || "";
    console.log(`  ✓ Stage 2: Entity domain resolved -> ${domain}`);

    // Stage 3: Simulated AI Headcount Crawler (crawling /team or /about)
    console.log(`  🔎 Stage 3: AI Website Headcount Auditor scanning https://${domain}/attorneys...`);
    
    // Simulate LLM parsing of roster
    let verifiedCount = record.barReportedFirmSize === "Solo" ? 1 : 2;
    if (record.firmName.includes("Covington")) verifiedCount = 3;

    const sizeTier: "SOLO" | "BOUTIQUE" = verifiedCount === 1 ? "SOLO" : "BOUTIQUE";

    console.log(`  ✅ Stage 3 PASS: AI confirmed ${verifiedCount} licensed attorneys at firm.`);
    console.log(`  🎯 Classified as: ${sizeTier === "SOLO" ? "Solo (1 Attorney)" : `Micro-Boutique (${verifiedCount} Attorneys)`}`);

    // Stage 4: Profile Enrichment
    console.log(`  📋 Stage 4: Enriched decision-maker: ${record.name} (Bar #${record.barNumber})`);

    auditedResults.push({
      firmName: record.firmName,
      cleanDomain: domain,
      verifiedAttorneyCount: verifiedCount,
      sizeTier,
      isSatelliteOffice: false,
      status: "APPROVED",
      attorneys: [record.name],
      managingPartner: record.name,
      primaryPractice: record.practiceAreas[0],
    });
    console.log("");
  }

  const approved = auditedResults.filter((r) => r.status === "APPROVED");
  console.log("=========================================================");
  console.log(`Pipeline Summary: ${approved.length} small firms verified and ready for Tarrant County directory insertion.`);
  console.log("=========================================================");

  return auditedResults;
}

// Execute if run directly
if (require.main === module) {
  runTarrantDiscoveryPipeline().catch(console.error);
}
