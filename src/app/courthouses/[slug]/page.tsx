import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, MapPin, Phone, ExternalLink, ShieldCheck, Scale, ArrowLeft } from "lucide-react";
import LawFirmCard from "@/components/LawFirmCard";
import AssociatedProCard from "@/components/AssociatedProCard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourthouseGuidePage({ params }: PageProps) {
  const { slug } = await params;

  const courthouse = await prisma.courthouse.findUnique({
    where: { slug },
    include: {
      county: true,
      city: true,
    },
  });

  if (!courthouse) {
    notFound();
  }

  // Find 1-5 lawyer firms in this city matching the court type
  let matchingPractice = "family-law";
  if (courthouse.courtType.includes("Criminal") || courthouse.courtType.includes("Jail")) {
    matchingPractice = "criminal-defense-dwi";
  } else if (courthouse.courtType.includes("Probate")) {
    matchingPractice = "probate-estate-planning";
  }

  const nearbyFirms = await prisma.lawFirm.findMany({
    where: {
      countyId: courthouse.countyId,
      practiceAreas: {
        some: {
          practiceArea: { slug: matchingPractice },
        },
      },
    },
    include: {
      city: true,
      practiceAreas: {
        include: { practiceArea: true },
      },
    },
    take: 3,
  });

  const nearbyPros = await prisma.associatedPro.findMany({
    where: {
      countyId: courthouse.countyId,
      linkedPracticeSlug: matchingPractice,
    },
    include: { city: true },
    take: 2,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Directory</span>
      </Link>

      {/* Guide Header */}
      <div className="border border-slate-800 rounded-3xl bg-slate-900/90 p-8 sm:p-10 space-y-4 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5" />
          <span>Tarrant County Procedural Survival Guide</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {courthouse.name}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 pt-2">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-amber-400" />
            {courthouse.address}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-emerald-400" />
            {courthouse.phone}
          </span>
          {courthouse.docketUrl && (
            <a
              href={courthouse.docketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-amber-400 hover:underline font-semibold"
            >
              <span>Official Clerk / Docket Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Instructions & Parking */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
          <h3 className="text-lg font-bold text-white">Parking & Security Protocols</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{courthouse.parkingGuide}</p>
        </div>

        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
          <h3 className="text-lg font-bold text-white">Courtroom Survival Tips</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{courthouse.survivalTips}</p>
        </div>
      </div>

      {/* Nearby Small Firms */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Immediate Representation
            </span>
            <h2 className="text-2xl font-bold text-white">
              Vetted 1–5 Lawyer Practices Minutes From {courthouse.name}
            </h2>
          </div>
        </div>

        <div className="space-y-4">
          {nearbyFirms.map((f) => (
            <LawFirmCard
              key={f.id}
              firm={f}
              practiceAreaSlug={matchingPractice}
              citySlug={f.city.slug}
            />
          ))}
        </div>
      </div>

      {/* Nearby Associated Pros */}
      {nearbyPros.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-slate-800">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Support Services
            </span>
            <h2 className="text-xl font-bold text-white">
              Licensed Associated Specialists (Bail, Mediation, Rehabilitation)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {nearbyPros.map((pro) => (
              <AssociatedProCard
                key={pro.id}
                pro={pro}
                practiceAreaSlug={matchingPractice}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
