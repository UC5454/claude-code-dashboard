"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import UsageTrend from "@/components/tools/UsageTrend";
import SkillDistribution from "@/components/tools/SkillDistribution";
import SkillBarChart from "@/components/tools/SkillBarChart";
import type { ToolSubTab } from "@/types";

const toolSubTabs: { key: ToolSubTab; label: string }[] = [
  { key: "skill", label: "スキル" },
  { key: "subagent", label: "サブエージェント" },
  { key: "mcp", label: "MCP" },
  { key: "command", label: "スラッシュコマンド" },
];

export default function ToolsAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<ToolSubTab>("skill");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="flex gap-2 mb-6">
          {toolSubTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-gray-900 text-white font-medium"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <UsageTrend />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <SkillDistribution />
          <SkillBarChart />
        </div>
      </main>
    </div>
  );
}
