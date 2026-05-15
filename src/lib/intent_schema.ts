import rawTokens from "@/core/skills/motion_skills/tokens.json";

type RawTokenMap = Record<
  string,
  {
    easeInInfluence: number;
    easeOutInfluence: number;
  }
>;

export interface MotionToken {
  name: string;
  easeInInfluence: number;
  easeOutInfluence: number;
  category: "brand" | "micro" | "utility";
  description: string;
}

export type SyncTarget = "ae" | "web" | "both";

export interface SyncRequest {
  token: string;
  target: SyncTarget;
}

export interface SyncEvent {
  ts: string;
  event: string;
  token?: string;
  target?: SyncTarget;
  ok?: boolean;
  detail?: string;
  durationMs?: number;
  paths?: Record<string, string>;
}

export interface AuditResponse {
  events: SyncEvent[];
  total: number;
}

const TOKEN_META: Record<string, Pick<MotionToken, "category" | "description">> = {
  linearHold: {
    category: "utility",
    description: "Mechanical hold with no easing on either side.",
  },
  brandEaseOut: {
    category: "brand",
    description: "Primary product motion exit curve with quick release and soft landing.",
  },
  brandEaseInOut: {
    category: "brand",
    description: "Balanced in and out easing for editorial and hero transitions.",
  },
  snappyMicro: {
    category: "micro",
    description: "High-energy micro-interaction curve for UI accents and fast corrections.",
  },
};

const tokenSource = rawTokens as RawTokenMap;

export const MOTION_TOKENS: MotionToken[] = Object.entries(tokenSource).map(([name, value]) => {
  const meta = TOKEN_META[name] ?? {
    category: "utility" as const,
    description: `Motion token ${name}.`,
  };

  return {
    name,
    easeInInfluence: value.easeInInfluence,
    easeOutInfluence: value.easeOutInfluence,
    category: meta.category,
    description: meta.description,
  };
});

export const MOTION_TOKEN_MAP: Record<string, MotionToken> = Object.fromEntries(
  MOTION_TOKENS.map((token) => [token.name, token])
);

export function resolveToken(name: string): MotionToken | null {
  return MOTION_TOKEN_MAP[name] ?? null;
}
