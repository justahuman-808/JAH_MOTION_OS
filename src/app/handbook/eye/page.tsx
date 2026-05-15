"use client";

import { useState } from "react";
import { TactileCard } from "@/components/ui/TactileCard";
import { Eye, CheckCircle2, Search, Zap, Code, Loader2 } from "lucide-react";
import { auditDNA } from "@/app/actions/audit-dna";
import { cn } from "@/lib/utils";

interface AuditResult {
  status: string;
  mode: string;
  score: number;
  feedback: string;
  timestamp: string;
}

export default function EyePage() {
  const [code, setCode] = useState("txt = text.sourceText; regex = /[\\u1000-\\u109F]/g; txt.replace(regex, (m) => m + '\\u200B');");
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);

  const handleAudit = async () => {
    setIsAuditing(true);
    try {
      const res = await auditDNA(code);
      setResult(res);
    } catch (error) {
      console.error("Audit failed", error);
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-white">
          <Eye size={40} />
          <h1 className="text-4xl font-bold">Eye: Quality Feedback Loop</h1>
        </div>
        <p className="text-gray-400 text-lg max-w-2xl">
          The auditing and validation system. The Eye ensures every frame and snippet meets our studio&apos;s standards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <TactileCard>
          <div className="flex items-center gap-3 mb-4 text-white">
            <CheckCircle2 size={20} />
            <h3 className="font-bold text-xl">Aesthetic Standards</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Every output is audited for brand compliance, motion fluidity, and Burmese Unicode correctness.
          </p>
        </TactileCard>

        <TactileCard>
          <div className="flex items-center gap-3 mb-4 text-white">
            <Search size={20} />
            <h3 className="font-bold text-xl">Human-in-the-Loop</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Final review is always performed by a lead artist. We utilize AI assistance for audits while keeping the final judgment human.
          </p>
        </TactileCard>
      </div>

      {/* AI Auditor Interface */}
      <section className="bg-neutral-dark p-8 rounded-2xl border border-white/10 space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="text-accent" size={24} />
            Gemini DNA Auditor
          </h2>
          <p className="text-gray-500 text-sm">
            Paste After Effects expressions or JSX code to run an automated quality audit.
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative group">
            <div className="absolute top-4 left-4 text-accent/30 pointer-events-none">
              <Code size={18} />
            </div>
            <textarea
              id="dna-audit-code"
              name="dnaAuditCode"
              className="w-full h-48 bg-black/40 border border-white/10 rounded-xl p-6 pl-12 font-mono text-xs focus:outline-none focus:border-accent transition-colors resize-none"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code to audit..."
            />
          </div>

          <button
            onClick={handleAudit}
            disabled={isAuditing}
            className={cn(
              "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all",
              isAuditing
                ? "bg-white/5 text-gray-500 cursor-not-allowed"
                : "bg-accent text-background hover:scale-[1.02] active:scale-[0.98]"
            )}
          >
            {isAuditing ? <Loader2 className="animate-spin" size={20} /> : "Run DNA Audit"}
          </button>
        </div>

        {result && (
          <div className={cn(
            "p-6 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300",
            result.status === "PASS" ? "bg-accent/5 border-accent/20" : "bg-red-500/5 border-red-500/20"
          )}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-accent" size={20} />
                <span className="font-bold uppercase tracking-wider text-accent text-sm">
                  {result.status}
                </span>
              </div>
              <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-mono text-gray-400">
                Score: {result.score}/100
              </div>
            </div>
            <p className="text-white text-sm leading-relaxed mb-4">
              {result.feedback}
            </p>
            <div className="flex justify-between items-center text-[10px] text-gray-600 font-mono">
              <span>Mode: {result.mode.toUpperCase()}</span>
              <span>{new Date(result.timestamp).toLocaleString()}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
