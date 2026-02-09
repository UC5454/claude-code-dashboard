import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { aggregateByUser, aggregateKPIs } from "@/lib/aggregator";
import { generateInsights } from "@/lib/gemini";
import { loadEvents } from "@/lib/parser";
import type { InsightCard, InsightsResponse, Period } from "@/types";

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

function cacheFile() {
  return path.join(os.homedir(), ".claude-code-dashboard", "data", "insights-cache.json");
}

function buildFallbackInsights(kpi: ReturnType<typeof aggregateKPIs>, topUsers: ReturnType<typeof aggregateByUser>): InsightCard[] {
  const leader = topUsers[0];
  return [
    {
      type: "TREND UP",
      color: "text-emerald-700",
      borderColor: "border-l-emerald-500",
      title: "MCP呼び出しトレンド",
      description: `前期比 ${kpi.mcpCalls.changeRate}% の変化（現在 ${kpi.mcpCalls.current}）。`,
    },
    {
      type: "TREND DOWN",
      color: "text-red-700",
      borderColor: "border-l-red-500",
      title: "サブエージェント利用トレンド",
      description: `前期比 ${kpi.subagents.changeRate}% の変化（現在 ${kpi.subagents.current}）。`,
    },
    {
      type: "POWER USER",
      color: "text-orange-700",
      borderColor: "border-l-orange-500",
      title: "最も活発なユーザー",
      description: leader ? `${leader.name}（合計 ${leader.total}）が最上位です。` : "データが不足しています。",
    },
    {
      type: "USECASE INSIGHT",
      color: "text-blue-700",
      borderColor: "border-l-blue-500",
      title: "スキル活用状況",
      description: `スキル実行数は ${kpi.skills.current}（前期比 ${kpi.skills.changeRate}%）。`,
    },
    {
      type: "TREND UP",
      color: "text-emerald-700",
      borderColor: "border-l-emerald-500",
      title: "メッセージ活動",
      description: `メッセージ数は ${kpi.messages.current}、アクティブ率 ${kpi.activeUsers.rate}%。`,
    },
  ];
}

export async function GET(request: NextRequest): Promise<NextResponse<InsightsResponse | { error: string }>> {
  const range = parseRange(request);
  if (!range) return NextResponse.json({ error: "invalid start/end" }, { status: 400 });

  const ttl = Number(process.env.INSIGHTS_CACHE_TTL_SEC ?? "3600");
  const maxCount = Number(process.env.INSIGHTS_MAX_COUNT ?? "5");
  const key = crypto
    .createHash("sha256")
    .update(`${range.start.toISOString()}|${range.end.toISOString()}`)
    .digest("hex");
  const file = cacheFile();

  if (fs.existsSync(file)) {
    try {
      const cache = JSON.parse(fs.readFileSync(file, "utf8")) as Record<
        string,
        { generatedAt: string; insights: InsightCard[] }
      >;
      const hit = cache[key];
      if (hit) {
        const ageSec = (Date.now() - new Date(hit.generatedAt).getTime()) / 1000;
        if (ageSec <= ttl) {
          return NextResponse.json({ generatedAt: hit.generatedAt, insights: hit.insights, cached: true });
        }
      }
    } catch {
      // ignore broken cache
    }
  }

  const logDir = process.env.LOG_DIR?.replace(/^~(?=\/)/, os.homedir()) ?? `${os.homedir()}/.claude-code-dashboard/logs`;
  const period = inferPeriod(range.start, range.end);
  const days = Math.ceil((range.end.getTime() - range.start.getTime()) / 86400000) + 1;
  const previousStart = new Date(range.start);
  previousStart.setUTCDate(previousStart.getUTCDate() - days);

  const events = await loadEvents(logDir, previousStart, range.end);
  const kpi = aggregateKPIs(events, period);
  const users = aggregateByUser(events);

  let insights: InsightCard[];
  try {
    insights = await generateInsights(
      {
        period,
        kpis: kpi,
        topUsers: users.slice(0, 5),
      },
      maxCount,
    );
  } catch {
    insights = buildFallbackInsights(kpi, users).slice(0, maxCount);
  }

  const payload: InsightsResponse = {
    generatedAt: new Date().toISOString(),
    insights,
    cached: false,
  };

  const dir = path.dirname(file);
  fs.mkdirSync(dir, { recursive: true });
  const cache = fs.existsSync(file)
    ? (JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>)
    : {};
  fs.writeFileSync(file, JSON.stringify({ ...cache, [key]: { generatedAt: payload.generatedAt, insights } }, null, 2));

  return NextResponse.json(payload);
}
