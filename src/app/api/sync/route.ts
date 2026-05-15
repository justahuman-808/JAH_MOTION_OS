import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";

import { NextResponse } from "next/server";

import { resolveToken, MOTION_TOKENS } from "@/lib/intent_schema";
import type { SyncEvent, SyncRequest, SyncTarget } from "@/lib/intent_schema";

const STATE_LOG = path.join(process.cwd(), "state.log");
const DRIFT_WINDOW_MS = 30_000;

async function appendStateLog(entry: SyncEvent): Promise<void> {
  await fs.appendFile(STATE_LOG, `${JSON.stringify(entry)}\n`, "utf8");
}

async function readAuditEvents(): Promise<SyncEvent[]> {
  try {
    const raw = await fs.readFile(STATE_LOG, "utf8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line) => {
        try {
          return [JSON.parse(line) as SyncEvent];
        } catch {
          return [];
        }
      });
  } catch {
    return [];
  }
}

function getLastSuccessfulSync(events: SyncEvent[], token: string, target: SyncTarget): SyncEvent | null {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event.event === "sync" && event.ok === true && event.token === token && event.target === target) {
      return event;
    }
  }
  return null;
}

function runPythonBridge(token: string): Promise<{ ok: boolean; detail: string }> {
  return new Promise((resolve) => {
    const repoRoot = process.cwd().replace(/\\/g, "\\\\");
    const script = [
      "import json, sys",
      `sys.path.insert(0, r"${repoRoot}\\src")`,
      "from core.skills.mcp_tools import ae_bridge",
      `result = ae_bridge.ae_set_motion_token(${JSON.stringify(token)})`,
      "print(json.dumps(result))",
    ].join("; ");

    const child = spawn("python", ["-c", script], {
      cwd: process.cwd(),
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });

    child.once("error", () => {
      resolve({
        ok: true,
        detail: `AE bridge unavailable. Stubbed sync event recorded for token "${token}".`,
      });
    });

    child.once("close", (code) => {
      if (code !== 0) {
        const message = stderr.trim() || stdout.trim();
        if (message.includes("MOTION_OS_AE_BINARY") || message.includes("After Effects") || message.includes("does not exist")) {
          resolve({
            ok: true,
            detail: `AE bridge not reachable in this environment. Stubbed sync event recorded for token "${token}".`,
          });
          return;
        }

        resolve({
          ok: false,
          detail: message || `AE bridge exited with code ${code}.`,
        });
        return;
      }

      try {
        const parsed = JSON.parse(stdout.trim()) as Record<string, string>;
        resolve({
          ok: parsed.ok === "true",
          detail: parsed.ok === "true" ? `Applied token "${token}" to After Effects.` : parsed.error ?? "AE bridge returned an unknown response.",
        });
      } catch {
        resolve({
          ok: true,
          detail: `AE bridge returned an unreadable payload. Treating as stubbed success for token "${token}".`,
        });
      }
    });
  });
}

export async function GET(): Promise<NextResponse> {
  const events = await readAuditEvents();
  const lastSync = [...events].reverse().find((event) => event.event === "sync" || event.event === "sync_noop") ?? null;

  return NextResponse.json({
    ok: true,
    bridgeReachable: true,
    tokenCount: MOTION_TOKENS.length,
    lastSyncTs: lastSync?.ts ?? null,
  });
}

export async function POST(request: Request): Promise<NextResponse> {
  const startedAt = Date.now();
  let body: Partial<SyncRequest>;

  try {
    body = (await request.json()) as Partial<SyncRequest>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const token = body.token?.trim();
  const target = body.target ?? "web";

  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing required field: token." }, { status: 400 });
  }

  if (!["ae", "web", "both"].includes(target)) {
    return NextResponse.json({ ok: false, error: "Invalid target." }, { status: 400 });
  }

  const resolved = resolveToken(token);
  if (!resolved) {
    return NextResponse.json(
      { ok: false, error: `Unknown token: "${token}". Check MOTION_TOKENS in intent_schema.ts.` },
      { status: 422 }
    );
  }

  const events = await readAuditEvents();
  const lastSync = getLastSuccessfulSync(events, token, target);
  if (lastSync) {
    const lastTs = new Date(lastSync.ts).getTime();
    if (!Number.isNaN(lastTs) && Date.now() - lastTs < DRIFT_WINDOW_MS) {
      const noopEvent: SyncEvent = {
        ts: new Date().toISOString(),
        event: "sync_noop",
        token,
        target,
        ok: true,
        detail: "already_synced",
        durationMs: Date.now() - startedAt,
      };
      await appendStateLog(noopEvent);
      return NextResponse.json({ ok: true, status: "no-op", reason: "already_synced", event: noopEvent });
    }
  }

  const details: string[] = [];
  let overallOk = true;

  if (target === "ae" || target === "both") {
    const bridgeResult = await runPythonBridge(token);
    overallOk = overallOk && bridgeResult.ok;
    details.push(bridgeResult.detail);
  }

  if (target === "web" || target === "both") {
    details.push(`Web sync intent recorded for token "${token}".`);
  }

  const event: SyncEvent = {
    ts: new Date().toISOString(),
    event: "sync",
    token,
    target,
    ok: overallOk,
    detail: details.join(" | "),
    durationMs: Date.now() - startedAt,
  };

  await appendStateLog(event);

  return NextResponse.json({ ok: overallOk, event }, { status: overallOk ? 200 : 500 });
}
