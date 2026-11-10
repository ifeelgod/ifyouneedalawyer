import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import LawFirmCard from "@/components/LawFirmCard";
import { getGoogleMapsPlaceUrl } from "@/lib/google-places";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const firm = await prisma.lawFirm.findUnique({
    where: { slug },
    include: {
      city: true,
      county: true,
      practiceAreas: { include: { practiceArea: true } },
    },
  });

  if (!firm) {
    return {
      title: "Law Firm Not Found | IfYouNeedALawyer.com",
    };
  }

  const practiceNames = firm.practiceAreas.map((p) => p.practiceArea.name).join(", ");
  const title = `${firm.name} — ${firm.city.name}, TX (${firm.attorneyCount}-Attorney Practice) | IfYouNeedALawyer.com`;
  const description = `${firm.name} in ${firm.city.name}, Texas. Led by Managing Partner ${firm.managingPartnerName}. Practicing ${practiceNames || "Local Law"}. Verified 1–5 attorney boutique firm.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://ifyouneedalawyer.com/firm/${firm.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://ifyouneedalawyer.com/firm/${firm.slug}`,
      type: "website",
    },
  };
}

export default async function FirmProfilePage({ params }: PageProps) {
  const { slug } = await params;

  const firm = await prisma.lawFirm.findUnique({
    where: { slug },
    include: {
      city: true,
      county: true,
      practiceAreas: {
        include: { practiceArea: true },
      },
    },
  });

  if (!firm) {
    notFound();
  }

  const primaryPractice = firm.practiceAreas[0]?.practiceArea.slug || "family-law";
  const primaryPracticeName = firm.practiceAreas[0]?.practiceArea.name || "Legal Services";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ifyouneedalawyer.com";
  const firmProfileUrl = `${baseUrl}/firm/${firm.slug}`;

  const mapsUrl = getGoogleMapsPlaceUrl({
    placeId: firm.googlePlaceId,
    name: firm.name,
    address: firm.address,
    city: firm.city.name,
  });

  // LegalService + Attorney JSON-LD Structured Data
  const legalServiceSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": ["LegalService", "Attorney"],
    "@id": firmProfileUrl,
    name: firm.name,
    description: firm.bio,
    url: firmProfileUrl,
    telephone: firm.phone,
    email: firm.partnerEmail || firm.email || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: firm.address,
      addressLocality: firm.city.name,
      addressRegion: "TX",
      postalCode: firm.zipCode,
      addressCountry: "US",
    },
    areaServed: [
      { "@type": "City", name: firm.city.name },
      { "@type": "AdministrativeArea", name: firm.county.name },
    ],
    employee: {
      "@type": "Person",
      name: firm.managingPartnerName,
      jobTitle: "Managing Partner & Attorney at Law",
    },
    sameAs: [firm.websiteUrl, mapsUrl].filter(Boolean),
    knowsAbout: firm.practiceAreas.map((p) => p.practiceArea.name),
  };

  if (typeof firm.googleRating === "number" && typeof firm.googleReviewCount === "number" && firm.googleReviewCount > 0) {
    legalServiceSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: firm.googleRating,
      reviewCount: firm.googleReviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${firm.city.name} ${primaryPracticeName}`,
        item: `${baseUrl}/${firm.county.slug}/${firm.city.slug}/${primaryPractice}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: firm.name,
        item: firmProfileUrl,
      },
    ],
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Structured Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(legalServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Link
        href={`/${firm.county.slug}/${firm.city.slug}/${primaryPractice}`}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to {firm.city.name} Directory</span>
      </Link>

      <LawFirmCard
        firm={firm}
        practiceAreaSlug={primaryPractice}
        citySlug={firm.city.slug}
      />

      {/* SEO Practice Area Badges & Local Verification Summary */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
          Verified Practice Areas & Direct Coverage
        </h2>
        <div className="flex flex-wrap gap-2">
          {firm.practiceAreas.map(({ practiceArea }) => (
            <Link
              key={practiceArea.id}
              href={`/${firm.county.slug}/${firm.city.slug}/${practiceArea.slug}`}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-amber-400 transition-colors"
            >
              {firm.city.name} {practiceArea.name} &rarr;
            </Link>
          ))}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {firm.name} is an independent {firm.attorneyCount}-attorney Texas law practice serving {firm.city.name} and {firm.county.name}. All consultations are handled directly by licensed counsel without third-party call center screening.
        </p>
      </div>
    </div>
  );
}
