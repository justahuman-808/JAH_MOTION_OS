"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react";

import type { AuditResponse, SyncEvent } from "@/lib/intent_schema";

interface SyncFeedProps {
  limit?: number;
  pollIntervalMs?: number;
  className?: string;
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) {
    return ts;
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function EventStatus({ event }: { event: SyncEvent }) {
  if (event.event === "sync_noop") {
    return <span className="text-xs font-mono text-yellow-300">↺ no-op</span>;
  }
  if (event.event === "sync" && event.ok === true) {
    return <span className="text-xs font-mono text-accent">✓ ok</span>;
  }
  if (event.event === "sync" && event.ok === false) {
    return <span className="text-xs font-mono text-red-400">✗ error</span>;
  }
  return <span className="text-xs font-mono text-gray-500">{event.event}</span>;
}

export function SyncFeed({ limit = 20, pollIntervalMs = 5000, className = "" }: SyncFeedProps) {
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    try {
      const res = await fetch(`/api/audit?limit=${limit}`, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Audit API error: ${res.status}`);
      }
      const data = (await res.json()) as AuditResponse;
      setEvents(data.events);
      setTotal(data.total);
      setLastRefresh(new Date().toISOString());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit feed.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void loadFeed();
    const timer = window.setInterval(() => {
      void loadFeed();
    }, pollIntervalMs);
    return () => window.clearInterval(timer);
  }, [loadFeed, pollIntervalMs]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Audit Feed</h2>
          <p className="text-xs text-gray-500">{total} recorded events</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh ? (
            <span className="flex items-center gap-1 text-[10px] font-mono text-gray-600">
              <Clock3 size={10} />
              {formatTimestamp(lastRefresh)}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => void loadFeed()}
            className="text-gray-500 transition-colors hover:text-accent"
            aria-label="Refresh audit feed"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="max-h-[34rem] space-y-2 overflow-y-auto pr-1">
        {error ? (
          <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">{error}</div>
        ) : null}

        {!loading && !error && events.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-sm text-gray-500">
            No sync events yet. Trigger a sync to populate the audit trail.
          </div>
        ) : null}

        {events.map((event, index) => (
          <div key={`${event.ts}-${index}`} className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono text-gray-600">{formatTimestamp(event.ts)}</span>
              <EventStatus event={event} />
              {event.token ? (
                <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-white/80">{event.token}</span>
              ) : null}
              {event.target ? <span className="text-[10px] font-mono uppercase text-gray-500">{event.target}</span> : null}
              {typeof event.durationMs === "number" ? (
                <span className="text-[10px] font-mono text-gray-600">{event.durationMs}ms</span>
              ) : null}
            </div>
            {event.detail ? <p className="text-xs leading-relaxed text-gray-400">{event.detail}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
