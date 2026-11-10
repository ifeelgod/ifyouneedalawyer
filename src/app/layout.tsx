import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Scale, ShieldCheck, PhoneCall, Building2 } from "lucide-react";
import NavSearchButton from "@/components/NavSearchButton";

export const metadata: Metadata = {
  title: "If You Need A Lawyer | Vetted 1-5 Attorney Small Firms in DFW (No Billboard Mills)",
  description: "Find vetted 1 to 5 lawyer boutique firms in Tarrant County & DFW. Honest legal triage, direct attorney access, real pricing benchmarks, and trusted local associated professionals.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white block">
                  IfYouNeedA<span className="text-amber-400">Lawyer</span><span className="text-xs text-slate-400 ml-1">.com</span>
                </span>
                <span className="text-xs text-slate-400 font-medium block">
                  Strictly 1–5 Attorney Boutique Firms • Texas Bar Verified
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
              <Link href="/#triage" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Legal Triage Quiz
              </Link>
              <Link href="/tarrant-county/fort-worth/family-law" className="hover:text-amber-400 transition-colors">
                Tarrant County Directory
              </Link>
              <Link href="/courthouses/tarrant-county-family-law-center" className="hover:text-amber-400 transition-colors">
                Courthouse Guides
              </Link>
              <Link href="/admin/outreach" className="hover:text-amber-400 transition-colors">
                Firm Claim Portal
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <NavSearchButton />
              <Link
                href="/#triage"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-md shadow-amber-500/10 hover:shadow-amber-500/25"
              >
                <span>Take 60-Sec Triage</span>
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-slate-800/80 bg-slate-900/60 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              <div className="space-y-4 md:col-span-1">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-white tracking-wide">IfYouNeedALawyer.com</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  The consumer-first legal directory for Fort Worth & Tarrant County. Exclusively connecting people with vetted 1 to 5 attorney small firms—never billboard mills or call centers.
                </p>
                <div className="pt-2 text-xs text-slate-500">
                  Compliant with Texas Disciplinary Rules of Professional Conduct (TDRPC Rules 1.04, 5.04 & 7.03).
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Practice Areas (1-5 Attys)</h4>
                <ul className="space-y-2.5 text-sm text-slate-400">
                  <li><Link href="/tarrant-county/fort-worth/family-law" className="hover:text-amber-400 transition-colors">Family Law & Custody</Link></li>
                  <li><Link href="/tarrant-county/fort-worth/criminal-defense-dwi" className="hover:text-amber-400 transition-colors">Criminal Defense & DWI</Link></li>
                  <li><Link href="/tarrant-county/fort-worth/probate-estate-planning" className="hover:text-amber-400 transition-colors">Probate & Estate Planning</Link></li>
                  <li><Link href="/tarrant-county/fort-worth/personal-injury" className="hover:text-amber-400 transition-colors">Personal Injury & Accidents</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Associated Professionals</h4>
                <ul className="space-y-2.5 text-sm text-slate-400">
                  <li><span className="text-slate-300 font-medium">Car Accident Chiropractors & MDs</span></li>
                  <li><span className="text-slate-300 font-medium">24/7 Tarrant County Bail Bondsmen</span></li>
                  <li><span className="text-slate-300 font-medium">Court-Approved Co-Parenting Mediators</span></li>
                  <li><span className="text-slate-300 font-medium">Probate Real Estate Specialists & CPAs</span></li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">Tarrant County & Metroplex</h4>
                <ul className="space-y-2.5 text-sm text-slate-400">
                  <li><Link href="/courthouses/lon-evans-corrections-center" className="hover:text-amber-400 transition-colors">Tarrant County Jail & Bond Desk</Link></li>
                  <li><Link href="/courthouses/tarrant-county-family-law-center" className="hover:text-amber-400 transition-colors">Family Law Center (200 E Weatherford)</Link></li>
                  <li><Link href="/courthouses/tarrant-county-probate-courts" className="hover:text-amber-400 transition-colors">Probate Courts #1 & #2 Guide</Link></li>
                  <li><Link href="/admin/outreach" className="hover:text-amber-400 transition-colors">Claim Your 1-5 Lawyer Profile</Link></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
              <p>© {new Date().getFullYear()} IfYouNeedALawyer.com. All rights reserved. Not a certified lawyer referral service or law firm. Attorney profiles are advertising listings.</p>
              <div className="flex gap-6">
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Texas Bar Compliance</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
