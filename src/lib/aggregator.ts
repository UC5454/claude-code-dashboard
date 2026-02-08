import type {
  BaseEvent,
  KPISummary,
  Period,
  ToolAnalysis,
  ToolCategory,
  TrendDataPoint,
  UserSummary,
  SkillBarData,
  SkillDistribution,
} from "@/types";

function daysFromPeriod(period: Period): number {
  if (period === "1D") return 1;
  if (period === "7D") return 7;
  if (period === "30D") return 30;
  return 30;
}

function countBy(events: BaseEvent[], fn: (event: BaseEvent) => boolean): number {
  return events.reduce((acc, event) => acc + (fn(event) ? 1 : 0), 0);
}

function splitByPeriod(events: BaseEvent[], period: Period) {
  if (!events.length) {
    return { current: [] as BaseEvent[], previous: [] as BaseEvent[] };
  }
  const periodDays = daysFromPeriod(period);
  const latest = new Date(
    events.reduce((maxTs, event) => {
      const ts = new Date(event.ts).getTime();
      return Number.isFinite(ts) && ts > maxTs ? ts : maxTs;
    }, 0),
  );

  const currentStart = new Date(latest);
  currentStart.setUTCDate(currentStart.getUTCDate() - periodDays + 1);
  const previousStart = new Date(currentStart);
  previousStart.setUTCDate(previousStart.getUTCDate() - periodDays);
  const previousEnd = new Date(currentStart);
  previousEnd.setUTCMilliseconds(previousEnd.getUTCMilliseconds() - 1);

  const current = events.filter((event) => {
    const ts = new Date(event.ts).getTime();
    return ts >= currentStart.getTime() && ts <= latest.getTime();
  });
  const previous = events.filter((event) => {
    const ts = new Date(event.ts).getTime();
    return ts >= previousStart.getTime() && ts <= previousEnd.getTime();
  });

  return { current, previous };
}

