import { prisma } from "@/lib/prisma";
import Link from "next/link";
import LegalTriageTool from "@/components/LegalTriageTool";
import DirectorySearch from "@/components/DirectorySearch";
import {
  Scale,
  ShieldCheck,
  Building,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Sparkles,
  Award,
  Stethoscope,
  Key,
  HeartHandshake,
  Home,
  AlertTriangle
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let cities: Array<{ id: string; name: string; slug: string }> = [];
  let practiceAreas: Array<{ id: string; name: string; slug: string; description: string }> = [];
  let courthouses: Array<{ id: string; name: string; slug: string; courtType: string; parkingGuide: string }> = [];
  let dbError: string | null = null;

  try {
    const [c, pa, ch] = await Promise.all([
      prisma.city.findMany({
        where: { county: { slug: "tarrant-county" } },
        orderBy: { population: "desc" },
        take: 6,
      }),
      prisma.practiceArea.findMany({
        where: { isHighVelocity: true },
      }),
      prisma.courthouse.findMany({
        take: 3,
      }),
    ]);
    cities = c;
    practiceAreas = pa;
    courthouses = ch;
  } catch (err: unknown) {
    console.error("Database connection error on homepage:", err);
    dbError = err instanceof Error ? err.message : String(err);
  }

  // Fallbacks if database is pending migration or seeding
  const fallbackPracticeAreas = [
    {
      id: "pa-1",
      name: "Family Law & Custody",
      slug: "family-law",
      description: "Divorce, child custody, protective orders, child support modifications, and parental rights.",
    },
    {
      id: "pa-2",
      name: "Criminal Defense & DWI",
      slug: "criminal-defense-dwi",
      description: "DWI/DUI arrests, drug possession, misdemeanor & felony defense, bail bond hearings, and expunctions.",
    },
    {
      id: "pa-3",
      name: "Probate & Estate Planning",
      slug: "probate-estate-planning",
      description: "Will probate, muniment of title, small estate affidavits, trusts, guardianship, and estate administration.",
    },
    {
      id: "pa-4",
      name: "Personal Injury & Accidents",
      slug: "personal-injury",
      description: "Car wrecks, 18-wheeler accidents, slip and falls, and wrongful death. Contingency fee representation.",
    },
  ];

  const displayPracticeAreas = practiceAreas.length > 0 ? practiceAreas : fallbackPracticeAreas;

  const fallbackCourthouses = [
    {
      id: "ch-1",
      name: "Tarrant County Family Law Center",
      slug: "tarrant-county-family-law-center",
      courtType: "Family",
      parkingGuide: "Calhoun St parking garage across from the Family Law Center or metered parking along Weatherford.",
    },
    {
      id: "ch-2",
      name: "Lon Evans Corrections Center & Tarrant Jail Bond Desk",
      slug: "lon-evans-corrections-center",
      courtType: "Criminal/Jail",
      parkingGuide: "Free 2-hour and metered street parking along Belknap and Weatherford. Bond desk is accessible 24/7.",
    },
    {
      id: "ch-3",
      name: "Tarrant County Probate Courts #1 & #2",
      slug: "tarrant-county-probate-courts",
      courtType: "Probate",
      parkingGuide: "Historic 1895 Courthouse at 100 W Weatherford. Public parking garage is located at 101 Calhoun St.",
    },
  ];

  const displayCourthouses = courthouses.length > 0 ? courthouses : fallbackCourthouses;

  return (
    <div className="space-y-24 pb-20">
      {/* 1. DUAL-ENTRY HERO SECTION */}
      <section className="relative overflow-hidden pt-12 sm:pt-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-amber-500/10 rounded-full blur-[140px] -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {dbError && (
            <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
              <div>
                <strong>Notice:</strong> Cloud database schema migration pending ({dbError.slice(0, 80)}...). Site running in resilient preview mode.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero: Direct Search & Small-Firm Positioning */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-300">
                  Strictly 1 to 5 Lawyer Firms • Billboard Mills Excluded
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1]">
                If You Need A Lawyer, <br />
                <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                  Get Direct Attorney Access.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                Tired of calling a TV billboard firm only to be handed to a call center or junior paralegal? We index exclusively vetted <strong>1 to 5 attorney small boutique practices</strong> across Tarrant County, plus the trusted local associated doctors, bail bondsmen, and mediators you need.
              </p>

              {/* Instant Search Bar (Search by Firm, Email, Attorney, or City) */}
              <div className="space-y-3">
                <DirectorySearch
                  variant="hero"
                  placeholder="Search by firm name, partner name, email (e.g. ynk@, .com), city, or issue..."
                />

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
                  <span className="font-semibold text-slate-300">Popular Quick Searches:</span>
                  <Link
                    href="/tarrant-county/fort-worth/family-law"
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Fort Worth Family Law
                  </Link>
                  <Link
                    href="/tarrant-county/arlington/criminal-defense-dwi"
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Arlington DWI Defense
                  </Link>
                  <Link
                    href="/tarrant-county/southlake/probate-estate-planning"
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    Southlake Probate
                  </Link>
                </div>
              </div>

              {/* Trust Metrics */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
                <div>
                  <strong className="text-lg font-bold text-white block">100%</strong>
                  <span className="text-slate-400">1 to 5 Lawyer Cap</span>
                </div>
                <div>
                  <strong className="text-lg font-bold text-white block">$0</strong>
                  <span className="text-slate-400">Call Center Markups</span>
                </div>
                <div>
                  <strong className="text-lg font-bold text-white block">Texas Bar</strong>
                  <span className="text-slate-400">Rule 1.04 & 7.03 Compliant</span>
                </div>
              </div>
            </div>

            {/* Right Hero: 60-Second Legal Triage Calculator */}
            <div className="lg:col-span-5">
              <LegalTriageTool />
            </div>
          </div>
        </div>
      </section>

      {/* 2. WHY 1-5 LAWYER FIRMS BEAT BILLBOARD FIRMS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
            The Consumer Dilemma
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            Why High-Impact Legal Cases Belong With 1–5 Attorney Firms
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
            The legal industry's best-kept secret: giant firms spend millions on freeway billboards, then treat your family, criminal, or accident case like an assembly line.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Billboard Settlement Mills */}
          <div className="p-8 rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-500/5 to-slate-950 space-y-4">
            <div className="flex items-center gap-3 text-red-400 font-bold text-lg">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3>The 50+ Lawyer TV "Settlement Mill" Reality</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span>You rarely or never speak to the named partner on the billboard.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span>Case managers and non-lawyer coordinators handle negotiations.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span>Pressured to take early lowball settlements to maintain firm cash flow.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-red-400 font-bold">✕</span>
                <span>Your file is one of 400 cases assigned to an overworked junior associate.</span>
              </li>
            </ul>
          </div>

          {/* 1-5 Lawyer Boutique Firms */}
          <div className="p-8 rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/5 to-slate-950 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-emerald-400 font-bold text-lg">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <h3>The Vetted 1–5 Attorney Boutique Advantage</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Direct Trial Attorney Representation:</strong> You have the partner's direct office number and email.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Strictly Capped Caseloads:</strong> The lawyer devotes actual hours to reviewing your evidence and court docket.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Trial Ready:</strong> Prosecutors and insurance adjusters know small trial attorneys aren't afraid of the courtroom.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span><strong>Transparent Fees:</strong> No inflated corporate overhead; competitive flat fees and honest retainers.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. HIGH-VELOCITY BIG 4 PRACTICE DIRECTORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Phase 1 Launch: Tarrant County
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Browse Vetted 1–5 Lawyer Practices by Vertical
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Expanding soon to Dallas, Denton, Johnson, and Collin/Plano
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayPracticeAreas.map((pa) => (
            <Link
              key={pa.id}
              href={`/tarrant-county/fort-worth/${pa.slug}`}
              className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-amber-500/50 transition-all space-y-4 shadow-lg hover:shadow-amber-500/5"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  {pa.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {pa.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-amber-400">
                <span>View Small Firms</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. CONTEXTUAL ASSOCIATED PROFESSIONALS ECOSYSTEM */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 sm:p-12 shadow-2xl">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Associated Support Specialists
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              The Essential Non-Lawyer Network You Need
            </h2>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
              Legal challenges require coordinated medical, bonding, therapy, and real estate professionals. We connect consumers and small law firms directly with pre-screened local specialists in Tarrant County.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <Stethoscope className="w-6 h-6 text-emerald-400" />
              <h4 className="text-base font-bold text-white">Car Accident Doctors & Chiros</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Accepts Letters of Protection (LOP) and MedPay. Diagnostic whiplash and spine treatment before insurance settlement.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <Key className="w-6 h-6 text-amber-400" />
              <h4 className="text-base font-bold text-white">24/7 Tarrant County Bail Bonds</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Immediate jail release from Lon Evans & municipal jails. Fast payment plans and coordination with defense counsel.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <HeartHandshake className="w-6 h-6 text-sky-400" />
              <h4 className="text-base font-bold text-white">Co-Parenting Mediators & LMFTs</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Court-approved custody mediation, reunification counseling, and parenting coordinators to reduce litigation costs.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <Home className="w-6 h-6 text-purple-400" />
              <h4 className="text-base font-bold text-white">Probate Real Estate Specialists</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Certified Probate Real Estate Specialists (CPRES) handling property cleanouts, appraisals, and estate home liquidation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. COURTHOUSE & JAIL PROCEDURAL HUBS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              High-Intent Procedural Guides
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Tarrant County Courthouse, Jail & Clerk Hub
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayCourthouses.map((ch) => (
            <Link
              key={ch.id}
              href={`/courthouses/${ch.slug}`}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 transition-colors space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                <span>{ch.courtType} Facility</span>
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-base font-bold text-white">{ch.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{ch.parkingGuide}</p>
              <div className="pt-2 text-xs font-semibold text-slate-300 flex items-center gap-1">
                <span>Read Survival Guide & Nearby Firms</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
