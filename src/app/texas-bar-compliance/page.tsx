import type { Metadata } from "next";
import Link from "next/link";
import { Scale, ShieldCheck, CheckCircle2, AlertTriangle, ArrowLeft, BookOpen, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Texas State Bar Compliance & Advertising Standards | IfYouNeedALawyer.com",
  description:
    "Official compliance statement regarding Texas Disciplinary Rules of Professional Conduct (TDRPC Rules 1.04, 5.04, 7.01-7.03) and the Texas Lawyer Referral Services Act.",
};

export default function TexasBarCompliancePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Breadcrumb */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      {/* Header */}
      <div className="space-y-4 border-b border-slate-800 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Scale className="w-3.5 h-3.5" />
          <span>Regulatory Disclosure</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Texas State Bar Compliance & Advertising Standards
        </h1>
        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-3xl">
          IfYouNeedALawyer.com is an independent legal directory and advertising service. We are committed to strict adherence to the Texas Disciplinary Rules of Professional Conduct (TDRPC) and the Texas Occupations Code.
        </p>
      </div>

      {/* Primary Disclosures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            § 1
          </div>
          <h2 className="text-lg font-bold text-white">Not a Law Firm</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            IfYouNeedALawyer.com is not a law firm, does not provide legal advice, does not represent clients, and does not participate in any legal representation. Communications through this site do not form an attorney-client relationship.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            § 2
          </div>
          <h2 className="text-lg font-bold text-white">Not a Lawyer Referral Service</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            This website is an online advertising directory and is <strong>not</strong> a certified lawyer referral service under the Texas Lawyer Referral Services Act (Texas Occupations Code Chapter 952). We do not select or assign attorneys to consumers.
          </p>
        </div>
      </div>

      {/* Detailed TDRPC Rules Analysis */}
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Compliance with Texas Disciplinary Rules of Professional Conduct
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            How our operational architecture respects the professional independence and ethical obligations of licensed Texas attorneys:
          </p>
        </div>

        {/* Rule 7.03 */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="text-base font-bold text-white">
              TDRPC Rule 7.03: Prohibited Referral Payments & Flat Advertising
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Texas Disciplinary Rule 7.03 strictly prohibits lawyers from paying non-lawyers for referrals or sharing fees based on case outcomes.
          </p>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Flat-Rate Monthly Directory Advertising:</strong> Any fees paid by attorneys for Featured Sponsor or Verified Boutique tiers are strictly flat advertising subscriptions for profile hosting and visibility.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Zero Referral Fees or Percentage Splits:</strong> We never charge or accept per-case referral fees, contingency fee percentages, or kickbacks of any kind. Baseline listings are provided at no charge.</span>
            </div>
          </div>
        </div>

        {/* Rule 5.04 */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="text-base font-bold text-white">
              TDRPC Rule 5.04: Professional Independence of a Lawyer
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            IfYouNeedALawyer.com exercises zero control, influence, or direction over any attorney&apos;s independent professional judgment, client intake decisions, legal strategies, fee structures, or communications. Clients contract directly with their chosen independent law firm.
          </p>
        </div>

        {/* Rule 7.01 & 7.02 */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <h3 className="text-base font-bold text-white">
              TDRPC Rules 7.01 & 7.02: Truthful & Non-Misleading Information
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            All attorney profile data is gathered from public records, Texas State Bar registration, firm websites, or provided directly by the firm:
          </p>
          <ul className="list-disc list-inside text-xs sm:text-sm text-slate-400 space-y-1.5 pl-2">
            <li>We do not claim that any attorney is a &ldquo;specialist&rdquo; unless certified by the Texas Board of Legal Specialization (TBLS).</li>
            <li>We do not publish unsubstantiated superlatives or comparative claims regarding attorney quality.</li>
            <li>Profiles are designated as &ldquo;Attorney Advertising Listings&rdquo; in compliance with Texas Bar regulations.</li>
          </ul>
        </div>

        {/* Strict 1-5 Headcount Cap */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400 shrink-0" />
            <h3 className="text-base font-bold text-white">
              Our 1 to 5 Attorney Headcount Policy
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Our mission is to connect consumers directly with small boutique practices and solo practitioners who provide personal trial advocacy, rather than large volume call-center billboard mills.
          </p>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Firms that exceed 5 licensed attorneys are not eligible for listing on this platform. This is a private editorial and directory standard designed to foster direct client-partner engagement.
          </p>
        </div>
      </div>

      {/* Attorney Review & Opt-Out Notice */}
      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <h3 className="text-base font-bold text-white">
            Managing Partner Listing Verification & Opt-Out
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Under Texas ethics opinions, licensed attorneys retain individual responsibility for verifying information published on directories where their practice is listed.
        </p>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          If you are a managing partner and wish to claim your verified listing, update your practice details, or remove your profile from our directory, please email us directly or use your claim portal. All removal or correction requests are processed within two business days.
        </p>
        <div className="pt-2 flex flex-wrap gap-4 items-center">
          <Link
            href="/admin/outreach"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Claim or Verify Your Profile
          </Link>
          <a
            href="mailto:compliance@ifyouneedalawyer.com"
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            compliance@ifyouneedalawyer.com
          </a>
        </div>
      </div>
    </div>
  );
}
