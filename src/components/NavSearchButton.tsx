"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import DirectorySearch from "./DirectorySearch";

export default function NavSearchButton() {
  const [isOpen, setIsOpen] = useState(false);

  // Close modal on escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors group"
        title="Search firms, attorneys, or emails (Ctrl+K)"
      >
        <Search className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline">Search firms or emails...</span>
        <span className="sm:hidden">Search</span>
        <kbd className="hidden lg:inline-block px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-500">
          ⌘K
        </kbd>
      </button>

      {/* Fullscreen Search Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Directory Search
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <DirectorySearch
              variant="compact"
              placeholder="Search firm name, managing partner, direct email, or city..."
              onSelect={() => setIsOpen(false)}
            />

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Search across 69+ vetted small firms in Tarrant County</span>
              <span>ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
