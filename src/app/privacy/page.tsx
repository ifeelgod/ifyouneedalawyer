import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | IfYouNeedALawyer.com",
  description:
    "How IfYouNeedALawyer.com collects, protects, and handles consumer inquiries and attorney directory information in accordance with Texas privacy standards.",
};

export default function PrivacyPolicyPage() {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          <span>Data Protection & Privacy</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400 font-medium">
          Effective Date: {effectiveDate} • Domain: IfYouNeedALawyer.com
        </p>
      </div>

      {/* Warning Notice */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-white">
            Important Notice Regarding Attorney-Client Privilege
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Submitting an inquiry or using our 60-Second Legal Triage tool does <strong>not</strong> establish an attorney-client relationship. Do not include highly sensitive, confidential, or privileged facts in web forms before executing a formal written engagement agreement with a licensed attorney.
          </p>
        </div>
      </div>

      {/* Policy Sections */}
      <div className="space-y-8 text-slate-300 text-sm leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-amber-400">1.</span> Information We Collect
          </h2>
          <p className="text-slate-400">
            We collect information in three primary ways when you interact with IfYouNeedALawyer.com:
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
            <li>
              <strong>Voluntary Inquiry & Triage Information:</strong> When you request contact with a listed law firm or associated support professional, you may provide your name, phone number, email address, zip code, and a brief summary of your matter.
            </li>
            <li>
              <strong>Public Directory & Business Profile Data:</strong> We aggregate publicly available Texas State Bar registration records, business addresses, phone numbers, public social profile emails, and practice focus areas for 1–5 attorney firms.
            </li>
            <li>
              <strong>Technical & Usage Data:</strong> Standard web analytics such as device type, browser agent, referral paths, and page view telemetry to ensure website performance, security, and spam protection.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-amber-400">2.</span> How We Use Your Information
          </h2>
          <p className="text-slate-400">
            We use collected information strictly to facilitate direct consumer-to-firm connections:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Direct Firm Routing</span>
              </div>
              <p className="text-xs text-slate-400">
                Delivering your contact details exclusively to the specific law firm or associated professional you choose to inquire with.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <CheckCircle2 className="w-4 h-4" />
                <span>Directory Accuracy</span>
              </div>
              <p className="text-xs text-slate-400">
                Verifying managing partner contacts, updating bar standings, and maintaining accurate office addresses in Tarrant County.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-amber-400">3.</span> Zero Data Selling Policy
          </h2>
          <p className="text-slate-400">
            Unlike large lead-generation aggregators or billboard marketing brokers, <strong>IfYouNeedALawyer.com does not sell, rent, or auction your personal contact data to third-party data brokers or multiple competing call centers.</strong> When you select a practice, your request is directed specifically to that practice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-amber-400">4.</span> Data Security & Storage
          </h2>
          <p className="text-slate-400">
            We implement industry-standard TLS/SSL encryption in transit and restricted cloud database access controls at rest. While no online platform can guarantee absolute security, we regularly audit our infrastructure to safeguard stored information.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="text-amber-400">5.</span> Opt-Out, Correction & Deletion Rights
          </h2>
          <p className="text-slate-400">
            Under the Texas Data Privacy and Security Act (TDPSA) and general consumer privacy principles, you may request to view, update, or permanently delete your submitted information at any time. Managing partners of listed law firms may likewise request profile updates or immediate opt-out from outreach communications.
          </p>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            To submit a privacy or data removal request, contact us directly at{" "}
            <a href="mailto:privacy@ifyouneedalawyer.com" className="text-amber-400 font-bold hover:underline">
              privacy@ifyouneedalawyer.com
            </a>{" "}
            or{" "}
            <a href="mailto:support@ifyouneedalawyer.com" className="text-amber-400 font-bold hover:underline">
              support@ifyouneedalawyer.com
            </a>
            .
          </div>
        </section>
      </div>
    </div>
  );
}
