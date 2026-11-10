"use client";

import { useState } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Copy,
  Check,
  MessageSquare,
  Globe,
  Share2,
  X,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface FirmItem {
  id: string;
  name: string;
  cityName: string;
  managingPartnerName: string;
  email: string | null;
  partnerEmail: string | null;
  websiteUrl: string;
  partnerLinkedIn: string | null;
  claimToken: string;
  tier: string;
  attorneyCount: number;
  isContacted: boolean;
  contactHistory?: Array<{ eventType: string; createdAt: string }>;
}

interface OutreachDispatcherProps {
  firms: FirmItem[];
}

interface MatchedBounceItem {
  id: string;
  firmName: string;
  cityName: string;
  bouncedEmail: string;
  newPartnerEmail: string | null;
  canResend: boolean;
  status: string;
}

export default function OutreachDispatcher({ firms }: OutreachDispatcherProps) {
  const [testEmail, setTestEmail] = useState("");
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const [batchStatus, setBatchStatus] = useState<string | null>(null);
  const [isBatchSending, setIsBatchSending] = useState(false);
  const [sentFirmIds, setSentFirmIds] = useState<Set<string>>(
    new Set(firms.filter((f) => f.isContacted).map((f) => f.id))
  );

  // Bounces Resolution State
  const [bounceInput, setBounceInput] = useState("");
  const [isAnalyzingBounces, setIsAnalyzingBounces] = useState(false);
  const [isResendingBounces, setIsResendingBounces] = useState(false);
  const [matchedBounces, setMatchedBounces] = useState<MatchedBounceItem[] | null>(null);
  const [bounceActionStatus, setBounceActionStatus] = useState<string | null>(null);

  // Manual Outreach Modal State
  const [activeModalFirm, setActiveModalFirm] = useState<FirmItem | null>(null);
  const [activeTab, setActiveTab] = useState<"form" | "social" | "email">("form");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [markingContacted, setMarkingContacted] = useState(false);

  // Outreach Search & Filtering State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CONTACTED" | "PENDING" | "DIRECT_EMAIL" | "FORM_NEEDED">("ALL");
  const [cityFilter, setCityFilter] = useState<string>("ALL");

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://ifyouneedalawyer.com";

  // Unique sorted cities list for dropdown
  const citiesList = Array.from(new Set(firms.map((f) => f.cityName))).sort();

  // Real-time filtered firms by search term (firm name, partner name, email, website, city) and status
  const filteredFirms = firms.filter((f) => {
    const isSent = sentFirmIds.has(f.id);
    const displayEmail = (f.partnerEmail || f.email || "").toLowerCase();
    const isUnroutable = displayEmail.startsWith("unverified@");

    // Status Filter
    if (statusFilter === "CONTACTED" && !isSent) return false;
    if (statusFilter === "PENDING" && isSent) return false;
    if (statusFilter === "DIRECT_EMAIL" && (isUnroutable || !displayEmail || displayEmail === "no email")) return false;
    if (statusFilter === "FORM_NEEDED" && (!isUnroutable && displayEmail && displayEmail !== "no email")) return false;

    // City Filter
    if (cityFilter !== "ALL" && f.cityName !== cityFilter) return false;

    // Search Term matching firm name, partner name, direct/raw email, domain, or city
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      const matchesName = f.name.toLowerCase().includes(term);
      const matchesPartner = f.managingPartnerName.toLowerCase().includes(term);
      const matchesEmail =
        displayEmail.includes(term) || (f.email && f.email.toLowerCase().includes(term));
      const matchesCity = f.cityName.toLowerCase().includes(term);
      const matchesWebsite = f.websiteUrl ? f.websiteUrl.toLowerCase().includes(term) : false;
      return matchesName || matchesPartner || matchesEmail || matchesCity || matchesWebsite;
    }

    return true;
  });

  // Handle single test send to user's email
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) return;

    setIsTesting(true);
    setTestStatus(null);

    try {
      const sampleFirm = firms[0];
      const res = await fetch("/api/admin/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firmId: sampleFirm.id,
          targetEmail: testEmail,
          isTest: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestStatus(`✓ Test email successfully sent to ${testEmail}! Check your inbox.`);
      } else {
        setTestStatus(`Error: ${data.error || "Failed to send test email. Ensure RESEND_API_KEY is configured."}`);
      }
    } catch (err: any) {
      setTestStatus(`Exception: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  // Handle individual send to a specific firm
  const handleSendSingleFirm = async (firmId: string) => {
    try {
      const res = await fetch("/api/admin/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firmId }),
      });
      const data = await res.json();
      if (data.success) {
        setSentFirmIds((prev) => new Set([...prev, firmId]));
      } else {
        alert(`Error sending to firm: ${data.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  // Handle batch dispatch to all firms
  const handleBatchSendAll = async () => {
    if (!confirm(`Are you sure you want to dispatch 20x conversion emails to all ${firms.length} verified law firms?`)) {
      return;
    }

    setIsBatchSending(true);
    setBatchStatus("Dispatching batch invitations in sequence...");

    let successCount = 0;
    let failCount = 0;

    for (const firm of firms) {
      try {
        const res = await fetch("/api/admin/outreach/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firmId: firm.id }),
        });
        const data = await res.json();
        if (data.success) {
          successCount++;
          setSentFirmIds((prev) => new Set([...prev, firm.id]));
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }
      await new Promise((r) => setTimeout(r, 600));
    }

    setIsBatchSending(false);
    setBatchStatus(`Completed! Successfully sent: ${successCount} emails. Failed: ${failCount}.`);
  };

  // Analyze pasted bounces or CSV
  const handleAnalyzeBounces = async () => {
    if (!bounceInput.trim()) return;

    setIsAnalyzingBounces(true);
    setBounceActionStatus(null);

    try {
      const res = await fetch("/api/admin/outreach/bounces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: bounceInput, executeSend: false }),
      });

      const data = await res.json();
      if (data.success) {
        setMatchedBounces(data.matched);
        setBounceActionStatus(
          `Identified ${data.totalBouncesProvided} bounce records. Successfully matched ${data.matchedFirmsCount} law firms in directory.`
        );
      } else {
        setBounceActionStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setBounceActionStatus(`Exception: ${err.message}`);
    } finally {
      setIsAnalyzingBounces(false);
    }
  };

  // Execute Re-dispatch to Bounced Firms
  const handleExecuteResend = async () => {
    if (!bounceInput.trim()) return;
    if (!confirm("Are you ready to dispatch invitations to all matched firms using their corrected partner emails?")) {
      return;
    }

    setIsResendingBounces(true);
    setBounceActionStatus("Dispatching corrected invitations via Resend...");

    try {
      const res = await fetch("/api/admin/outreach/bounces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: bounceInput, executeSend: true }),
      });

      const data = await res.json();
      if (data.success) {
        setMatchedBounces(data.matched);
        setBounceActionStatus(
          `Re-dispatch Complete! Successfully sent: ${data.sentCount} emails. Skipped/Failed: ${data.failedCount}.`
        );
        // Refresh sent firms
        if (data.matched) {
          const newSent = new Set(sentFirmIds);
          data.matched.forEach((m: MatchedBounceItem) => {
            if (m.status.includes("Sent successfully")) newSent.add(m.id);
          });
          setSentFirmIds(newSent);
        }
      } else {
        setBounceActionStatus(`Error: ${data.error}`);
      }
    } catch (err: any) {
      setBounceActionStatus(`Exception: ${err.message}`);
    } finally {
      setIsResendingBounces(false);
    }
  };

  // Copy to clipboard helper
  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Mark as manually contacted
  const handleMarkManualContact = async (firmId: string, eventType: "MANUAL_OUTREACH_FORM" | "MANUAL_OUTREACH_SOCIAL") => {
    setMarkingContacted(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType,
          targetType: "LAW_FIRM",
          targetId: firmId,
          citySlug: activeModalFirm?.cityName.toLowerCase().replace(/\s+/g, "-"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSentFirmIds((prev) => new Set([...prev, firmId]));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingContacted(false);
    }
  };

  // Clean first name
  const getFirstName = (partnerName: string) => {
    const clean = partnerName.replace(/,\s*(Esq|PC|JD|PLLC|LLC)\.?/gi, "").trim();
    return clean.split(/\s+/)[0] || clean;
  };

  return (
    <div className="space-y-8">
      {/* Test Send & Batch Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Send Box */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Mail className="w-5 h-5 text-amber-400" />
            <span>Send Live Test Preview to Your Inbox</span>
          </div>
          <p className="text-xs text-slate-300">
            Preview the exact 20x conversion sales copy, layout, and magic claim link as an attorney will see it.
          </p>

          <form onSubmit={handleSendTest} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="Enter your personal email..."
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={isTesting}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Send Test</span>
            </button>
          </form>

          {testStatus && (
            <div
              className={`p-3 rounded-xl text-xs ${
                testStatus.startsWith("✓")
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              {testStatus}
            </div>
          )}
        </div>

        {/* Batch Dispatch Box */}
        <div className="p-6 rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-500/10 to-slate-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>1-Click Batch Dispatch (All {firms.length} Firms)</span>
            </div>
            <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">
              Founders Special
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Dispatches personalized invitation emails to all {firms.length} verified 1-5 lawyer practices with their unique claim links.
          </p>

          <button
            onClick={handleBatchSendAll}
            disabled={isBatchSending}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isBatchSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isBatchSending ? "Dispatching Batch..." : `Dispatch To All ${firms.length} Law Firms`}</span>
          </button>

          {batchStatus && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-medium">
              {batchStatus}
            </div>
          )}
        </div>
      </div>

      {/* Bounced Email Resolver & Re-dispatch Panel */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/70 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <RefreshCw className="w-5 h-5 text-amber-400" />
            <span>Resend Bounced Email Resolver (Import CSV or Paste Bounced Inboxes)</span>
          </div>
          <span className="text-[11px] text-slate-400">
            Auto-matches old contact@ bounces to new direct partner emails
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Paste the list of bounced emails or raw CSV export from your Resend dashboard. The engine matches each firm, verifies active mail exchange (MX) servers, and re-dispatches the Founders Launch invitation to the managing partner's inbox.
        </p>

        <textarea
          rows={3}
          placeholder="Paste bounced emails or CSV text here (e.g., contact@dougwrightlaw.com, contact@thekaforlawfirm.com, contact@bryanhoellerlaw.com)..."
          value={bounceInput}
          onChange={(e) => setBounceInput(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-amber-500"
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAnalyzeBounces}
            disabled={isAnalyzingBounces || !bounceInput.trim()}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {isAnalyzingBounces ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>Analyze Bounces & Match Partner Inboxes</span>
          </button>

          {matchedBounces && matchedBounces.some((m) => m.canResend) && (
            <button
              onClick={handleExecuteResend}
              disabled={isResendingBounces}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-emerald-500/20"
            >
              {isResendingBounces ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Resend to Corrected Partner Inboxes Now</span>
            </button>
          )}
        </div>

        {bounceActionStatus && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-amber-300 font-medium">
            {bounceActionStatus}
          </div>
        )}

        {/* Matched Bounces Table */}
        {matchedBounces && matchedBounces.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3">Firm Name</th>
                  <th className="p-3">Old Bounced Email</th>
                  <th className="p-3">Corrected Partner Email</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {matchedBounces.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-3 font-medium text-white">{item.firmName} ({item.cityName})</td>
                    <td className="p-3 font-mono text-red-400">{item.bouncedEmail}</td>
                    <td className="p-3 font-mono text-emerald-400 font-semibold">{item.newPartnerEmail || "None found"}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                          item.status.includes("Sent successfully")
                            ? "bg-emerald-500/20 text-emerald-400"
                            : item.canResend
                            ? "bg-sky-500/10 text-sky-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Discovered Law Firms Table with Enriched Emails, Status & Pitch Modals */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">Discovered 1–5 Lawyer Practices ({firms.length} Enriched)</h2>
            <p className="text-xs text-slate-400">
              {sentFirmIds.size} of {firms.length} firms have been contacted ({firms.length - sentFirmIds.size} pending).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {sentFirmIds.size} Dispatched
            </span>
            <span className="text-xs text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              {firms.length - sentFirmIds.size} Pending
            </span>
          </div>
        </div>

        {/* Live Search & Filter Bar */}
        <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search Input for Firm, Partner, Email, City */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4 text-amber-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search firm name, partner name, email (e.g. ynk@, @domain.com), city..."
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* City Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-xs text-slate-400 font-medium hidden sm:inline">City:</label>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Cities ({citiesList.length})</option>
                {citiesList.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Pills & Result Counter */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-500 text-[11px] font-semibold mr-1">Filter:</span>
              <button
                type="button"
                onClick={() => setStatusFilter("ALL")}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                  statusFilter === "ALL"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "bg-slate-800/80 hover:bg-slate-800 text-slate-300"
                }`}
              >
                All ({firms.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("CONTACTED")}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                  statusFilter === "CONTACTED"
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "bg-slate-800/80 hover:bg-slate-800 text-emerald-400"
                }`}
              >
                Contacted ({sentFirmIds.size})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("PENDING")}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                  statusFilter === "PENDING"
                    ? "bg-amber-500 text-slate-950 shadow-sm"
                    : "bg-slate-800/80 hover:bg-slate-800 text-amber-400"
                }`}
              >
                Pending ({firms.length - sentFirmIds.size})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("DIRECT_EMAIL")}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                  statusFilter === "DIRECT_EMAIL"
                    ? "bg-sky-500 text-slate-950 shadow-sm"
                    : "bg-slate-800/80 hover:bg-slate-800 text-sky-400"
                }`}
              >
                Direct Email Available
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("FORM_NEEDED")}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-colors ${
                  statusFilter === "FORM_NEEDED"
                    ? "bg-purple-500 text-slate-950 shadow-sm"
                    : "bg-slate-800/80 hover:bg-slate-800 text-purple-400"
                }`}
              >
                Form / Social Needed
              </button>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <span>
                Showing <strong className="text-white">{filteredFirms.length}</strong> of {firms.length} practices
              </span>
              {(searchTerm || statusFilter !== "ALL" || cityFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                    setCityFilter("ALL");
                  }}
                  className="text-amber-400 hover:underline font-semibold"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Firm Name & City</th>
                <th className="p-4">Managing Partner & Verified Inbox</th>
                <th className="p-4">Size</th>
                <th className="p-4">Outreach Status</th>
                <th className="p-4 text-right">Actions & Pitch Copy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredFirms.length > 0 ? (
                filteredFirms.map((f) => {
                  const isSent = sentFirmIds.has(f.id);
                  const displayEmail = f.partnerEmail || f.email || "No email";
                  const isUnroutable = displayEmail.startsWith("unverified@");

                return (
                  <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <strong className="text-white block font-semibold text-sm">{f.name}</strong>
                      <span className="text-slate-400">{f.cityName}, TX</span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-200 block font-medium">{f.managingPartnerName}</span>
                      <span
                        className={`font-mono text-xs font-semibold ${
                          isUnroutable ? "text-amber-400 italic" : "text-emerald-400"
                        }`}
                      >
                        {displayEmail}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 font-semibold text-amber-400">
                        {f.attorneyCount === 1 ? "1 (Solo)" : `${f.attorneyCount} (Boutique)`}
                      </span>
                    </td>
                    <td className="p-4">
                      {isSent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Contacted</span>
                        </span>
                      ) : isUnroutable ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium text-[11px]">
                          Form/Social Only
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-400 font-medium text-[11px]">
                          Pending Outreach
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {/* Copy Pitch & Form Content Button */}
                      <button
                        onClick={() => setActiveModalFirm(f)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold text-xs transition-colors"
                        title="Copy Form, LinkedIn & Email Pitch"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Copy Pitch</span>
                      </button>

                      <button
                        onClick={() => handleSendSingleFirm(f.id)}
                        disabled={isUnroutable}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={isUnroutable ? "Domain has no MX; use Contact Form copy instead" : "Send Resend Email"}
                      >
                        <Send className="w-3 h-3" />
                        <span>Email</span>
                      </button>

                      <Link
                        href={`/claim/${f.claimToken}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                      >
                        <span>Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="p-10 text-center space-y-2">
                  <p className="text-sm font-semibold text-slate-300">
                    No law practices or emails matched your search.
                  </p>
                  <p className="text-xs text-slate-500">
                    Try typing a different firm name, attorney first name, or email domain.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("ALL");
                      setCityFilter("ALL");
                    }}
                    className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs transition-colors"
                  >
                    Reset Filters
                  </button>
                </td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outreach Pitch Copy Modal */}
      {activeModalFirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setActiveModalFirm(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Direct Admin Outreach Generator</span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {activeModalFirm.name} ({activeModalFirm.cityName}, TX)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Managing Partner: <strong className="text-slate-200">{activeModalFirm.managingPartnerName}</strong> • Claim Token: <code className="font-mono text-amber-400">{activeModalFirm.claimToken}</code>
              </p>
            </div>

            {/* Quick Action Links */}
            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800">
              <a
                href={activeModalFirm.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Open Firm Website</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>

              {activeModalFirm.partnerLinkedIn && (
                <a
                  href={activeModalFirm.partnerLinkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Open Social Profile</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              )}

              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(`${activeModalFirm.name} ${activeModalFirm.cityName} contact`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
              >
                <span>Google Search Contact</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>

            {/* Message Type Selector Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab("form")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === "form"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Website Contact Form Message
              </button>
              <button
                onClick={() => setActiveTab("social")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === "social"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                LinkedIn / Facebook Direct Message
              </button>
              <button
                onClick={() => setActiveTab("email")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === "email"
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                Full Verified Notice Email
              </button>
            </div>

            {/* Copyable Message Bodies */}
            <div className="space-y-3">
              {activeTab === "form" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Optimized for Law Firm Website Contact Form & Intake Boxes</span>
                    <button
                      onClick={() =>
                        handleCopyText(
                          `Notice of Verified Inclusion: ${activeModalFirm.name} (${activeModalFirm.cityName})\n\nDear ${activeModalFirm.managingPartnerName},\n\nYour practice, ${activeModalFirm.name} in ${activeModalFirm.cityName}, has been independently vetted and selected for inclusion in the Tarrant County Small Practice Index on IfYouNeedALawyer.com.\n\nWe built this platform exclusively for 1 to 5 attorney boutique practices to bypass mega-firm billboard mills and connect local clients directly with trial-tested partners.\n\nYour baseline verified listing is active at no cost. Each city is capped at strictly 3 Featured Sponsor Slots, currently open to early adopters at our grandfathered Founders rate.\n\nPreview and claim your verified practice listing here:\n${siteUrl}/claim/${activeModalFirm.claimToken}\n\nBest regards,\nEditorial Staff, IfYouNeedALawyer.com\nNon-lawyer flat advertising directory operating strictly within TDRPC 5.04 & 7.03.`,
                          "form"
                        )
                      }
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === "form" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "form" ? "Copied to Clipboard!" : "Copy Form Message"}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
{`Notice of Verified Inclusion: ${activeModalFirm.name} (${activeModalFirm.cityName})

Dear ${activeModalFirm.managingPartnerName},

Your practice, ${activeModalFirm.name} in ${activeModalFirm.cityName}, has been independently vetted and selected for inclusion in the Tarrant County Small Practice Index on IfYouNeedALawyer.com.

We built this platform exclusively for 1 to 5 attorney boutique practices to bypass mega-firm billboard mills and connect local clients directly with trial-tested partners.

Your baseline verified listing is active at no cost. Each city is capped at strictly 3 Featured Sponsor Slots, currently open to early adopters at our grandfathered Founders rate.

Preview and claim your verified practice listing here:
${siteUrl}/claim/${activeModalFirm.claimToken}

Best regards,
Editorial Staff, IfYouNeedALawyer.com
Non-lawyer flat advertising directory operating strictly within TDRPC 5.04 & 7.03.`}
                  </pre>
                </div>
              )}

              {activeTab === "social" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Short & High-Converting for LinkedIn InMail or Facebook Messenger</span>
                    <button
                      onClick={() =>
                        handleCopyText(
                          `Hi ${getFirstName(activeModalFirm.managingPartnerName)}, reaching out because ${activeModalFirm.name} in ${activeModalFirm.cityName} was vetted and selected for our Tarrant County Small Practice Directory (ifyouneedalawyer.com).\n\nWe built this index specifically for 1 to 5 attorney practices to give clients direct partner access instead of billboard call centers. Your baseline listing is live at no charge, and you can preview and claim the ${activeModalFirm.cityName} profile here: ${siteUrl}/claim/${activeModalFirm.claimToken}`,
                          "social"
                        )
                      }
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === "social" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "social" ? "Copied!" : "Copy LinkedIn/FB Message"}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
{`Hi ${getFirstName(activeModalFirm.managingPartnerName)}, reaching out because ${activeModalFirm.name} in ${activeModalFirm.cityName} was vetted and selected for our Tarrant County Small Practice Directory (ifyouneedalawyer.com).

We built this index specifically for 1 to 5 attorney practices to give clients direct partner access instead of billboard call centers. Your baseline listing is live at no charge, and you can preview and claim the ${activeModalFirm.cityName} profile here: ${siteUrl}/claim/${activeModalFirm.claimToken}`}
                  </pre>
                </div>
              )}

              {activeTab === "email" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Full Verified Notice Email</span>
                    <button
                      onClick={() =>
                        handleCopyText(
                          `Subject: Tarrant County Directory: ${activeModalFirm.name} (${getFirstName(activeModalFirm.managingPartnerName)})\n\nDear ${getFirstName(activeModalFirm.managingPartnerName)},\n\nYour practice, ${activeModalFirm.name} in ${activeModalFirm.cityName}, has been vetted and added to IfYouNeedALawyer.com.\n\nWhy Small Practices Choose Us:\nHigh-intent legal consumers in Tarrant County are tired of billboard mega-firms where clients get handed off to call centers. We built this platform strictly for 1 to 5 attorney practices so local clients connect directly with trial-tested partners.\n\nFounders Rate Notice:\nYour baseline verified listing is active at no charge. We also reserve strictly 3 Featured Sponsor Slots per city. As an early partner, you can lock in our Founders Launch rate before the top spots in ${activeModalFirm.cityName} are claimed.\n\nView & Claim Your Practice Listing:\n${siteUrl}/claim/${activeModalFirm.claimToken}\n\n--\nIfYouNeedALawyer.com • Tarrant County Vetted Legal Directory\nNon-lawyer flat advertising directory operating strictly within TDRPC 5.04 & 7.03.\nTo opt out or update your listing preferences, reply directly to this email.`,
                          "email"
                        )
                      }
                      className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold text-xs flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === "email" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === "email" ? "Copied!" : "Copy Email Notice"}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
{`Subject: Tarrant County Directory: ${activeModalFirm.name} (${getFirstName(activeModalFirm.managingPartnerName)})

Dear ${getFirstName(activeModalFirm.managingPartnerName)},

Your practice, ${activeModalFirm.name} in ${activeModalFirm.cityName}, has been vetted and added to IfYouNeedALawyer.com.

Why Small Practices Choose Us:
High-intent legal consumers in Tarrant County are tired of billboard mega-firms where clients get handed off to call centers. We built this platform strictly for 1 to 5 attorney practices so local clients connect directly with trial-tested partners.

Founders Rate Notice:
Your baseline verified listing is active at no charge. We also reserve strictly 3 Featured Sponsor Slots per city. As an early partner, you can lock in our Founders Launch rate before the top spots in ${activeModalFirm.cityName} are claimed.

View & Claim Your Practice Listing:
${siteUrl}/claim/${activeModalFirm.claimToken}

--
IfYouNeedALawyer.com • Tarrant County Vetted Legal Directory
Non-lawyer flat advertising directory operating strictly within TDRPC 5.04 & 7.03.`}
                  </pre>
                </div>
              )}
            </div>

            {/* Bottom Actions to Log Lead Event */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-400">
                Pasted on website or sent via message?
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleMarkManualContact(activeModalFirm.id, "MANUAL_OUTREACH_FORM")}
                  disabled={markingContacted}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark as Contacted via Form</span>
                </button>
                <button
                  onClick={() => handleMarkManualContact(activeModalFirm.id, "MANUAL_OUTREACH_SOCIAL")}
                  disabled={markingContacted}
                  className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 font-semibold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Mark as Contacted via LinkedIn/FB</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
