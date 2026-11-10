"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Scale, Mail, MapPin, ExternalLink, ArrowRight, X, Loader2, Sparkles, User } from "lucide-react";
import Link from "next/link";

interface SearchFirmResult {
  id: string;
  name: string;
  slug: string;
  managingPartnerName: string;
  email: string | null;
  websiteUrl: string;
  phone: string;
  attorneyCount: number;
  tier: string;
  cityName: string;
  citySlug: string;
  countySlug: string;
  practiceAreas: Array<{ name: string; slug: string }>;
  profileUrl: string;
  directoryUrl: string;
}

interface SearchProResult {
  id: string;
  businessName: string;
  slug: string;
  category: string;
  email: string | null;
  phone: string;
  websiteUrl: string;
  cityName: string;
  linkedPracticeSlug: string;
}

interface DirectorySearchProps {
  variant?: "hero" | "compact" | "modal";
  placeholder?: string;
  onSelect?: () => void;
}

export default function DirectorySearch({
  variant = "hero",
  placeholder = "Search by firm name, attorney, email (e.g. ynk@, .com), city, or legal issue...",
  onSelect,
}: DirectorySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ firms: SearchFirmResult[]; pros: SearchProResult[] }>({
    firms: [],
    pros: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ firms: [], pros: [] });
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults({ firms: data.firms || [], pros: data.pros || [] });
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const hasResults = results.firms.length > 0 || results.pros.length > 0;
  const isEmailQuery = query.includes("@") || query.includes(".com");

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Bar Input */}
      <div
        className={`relative flex items-center w-full transition-all duration-200 ${
          variant === "hero"
            ? "p-2 rounded-2xl border-2 border-amber-500/30 bg-slate-900/95 shadow-2xl shadow-amber-500/10 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-500/20"
            : "p-1.5 rounded-xl border border-slate-700 bg-slate-900 focus-within:border-amber-400"
        }`}
      >
        <div className="pl-3 pr-2 text-amber-400 flex items-center">
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
          ) : (
            <Search className="w-5 h-5 text-amber-400" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim().length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none py-1.5 px-2"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults({ firms: [], pros: [] });
              setIsOpen(false);
            }}
            className="p-1.5 mr-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {variant === "hero" && (
          <button
            type="button"
            onClick={() => {
              if (query.trim().length >= 2) setIsOpen(true);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all shrink-0"
          >
            <span>Search</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Instant Dropdown Results */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-slate-800 bg-slate-900/98 shadow-2xl backdrop-blur-xl z-50 overflow-hidden max-h-[460px] overflow-y-auto divide-y divide-slate-800/80">
          {/* Header indicator */}
          <div className="px-4 py-2.5 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800">
            <span className="flex items-center gap-1.5">
              {isEmailQuery ? (
                <span className="text-amber-400 font-semibold flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Matching Email / Domain:
                </span>
              ) : (
                <span>Search Results:</span>
              )}
              <strong className="text-white">&ldquo;{query}&rdquo;</strong>
            </span>
            <span>
              {results.firms.length} firm{results.firms.length === 1 ? "" : "s"} found
            </span>
          </div>

          {/* Results List */}
          {hasResults ? (
            <div className="p-2 space-y-1">
              {/* Law Firms */}
              {results.firms.map((firm) => (
                <Link
                  key={firm.id}
                  href={firm.profileUrl}
                  onClick={() => {
                    setIsOpen(false);
                    if (onSelect) onSelect();
                  }}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700/60"
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">
                        {firm.name}
                      </span>
                      {firm.tier === "FEATURED_SPONSOR" && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                          Featured Sponsor
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium flex items-center gap-1">
                        <Scale className="w-2.5 h-2.5 text-amber-400" />
                        {firm.attorneyCount} Attorney{firm.attorneyCount > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 text-slate-300">
                        <User className="w-3 h-3 text-slate-500" />
                        {firm.managingPartnerName}
                      </span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3 h-3 text-amber-400/80" />
                        {firm.cityName}, TX
                      </span>
                      {firm.email && (
                        <span className="flex items-center gap-1 text-amber-300 font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          <Mail className="w-3 h-3 text-amber-400" />
                          {firm.email}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-0 flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <span className="text-xs font-semibold text-amber-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      View Profile
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}

              {/* Associated Pros */}
              {results.pros.length > 0 && (
                <div className="pt-2 mt-2 border-t border-slate-800">
                  <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Associated Support Professionals
                  </div>
                  {results.pros.map((pro) => (
                    <div
                      key={pro.id}
                      className="p-3 rounded-xl hover:bg-slate-800/80 transition-colors flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-white text-xs block">
                          {pro.businessName}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="text-amber-400">{pro.category.replace(/_/g, " ")}</span>
                          <span>•</span>
                          <span>{pro.cityName}, TX</span>
                          {pro.email && (
                            <span className="text-slate-300 font-mono">{pro.email}</span>
                          )}
                        </div>
                      </div>

                      {pro.websiteUrl && (
                        <a
                          href={pro.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                        >
                          <span>Visit</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center space-y-2">
              <Scale className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                No matching firms or emails found for &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching by city (e.g., &ldquo;Fort Worth&rdquo;, &ldquo;Arlington&rdquo;), attorney name (e.g., &ldquo;Robert&rdquo;, &ldquo;Kafor&rdquo;), or practice area.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
