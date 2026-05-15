import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type { SyncEvent, AuditResponse } from "@/lib/intent_schema";

const STATE_LOG = path.join(process.cwd(), "state.log");

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 200);

  let raw = "";
  try {
    raw = await fs.readFile(STATE_LOG, "utf8");
  } catch {
    return NextResponse.json({ events: [], total: 0 } satisfies AuditResponse);
  }

  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const events: SyncEvent[] = [];
  for (const line of lines) {
    try {
      events.push(JSON.parse(line) as SyncEvent);
    } catch {
      // skip malformed lines
    }
  }

  const slice = events.slice(-limit).reverse();
  return NextResponse.json({ events: slice, total: events.length } satisfies AuditResponse);
}
