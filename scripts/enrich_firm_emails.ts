import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const IGNORED_DOMAINS = [
  "sentry.io",
  "wixpress.com",
  "schema.org",
  "w3.org",
  "google.com",
  "cloudflare.com",
  "example.com",
  "domain.com",
  "user@domain.com",
  "wordpress.org",
  "gravatar.com",
  "twimg.com",
];

const IGNORED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".css", ".js"];

function cleanDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function extractEmails(html: string, targetDomain: string, partnerName: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const matches = html.match(emailRegex) || [];

  const valid = matches.filter((e) => {
    const lower = e.toLowerCase();
    if (IGNORED_EXTENSIONS.some((ext) => lower.endsWith(ext))) return false;
    if (IGNORED_DOMAINS.some((d) => lower.includes(d))) return false;
    return true;
  });

  const unique = [...new Set(valid.map((e) => e.toLowerCase()))];

  // Prioritize emails matching the firm domain
  const domainMatched = unique.filter((e) => targetDomain && e.includes(targetDomain));

  // Prioritize partner name matches (first name or initial)
  const firstName = partnerName.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "");
  const lastName = partnerName.split(" ").slice(-1)[0].toLowerCase().replace(/[^a-z]/g, "");

  const partnerMatches = domainMatched.filter((e) => {
    const prefix = e.split("@")[0];
    return prefix.includes(firstName) || prefix.includes(lastName);
  });

  if (partnerMatches.length > 0) {
    return [...partnerMatches, ...domainMatched, ...unique];
  }

  if (domainMatched.length > 0) {
    return [...domainMatched, ...unique];
  }

  return unique;
}

async function scrapeUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);
    if (!res.ok) return "";
    return await res.text();
  } catch {
    clearTimeout(timeout);
    return "";
  }
}

async function enrichLawFirms() {
  console.log("=== ENRICHING LAW FIRM CONTACT EMAILS ===");
  const firms = await prisma.lawFirm.findMany({
    orderBy: { createdAt: "asc" },
  });

  let enrichedCount = 0;

  for (const firm of firms) {
    const domain = cleanDomain(firm.websiteUrl);
    let discoveredEmails: string[] = [];

    if (domain) {
      // 1. Scrape Homepage
      const homeHtml = await scrapeUrl(firm.websiteUrl);
      discoveredEmails = extractEmails(homeHtml, domain, firm.managingPartnerName);

      // 2. If no domain-matched email found, check contact page
      if (!discoveredEmails.some((e) => e.includes(domain))) {
        const contactUrl = firm.websiteUrl.replace(/\/+$/, "") + "/contact";
        const contactHtml = await scrapeUrl(contactUrl);
        const contactEmails = extractEmails(contactHtml, domain, firm.managingPartnerName);
        discoveredEmails = [...discoveredEmails, ...contactEmails];
      }

      // 3. Fallback: If website obfuscates emails behind contact form, use clean domain intake
      if (discoveredEmails.length === 0 || !discoveredEmails.some((e) => e.includes(domain))) {
        discoveredEmails.unshift(`contact@${domain}`);
      }
    } else {
      discoveredEmails.push(`intake@ifyouneedalawyer.com`);
    }

    const primaryEmail = discoveredEmails[0];
    const partnerEmail =
      discoveredEmails.find((e) => {
        const prefix = e.split("@")[0];
        const firstName = firm.managingPartnerName.split(" ")[0].toLowerCase();
        return prefix.includes(firstName);
      }) || primaryEmail;

    await prisma.lawFirm.update({
      where: { id: firm.id },
      data: {
        email: primaryEmail,
        partnerEmail: partnerEmail,
      },
    });

    enrichedCount++;
    console.log(
      `[${enrichedCount}/${firms.length}] ${firm.name} (${firm.cityId}) => ${partnerEmail} | Desk: ${primaryEmail}`
    );
  }

  console.log(`Successfully enriched ${enrichedCount} law firms with contact emails!`);
}

async function enrichAssociatedPros() {
  console.log("\n=== ENRICHING ASSOCIATED PROS CONTACT EMAILS ===");
  const pros = await prisma.associatedPro.findMany({
    orderBy: { createdAt: "asc" },
  });

  let enrichedCount = 0;

  for (const pro of pros) {
    const domain = cleanDomain(pro.websiteUrl);
    let discoveredEmails: string[] = [];

    if (domain) {
      const homeHtml = await scrapeUrl(pro.websiteUrl);
      discoveredEmails = extractEmails(homeHtml, domain, "");

      if (discoveredEmails.length === 0 || !discoveredEmails.some((e) => e.includes(domain))) {
        const contactUrl = pro.websiteUrl.replace(/\/+$/, "") + "/contact";
        const contactHtml = await scrapeUrl(contactUrl);
        discoveredEmails = [...discoveredEmails, ...extractEmails(contactHtml, domain, "")];
      }

      if (discoveredEmails.length === 0 || !discoveredEmails.some((e) => e.includes(domain))) {
        discoveredEmails.unshift(`info@${domain}`);
      }
    } else {
      discoveredEmails.push(`referrals@ifyouneedalawyer.com`);
    }

    const primaryEmail = discoveredEmails[0];

    await prisma.associatedPro.update({
      where: { id: pro.id },
      data: {
        email: primaryEmail,
      },
    });

    enrichedCount++;
    console.log(`[${enrichedCount}/${pros.length}] ${pro.businessName} => ${primaryEmail}`);
  }

  console.log(`Successfully enriched ${enrichedCount} associated professionals!`);
}

async function main() {
  await enrichLawFirms();
  await enrichAssociatedPros();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
