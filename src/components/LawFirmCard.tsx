"use client";

import { useState } from "react";
import { Phone, Globe, ShieldCheck, CheckCircle2, MapPin, Scale, Calendar, Sparkles } from "lucide-react";
import Link from "next/link";
import { formatPhoneNumber } from "@/lib/utils";

interface LawFirmCardProps {
  firm: {
    id: string;
    name: string;
    slug: string;
    tagline: string | null;
    bio: string;
    phone: string;
    websiteUrl: string;
    address: string;
    city: { name: string; slug: string };
    attorneyCount: number;
    sizeTier: string;
    managingPartnerName: string;
    barNumber: string | null;
    tier: string;
    featuredRank: number | null;
    hasFreeConsultation: boolean;
    acceptsCoCounsel: boolean;
  };
  practiceAreaSlug: string;
  citySlug: string;
}

export default function LawFirmCard({ firm, practiceAreaSlug, citySlug }: LawFirmCardProps) {
  const [phoneRevealed, setPhoneRevealed] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const handleRevealPhone = async () => {
    setPhoneRevealed(true);
    // Fire tracking event to Ledger
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "PHONE_REVEAL",
          targetType: "LAW_FIRM",
          targetId: firm.id,
          practiceAreaSlug,
          citySlug,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "AVAILABILITY_INQUIRY",
          targetType: "LAW_FIRM",
          targetId: firm.id,
          practiceAreaSlug,
          citySlug,
          prospectName: name,
          prospectPhone: phone,
          prospectIssueSummary: notes,
        }),
      });
      setInquirySent(true);
    } catch (e) {
      console.error(e);
    }
  };

  const isFeatured = firm.tier === "FEATURED_SPONSOR";
  const isVerifiedPartner = firm.tier === "VERIFIED_PRO";

  return (
    <div
      className={`rounded-2xl border transition-all p-6 sm:p-7 relative ${
        isFeatured
          ? "border-amber-500/60 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/30"
          : isVerifiedPartner
          ? "border-emerald-500/50 bg-gradient-to-b from-emerald-500/5 via-slate-900 to-slate-950 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/20"
          : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
      }`}
    >
      {/* Featured Sponsor Badge */}
      {isFeatured && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Top Featured Sponsor • Exclusive Partner Placement</span>
        </div>
      )}

      {/* Verified Partner Badge */}
      {isVerifiedPartner && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Premier Partner • Priority Placement</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h3 className="text-xl font-bold text-white tracking-tight hover:text-amber-400 transition-colors">
              <Link href={`/firm/${firm.slug}`}>{firm.name}</Link>
            </h3>

            {/* Firm Size Badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                firm.attorneyCount === 1
                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                  : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              }`}
            >
              <Scale className="w-3 h-3" />
              {firm.attorneyCount === 1 ? "Solo Practitioner (1 Lawyer)" : `Boutique Practice (${firm.attorneyCount} Lawyers)`}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              Texas Bar Verified
            </span>
          </div>

          {firm.tagline && (
            <p className="text-amber-400/90 text-sm font-medium italic mb-2">
              "{firm.tagline}"
            </p>
          )}

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {firm.address}, {firm.city.name}, TX
            </span>
            <span>Managing Attorney: <strong className="text-slate-200">{firm.managingPartnerName}</strong></span>
            {firm.barNumber && <span>Bar #{firm.barNumber}</span>}
          </div>

          <p className="text-slate-300 text-sm leading-relaxed max-w-3xl mb-4">
            {firm.bio}
          </p>

          <div className="flex flex-wrap gap-2 text-xs">
            {firm.hasFreeConsultation && (
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                ✓ Free Case Evaluation
              </span>
            )}
            {firm.acceptsCoCounsel && (
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300">
                ✓ Accepts TX Rule 1.04(f) Co-Counsel
              </span>
            )}
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300">
              ✓ Direct Attorney Contact (No Call Center)
            </span>
          </div>
        </div>

        {/* Action Controls & Lead Tracking */}
        <div className="shrink-0 flex flex-col sm:items-end gap-2.5 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          {!phoneRevealed ? (
            <button
              onClick={handleRevealPhone}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/10"
            >
              <Phone className="w-4 h-4" />
              <span>Reveal Phone Number</span>
            </button>
          ) : (
            <a
              href={`tel:${firm.phone}`}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20 animate-in fade-in"
            >
              <Phone className="w-4 h-4" />
              <span>{formatPhoneNumber(firm.phone)}</span>
            </a>
          )}

          <a
            href={`/out/firm/${firm.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Visit Firm Website</span>
          </a>

          <button
            onClick={() => setShowInquiryModal(true)}
            className="w-full sm:w-auto text-xs text-amber-400 hover:text-amber-300 underline font-medium pt-1 text-center sm:text-right"
          >
            Request Confidential Callback
          </button>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowInquiryModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            {!inquirySent ? (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Request Direct Callback from {firm.name}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your information is transmitted directly to {firm.managingPartnerName}'s office. No call center or broker middlemen.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Miller"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Phone Number</label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(817) 555-0199"
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Brief Description of Legal Need</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide a general summary without sharing sensitive privileged secrets..."
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20"
                >
                  Send Direct Inquiry
                </button>
              </form>
            ) : (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-lg font-bold text-white">Inquiry Sent to {firm.name}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The managing attorney has been notified with your contact request and will review availability promptly.
                </p>
                <button
                  onClick={() => {
                    setShowInquiryModal(false);
                    setInquirySent(false);
                  }}
                  className="mt-4 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
