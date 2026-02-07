"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { Period } from "@/types";

const tabs = [
  { label: "ダッシュボード", href: "/" },
  { label: "ツール分析", href: "/analytics/tools" },
  { label: "トークン使用量", href: "/analytics/tokens" },
  { label: "ユーザー一覧", href: "/users" },
];

const periods: Period[] = ["1D", "7D", "30D", "All"];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState<Period>("7D");

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Claude Code Usage Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              チーム全体の利用状況を一目で把握
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => setActivePeriod(period)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    activePeriod === period
                      ? "bg-white text-gray-900 shadow-sm font-medium"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700">
              <option>期間</option>
              <option>今日</option>
              <option>今週</option>
              <option>今月</option>
              <option>カスタム</option>
            </select>
          </div>
        </div>

        <nav className="flex gap-0 -mb-px">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            return (
              <button
                key={tab.href}
                onClick={() => router.push(tab.href)}
                className={`px-4 py-3 text-sm border-b-2 transition-colors ${
                  isActive
                    ? "border-gray-900 text-gray-900 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
