import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import LawFirmCard from "@/components/LawFirmCard";
import AssociatedProCard from "@/components/AssociatedProCard";
import Link from "next/link";
import { Scale, Users, ShieldAlert, Sparkles, MapPin, Building, ArrowLeft, HelpCircle } from "lucide-react";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    county: string;
    city: string;
    practiceArea: string;
  }>;
  searchParams: Promise<{
    size?: string; // "all", "solo", "boutique"
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { county: countySlug, city: citySlug, practiceArea: paSlug } = await params;

  if (countySlug === "out") {
    return { title: "Redirecting... | IfYouNeedALawyer.com" };
  }

  const [county, city, practiceArea] = await Promise.all([
    prisma.county.findUnique({ where: { slug: countySlug } }),
    prisma.city.findUnique({ where: { slug: citySlug } }),
    prisma.practiceArea.findUnique({ where: { slug: paSlug } }),
  ]);

  if (!county || !city || !practiceArea) {
    return { title: "Directory | IfYouNeedALawyer.com" };
  }

  const title = `Best ${practiceArea.name} Lawyers in ${city.name}, TX (1–5 Attorney Firms) | IfYouNeedALawyer.com`;
  const description = `Compare vetted 1 to 5 attorney boutique ${practiceArea.name} practices in ${city.name}, ${county.name}, Texas. Transparent fee ranges (${practiceArea.avgSoloFeeRange}), direct partner access, and zero billboard mills.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://ifyouneedalawyer.com/${county.slug}/${city.slug}/${practiceArea.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://ifyouneedalawyer.com/${county.slug}/${city.slug}/${practiceArea.slug}`,
      type: "website",
    },
  };
}

