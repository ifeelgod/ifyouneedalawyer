import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, CheckCircle2, Award, Zap, Sparkles, Scale, Globe, Phone, Flame, Lock, ArrowRight, DollarSign, TrendingUp, AlertCircle } from "lucide-react";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function ClaimProfilePage({ params }: PageProps) {
  const { token } = await params;

  // Find either firm or associated pro by claim token
  const firm = await prisma.lawFirm.findUnique({
    where: { claimToken: token },
    include: {
      city: true,
      county: true,
      leadEvents: true,
      practiceAreas: {
        include: { practiceArea: true },
      },
    },
  });

  const pro = !firm
    ? await prisma.associatedPro.findUnique({
        where: { claimToken: token },
        include: {
          city: true,
          county: true,
          leadEvents: true,
        },
      })
    : null;

  if (!firm && !pro) {
    notFound();
  }

  const entityName = firm ? firm.name : pro!.businessName;
  const decisionMaker = firm ? firm.managingPartnerName : "Owner / Manager";
  const city = firm ? firm.city.name : pro!.city.name;
  const leadCount = firm ? firm.leadEvents.length : pro!.leadEvents.length;
  const userEmail = firm?.partnerEmail || firm?.email || pro?.email || "";

  // Live Stripe Founders Special Checkout URLs
  const verifiedPartnerUrl = `https://buy.stripe.com/8x29AVfDH7ZwcwP3BrfIs00?client_reference_id=${encodeURIComponent(token)}${userEmail ? `&prefilled_email=${encodeURIComponent(userEmail)}` : ""}`;
  const top3SponsorUrl = `https://buy.stripe.com/cNidRb4Z3cfM54n1tjfIs01?client_reference_id=${encodeURIComponent(token)}${userEmail ? `&prefilled_email=${encodeURIComponent(userEmail)}` : ""}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Verification Notice Card */}
      <div className="p-8 rounded-3xl border border-amber-500/40 bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-950 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Profile Verification Notice</span>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            ✓ Free Basic Listing Active
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Welcome, {decisionMaker} of {entityName}
        </h1>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          {firm ? (
            <>
              Your practice in <strong>{city}, Texas</strong> has been independently verified as an authentic <strong>1 to 5 attorney firm ({firm.attorneyCount} attorneys verified)</strong> and is active on <strong>IfYouNeedALawyer.com</strong>. We have permanently banned 6+ lawyer billboard settlement mills from this platform so local clients looking for serious legal help connect directly with managing trial partners.
            </>
          ) : (
            <>
              Your business in <strong>{city}, Texas</strong> is active on <strong>IfYouNeedALawyer.com</strong> to receive high-intent inquiries from local clients and small law practices across Tarrant County.
            </>
          )}
        </p>

        {/* Live Traffic / Inquiry Meter */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 block font-medium">Attributed Prospect Inquiries & Phone Reveals:</span>
            <span className="text-2xl font-black text-emerald-400 tracking-tight">{leadCount} Client Contacts Logged</span>
          </div>
          <div className="text-right sm:text-right">
            <span className="text-slate-400 block">Current Placement:</span>
            <span className="text-slate-300 font-bold">Standard Free Rotation (Alphabetical)</span>
          </div>
        </div>
      </div>

      {/* Free Backlink Badge Download */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Award className="w-5 h-5" />
          <span>Your Complimentary "Verified Tarrant County Small Practice" Trust Badge</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Embed this verified trust badge on your website footer to signal to clients that your practice offers direct partner attention, while securing a permanent local authority backlink from IfYouNeedALawyer.com.
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
          {`<a href="https://ifyouneedalawyer.com/tarrant-county" target="_blank" rel="noopener"><img src="https://ifyouneedalawyer.com/badges/verified-small-firm.svg" alt="Verified 1-5 Lawyer Firm - IfYouNeedALawyer.com" width="180" height="48" /></a>`}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 20X HIGH-CONVERTING SALES SECTION: FOUNDERS INVITATION                   */}
      {/* ========================================================================= */}
      <div className="space-y-8 pt-4">
        {/* Red Urgency Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-red-500/20 via-amber-500/15 to-red-500/20 border-2 border-red-500/40 space-y-2 shadow-xl">
          <div className="flex items-center gap-2 text-red-400 font-black text-sm uppercase tracking-wider">
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
            <span>Strict Early Adopter Allocation • Limited Capacity</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Claim One of Only 3 Premier Spots in {city} Before Your Direct Competitor Does.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            When all 3 featured spots in {city} are claimed, this offer permanently closes and pricing reverts to our full market rates (<strong>$395/month</strong> and <strong>$149/month</strong>). <span className="text-amber-400 font-bold">Lock in your Founders Rate today and it is guaranteed never to increase for the life of your active subscription.</span>
          </p>
        </div>

        {/* Why This Works / Value Stack */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-sm">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Massive ROI on 1 Client</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              In {city}, a single retained divorce, DWI defense, probate estate, or injury case generates $3,500 – $10,000+. One client alone pays for <strong>2 to 5 full years</strong> of your sponsorship.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">High-Intent Clients</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visitors on IfYouNeedALawyer.com deliberately avoid TV billboard settlement mills. They demand experienced trial lawyers and have the budget to pay private retainers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 font-bold text-sm">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">Lifetime Price Lock</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Once enrolled, your monthly fee is grandfathered. Even as site traffic expands across DFW and rates rise to full market price, your rate will never go up.
            </p>
          </div>
        </div>

        {/* The Two Checkout Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          {/* TIER 1: VERIFIED PREMIER PARTNER */}
          <div className="p-7 rounded-3xl border-2 border-slate-700 bg-slate-900/90 space-y-6 flex flex-col justify-between relative shadow-xl hover:border-slate-600 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tier 1: Premier Partner</span>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-black px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                  SAVE $99/MO (66% OFF)
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white">$50</span>
                  <span className="text-slate-400 text-sm font-bold">/ month</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 line-through font-semibold">Regular: $149/month</span>
                  <span className="text-xs text-emerald-400 font-bold">You Save $1,188 Every Year</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Strict limit of 5 partner slots per practice area in {city}.</span>
              </div>

              <ul className="text-xs text-slate-300 space-y-2.5 pt-2 border-t border-slate-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Premier Priority Placement:</strong> Displayed prominently above all standard free profiles.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Verified Premier Partner Badge:</strong> Distinguished emerald styling that signals trust.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Direct Booking & Phone Reveals:</strong> Direct integration with your firm's calendar or intake desk.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>High-Authority DoFollow Backlink:</strong> High-powered SEO juice passing domain authority to your website.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>Lifetime Rate Lock:</strong> Grandfathered at $50/mo. Zero price hikes ever.</span>
                </li>
              </ul>
            </div>

            <a
              href={verifiedPartnerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm text-center transition-all shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>Claim $50/mo Premier Partner</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* TIER 2: TOP 3 FEATURED SPONSOR (PREMIUM) */}
          <div className="p-7 rounded-3xl border-2 border-amber-500/80 bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-950 space-y-6 flex flex-col justify-between relative shadow-2xl ring-2 ring-amber-500/30">
            {/* Top Ribbon */}
            <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md">
              Most Coveted Placement
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">Tier 2: Top 3 Sponsor</span>
                <span className="text-[11px] bg-red-500/20 text-red-300 font-black px-2.5 py-0.5 rounded-full border border-red-500/40">
                  SAVE $245/MO (62% OFF)
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white">$150</span>
                  <span className="text-slate-400 text-sm font-bold">/ month flat</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 line-through font-semibold">Regular: $395/month</span>
                  <span className="text-xs text-amber-400 font-bold">You Save $2,940 Every Year</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-2 font-medium">
                <Flame className="w-4 h-4 shrink-0 text-amber-400" />
                <span>Strictly capped at 3 spots in {city}. When filled, the door closes.</span>
              </div>

              <ul className="text-xs text-slate-200 space-y-2.5 pt-2 border-t border-slate-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Pinned at the Very Top (#1, #2, #3):</strong> The first law practice prospective clients see in {city}.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Gold Frame Highlight &amp; Direct Call Button:</strong> Maximum visual dominance that captures the majority of inbound calls.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>Featured in Courthouse Procedural Guides:</strong> Embedded directly into Tarrant County courthouse resources.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>60-Second Legal Triage Recommendation:</strong> Priority match for local users completing our interactive triage quiz.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>100% Texas Bar Compliant:</strong> Flat advertising sponsorship fee under TDRPC Rules 5.04 &amp; 7.03 (no fee-splitting).</span>
                </li>
              </ul>
            </div>

            <a
              href={top3SponsorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm text-center transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 group"
            >
              <span>Lock in $150/mo Top 3 Featured Slot</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Texas Bar Compliance Notice */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-center space-y-1">
          <p>
            <strong>Texas Bar Rule 5.04 &amp; 7.03 Compliance:</strong> IfYouNeedALawyer.com operates strictly on a flat monthly advertising subscription basis. We do not participate in legal fee-splitting, per-case referral cuts, or commissions.
          </p>
          <p className="text-slate-500">
            Cancel anytime with 1 click. No long-term lock-ins. Once cancelled, your spot is released to the next firm on the waiting list at full market rate.
          </p>
        </div>
      </div>
    </div>
  );
}
