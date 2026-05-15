"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, CheckCircle2, Radio, RefreshCw, Zap } from "lucide-react";

import { SyncFeed } from "@/components/ui/SyncFeed";
import { MOTION_TOKENS } from "@/lib/intent_schema";
import type { SyncEvent, SyncTarget } from "@/lib/intent_schema";

type SyncState = "idle" | "loading" | "success" | "noop" | "error";

interface HealthState {
  bridgeReachable: boolean;
  lastSyncTs: string | null;
}

export default function DashboardPage() {
  const [selectedToken, setSelectedToken] = useState(MOTION_TOKENS[0]?.name ?? "");
  const [selectedTarget, setSelectedTarget] = useState<SyncTarget>("web");
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [syncEvent, setSyncEvent] = useState<SyncEvent | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [feedKey, setFeedKey] = useState(0);
  const [health, setHealth] = useState<HealthState>({ bridgeReachable: true, lastSyncTs: null });

  const driftFlag = useMemo(() => {
    if (!health.lastSyncTs || !syncEvent?.token || syncEvent.event !== "sync_noop") {
      return false;
    }
    return true;
  }, [health.lastSyncTs, syncEvent]);

  async function refreshHealth() {
    try {
      const res = await fetch("/api/sync", { cache: "no-store" });
      const data = (await res.json()) as { bridgeReachable?: boolean; lastSyncTs?: string | null };
      setHealth({
        bridgeReachable: data.bridgeReachable ?? true,
        lastSyncTs: data.lastSyncTs ?? null,
      });
    } catch {
      setHealth((current) => ({ ...current, bridgeReachable: false }));
    }
  }

  useEffect(() => {
    void refreshHealth();
  }, []);

  async function triggerSync() {
    setSyncState("loading");
    setSyncError(null);
    setSyncEvent(null);

    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: selectedToken, target: selectedTarget }),
      });

      const data = (await res.json()) as {
        ok: boolean;
        status?: string;
        event?: SyncEvent;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        setSyncState("error");
        setSyncError(data.error ?? "Sync failed.");
      } else if (data.status === "no-op") {
        setSyncState("noop");
        setSyncEvent(data.event ?? null);
      } else {
        setSyncState("success");
        setSyncEvent(data.event ?? null);
      }

      setFeedKey((value) => value + 1);
      await refreshHealth();
    } catch (error) {
      setSyncState("error");
      setSyncError(error instanceof Error ? error.message : "Network error.");
    }
  }

  return (
    <div className="max-w-6xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="max-w-3xl text-gray-400">
          Close the gap between the tactile dashboard and the execution layer. One motion token can now propagate from the UI into the sync pipeline with a visible audit trail.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatusCard
          label="AE Bridge Reachable"
          value={health.bridgeReachable ? "Yes" : "Stub Mode"}
          sub={health.bridgeReachable ? "Python layer available" : "Will record event without live AE"}
          icon={<Radio size={14} />}
          tone={health.bridgeReachable ? "accent" : "warning"}
        />
        <StatusCard
          label="Last Sync"
          value={health.lastSyncTs ? new Date(health.lastSyncTs).toLocaleTimeString() : "None yet"}
          sub={health.lastSyncTs ? new Date(health.lastSyncTs).toLocaleDateString() : "Waiting for first event"}
          icon={<Activity size={14} />}
          tone="white"
        />
        <StatusCard
          label="Drift Guard"
          value={driftFlag ? "Triggered" : "Clear"}
          sub={driftFlag ? "Duplicate request blocked" : "No recent duplicate sync"}
          icon={<AlertTriangle size={14} />}
          tone={driftFlag ? "warning" : "vibrant"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="tactile-card relative space-y-6 p-6">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-accent/5 blur-2xl" />

          <div className="space-y-1">
            <h2 className="text-xl font-bold">Sync Panel</h2>
            <p className="text-sm text-gray-500">Select one canonical token and choose where it should propagate.</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="token-picker" className="text-xs font-mono uppercase tracking-widest text-gray-500">
              Motion Token
            </label>
            <select
              id="token-picker"
              name="token"
              value={selectedToken}
              onChange={(event) => setSelectedToken(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-neutral-dark px-4 py-3 text-white focus:border-accent focus:outline-none"
            >
              {MOTION_TOKENS.map((token) => (
                <option key={token.name} value={token.name}>
                  {token.name} - {token.category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="target-picker" className="text-xs font-mono uppercase tracking-widest text-gray-500">
              Target
            </label>
            <select
              id="target-picker"
              name="target"
              value={selectedTarget}
              onChange={(event) => setSelectedTarget(event.target.value as SyncTarget)}
              className="w-full rounded-xl border border-white/10 bg-neutral-dark px-4 py-3 text-white focus:border-accent focus:outline-none"
            >
              <option value="ae">AE</option>
              <option value="web">Web</option>
              <option value="both">Both</option>
            </select>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
              <Zap size={14} className="text-accent" />
              Selected Token
            </div>
            {MOTION_TOKENS.filter((token) => token.name === selectedToken).map((token) => (
              <div key={token.name} className="space-y-1 text-sm text-gray-400">
                <div>{token.description}</div>
                <div className="font-mono text-xs text-gray-500">
                  easeIn {token.easeInInfluence} / easeOut {token.easeOutInfluence}
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => void triggerSync()}
            disabled={syncState === "loading" || !selectedToken}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-black transition-all hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-accent/30 disabled:text-black/50"
          >
            {syncState === "loading" ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
            {syncState === "loading" ? "Syncing..." : "Sync Now"}
          </button>

          {(syncState === "success" || syncState === "noop" || syncState === "error") && (
            <ResultBanner state={syncState} event={syncEvent} error={syncError} />
          )}
        </section>

        <section className="tactile-card p-6">
          <SyncFeed key={feedKey} limit={20} pollIntervalMs={5000} />
        </section>
      </div>
    </div>
  );
}

function StatusCard({
  label,
  value,
  sub,
  icon,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  tone: "accent" | "vibrant" | "white" | "warning";
}) {
  const toneClass = {
    accent: "border-accent/20 bg-accent/5 text-accent",
    vibrant: "border-accent-vibrant/20 bg-accent-vibrant/5 text-accent-vibrant",
    white: "border-white/10 bg-white/5 text-white",
    warning: "border-yellow-400/20 bg-yellow-400/5 text-yellow-300",
  }[tone];

  return (
    <div className={`tactile-card border p-4 ${toneClass}`}>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">{label}</div>
      </div>
      <div className="text-sm font-bold text-white">{value}</div>
      <div className="mt-1 text-[10px] font-mono text-gray-600">{sub}</div>
    </div>
  );
}

function ResultBanner({
  state,
  event,
  error,
}: {
  state: Exclude<SyncState, "idle" | "loading">;
  event: SyncEvent | null;
  error: string | null;
}) {
  if (state === "success") {
    return (
      <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
        <div className="mb-2 flex items-center gap-2 text-accent">
          <CheckCircle2 size={16} />
          <span className="font-semibold">Sync recorded</span>
        </div>
        <p className="text-gray-400">{event?.detail}</p>
      </div>
    );
  }

  if (state === "noop") {
    return (
      <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-sm">
        <div className="mb-2 flex items-center gap-2 text-yellow-300">
          <RefreshCw size={16} />
          <span className="font-semibold">No-op</span>
        </div>
        <p className="text-gray-400">This token was already synced to the same target within the 30 second drift window.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm">
      <div className="mb-2 flex items-center gap-2 text-red-400">
        <AlertTriangle size={16} />
        <span className="font-semibold">Sync error</span>
      </div>
      <p className="text-gray-400">{error ?? event?.detail ?? "Unknown sync failure."}</p>
    </div>
  );
}
