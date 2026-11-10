import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Scale, ShieldAlert, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | IfYouNeedALawyer.com",
  description:
    "Terms of use, legal disclaimers, and advertising rules governing your access to IfYouNeedALawyer.com.",
};

export default function TermsOfServicePage() {
  const effectiveDate = "November 9, 2026";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
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
          <FileText className="w-3.5 h-3.5" />
          <span>User Agreement & Disclaimers</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Effective Date: {effectiveDate} • Governed by Texas Law
        </p>
      </div>

      {/* Key Disclaimer Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <ShieldAlert className="w-5 h-5" />
          <span>No Legal Advice & No Attorney-Client Relationship</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          All materials, pricing estimates, courthouse guides, and 60-Second Legal Triage outputs on IfYouNeedALawyer.com are provided strictly for general informational purposes and do not constitute legal advice. Your use of this site does not create an attorney-client relationship with IfYouNeedALawyer.com or any listed firm.
        </p>
      </div>

      {/* Terms Body */}
      <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-white">1. Acceptance of Terms</h2>
          <p className="text-slate-400">
            By accessing or using IfYouNeedALawyer.com (the &ldquo;Platform&rdquo;), you agree to be bound by these Terms of Service and our{" "}
            <Link href="/privacy" className="text-amber-400 hover:underline">
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link href="/texas-bar-compliance" className="text-amber-400 hover:underline">
              Texas Bar Compliance Statement
            </Link>
            . If you do not agree to these terms, you must discontinue use of the Platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-white">2. Directory Role & Advertising Disclosures</h2>
          <p className="text-slate-400">
            IfYouNeedALawyer.com operates as an online legal directory limited to small law practices with 1 to 5 attorneys and independent associated support professionals (such as chiropractors, bail bondsmen, mediators, and probate specialists) operating in Tarrant County and the Dallas–Fort Worth Metroplex.
          </p>
          <p className="text-slate-400">
            Featured Sponsor placements represent paid directory advertising. Neither placement order nor presence on the Platform implies a warranty, endorsement, or guarantee of legal outcomes by IfYouNeedALawyer.com.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-white">3. Independent Verification of Counsel</h2>
          <p className="text-slate-400">
            Selecting an attorney is an important decision. Users are encouraged to independently verify an attorney&apos;s current active license standing with the State Bar of Texas, review conflict disclosures, and execute a written fee agreement directly with their selected law practice prior to sharing confidential case files.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-white">4. Prohibited Use & Anti-Scraping</h2>
          <p className="text-slate-400">
            You agree not to use automated bots, scrapers, spiders, or data mining tools to harvest attorney contact details, email addresses, or directory schemas from this Platform for unsolicited commercial spam or competing lead resale.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-white">5. Limitation of Liability</h2>
          <p className="text-slate-400">
            To the fullest extent permitted by Texas law, IfYouNeedALawyer.com and its operators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your reliance on directory content, any communication failures, or legal representation provided by an independent listed law practice or associated professional.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-white">6. Governing Law & Venue</h2>
          <p className="text-slate-400">
            These Terms of Service are governed by the laws of the State of Texas, without regard to conflict-of-law principles. Any disputes arising out of or relating to the Platform shall be resolved exclusively in the state or federal courts sitting in Tarrant County, Texas.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-bold text-white">7. Contact Information</h2>
          <p className="text-slate-400">
            Questions regarding these Terms of Service or listing claims may be directed to{" "}
            <a href="mailto:support@ifyouneedalawyer.com" className="text-amber-400 font-bold hover:underline">
              support@ifyouneedalawyer.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
