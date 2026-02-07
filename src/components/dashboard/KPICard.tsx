"use client";

import { ChevronRight } from "lucide-react";
import SparkLine from "./SparkLine";
import type { KPIData } from "@/types";

interface KPICardProps {
  data: KPIData;
}

export default function KPICard({ data }: KPICardProps) {
  const isPositive = data.change > 0;
  const isNeutral = data.change === 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {data.label}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>

      {!isNeutral && (
        <span
          className={`text-xs font-medium ${
            isPositive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {isPositive ? "↑" : "↓"} {data.changeLabel}
        </span>
      )}

      <div className="flex items-baseline gap-2 mt-1 mb-3">
        <span className="text-3xl font-bold text-gray-900">{data.value}</span>
        {data.suffix && (
          <span className="text-sm text-gray-400">{data.suffix}</span>
        )}
      </div>

      {data.type === "progress" ? (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">
              {data.progressPercent}% 普及率
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${data.progressPercent}%` }}
            />
          </div>
        </div>
      ) : (
        <SparkLine
          data={data.sparkData}
          color={isPositive ? "#10b981" : "#ef4444"}
        />
      )}
    </div>
  );
}
