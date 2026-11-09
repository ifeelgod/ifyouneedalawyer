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

function extractSocialLinks(html: string): { facebookUrl: string | null; linkedinUrl: string | null } {
  const fbMatch = html.match(/https?:\/\/(www\.)?facebook\.com\/([a-zA-Z0-9._-]+)/i);
  const liMatch = html.match(/https?:\/\/(www\.)?linkedin\.com\/(in|company)\/([a-zA-Z0-9._-]+)/i);

  const cleanFb = fbMatch && !fbMatch[0].includes("sharer") && !fbMatch[0].includes("tr") ? fbMatch[0] : null;
  const cleanLi = liMatch && !liMatch[0].includes("shareArticle") ? liMatch[0] : null;

  return { facebookUrl: cleanFb, linkedinUrl: cleanLi };
}

async function scrapeFacebookPageEmail(facebookUrl: string, domain: string): Promise<string | null> {
  try {
    const html = await scrapeUrl(facebookUrl);
    if (!html) return null;

    const emails = extractMailtoAndRegex(html, domain);
    const domainMatch = emails.find((e) => e.includes(domain));
    if (domainMatch) return domainMatch;

    // Check for any public direct email (e.g. gmail/outlook if solo practice)
    if (emails.length > 0) return emails[0];
  } catch {
    // Ignore social rate limit or private block
  }
  return null;
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
  facebookUrl: string | null;
  linkedinUrl: string | null;
  source: "SCRAPED_MAILTO" | "SCRAPED_PAGE" | "FACEBOOK_PAGE" | "FIRST_NAME_PREDICTED" | "NO_MX";
}> {
  const domain = cleanDomain(websiteUrl);
  if (!domain) {
    return {
      partnerEmail: "directory@ifyouneedalawyer.com",
      deskEmail: "directory@ifyouneedalawyer.com",
      hasMx: false,
      facebookUrl: null,
      linkedinUrl: null,
      source: "NO_MX",
    };
  }

  const mxOk = await hasMxRecords(domain);
  if (!mxOk) {
    return {
      partnerEmail: `unverified@${domain}`,
      deskEmail: `unverified@${domain}`,
      hasMx: false,
      facebookUrl: null,
      linkedinUrl: null,
      source: "NO_MX",
    };
  }

  // Parse partner names and initials (e.g., "Yvonne N. Kafor" -> initials "ynk")
  const cleanName = partnerName.replace(/,\s*(Esq|PC|JD|PLLC|LLC)\.?/gi, "").trim();
  const nameParts = cleanName.split(/\s+/).map((p) => p.replace(/[^a-zA-Z]/g, ""));
  const firstName = nameParts[0]?.toLowerCase() || "";
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : "";
  const firstInitial = firstName.charAt(0);
  const initials = nameParts.map((p) => p.charAt(0).toLowerCase()).join("");

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
  let foundFb: string | null = null;
  let foundLi: string | null = null;

  for (const html of htmlResults) {
    if (html) {
      allDiscovered.push(...extractMailtoAndRegex(html, domain));
      const social = extractSocialLinks(html);
      if (social.facebookUrl && !foundFb) foundFb = social.facebookUrl;
      if (social.linkedinUrl && !foundLi) foundLi = social.linkedinUrl;
    }
  }

  allDiscovered = [...new Set(allDiscovered)];

  // 1. If Facebook page found, attempt to scrape direct bio email
  if (foundFb) {
    const fbEmail = await scrapeFacebookPageEmail(foundFb, domain);
    if (fbEmail) {
      return {
        partnerEmail: fbEmail,
        deskEmail: fbEmail,
        hasMx: true,
        facebookUrl: foundFb,
        linkedinUrl: foundLi,
        source: "FACEBOOK_PAGE",
      };
    }
  }

  // 2. Look for partner matches on domain (including middle initials, e.g. ynk@)
  const domainEmails = allDiscovered.filter((e) => e.includes(domain));
  const partnerMatched = domainEmails.find((e) => {
    const user = e.split("@")[0].toLowerCase();
    return (
      user === firstName ||
      user === `${firstName}.${lastName}` ||
      user === `${firstInitial}${lastName}` ||
      (initials.length >= 2 && user === initials) ||
      user.includes(firstName) ||
      (lastName.length > 3 && user.includes(lastName))
    );
  });

  if (partnerMatched) {
    return {
      partnerEmail: partnerMatched,
      deskEmail: domainEmails[0] || partnerMatched,
      hasMx: true,
      facebookUrl: foundFb,
      linkedinUrl: foundLi,
      source: "SCRAPED_MAILTO",
    };
  }

  // 3. Look for office intake emails on domain (info, intake, office, inquiry)
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
      facebookUrl: foundFb,
      linkedinUrl: foundLi,
      source: "FIRST_NAME_PREDICTED",
    };
  }

  if (domainEmails.length > 0) {
    return {
      partnerEmail: `${firstName}@${domain}`,
      deskEmail: domainEmails[0],
      hasMx: true,
      facebookUrl: foundFb,
      linkedinUrl: foundLi,
      source: "SCRAPED_PAGE",
    };
  }

  // 4. Predicted First-Name (standard for solo and small law firms)
  // NEVER use contact@
  return {
    partnerEmail: `${firstName}@${domain}`,
    deskEmail: `info@${domain}`,
    hasMx: true,
    facebookUrl: foundFb,
    linkedinUrl: foundLi,
    source: "FIRST_NAME_PREDICTED",
  };
}
