import os from "node:os";
import { NextRequest, NextResponse } from "next/server";
import type { KPISummary, Period } from "@/types";
import { loadEvents } from "@/lib/parser";
import { aggregateKPIs } from "@/lib/aggregator";

function getLogDir() {
  return process.env.LOG_DIR?.replace(/^~(?=\/)/, os.homedir()) ?? `${os.homedir()}/.claude-code-dashboard/logs`;
}

function parseRange(request: NextRequest) {
  const startRaw = request.nextUrl.searchParams.get("start");
  const endRaw = request.nextUrl.searchParams.get("end");

  const end = endRaw ? new Date(endRaw) : new Date();
  const start = startRaw ? new Date(startRaw) : new Date(Date.now() - 6 * 86400000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return null;
  }
  return { start, end };
}

function inferPeriod(start: Date, end: Date): Period {
  const days = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1;
  if (days <= 1) return "1D";
  if (days <= 7) return "7D";
  if (days <= 30) return "30D";
  return "All";
}

export async function GET(request: NextRequest): Promise<NextResponse<KPISummary | { error: string }>> {
  const range = parseRange(request);
  if (!range) {
    return NextResponse.json({ error: "invalid start/end" }, { status: 400 });
  }

  const period = inferPeriod(range.start, range.end);
  const previousStart = new Date(range.start);
  const days = Math.ceil((range.end.getTime() - range.start.getTime()) / 86400000) + 1;
  previousStart.setUTCDate(previousStart.getUTCDate() - days);

  const events = await loadEvents(getLogDir(), previousStart, range.end);
  const kpis = aggregateKPIs(events, period);
  return NextResponse.json(kpis);
}
