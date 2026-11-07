"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle, ArrowRight, DollarSign, ShieldAlert, Sparkles, UserCheck, Stethoscope, Scale } from "lucide-react";
import Link from "next/link";

interface TriageStep {
  question: string;
  subtext: string;
  categoryKey: string;
  options: {
    label: string;
    sublabel: string;
    actionType: "DIY" | "PRO_FIRST" | "LAWYER_URGENT";
    verdict: string;
    costRange: string;
    recommendation: string;
    matchedCategory: string;
    matchedProType?: string;
  }[];
}

const TRIAGE_DATA: Record<string, TriageStep> = {
  root: {
    question: "What legal situation are you facing in Tarrant County?",
    subtext: "Answer honestly—we will tell you if you can do it yourself, need an associated doctor/mediator first, or must retain a 1-5 lawyer firm.",
    categoryKey: "root",
    options: [
      {
        label: "Auto Accident / Injury Collision",
        sublabel: "Rear-ended, T-bone, commercial truck, or slip and fall injury",
        actionType: "PRO_FIRST",
        verdict: "Medical Evaluation & Lawyer Protection Required",
        costRange: "$0 Upfront (Contingency: 33.3% upon recovery)",
        recommendation: "Get clinical diagnostic evaluation immediately (under a Letter of Protection) so insurance cannot claim your injury pre-existed. Then pair with an Arlington/Fort Worth boutique trial lawyer who handles your case directly.",
        matchedCategory: "personal-injury",
        matchedProType: "Chiropractor / Accident MD (LOP)",
      },
      {
        label: "Arrest, DWI or Tarrant County Warrant",
        sublabel: "Pulled over, booked in Lon Evans/Mansfield jail, or open citation warrant",
        actionType: "LAWYER_URGENT",
        verdict: "Urgent: 15-Day ALR License Clock Ticking",
        costRange: "$1,500 – $4,500 Flat Fee for Solo/Small Defense Firm",
        recommendation: "Under Texas law, you have exactly 15 days from arrest to contest automatic driver's license suspension. Contact a 24/7 bail bondsman for release, followed immediately by a dedicated Tarrant County criminal defense attorney.",
        matchedCategory: "criminal-defense-dwi",
        matchedProType: "24/7 Bail Bondsman",
      },
      {
        label: "Divorce, Custody Dispute, or Child Support",
        sublabel: "Separation, modification of visitation, or protective order",
        actionType: "PRO_FIRST",
        verdict: "Determined by Contested vs. Uncontested Assets",
        costRange: "$1,500 DIY/Mediated to $3,500 – $6,500 Retainer for Boutique Firm",
        recommendation: "If you and your spouse agree on everything, a certified Tarrant County family mediator can save you $10,000+. If custody or property is contested, retaining a 1-5 lawyer boutique firm protects your parental rights without billing high-rise partner rates.",
        matchedCategory: "family-law",
        matchedProType: "Co-Parenting Mediator / LMFT",
      },
      {
        label: "Deceased Loved One's Estate / Will Probate",
        sublabel: "Need to transfer home title, bank accounts, or execute a Texas Will",
        actionType: "DIY",
        verdict: "Probate Court Rules Prevent Most Pro Se Filings",
        costRange: "$1,200 – $3,000 Flat Fee for Uncontested Muniment of Title / Probate",
        recommendation: "In Tarrant County Probate Courts #1 & #2, an executor cannot appear without a licensed attorney if there are other beneficiaries. A solo probate attorney will streamline Letters Testamentary quickly and affordably.",
        matchedCategory: "probate-estate-planning",
        matchedProType: "Probate Real Estate Specialist",
      },
    ],
  },
};

export default function LegalTriageTool() {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  const step = TRIAGE_DATA["root"];

  const handleCalculate = () => {
    if (selectedOption !== null) {
      setHasCalculated(true);
    }
  };

  const currentResult = selectedOption !== null ? step.options[selectedOption] : null;

  return (
    <div id="triage" className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs tracking-wider uppercase">
        <Sparkles className="w-4 h-4" />
        <span>Texas Legal Triage & Cost Estimator</span>
      </div>

      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
        Do You Need a Lawyer in Tarrant County?
      </h3>
      <p className="text-slate-400 text-sm mt-1 mb-6 leading-relaxed">
        {step.subtext}
      </p>

      {!hasCalculated ? (
        <div className="space-y-3">
          {step.options.map((opt, idx) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setSelectedOption(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                selectedOption === idx
                  ? "border-amber-500 bg-amber-500/10 text-white shadow-md shadow-amber-500/10"
                  : "border-slate-800 bg-slate-900/60 hover:border-slate-700 text-slate-300"
              }`}
            >
              <div
                className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  selectedOption === idx ? "border-amber-400 bg-amber-400 text-slate-950" : "border-slate-700"
                }`}
              >
                {selectedOption === idx && <div className="w-2 h-2 rounded-full bg-slate-950" />}
              </div>
              <div>
                <span className="font-semibold text-sm sm:text-base text-slate-100 block">
                  {opt.label}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  {opt.sublabel}
                </span>
              </div>
            </button>
          ))}

          <button
            type="button"
            disabled={selectedOption === null}
            onClick={handleCalculate}
            className="w-full mt-4 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
          >
            <span>Run Free 60-Second Legal Triage</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        currentResult && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Verdict Card */}
            <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>Triage Verdict: {currentResult.verdict}</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentResult.recommendation}
              </p>
            </div>

            {/* Estimated Small Firm Cost Range */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-slate-400 block font-medium">Estimated Tarrant County Small Firm Cost:</span>
                <span className="text-sm sm:text-base font-bold text-emerald-400">
                  {currentResult.costRange}
                </span>
              </div>
            </div>

            {/* Dual Matching CTAs */}
            <div className="space-y-3 pt-1">
              <Link
                href={`/tarrant-county/fort-worth/${currentResult.matchedCategory}`}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20"
              >
                <Scale className="w-4 h-4" />
                <span>View Vetted 1–5 Lawyer Firms For This Issue</span>
              </Link>

              {currentResult.matchedProType && (
                <div className="text-center pt-1">
                  <span className="text-xs text-slate-400">
                    Also need support? We have pre-vetted{" "}
                    <span className="text-amber-400 font-medium">{currentResult.matchedProType}</span> in Tarrant County.
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setHasCalculated(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 pt-2"
              >
                ← Test Another Legal Situation
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}
