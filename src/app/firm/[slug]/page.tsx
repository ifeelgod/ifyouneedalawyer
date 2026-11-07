import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Scale, ShieldCheck, MapPin, Phone, Globe, Calendar, ArrowLeft } from "lucide-react";
import LawFirmCard from "@/components/LawFirmCard";

interface PageProps {
  params: Promise<{ slug: string }>;
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
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
    </div>
  );
}
