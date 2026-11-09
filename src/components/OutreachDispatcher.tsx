"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, ExternalLink } from "lucide-react";
import Link from "next/link";

interface FirmItem {
  id: string;
  name: string;
  cityName: string;
  managingPartnerName: string;
  email: string | null;
  partnerEmail: string | null;
  claimToken: string;
  tier: string;
  attorneyCount: number;
}

interface OutreachDispatcherProps {
  firms: FirmItem[];
}

export default function OutreachDispatcher({ firms }: OutreachDispatcherProps) {
  const [testEmail, setTestEmail] = useState("");
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const [batchStatus, setBatchStatus] = useState<string | null>(null);
  const [isBatchSending, setIsBatchSending] = useState(false);
  const [sentFirmIds, setSentFirmIds] = useState<Set<string>>(new Set());

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
      // Small delay between sends to respect rate limits
      await new Promise((r) => setTimeout(r, 600));
    }

    setIsBatchSending(false);
    setBatchStatus(`Completed! Successfully sent: ${successCount} emails. Failed: ${failCount}.`);
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

      {/* Discovered Law Firms Table with Enriched Emails & Send Buttons */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Discovered 1–5 Lawyer Practices ({firms.length} Enriched)</h2>
          <span className="text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            100% Emails Enriched
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/40">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="p-4">Firm Name & City</th>
                <th className="p-4">Decision Maker & Enriched Email</th>
                <th className="p-4">Size</th>
                <th className="p-4">Email Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {firms.map((f) => {
                const isSent = sentFirmIds.has(f.id);
                const displayEmail = f.partnerEmail || f.email || "No email";

                return (
                  <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <strong className="text-white block font-semibold text-sm">{f.name}</strong>
                      <span className="text-slate-400">{f.cityName}, TX</span>
                    </td>
                    <td className="p-4">
                      <span className="text-slate-200 block font-medium">{f.managingPartnerName}</span>
                      <span className="font-mono text-emerald-400 font-semibold">{displayEmail}</span>
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
                          <span>Sent</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-400 font-medium text-[11px]">
                          Ready to Send
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleSendSingleFirm(f.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-semibold text-xs transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send Invite</span>
                      </button>
                      <Link
                        href={`/claim/${f.claimToken}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
                      >
                        <span>Preview Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
