"use client";

import Header from "@/components/layout/Header";
import KPICard from "@/components/dashboard/KPICard";
import AIInsights from "@/components/dashboard/AIInsights";
import UserTable from "@/components/dashboard/UserTable";
import { kpiData as fallbackKPIData } from "@/lib/mock-data";
import { useInsights, useKPIs, useUsers } from "@/lib/api";
import { usePeriod } from "@/hooks/usePeriod";
import type { KPIData, UserRow } from "@/types";

function toChangeLabel(changeRate: number): string {
  const sign = changeRate > 0 ? "+" : "";
  return `${sign}${changeRate}%`;
}

function formatLastActive(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.max(1, Math.floor(diffMs / 3600000));
  return `${hours}時間前`;
}

export default function DashboardPage() {
  const { period } = usePeriod("7D");

  const kpis = useKPIs(period);
  const users = useUsers(period, "total", "desc");
  const insights = useInsights(period);

  const kpiCards: KPIData[] = !kpis.data
    ? fallbackKPIData
    : [
        {
          label: "Skill実行数",
          value: kpis.data.skills.current.toLocaleString(),
          change: kpis.data.skills.changeRate,
          changeLabel: toChangeLabel(kpis.data.skills.changeRate),
          sparkData: kpis.data.skills.sparkline,
        },
        {
          label: "Subagent数",
          value: kpis.data.subagents.current.toLocaleString(),
          change: kpis.data.subagents.changeRate,
          changeLabel: toChangeLabel(kpis.data.subagents.changeRate),
          sparkData: kpis.data.subagents.sparkline,
        },
        {
          label: "MCP呼び出し",
          value: kpis.data.mcpCalls.current.toLocaleString(),
          change: kpis.data.mcpCalls.changeRate,
          changeLabel: toChangeLabel(kpis.data.mcpCalls.changeRate),
          sparkData: kpis.data.mcpCalls.sparkline,
        },
        {
          label: "メッセージ",
          value: kpis.data.messages.current.toLocaleString(),
          change: kpis.data.messages.changeRate,
          changeLabel: toChangeLabel(kpis.data.messages.changeRate),
          sparkData: kpis.data.messages.sparkline,
        },
        {
          label: "アクティブ",
          value: `${kpis.data.activeUsers.active}`,
          change: 0,
          changeLabel: "",
          sparkData: [],
          suffix: `/ ${kpis.data.activeUsers.total}名`,
          type: "progress",
          progressValue: kpis.data.activeUsers.active,
          progressTotal: kpis.data.activeUsers.total,
          progressPercent: kpis.data.activeUsers.rate,
        },
        {
          label: "セッション",
          value: kpis.data.sessions.current.toLocaleString(),
          change: kpis.data.sessions.changeRate,
          changeLabel: toChangeLabel(kpis.data.sessions.changeRate),
          sparkData: kpis.data.sessions.sparkline,
        },
      ];

  const userRows: UserRow[] =
    users.data?.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      lastActive: formatLastActive(user.lastActive),
      skill: user.skill,
      subagent: user.subagent,
      mcp: user.mcp,
      command: user.command,
      message: user.message,
      total: user.total,
    })) ?? [];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1440px] mx-auto px-6 py-6">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {kpiCards.map((kpi) => (
              <KPICard key={kpi.label} data={kpi} />
            ))}
          </div>
          {kpis.error && <p className="text-sm text-red-600 mt-3">KPIの取得に失敗しました。</p>}
        </section>

        <AIInsights
          insights={insights.data?.insights}
          generatedAt={insights.data?.generatedAt}
          isLoading={insights.isLoading}
          error={insights.error?.message}
        />
        <UserTable rows={userRows} isLoading={users.isLoading} error={users.error?.message} />
      </main>
    </div>
  );
}
