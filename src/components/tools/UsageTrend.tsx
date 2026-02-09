"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { trendData } from "@/lib/mock-data";
import type { TrendDataPoint, TrendSubTab } from "@/types";

const subTabs: { key: TrendSubTab; label: string }[] = [
  { key: "total", label: "総数" },
  { key: "byUser", label: "ユーザー別" },
  { key: "byUsecase", label: "ユースケース別" },
];

interface UsageTrendProps {
  data?: TrendDataPoint[];
  isLoading?: boolean;
  error?: string;
}

export default function UsageTrend({ data, isLoading, error }: UsageTrendProps) {
  const [activeSubTab, setActiveSubTab] = useState<TrendSubTab>("total");
  const chartData = data ?? trendData;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">利用トレンド</h3>
          <span className="text-xs text-gray-400">（過去24時間）</span>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {subTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeSubTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-500 mb-3">トレンドを読み込み中...</p>}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                fontSize: "12px",
              }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
