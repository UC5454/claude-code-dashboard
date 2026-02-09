"use client";

import { Sparkles } from "lucide-react";
import { insightsData } from "@/lib/mock-data";
import type { InsightCard } from "@/types";

interface AIInsightsProps {
  insights?: InsightCard[];
  generatedAt?: string;
  isLoading?: boolean;
  error?: string;
}

export default function AIInsights({ insights, generatedAt, isLoading, error }: AIInsightsProps) {
  const list = insights ?? insightsData;

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-bold text-gray-900">AI Insights</h2>
        </div>
        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">
          Powered by Gemini
        </span>
        <span className="text-xs text-gray-400">
          {generatedAt ? `${generatedAt} に生成` : "29分前に生成"}
        </span>
      </div>

      {isLoading && <p className="text-sm text-gray-500 mb-4">インサイトを読み込み中...</p>}
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {list.map((insight, i) => (
          <div
            key={i}
            className={`bg-white rounded-lg border border-gray-100 p-4 border-l-4 ${insight.borderColor} shadow-sm`}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${insight.color}`}
            >
              {insight.type.replace(/_/g, " ")}
            </span>
            <h3 className="text-sm font-semibold text-gray-900 mt-2 mb-1">
              {insight.title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              {insight.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
