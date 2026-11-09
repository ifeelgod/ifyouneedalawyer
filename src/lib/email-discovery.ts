import dns from "dns/promises";

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
  "godaddy.com",
  "secureserver.net",
];

const IGNORED_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".css", ".js"];

export function cleanDomain(url: string): string {
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

export async function hasMxRecords(domain: string): Promise<boolean> {
  try {
    const records = await dns.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false;
  }
}

async function scrapeUrl(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
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

function extractMailtoAndRegex(html: string, domain: string): string[] {
  const found: string[] = [];

  // 1. Mailto matches
  const mailtoRegex = /mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi;
  let match;
  while ((match = mailtoRegex.exec(html)) !== null) {
    found.push(match[1].toLowerCase());
  }

  // 2. Standard regex matches
  const generalRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const generalMatches = html.match(generalRegex) || [];
  for (const m of generalMatches) {
    found.push(m.toLowerCase());
  }

  const valid = found.filter((e) => {
    if (IGNORED_EXTENSIONS.some((ext) => e.endsWith(ext))) return false;
    if (IGNORED_DOMAINS.some((d) => e.includes(d))) return false;
    return true;
  });

  return [...new Set(valid)];
}

export async function discoverSmartEmail({
  websiteUrl,
  partnerName,
}: {
  websiteUrl: string;
  partnerName: string;
}): Promise<{
  partnerEmail: string;
  deskEmail: string;
  hasMx: boolean;
  source: "SCRAPED_MAILTO" | "SCRAPED_PAGE" | "FIRST_NAME_PREDICTED" | "NO_MX";
}> {
  const domain = cleanDomain(websiteUrl);
  if (!domain) {
    return {
      partnerEmail: "directory@ifyouneedalawyer.com",
      deskEmail: "directory@ifyouneedalawyer.com",
      hasMx: false,
      source: "NO_MX",
    };
  }

  const mxOk = await hasMxRecords(domain);
  if (!mxOk) {
    return {
      partnerEmail: `unverified@${domain}`,
      deskEmail: `unverified@${domain}`,
      hasMx: false,
      source: "NO_MX",
    };
  }

  const cleanName = partnerName.replace(/,\s*(Esq|PC|JD|PLLC|LLC)\.?/gi, "").trim();
  const nameParts = cleanName.split(/\s+/);
  const firstName = nameParts[0].toLowerCase().replace(/[^a-z]/g, "");
  const lastName = (nameParts.length > 1 ? nameParts[nameParts.length - 1] : "").toLowerCase().replace(/[^a-z]/g, "");
  const firstInitial = firstName.charAt(0);

  // Deep Scrape Candidate Pages in parallel
  const baseUrl = websiteUrl.replace(/\/+$/, "");
  const candidateUrls = [
    baseUrl,
    `${baseUrl}/contact`,
    `${baseUrl}/contact-us`,
    `${baseUrl}/about`,
    `${baseUrl}/about-us`,
  ];

  const htmlResults = await Promise.all(candidateUrls.map((u) => scrapeUrl(u)));
  let allDiscovered: string[] = [];

  for (const html of htmlResults) {
    if (html) {
      allDiscovered.push(...extractMailtoAndRegex(html, domain));
    }
  }

  allDiscovered = [...new Set(allDiscovered)];

  // 1. Look for partner matches on domain
  const domainEmails = allDiscovered.filter((e) => e.includes(domain));
  const partnerMatched = domainEmails.find((e) => {
    const user = e.split("@")[0];
    return (
      user === firstName ||
      user === `${firstName}.${lastName}` ||
      user === `${firstInitial}${lastName}` ||
      user.includes(firstName) ||
      (lastName.length > 3 && user.includes(lastName))
    );
  });

  if (partnerMatched) {
    return {
      partnerEmail: partnerMatched,
      deskEmail: domainEmails[0] || partnerMatched,
      hasMx: true,
      source: "SCRAPED_MAILTO",
    };
  }

  // 2. Look for office intake emails on domain (info, intake, office, inquiry)
  const intakePref = ["info", "office", "intake", "inquiry", "frontdesk", "help", "admin", "legal"];
  const officeMatched = domainEmails.find((e) => {
    const user = e.split("@")[0];
    return intakePref.includes(user);
  });

  if (officeMatched) {
    return {
      partnerEmail: `${firstName}@${domain}`,
      deskEmail: officeMatched,
      hasMx: true,
      source: "FIRST_NAME_PREDICTED",
    };
  }

  if (domainEmails.length > 0) {
    return {
      partnerEmail: `${firstName}@${domain}`,
      deskEmail: domainEmails[0],
      hasMx: true,
      source: "SCRAPED_PAGE",
    };
  }

  // 3. Predicted First-Name (standard for 90%+ solo and small boutique firms in Texas)
  // NEVER default to contact@ (honeypot/unconfigured address)
  return {
    partnerEmail: `${firstName}@${domain}`,
    deskEmail: `info@${domain}`,
    hasMx: true,
    source: "FIRST_NAME_PREDICTED",
  };
}
