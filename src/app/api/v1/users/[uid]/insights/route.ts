import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { aggregateUserDetail } from "@/lib/aggregator";
import { generateUserInsights } from "@/lib/gemini";
import { loadEvents } from "@/lib/parser";
import { fetchUserProfiles, resolveUserName } from "@/lib/supabase";
import type { InsightCard, InsightsResponse } from "@/types";

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

function cacheFile() {
  return path.join(os.homedir(), ".claude-code-dashboard", "data", "user-insights-cache.json");
}

const memoryCache = new Map<string, { generatedAt: string; insights: InsightCard[] }>();

function readCache(key: string, ttl: number): { generatedAt: string; insights: InsightCard[] } | null {
  const memHit = memoryCache.get(key);
  if (memHit) {
    const ageSec = (Date.now() - new Date(memHit.generatedAt).getTime()) / 1000;
    if (ageSec <= ttl) return memHit;
  }

  if (process.env.VERCEL) return null;
  const file = cacheFile();
  if (!fs.existsSync(file)) return null;
  try {
    const cache = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, { generatedAt: string; insights: InsightCard[] }>;
    const hit = cache[key];
    if (hit) {
      const ageSec = (Date.now() - new Date(hit.generatedAt).getTime()) / 1000;
      if (ageSec <= ttl) {
        memoryCache.set(key, hit);
        return hit;
      }
    }
  } catch {
    // ignore broken cache
  }
  return null;
}

function writeCache(key: string, entry: { generatedAt: string; insights: InsightCard[] }) {
  memoryCache.set(key, entry);

  if (process.env.VERCEL) return;
  try {
    const file = cacheFile();
    const dir = path.dirname(file);
    fs.mkdirSync(dir, { recursive: true });
    const existing = fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>) : {};
    fs.writeFileSync(file, JSON.stringify({ ...existing, [key]: entry }, null, 2));
  } catch {
    // ignore write errors
  }
}

function buildFallbackInsights(detail: { totalEvents: number; sessions: number; topTools: { name: string; count: number }[]; projects: { name: string; count: number }[] }): InsightCard[] {
  const topTool = detail.topTools[0];
  const topProject = detail.projects[0];
  return [
    {
      type: "USECASE INSIGHT",
      color: "text-blue-700",
      borderColor: "border-l-blue-500",
      title: "利用サマリー",
      description: `合計 ${detail.totalEvents} イベント、${detail.sessions} セッションの活動があります。`,
    },
    {
      type: "TREND UP",
      color: "text-emerald-700",
      borderColor: "border-l-emerald-500",
      title: "よく使うツール",
      description: topTool ? `「${topTool.name}」が最も利用されています（${topTool.count}回）。` : "データが不足しています。",
    },
    {
      type: "USECASE INSIGHT",
      color: "text-blue-700",
      borderColor: "border-l-blue-500",
      title: "主要プロジェクト",
      description: topProject ? `「${topProject.name}」での活動が最も多いです（${topProject.count}回）。` : "データが不足しています。",
    },
  ];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
): Promise<NextResponse<InsightsResponse | { error: string }>> {
  const { uid } = await params;
  const range = parseRange(request);
  if (!range) return NextResponse.json({ error: "invalid start/end" }, { status: 400 });

  const ttl = Number(process.env.INSIGHTS_CACHE_TTL_SEC ?? "3600");
  const maxCount = 3;
  const key = crypto
    .createHash("sha256")
    .update(`user:${uid}|${range.start.toISOString()}|${range.end.toISOString()}`)
    .digest("hex");

  const cached = readCache(key, ttl);
  if (cached) {
    return NextResponse.json({ generatedAt: cached.generatedAt, insights: cached.insights, cached: true });
  }

  const logDir = process.env.LOG_DIR?.replace(/^~(?=\/)/, os.homedir()) ?? `${os.homedir()}/.claude-code-dashboard/logs`;
  const events = await loadEvents(logDir, range.start, range.end);
  const detail = aggregateUserDetail(events, uid);

  const profiles = await fetchUserProfiles();
  const name = resolveUserName(profiles, uid);

  const userData = {
    name,
    totalEvents: detail.totalEvents,
    sessions: detail.sessions,
    topTools: detail.topTools,
    projects: detail.projects,
    toolCategories: detail.toolCategories.map((tc) => ({ name: tc.name, value: tc.value })),
    hourlyActivity: detail.hourlyActivity,
    dailyTrend: detail.dailyTrend,
  };

  let insights: InsightCard[];
  try {
    insights = await generateUserInsights(userData, maxCount);
  } catch {
    insights = buildFallbackInsights(detail);
  }

  const payload: InsightsResponse = {
    generatedAt: new Date().toISOString(),
    insights,
    cached: false,
  };

  writeCache(key, { generatedAt: payload.generatedAt, insights });

  return NextResponse.json(payload);
}