export default async function CategoryDirectoryPage({ params, searchParams }: PageProps) {
  const { county: countySlug, city: citySlug, practiceArea: paSlug } = await params;
  const { size = "all" } = await searchParams;

  // Intercept any legacy /out/firm/[slug] or /out/pro/[slug] calls
  if (countySlug === "out") {
    if (citySlug === "firm") {
      const firm = await prisma.lawFirm.findUnique({ where: { slug: paSlug } });
      if (firm?.websiteUrl) {
        redirect(firm.websiteUrl.startsWith("http") ? firm.websiteUrl : `https://${firm.websiteUrl}`);
      }
    } else if (citySlug === "pro") {
      const pro = await prisma.associatedPro.findUnique({ where: { slug: paSlug } });
      if (pro?.websiteUrl) {
        redirect(pro.websiteUrl.startsWith("http") ? pro.websiteUrl : `https://${pro.websiteUrl}`);
      }
    }
    notFound();
  }

  const county = await prisma.county.findUnique({
    where: { slug: countySlug },
  });

  const city = await prisma.city.findUnique({
    where: { slug: citySlug },
  });

  const practiceArea = await prisma.practiceArea.findUnique({
    where: { slug: paSlug },
  });

  if (!county || !city || !practiceArea) {
    notFound();
  }

  // Filter conditions
  const sizeCondition =
    size === "solo"
      ? { attorneyCount: 1 }
      : size === "boutique"
      ? { attorneyCount: { gte: 2, lte: 5 } }
      : { attorneyCount: { lte: 5 } };

  // Fetch 1-5 lawyer firms in this city/county for this practice area
  const firms = await prisma.lawFirm.findMany({
    where: {
      countyId: county.id,
      cityId: city.id,
      attorneyCount: sizeCondition.attorneyCount,
      practiceAreas: {
        some: {
          practiceArea: { slug: paSlug },
        },
      },
    },
    include: {
      city: true,
      practiceAreas: {
        include: { practiceArea: true },
      },
    },
  });

  // Strict hierarchical tier sorting: FEATURED_SPONSOR (Top 3) -> VERIFIED_PRO (Paying Premier) -> FREE
  const tierWeight: Record<string, number> = {
    FEATURED_SPONSOR: 3,
    VERIFIED_PRO: 2,
    FREE: 1,
  };

  firms.sort((a, b) => {
    const weightA = tierWeight[a.tier] || 1;
    const weightB = tierWeight[b.tier] || 1;
    if (weightA !== weightB) return weightB - weightA;
    if (a.featuredRank && b.featuredRank) return a.featuredRank - b.featuredRank;
    if (a.featuredRank) return -1;
    if (b.featuredRank) return 1;
    return a.attorneyCount - b.attorneyCount;
  });

  // Fetch Contextual Associated Professionals for this practice vertical
  const associatedPros = await prisma.associatedPro.findMany({
    where: {
      countyId: county.id,
      linkedPracticeSlug: paSlug,
    },
    include: {
      city: true,
    },
    orderBy: { tier: "desc" },
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ifyouneedalawyer.com";
  const pageUrl = `${baseUrl}/${county.slug}/${city.slug}/${practiceArea.slug}`;

  // 1. ItemList Schema for Rich Directory Snippets
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Vetted Small Firm ${practiceArea.name} Attorneys in ${city.name}, TX`,
    url: pageUrl,
    numberOfItems: firms.length,
    itemListElement: firms.map((firm, index) => {
      const legalServiceItem: Record<string, unknown> = {
        "@type": "LegalService",
        name: firm.name,
        url: `${baseUrl}/firm/${firm.slug}`,
        telephone: firm.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: firm.address,
          addressLocality: firm.city.name,
          addressRegion: "TX",
          postalCode: firm.zipCode,
          addressCountry: "US",
        },
      };

      if (typeof firm.googleRating === "number" && typeof firm.googleReviewCount === "number" && firm.googleReviewCount > 0) {
        legalServiceItem.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: firm.googleRating,
          reviewCount: firm.googleReviewCount,
          bestRating: 5,
          worstRating: 1,
        };
      }

      return {
        "@type": "ListItem",
        position: index + 1,
        item: legalServiceItem,
      };
    }),
  };

  // 2. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: county.name, item: `${baseUrl}/tarrant-county/fort-worth/${paSlug}` },
      { "@type": "ListItem", position: 3, name: `${city.name} ${practiceArea.name}`, item: pageUrl },
    ],
  };

  // 3. Dynamic City + Practice Area FAQs & Schema
  const faqs = [
    {
      question: `How much does a ${practiceArea.name} attorney cost in ${city.name}, TX?`,
      answer: `For vetted solo practitioners (1 lawyer) in ${city.name} and Tarrant County, typical retainers or fee structures range around ${practiceArea.avgSoloFeeRange}. For 2 to 5 attorney boutique firms, typical benchmarks are ${practiceArea.avgBoutiqueFeeRange}, often with lower overhead than large downtown billboard firms.`,
    },
    {
      question: `Why choose a 1 to 5 attorney firm in ${city.name} over a large regional billboard firm?`,
      answer: `Large TV billboard firms frequently pass cases off to call-center intake teams or junior associates. Every practice listed on IfYouNeedALawyer.com is strictly capped at 1 to 5 licensed attorneys so your ${practiceArea.name} matter in ${city.name} is handled directly by an experienced partner.`,
    },
    {
      question: `Are attorneys in ${city.name} verified by the State Bar of Texas?`,
      answer: `Yes. All listed managing partners are cross-checked against public Texas State Bar records and verified to maintain local offices serving ${city.name} and ${county.name} courts.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Structured Data / JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
        <Link href="/" className="hover:text-amber-400">Home</Link>
        <span>/</span>
        <span className="text-slate-300">{county.name}</span>
        <span>/</span>
        <span className="text-slate-300">{city.name}</span>
        <span>/</span>
        <span className="text-amber-400 font-semibold">{practiceArea.name}</span>
      </div>

      {/* Header Banner */}
      <div className="border border-slate-800 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-10 mb-10 relative overflow-hidden shadow-2xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Scale className="w-3.5 h-3.5" />
            <span>Strictly 1 to 5 Lawyer Law Firms • Big Billboard Mills Banned</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Vetted Small Firm {practiceArea.name} in {city.name}, TX
          </h1>

          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">
            Every firm below is independently verified to have <strong>1 to 5 attorneys total</strong>. You communicate directly with the managing trial lawyer—not a junior paralegal, call center, or case coordinator.
          </p>

          {/* Pricing Benchmark Strip */}
          <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-slate-400 block">Typical {city.name} Solo Lawyer Fee Range:</span>
              <strong className="text-emerald-400 text-sm">{practiceArea.avgSoloFeeRange}</strong>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
              <span className="text-slate-400 block">Typical 2-5 Lawyer Boutique Retainer:</span>
              <strong className="text-amber-400 text-sm">{practiceArea.avgBoutiqueFeeRange}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Way Firm Size Toggle Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Filter by Firm Size:
          </span>
          <span className="text-sm font-bold text-white">
            Showing {firms.length} Verified Small Firm{firms.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
          <Link
            href={`/${countySlug}/${citySlug}/${paSlug}?size=all`}
            className={`px-3 py-2 rounded-lg transition-all ${
              size === "all"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Small Firms (1–5 Lawyers)
          </Link>
          <Link
            href={`/${countySlug}/${citySlug}/${paSlug}?size=solo`}
            className={`px-3 py-2 rounded-lg transition-all ${
              size === "solo"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Solo Only (1 Lawyer)
          </Link>
          <Link
            href={`/${countySlug}/${citySlug}/${paSlug}?size=boutique`}
            className={`px-3 py-2 rounded-lg transition-all ${
              size === "boutique"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Micro-Boutique (2–5 Lawyers)
          </Link>
        </div>
      </div>

      {/* Main Grid: Law Firms (Col 1-2) + Contextual Associated Pros (Col 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Law Firms List */}
        <div className="lg:col-span-2 space-y-6">
          {firms.length > 0 ? (
            firms.map((firm) => (
              <LawFirmCard
                key={firm.id}
                firm={firm}
                practiceAreaSlug={paSlug}
                citySlug={citySlug}
              />
            ))
          ) : (
            <div className="text-center py-12 px-6 rounded-2xl border border-slate-800 bg-slate-900/40">
              <Building className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white">No firms match the exact filter right now.</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                We strictly enforce our 1 to 5 attorney headcount cap. Toggle back to "All Small Firms (1-5)" to view available practices.
              </p>
              <Link
                href={`/${countySlug}/${citySlug}/${paSlug}?size=all`}
                className="mt-4 inline-block px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Reset Filter
              </Link>
            </div>
          )}

          {/* Scarcity Sponsorship Box for Local Lawyers */}
          <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-6 text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Attorney Opportunity • Strictly 1 to 5 Lawyer Firms
            </span>
            <h4 className="text-lg font-bold text-white">
              Are you a 1–5 lawyer {practiceArea.name} firm in {city.name}?
            </h4>
            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              We cap each city & category to a maximum of 3 Featured Boutique Sponsors. Claim your profile or apply for a featured sponsorship slot before your category is full.
            </p>
            <Link
              href="/admin/outreach"
              className="inline-block px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/10"
            >
              Check Availability & Claim Your Profile
            </Link>
          </div>
        </div>

        {/* Contextual Associated Professionals Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 space-y-4 shadow-xl">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Associated Support Professionals</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">
                Local Specialists Needed for {practiceArea.name}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Trusted independent providers in Tarrant County working directly with small firm clients.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {associatedPros.map((pro) => (
                <AssociatedProCard
                  key={pro.id}
                  pro={pro}
                  practiceAreaSlug={paSlug}
                />
              ))}
            </div>

            <div className="pt-4 border-t border-slate-800 text-center">
              <span className="text-[11px] text-slate-500 block mb-2">
                Are you a local doctor, bail bondsman, mediator, or probate professional?
              </span>
              <Link
                href="/admin/outreach"
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
              >
                Inquire About Tarrant County Category Sponsorship
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Frequently Asked Questions Section (Matches FAQPage Schema) */}
      <div className="mt-16 pt-10 border-t border-slate-800 space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {city.name}, TX {practiceArea.name} — Common Questions & Fee Benchmarks
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2.5">
              <h3 className="text-sm font-bold text-amber-400 leading-snug">{faq.question}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
