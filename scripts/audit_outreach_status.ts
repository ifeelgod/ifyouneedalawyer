import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const totalFirms = await prisma.lawFirm.count();
  const totalPros = await prisma.associatedPro.count();
  const firms = await prisma.lawFirm.findMany({
    include: {
      city: true,
      leadEvents: true,
    },
    orderBy: { name: "asc" },
  });

  const contactedFirms = firms.filter((f) =>
    f.leadEvents.some((e) =>
      ["OUTREACH_EMAIL_SENT", "MANUAL_OUTREACH_FORM", "MANUAL_OUTREACH_SOCIAL"].includes(e.eventType)
    )
  );

  const uncontactedFirms = firms.filter(
    (f) =>
      !f.leadEvents.some((e) =>
        ["OUTREACH_EMAIL_SENT", "MANUAL_OUTREACH_FORM", "MANUAL_OUTREACH_SOCIAL"].includes(e.eventType)
      )
  );

  console.log("=========================================");
  console.log("       DIRECTORY OUTREACH AUDIT");
  console.log("=========================================");
  console.log(`Total Vetted 1-5 Attorney Firms: ${totalFirms}`);
  console.log(`Total Ancillary Professionals:  ${totalPros}`);
  console.log(`Total Contacted Firms:           ${contactedFirms.length}`);
  console.log(`Total Uncontacted Pending Firms: ${uncontactedFirms.length}`);
  console.log("=========================================\n");

  const cityMap: Record<string, { total: number; contacted: number; uncontacted: number }> = {};
  for (const f of firms) {
    const c = f.city?.name || "Unknown City";
    if (!cityMap[c]) {
      cityMap[c] = { total: 0, contacted: 0, uncontacted: 0 };
    }
    cityMap[c].total++;
    const isContacted = f.leadEvents.some((e) =>
      ["OUTREACH_EMAIL_SENT", "MANUAL_OUTREACH_FORM", "MANUAL_OUTREACH_SOCIAL"].includes(e.eventType)
    );
    if (isContacted) {
      cityMap[c].contacted++;
    } else {
      cityMap[c].uncontacted++;
    }
  }

  console.log("--- BREAKDOWN BY TARRANT COUNTY CITY ---");
  console.table(cityMap);

  console.log("\n--- UNCONTACTED FIRMS LIST (Ready for 1-Click Dispatch or Copy Pitch) ---");
  uncontactedFirms.forEach((f, idx) => {
    const emailStr = f.partnerEmail || f.email || "No direct email (use form/social)";
    console.log(`${idx + 1}. [${f.city.name}] ${f.name} - Partner: ${f.managingPartnerName} | Target: ${emailStr}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
