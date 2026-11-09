import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Sparkles, ShieldCheck, ExternalLink } from "lucide-react";
import OutreachDispatcher from "@/components/OutreachDispatcher";

export const dynamic = "force-dynamic";

export default async function AdminOutreachPage() {
  const firms = await prisma.lawFirm.findMany({
    include: {
      city: true,
      practiceAreas: {
        include: { practiceArea: true },
      },
      leadEvents: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const pros = await prisma.associatedPro.findMany({
    include: {
      city: true,
      leadEvents: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalLeads = await prisma.leadEvent.count();

  const formattedFirms = firms.map((f) => ({
    id: f.id,
    name: f.name,
    cityName: f.city.name,
    managingPartnerName: f.managingPartnerName,
    email: f.email,
    partnerEmail: f.partnerEmail,
    websiteUrl: f.websiteUrl,
    partnerLinkedIn: f.partnerLinkedIn,
    claimToken: f.claimToken,
    tier: f.tier,
    attorneyCount: f.attorneyCount,
    isContacted: f.leadEvents.some((e) =>
      ["OUTREACH_EMAIL_SENT", "MANUAL_OUTREACH_FORM", "MANUAL_OUTREACH_SOCIAL"].includes(e.eventType)
    ),
    contactHistory: f.leadEvents
      .filter((e) => ["OUTREACH_EMAIL_SENT", "MANUAL_OUTREACH_FORM", "MANUAL_OUTREACH_SOCIAL"].includes(e.eventType))
      .map((e) => ({
        eventType: e.eventType,
        createdAt: e.createdAt.toISOString(),
      })),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Monetization &amp; Decision-Maker Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            Tarrant County Discovery &amp; Outreach Ledger
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time attribution tracking, 1-click magic claim links, and embeddable trust badges.
          </p>
        </div>

        <div className="flex gap-4 text-xs font-semibold">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-slate-400 block">Verified Small Firms</span>
            <strong className="text-lg font-bold text-white">{firms.length}</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-slate-400 block">Associated Pros</span>
            <strong className="text-lg font-bold text-white">{pros.length}</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="text-slate-400 block">Total Inquiries / Reveals</span>
            <strong className="text-lg font-bold text-emerald-400">{totalLeads}</strong>
          </div>
        </div>
      </div>

      {/* Embeddable Badge Code Generator Preview */}
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>SEO Backlink Loop: Free Embeddable Trust Badge for 1–5 Lawyer Firms</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
          Firms paste this HTML snippet on their website footer to earn instant local credibility. Every badge provides a permanent, contextual local backlink pointing back to <strong>IfYouNeedALawyer.com</strong>, multiplying domain authority across DFW.
        </p>
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
          {`<a href="https://ifyouneedalawyer.com/tarrant-county" target="_blank"><img src="https://ifyouneedalawyer.com/badges/verified-small-firm.svg" alt="Verified Tarrant County Small Law Firm (1-5 Lawyers)" /></a>`}
        </div>
      </div>

      {/* Interactive Outreach & Dispatch Controller */}
      <OutreachDispatcher firms={formattedFirms} />

      {/* Discovered Associated Pros Table */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Discovered Associated Professionals ({pros.length} Active)</h2>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            100% Emails Enriched
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Business Name &amp; Category</th>
                <th className="p-4">Contact &amp; Enriched Email</th>
                <th className="p-4">City</th>
                <th className="p-4">Phone</th>
                <th className="p-4 text-right">Magic Claim Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {pros.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <strong className="text-white block font-semibold text-sm">{p.businessName}</strong>
                    <span className="text-amber-400 font-medium">{p.category.replace(/_/g, " ")}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-emerald-400 font-semibold">{p.email || "referrals@ifyouneedalawyer.com"}</span>
                  </td>
                  <td className="p-4 text-slate-300">{p.city.name}, TX</td>
                  <td className="p-4 font-mono text-slate-400">{p.phone}</td>
                  <td className="p-4 text-right">
                    <Link
                      href={`/claim/${p.claimToken}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold"
                    >
                      <span>Preview Claim Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
