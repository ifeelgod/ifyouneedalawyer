import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, CheckCircle2, Award, Zap, Sparkles, Scale, Globe, Phone } from "lucide-react";

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Notice Card */}
      <div className="p-8 rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 via-slate-900 to-slate-950 space-y-4 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Profile Verification & Free Inclusion Notice</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Welcome, {decisionMaker} of {entityName}
        </h1>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          {firm ? (
            <>
              Your practice in <strong>{city}, Texas</strong> has been independently verified as a <strong>1 to 5 attorney small firm ({firm.attorneyCount} attorneys verified)</strong> and is now listed for free on <strong>IfYouNeedALawyer.com</strong>. We have strictly excluded large billboard settlement mills so local clients connect directly with trial partners.
            </>
          ) : (
            <>
              Your business in <strong>{city}, Texas</strong> is listed on <strong>IfYouNeedALawyer.com</strong> to receive direct client inquiries and referrals from small law firms throughout Tarrant County.
            </>
          )}
        </p>

        {/* Live Activity Metric */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block">Total Inquiries & Phone Reveals Attributed to Your Profile:</span>
            <span className="text-xl font-bold text-emerald-400">{leadCount} Client Inquiries Logged</span>
          </div>
          <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded border border-emerald-500/20">
            ✓ Free Basic Listing Active
          </span>
        </div>
      </div>

      {/* Free Backlink Badge Download */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <Award className="w-5 h-5" />
          <span>Your Free "Verified Tarrant County Small Law Practice" Trust Badge</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Display this verified badge on your firm's website footer to highlight your direct partner representation and commitment to personal client service.
        </p>

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
          {`<a href="https://ifyouneedalawyer.com/tarrant-county" target="_blank" rel="noopener"><img src="https://ifyouneedalawyer.com/badges/verified-small-firm.svg" alt="Verified 1-5 Lawyer Firm - IfYouNeedALawyer.com" width="180" height="48" /></a>`}
        </div>
      </div>

      {/* Monetization Upgrade Options: Founders Launch Special */}
      <div className="space-y-6 pt-4">
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Founders Launch Special Pricing — Active Through November 30</span>
          </div>
          <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
            Early Adopter Rate Locked For Life
          </span>
        </div>

        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Early Adopter Upgrades</span>
          <h2 className="text-2xl font-bold text-white mt-1">Upgrade Your Firm's Visibility in {city}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Join during Round 1 (Nov) for maximum savings. Rates increase to $100 &amp; $250 in December, and full price in 2027.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Verified Boutique Partner */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Tier 1: Verified Partner</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  Save 66% Thru Nov
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">$50</span>
                <span className="text-sm font-normal text-slate-400">/ month</span>
                <span className="text-xs line-through text-slate-500 ml-1">$149/mo</span>
              </div>
              <p className="text-[11px] text-amber-400/90 font-medium">
                Round 1: $50/mo thru Nov • Round 2: $100/mo in Dec • Regular: $149/mo in 2027
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                <li>✓ Priority sorting above standard free profiles</li>
                <li>✓ Direct calendar booking integration (Calendly/Clio)</li>
                <li>✓ Live email &amp; SMS alerts for all prospect callbacks</li>
                <li>✓ Permanent DoFollow authority SEO backlink</li>
              </ul>
            </div>
            <a
              href={verifiedPartnerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-colors block"
            >
              Claim $50/mo Founders Partner
            </a>
          </div>

          {/* Exclusive Top 3 Category Sponsor */}
          <div className="p-6 rounded-2xl border border-amber-500/60 bg-gradient-to-b from-amber-500/10 to-slate-900 space-y-4 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase">Tier 2: Top 3 Sponsor</span>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                  Only 3 Available
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">$150</span>
                <span className="text-sm font-normal text-slate-400">/ month flat</span>
                <span className="text-xs line-through text-slate-500 ml-1">$395/mo</span>
              </div>
              <p className="text-[11px] text-amber-400/90 font-medium">
                Round 1: $150/mo thru Nov • Round 2: $250/mo in Dec • Regular: $395/mo in 2027
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                <li>✓ Pinned in the <strong>Top 3 Featured Slots</strong> in {city}</li>
                <li>✓ Embedded in local Courthouse Procedural Guides</li>
                <li>✓ Recommended in the 60-Second Legal Triage Tool</li>
                <li>✓ 100% Texas Bar Rule 5.04 &amp; 7.03 Compliant Flat Ad Fee</li>
              </ul>
            </div>
            <a
              href={top3SponsorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs text-center transition-all shadow-md shadow-amber-500/20 block"
            >
              Lock in $150/mo Top 3 Slot
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
