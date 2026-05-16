"use client";

import { useState, useMemo, useDeferredValue, memo, useEffect, useCallback } from "react";
import {
  Search,
  Copy,
  Check,
  Code,
  Zap,
  RotateCcw,
  SlidersHorizontal,
  Play,
  Pause,
  ToggleLeft,
  ToggleRight,
  SendToBack,
  Loader,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveToken } from "@/lib/intent_schema";
import { TactileCard } from "./TactileCard";
import { motion, AnimatePresence } from "framer-motion";

type ParamValue = string | number | boolean;

interface Snippet {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  code?: string;
  parameters?: Record<string, ParamValue>;
}

interface SnippetLibraryProps {
  initialSnippets: Snippet[];
}

function renderTemplateFallback(template: string, params: Record<string, ParamValue>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? "" : String(value);
  });
}

function findNumericParam(params: Record<string, ParamValue>, keys: string[], fallback: number): number {
  const match = Object.entries(params).find(([key, value]) => {
    if (typeof value !== "number") return false;
    const lower = key.toLowerCase();
    return keys.some((candidate) => lower.includes(candidate));
  });
  return typeof match?.[1] === "number" ? match[1] : fallback;
}

function normalizeAmplitude(raw: number): number {
  if (Math.abs(raw) <= 1) {
    return raw * 40;
  }
  return raw;
}

function getNumericInputBounds(value: number, key: string): { min: number; max: number; step: number } {
  const lower = key.toLowerCase();

  if (lower === "amplitude") {
    return { min: -1, max: 1, step: 0.01 };
  }

  if (lower === "frequency" || lower === "freq") {
    return { min: 0, max: 200, step: 1 };
  }

  if (lower === "decay") {
    return { min: 0, max: 10, step: 0.1 };
  }

  if (lower === "duration") {
    return { min: 0, max: 10, step: 0.05 };
  }

  if (lower === "speed") {
    return { min: 0, max: 50, step: 0.1 };
  }

  if (lower.includes("duration") || lower.includes("delay") || lower.includes("time")) {
    return { min: 0.05, max: Math.max(5, value * 2), step: 0.05 };
  }

  if (Math.abs(value) <= 1) {
    return { min: -1, max: 1, step: 0.01 };
  }

  return {
    min: value < 0 ? value * 2 : 0,
    max: Math.max(Math.abs(value) * 2, 100),
    step: Math.abs(value) >= 10 ? 1 : 0.1,
  };
}