export function calculateChangeRate(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function metricCount(events: BaseEvent[], metric: "skills" | "subagents" | "mcp" | "messages" | "sessions"): number {
  switch (metric) {
    case "skills":
      return countBy(events, (event) => event.event === "user_prompt" && Boolean(event.is_skill));
    case "subagents":
      return countBy(events, (event) => event.event === "subagent_start" || (event.event === "tool_use" && event.category === "subagent"));
    case "mcp":
      return countBy(events, (event) => event.event === "tool_use" && event.category === "mcp");
    case "messages":
      return countBy(events, (event) => event.event === "user_prompt");
    case "sessions":
      return countBy(events, (event) => event.event === "session_start");
  }
}

function sparklineForMetric(events: BaseEvent[], days: number, metric: "skills" | "subagents" | "mcp" | "messages" | "sessions"): number[] {
  const now = new Date();
  const buckets = new Array(days).fill(0);

  for (const event of events) {
    const ts = new Date(event.ts);
    const deltaDays = Math.floor((now.getTime() - ts.getTime()) / 86400000);
    if (deltaDays >= 0 && deltaDays < days) {
      if (metricCount([event], metric) > 0) {
        buckets[days - 1 - deltaDays] += 1;
      }
    }
  }

  return buckets;
}

export function generateSparkline(events: BaseEvent[], days: number): number[] {
  const now = new Date();
  const buckets = new Array(days).fill(0);

  for (const event of events) {
    const ts = new Date(event.ts);
    const deltaDays = Math.floor((now.getTime() - ts.getTime()) / 86400000);
    if (deltaDays >= 0 && deltaDays < days) {
      buckets[days - 1 - deltaDays] += 1;
    }
  }

  return buckets;
}

export function generateTrend(events: BaseEvent[], granularity: "hour" | "day"): TrendDataPoint[] {
  const map = new Map<string, number>();

  for (const event of events) {
    const d = new Date(event.ts);
    const key =
      granularity === "hour"
        ? `${String(d.getUTCHours()).padStart(2, "0")}:00`
        : d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return [...map.entries()]
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([time, count]) => ({ time, count }));
}

export function aggregateKPIs(events: BaseEvent[], period: Period): KPISummary {
  const { current, previous } = splitByPeriod(events, period);

  const totalUsers = new Set(events.map((event) => event.uid)).size;
  const activeUsers = new Set(current.map((event) => event.uid)).size;

  const skillsCurrent = metricCount(current, "skills");
  const skillsPrev = metricCount(previous, "skills");
  const subCurrent = metricCount(current, "subagents");
  const subPrev = metricCount(previous, "subagents");
  const mcpCurrent = metricCount(current, "mcp");
  const mcpPrev = metricCount(previous, "mcp");
  const msgCurrent = metricCount(current, "messages");
  const msgPrev = metricCount(previous, "messages");
  const sesCurrent = metricCount(current, "sessions");
  const sesPrev = metricCount(previous, "sessions");

  return {
    skills: {
      current: skillsCurrent,
      previous: skillsPrev,
      changeRate: calculateChangeRate(skillsCurrent, skillsPrev),
      sparkline: sparklineForMetric(current, 12, "skills"),
    },
    subagents: {
      current: subCurrent,
      previous: subPrev,
      changeRate: calculateChangeRate(subCurrent, subPrev),
      sparkline: sparklineForMetric(current, 12, "subagents"),
    },
    mcpCalls: {
      current: mcpCurrent,
      previous: mcpPrev,
      changeRate: calculateChangeRate(mcpCurrent, mcpPrev),
      sparkline: sparklineForMetric(current, 12, "mcp"),
    },
    messages: {
      current: msgCurrent,
      previous: msgPrev,
      changeRate: calculateChangeRate(msgCurrent, msgPrev),
      sparkline: sparklineForMetric(current, 12, "messages"),
    },
    activeUsers: {
      active: activeUsers,
      total: totalUsers,
      rate: totalUsers === 0 ? 0 : Number(((activeUsers / totalUsers) * 100).toFixed(1)),
    },
    sessions: {
      current: sesCurrent,
      previous: sesPrev,
      changeRate: calculateChangeRate(sesCurrent, sesPrev),
      sparkline: sparklineForMetric(current, 12, "sessions"),
    },
  };
}

export function aggregateByUser(events: BaseEvent[]): UserSummary[] {
  const userMap = new Map<string, UserSummary>();

  for (const event of events) {
    const current = userMap.get(event.uid) ?? {
      uid: event.uid,
      name: event.uid,
      lastActive: event.ts,
      skill: 0,
      subagent: 0,
      mcp: 0,
      command: 0,
      message: 0,
      total: 0,
    };

    if (new Date(event.ts).getTime() > new Date(current.lastActive).getTime()) {
      current.lastActive = event.ts;
    }

    if (event.event === "user_prompt") {
      current.message += 1;
      if (event.is_skill) current.skill += 1;
    }
    if (event.event === "subagent_start" || (event.event === "tool_use" && event.category === "subagent")) {
      current.subagent += 1;
    }
    if (event.event === "tool_use" && event.category === "mcp") current.mcp += 1;
    if (event.event === "tool_use" && event.category === "bash") current.command += 1;

    current.total = current.skill + current.subagent + current.mcp + current.command + current.message;
    userMap.set(event.uid, current);
  }

  return [...userMap.values()].sort((a, b) => b.total - a.total);
}

function topNAsDistribution(counter: Map<string, number>, topN: number): { distribution: SkillDistribution[]; ranking: SkillBarData[] } {
  const sorted = [...counter.entries()].sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((sum, [, count]) => sum + count, 0);
  const palette = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#d1d5db"];

  const head = sorted.slice(0, topN);
  const restCount = sorted.slice(topN).reduce((sum, [, count]) => sum + count, 0);

  const distribution = head.map(([name, count], idx) => ({
    name,
    value: total === 0 ? 0 : Number(((count / total) * 100).toFixed(1)),
    color: palette[idx % palette.length],
  }));

  if (restCount > 0) {
    distribution.push({
      name: "その他",
      value: Number(((restCount / total) * 100).toFixed(1)),
      color: "#d1d5db",
    });
  }

  const ranking = sorted.slice(0, 10).map(([name, count]) => ({ name, count }));
  return { distribution, ranking };
}

export function aggregateByToolCategory(events: BaseEvent[], category: ToolCategory): ToolAnalysis {
  const counter = new Map<string, number>();
  const selected: BaseEvent[] = [];

  for (const event of events) {
    if (category === "skills" && event.event === "user_prompt" && event.is_skill) {
      const key = String(event.skill_name || "skill");
      counter.set(key, (counter.get(key) ?? 0) + 1);
      selected.push(event);
    }

    if (category === "subagents" && (event.event === "subagent_start" || (event.event === "tool_use" && event.category === "subagent"))) {
      const key = String(event.agent_type || event.detail || "subagent");
      counter.set(key, (counter.get(key) ?? 0) + 1);
      selected.push(event);
    }

    if (category === "mcp" && event.event === "tool_use" && event.category === "mcp") {
      const key = String(event.detail || "mcp");
      counter.set(key, (counter.get(key) ?? 0) + 1);
      selected.push(event);
    }

    if (category === "commands" && event.event === "tool_use" && event.category === "bash") {
      const key = String(event.detail || "command");
      counter.set(key, (counter.get(key) ?? 0) + 1);
      selected.push(event);
    }
  }

  const { distribution, ranking } = topNAsDistribution(counter, 7);

  return {
    category,
    total: selected.length,
    trend: generateTrend(selected, "hour"),
    distribution,
    ranking,
  };
}
