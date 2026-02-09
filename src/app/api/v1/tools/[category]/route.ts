import os from "node:os";
import { NextRequest, NextResponse } from "next/server";
import { aggregateByToolCategory } from "@/lib/aggregator";
import { loadEvents } from "@/lib/parser";
import type { ToolAnalysis, ToolCategory } from "@/types";

const VALID_CATEGORIES: ToolCategory[] = ["skills", "subagents", "mcp", "commands"];

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> },
): Promise<NextResponse<ToolAnalysis | { error: string }>> {
  const { category } = await params;

  if (!VALID_CATEGORIES.includes(category as ToolCategory)) {
    return NextResponse.json({ error: "invalid category" }, { status: 400 });
  }

  const range = parseRange(request);
  if (!range) return NextResponse.json({ error: "invalid start/end" }, { status: 400 });

  const events = await loadEvents(getLogDir(), range.start, range.end);
  const analysis = aggregateByToolCategory(events, category as ToolCategory);

  return NextResponse.json(analysis);
}
