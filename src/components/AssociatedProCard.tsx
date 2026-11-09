"use client";

import { useState } from "react";
import { Phone, Globe, ShieldCheck, Stethoscope, Key, HeartHandshake, Home } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";

interface AssociatedProCardProps {
  pro: {
    id: string;
    businessName: string;
    slug: string;
    category: string;
    description: string;
    phone: string;
    websiteUrl: string;
    address: string;
    city: { name: string; slug: string };
    acceptsLOP: boolean;
    is24Hours: boolean;
    tier: string;
  };
  practiceAreaSlug: string;
}

export default function AssociatedProCard({ pro, practiceAreaSlug }: AssociatedProCardProps) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = async () => {
    setRevealed(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "PHONE_REVEAL",
          targetType: "ASSOCIATED_PRO",
          targetId: pro.id,
          practiceAreaSlug,
          citySlug: pro.city.slug,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleTrackWebsite = () => {
    try {
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "WEBSITE_CLICK",
          targetType: "ASSOCIATED_PRO",
          targetId: pro.id,
          practiceAreaSlug,
          citySlug: pro.city.slug,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const cleanWebsite = pro.websiteUrl.startsWith("http") ? pro.websiteUrl : `https://${pro.websiteUrl}`;
  const websiteUrlWithUtm = `${cleanWebsite}${cleanWebsite.includes("?") ? "&" : "?"}utm_source=ifyouneedalawyer.com&utm_medium=directory_referral`;

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "CHIROPRACTOR_MD":
        return <Stethoscope className="w-4 h-4 text-emerald-400" />;
      case "BAIL_BONDS":
        return <Key className="w-4 h-4 text-amber-400" />;
      case "COUNSELOR_THERAPIST":
      case "MEDIATOR":
        return <HeartHandshake className="w-4 h-4 text-sky-400" />;
      case "PROBATE_REALTOR_CPA":
        return <Home className="w-4 h-4 text-purple-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "CHIROPRACTOR_MD":
        return "Accident Doctor / Chiropractor (LOP)";
      case "BAIL_BONDS":
        return "24/7 Licensed Bail Bonds";
      case "COUNSELOR_THERAPIST":
        return "Family & Co-Parenting Therapist (LMFT)";
      case "MEDIATOR":
        return "Certified Family Mediator";
      case "PROBATE_REALTOR_CPA":
        return "Probate Real Estate & Estate Specialist";
      default:
        return "Associated Professional";
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 hover:border-slate-700 transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300">
          {getCategoryIcon(pro.category)}
          {getCategoryLabel(pro.category)}
        </span>
        {pro.acceptsLOP && (
          <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Accepts LOP / MedPay
          </span>
        )}
        {pro.is24Hours && (
          <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            24/7 Immediate Jail Release
          </span>
        )}
      </div>

      <div>
        <h4 className="text-base font-bold text-white tracking-tight">
          {pro.businessName}
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">
          {pro.address}, {pro.city.name}, TX
        </p>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        {pro.description}
      </p>

      <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800/80">
        {!revealed ? (
          <button
            onClick={handleReveal}
            className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Show Direct Phone</span>
          </button>
        ) : (
          <a
            href={`tel:${pro.phone}`}
            className="flex-1 py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{formatPhoneNumber(pro.phone)}</span>
          </a>
        )}

        <a
          href={websiteUrlWithUtm}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleTrackWebsite}
          className="p-2 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center justify-center transition-colors"
          title="Visit Provider Website"
        >
          <Globe className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