function SnippetAnimationPreview({
  snippetId,
  category,
  subcategory,
  params,
  previewText,
  onPreviewTextChange,
  isPlaying,
  autoPlay,
  onTogglePlay,
  onToggleAutoPlay,
}: {
  snippetId: string;
  category: string;
  subcategory?: string;
  params: Record<string, ParamValue>;
  previewText: string;
  onPreviewTextChange: (text: string) => void;
  isPlaying: boolean;
  autoPlay: boolean;
  onTogglePlay: () => void;
  onToggleAutoPlay: () => void;
}) {
  const amplitudeRaw = findNumericParam(params, ["amplitude", "distance", "offset", "height", "bounce"], 24);
  const amplitude = normalizeAmplitude(amplitudeRaw);
  const duration = Math.max(0.2, findNumericParam(params, ["duration", "time"], 1.2));
  const speed = Math.max(0.1, findNumericParam(params, ["speed"], 1));
  const frequency = Math.max(0.1, findNumericParam(params, ["frequency", "freq"], 1));
  const decay = Math.max(0, findNumericParam(params, ["decay"], 0));
  const rotate = findNumericParam(params, ["rotate", "rotation", "tilt"], 8);
  const scale = Math.max(0.1, findNumericParam(params, ["scale", "zoom"], 1.1));

  const normalizedCategory = category.toLowerCase();
  const normalizedSubcategory = subcategory?.toLowerCase() ?? "";

  // Library: Gradients & Textures
  if (normalizedCategory === "library") {
    if (normalizedSubcategory === "gradients") {
      const c1 = String(params.c1 ?? (params.r1 !== undefined ? `rgb(${Number(params.r1)*255},${Number(params.g1)*255},${Number(params.b1)*255})` : "#3b82f6"));
      const c2 = String(params.c2 ?? (params.r2 !== undefined ? `rgb(${Number(params.r2)*255},${Number(params.g2)*255},${Number(params.b2)*255})` : "#10b981"));
      const gradientType = String(params.type ?? "Linear").toLowerCase();
      const speedValue = Number(params.speed ?? 1);

      return (
        <div className="mb-6 rounded-lg border border-white/10 bg-black/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Artistic Control: Gradient</div>
            <div className="text-[10px] font-mono text-accent/60">{gradientType}</div>
          </div>
          <div
            className="relative h-28 overflow-hidden rounded-lg transition-all duration-300"
            style={{
              background: gradientType === "radial"
                ? `radial-gradient(circle at center, ${c1}, ${c2})`
                : `linear-gradient(135deg, ${c1}, ${c2})`,
            }}
          >
            <motion.div
              className="absolute inset-0 opacity-40"
              animate={{
                background: [
                  `radial-gradient(circle at 0% 0%, ${c2}, transparent)`,
                  `radial-gradient(circle at 100% 100%, ${c2}, transparent)`,
                  `radial-gradient(circle at 0% 0%, ${c2}, transparent)`,
                ]
              }}
              transition={{ duration: 5 / speedValue, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      );
    }

    if (normalizedSubcategory === "textures") {
      const opacity = Number(params.OPACITY ?? 0.5);
      const spacing = Number(params.GRID_SPACING ?? 10);
      const type = String(params.type ?? "Noise").toLowerCase();
      const contrast = Number(params.Contrast ?? 100);
      const brightness = Number(params.Brightness ?? 0);

      return (
        <div className="mb-6 rounded-lg border border-white/10 bg-black/30 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Artistic Control: Texture</div>
            <div className="text-[10px] font-mono text-accent/60">{type}</div>
          </div>
          <div className="relative h-28 overflow-hidden rounded-lg bg-[#0a0a0a]">
             {type === "noise" && (
               <div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay"
                  style={{
                    opacity,
                    filter: `contrast(${contrast}%) brightness(${100 + brightness}%)`,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${0.05 * spacing}' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}
               />
             )}
             {type === "grid" && (
               <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    opacity,
                    backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                    backgroundSize: `${spacing}px ${spacing}px`
                  }}
               />
             )}
             {type === "static" && (
               <div
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: `repeating-linear-gradient(45deg, #333, #333 1px, transparent 1px, transparent ${spacing}px)`
                  }}
               />
             )}
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[9px] font-mono text-white/10 uppercase tracking-[0.3em]">Surface Analysis Engine</span>
             </div>
          </div>
        </div>
      );
    }
  }

  // No key={previewSeed} here means Framer Motion will animate smoothly between values
  const liveDuration = Math.max(0.15, duration / Math.max(0.5, speed) / Math.max(0.5, frequency));
  const liveOpacity = Math.max(0.2, 1 - decay / 10);
  const typographySample = "Kinetic Typography Sample";
  const typographyText = previewText.trim().length > 0 ? previewText : typographySample;
  const typographyInputId = `preview-text-${snippetId}`;
  const typographyTracking = `${Math.min(0.3, Math.max(0, Math.abs(amplitude) * 0.04)).toFixed(2)}em`;
  const uiDepth = Math.max(6, Math.min(80, Math.abs(amplitude) * 2));

  if (normalizedCategory === "typography") {
    return (
      <div className="rounded-lg border border-white/10 bg-black/30 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Live Typo Preview</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePlay}
              className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-gray-300 hover:bg-white/10"
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={onToggleAutoPlay}
              className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-gray-300 hover:bg-white/10"
            >
              {autoPlay ? <ToggleRight size={14} className="text-accent" /> : <ToggleLeft size={14} />}
              Auto
            </button>
          </div>
        </div>
        <div className="mb-3 space-y-1">
          <label htmlFor={typographyInputId} className="block text-[11px] font-mono uppercase tracking-wider text-gray-500">
            Preview Text
          </label>
          <input
            id={typographyInputId}
            name={typographyInputId}
            type="text"
            value={previewText}
            onChange={(e) => onPreviewTextChange(e.target.value)}
            placeholder={typographySample}
            className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-accent focus:outline-none"
          />
        </div>
        <div className="relative h-28 overflow-hidden rounded-lg bg-black/40 px-4">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent" />
          <motion.p
            className="absolute left-1/2 top-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center text-base font-semibold text-white"
            style={{ opacity: liveOpacity }}
            animate={
              isPlaying
                ? {
                    y: [0, -amplitude * 0.25, 0],
                    letterSpacing: ["0em", typographyTracking, "0em"],
                    scale: [1, Math.min(1.2, scale), 1],
                  }
                : {
                    y: 0,
                    letterSpacing: "0em",
                    scale: 1,
                  }
            }
            transition={{ duration: liveDuration, repeat: isPlaying ? Infinity : 0, ease: "easeInOut" }}
          >
            {typographyText}
          </motion.p>
        </div>
      </div>
    );
  }

  if (normalizedCategory === "ui") {
    return (
      <div className="rounded-lg border border-white/10 bg-black/30 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Live UI Preview</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePlay}
              className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-gray-300 hover:bg-white/10"
            >
              {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={onToggleAutoPlay}
              className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-gray-300 hover:bg-white/10"
            >
              {autoPlay ? <ToggleRight size={14} className="text-accent" /> : <ToggleLeft size={14} />}
              Auto
            </button>
          </div>
        </div>
        <div className="relative h-28 overflow-hidden rounded-lg bg-black/40 [perspective:900px]">
          <div className="absolute inset-0 bg-linear-to-br from-accent/10 via-transparent to-white/10" />
          <motion.div
            className="absolute inset-0"
            animate={
              isPlaying
                ? {
                    rotateY: [0, rotate, 0, -rotate * 0.5, 0],
                    rotateX: [0, -rotate * 0.25, 0],
                  }
                : { rotateY: 0, rotateX: 0 }
            }
            transition={{ duration: liveDuration * 1.2, repeat: isPlaying ? Infinity : 0, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d", opacity: liveOpacity }}
          >
            <motion.div
              className="absolute left-6 top-6 h-12 w-16 rounded-lg border border-accent/40 bg-accent/15"
              animate={
                isPlaying
                  ? { x: [0, amplitude * 0.4, 0], y: [0, -amplitude * 0.15, 0], scale: [1, Math.min(scale, 1.25), 1] }
                  : { x: 0, y: 0, scale: 1 }
              }
              transition={{ duration: liveDuration, repeat: isPlaying ? Infinity : 0, ease: "easeInOut" }}
              style={{ transform: `translateZ(${uiDepth}px)` }}
            />
            <motion.div
              className="absolute right-6 top-8 h-10 w-20 rounded-lg border border-white/30 bg-white/10"
              animate={isPlaying ? { x: [0, -amplitude * 0.25, 0], y: [0, amplitude * 0.1, 0] } : { x: 0, y: 0 }}
              transition={{ duration: liveDuration * 0.9, repeat: isPlaying ? Infinity : 0, ease: "easeInOut" }}
              style={{ transform: `translateZ(${uiDepth * 0.6}px)` }}
            />
            <motion.div
              className="absolute bottom-6 left-1/2 h-8 w-28 -translate-x-1/2 rounded-full border border-white/20 bg-white/10"
              animate={isPlaying ? { scaleX: [1, Math.min(1.25, scale), 1], opacity: [0.3, 0.9, 0.3] } : { scaleX: 1, opacity: 0.3 }}
              transition={{ duration: liveDuration * 0.8, repeat: isPlaying ? Infinity : 0, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </div>
    );
  }

  const isRotationSub = normalizedSubcategory.includes("rotation") || normalizedSubcategory.includes("osc");
  const isPulseSub = normalizedSubcategory.includes("pulse") || normalizedSubcategory.includes("scale");
  const isElasticSub = normalizedSubcategory.includes("bounce") || normalizedSubcategory.includes("elastic");

  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Live Motion Preview</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-gray-300 hover:bg-white/10"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            onClick={onToggleAutoPlay}
            className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-gray-300 hover:bg-white/10"
          >
            {autoPlay ? <ToggleRight size={14} className="text-accent" /> : <ToggleLeft size={14} />}
            Auto
          </button>
        </div>
      </div>
      <div className="relative h-24 overflow-hidden rounded-lg bg-black/40">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent" />
        <motion.div
          className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-accent/90"
          style={{ opacity: liveOpacity }}
          animate={
            isPlaying
              ? {
                  y: isRotationSub || isPulseSub ? 0 : [0, -amplitude, 0],
                  rotate: isRotationSub ? [0, rotate * 5, 0] : (isPulseSub ? 0 : [0, rotate, 0]),
                  scale: isPulseSub ? [1, scale * 1.5, 1] : [1, scale, 1],
                }
              : { y: 0, rotate: 0, scale: 1 }
          }
          transition={{
            duration: liveDuration,
            repeat: isPlaying ? Infinity : 0,
            ease: isElasticSub ? "easeInOut" : "linear"
          }}
        />
      </div>
    </div>
  );
}

const SnippetCard = memo(({ snippet }: { snippet: Snippet }) => {
  const [params, setParams] = useState<Record<string, ParamValue>>(snippet.parameters ?? {});
  const [renderedCode, setRenderedCode] = useState<string>(renderTemplateFallback(snippet.code ?? "", snippet.parameters ?? {}));
  const [previewText, setPreviewText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [applyState, setApplyState] = useState<"idle" | "loading" | "ok" | "noop" | "error">("idle");

  const hasParams = Object.keys(params).length > 0;
  const matchedToken = resolveToken(snippet.id) ?? resolveToken(snippet.name);
  const canApplyToken = snippet.category.toLowerCase() === "motion" && matchedToken !== null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const applySnippet = async () => {
    if (!canApplyToken) {
      copyToClipboard(renderedCode);
      return;
    }
    setApplyState("loading");
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: matchedToken.name, target: "ae" }),
      });
      const data = (await res.json()) as { ok: boolean; status?: string; error?: string };
      if (!res.ok || !data.ok) {
        setApplyState("error");
      } else if (data.status === "no-op") {
        setApplyState("noop");
      } else {
        setApplyState("ok");
      }
    } catch {
      setApplyState("error");
    } finally {
      setTimeout(() => setApplyState("idle"), 3000);
    }
  };

  const renderSnippet = useCallback(async (snippet: Snippet, params: Record<string, ParamValue>, signal?: AbortSignal) => {
    const template = snippet.code ?? "";
    const fallback = renderTemplateFallback(template, params);

    try {
      const apiBase = process.env.NEXT_PUBLIC_STUDIO_API_BASE_URL || "http://localhost:8000";
      const response = await fetch(`${apiBase}/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: snippet.name, params }),
        signal,
      });

      if (!response.ok) {
        setRenderedCode(fallback);
        return;
      }

      const data = (await response.json()) as { code?: string };
      setRenderedCode(data.code ?? fallback);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setRenderedCode(fallback);
    }
  }, []);

  const handleParamChange = (key: string, value: ParamValue) => {
    const next = { ...params, [key]: value };
    setParams(next);
    if (autoPlay) {
      setIsPlaying(true);
    }
  };

  const resetParams = () => {
    const defaults = snippet.parameters ?? {};
    setParams(defaults);
    setIsPlaying(autoPlay);
  };

  // Debounce the backend render call to prevent network flood during slider adjustments
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      void renderSnippet(snippet, params, controller.signal);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [params, snippet, renderSnippet]);

  return (
    <TactileCard className="group flex h-full flex-col border-white/5 hover:border-accent/30">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <span className="mb-1 block text-[10px] font-mono uppercase tracking-widest text-accent">
            {snippet.category}
          </span>
          <h3 className="text-xl font-bold text-white transition-colors group-hover:text-accent">
            {snippet.name}
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          {canApplyToken && (
            <button
              onClick={() => void applySnippet()}
              disabled={applyState === "loading"}
              title={`Apply token "${matchedToken.name}" to AE`}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-mono flex items-center gap-1.5 transition-all border ${
                applyState === "ok"
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : applyState === "noop"
                  ? "bg-yellow-400/10 border-yellow-400/20 text-yellow-400"
                  : applyState === "error"
                  ? "bg-red-400/10 border-red-400/20 text-red-400"
                  : "bg-white/5 border-white/10 text-gray-300 hover:border-accent/30 hover:text-accent"
              }`}
            >
              {applyState === "loading" ? (
                <Loader size={13} className="animate-spin" />
              ) : applyState === "ok" ? (
                <Check size={13} />
              ) : (
                <SendToBack size={13} />
              )}
              {applyState === "ok" ? "Synced" : applyState === "noop" ? "No-op" : applyState === "error" ? "Error" : "Apply"}
            </button>
          )}
          <button
            onClick={() => copyToClipboard(renderedCode)}
            className="rounded-lg bg-white/5 p-2 transition-all hover:bg-accent hover:text-background"
            title="Copy rendered code"
          >
            {isCopied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>

      <p className="mb-6 flex-1 text-sm text-gray-400">{snippet.description}</p>

      {hasParams && (
        <div className="mb-6 space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-400">
              <SlidersHorizontal size={14} />
              Parameters
            </div>
            <button
              type="button"
              onClick={resetParams}
              className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-[11px] text-gray-300 hover:bg-white/10"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(params).map(([key, value]) => {
              const inputId = `${snippet.id}-${key}`;

              if (typeof value === "number") {
                const bounds = getNumericInputBounds(value, key);
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor={inputId} className="font-mono uppercase tracking-wide text-gray-400">
                        {key}
                      </label>
                      <span className="text-gray-300">{value}</span>
                    </div>
                    <input
                      id={inputId}
                      name={inputId}
                      type="range"
                      min={bounds.min}
                      max={bounds.max}
                      step={bounds.step}
                      value={value}
                      onChange={(e) => handleParamChange(key, Number(e.target.value))}
                      className="w-full accent-accent"
                    />
                  </div>
                );
              }

              if (typeof value === "boolean") {
                return (
                  <label key={key} htmlFor={inputId} className="flex items-center justify-between text-xs text-gray-300">
                    <span className="font-mono uppercase tracking-wide text-gray-400">{key}</span>
                    <input
                      id={inputId}
                      name={inputId}
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleParamChange(key, e.target.checked)}
                      className="h-4 w-4 accent-accent"
                    />
                  </label>
                );
              }

              return (
                <div key={key} className="space-y-1.5">
                  <label htmlFor={inputId} className="block text-xs font-mono uppercase tracking-wide text-gray-400">
                    {key}
                  </label>
                  <input
                    id={inputId}
                    name={inputId}
                    type="text"
                    value={value}
                    onChange={(e) => handleParamChange(key, e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-accent focus:outline-none"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <SnippetAnimationPreview
        snippetId={snippet.id}
        category={snippet.category}
        subcategory={snippet.subcategory}
        params={params}
        previewText={previewText}
        isPlaying={isPlaying}
        autoPlay={autoPlay}
        onTogglePlay={() => setIsPlaying((prev) => !prev)}
        onToggleAutoPlay={() => {
          const nextAutoPlay = !autoPlay;
          setAutoPlay(nextAutoPlay);
          setIsPlaying(nextAutoPlay);
        }}
        onPreviewTextChange={setPreviewText}
      />

      <div className="group/code relative max-h-40 overflow-hidden rounded-lg bg-black/40 p-4 font-mono text-xs text-gray-400">
        <div className="absolute right-0 top-0 p-2 opacity-0 transition-opacity group-hover/code:opacity-100">
          <Code size={12} className="text-accent" />
        </div>
        <code className="whitespace-pre-wrap break-all">
          {renderedCode ? (renderedCode.length > 180 ? `${renderedCode.substring(0, 180)}...` : renderedCode) : "// No code available"}
        </code>
      </div>
    </TactileCard>
  );
});
SnippetCard.displayName = "SnippetCard";

export const SnippetLibrary = ({ initialSnippets }: SnippetLibraryProps) => {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Motion", "Typography", "UI", "Gradient", "Texture"];

  const filteredSnippets = useMemo(() => {
    return initialSnippets.filter((snippet) => {
      const matchesSearch =
        snippet.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        snippet.description.toLowerCase().includes(deferredSearch.toLowerCase());
      let matchesCategory = activeCategory === "All" || snippet.category === activeCategory;

      if (activeCategory === "Gradient") {
        matchesCategory = snippet.category === "Library" && snippet.subcategory?.toLowerCase() === "gradients";
      } else if (activeCategory === "Texture") {
        matchesCategory = snippet.category === "Library" && snippet.subcategory?.toLowerCase() === "textures";
      }

      return matchesSearch && matchesCategory;
    });
  }, [initialSnippets, deferredSearch, activeCategory]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            id="search-snippets"
            name="search"
            type="text"
            placeholder="Search snippets..."
            className="w-full rounded-xl border border-white/10 bg-neutral-dark py-3 pl-12 pr-4 text-white transition-colors focus:border-accent focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all",
                activeCategory === cat
                  ? "bg-accent text-background"
                  : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredSnippets.map((snippet) => {
            return (
              <motion.div
                layout
                key={snippet.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <SnippetCard snippet={snippet} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredSnippets.length === 0 && (
        <div className="py-20 text-center text-gray-500">
          <Zap className="mx-auto mb-4 opacity-20" size={48} />
          <p>No snippets found matching your search.</p>
        </div>
      )}
    </div>
  );
};
