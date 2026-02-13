"use client";

import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import type { Period } from "@/types";
import { usePeriod } from "@/hooks/usePeriod";

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
  const { data: session } = useSession();
  const { period: activePeriod, setPeriod: setActivePeriod } = usePeriod("7D");

  const updatePeriod = (period: Period) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    params.set("period", period);
    setActivePeriod(period);
    router.push(`${pathname}?${params.toString()}`);
    window.dispatchEvent(new CustomEvent("periodchange", { detail: period }));
  };

  const pushTab = (href: string) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const query = params.toString();
    router.push(query ? `${href}?${query}` : href);
  };

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
                  onClick={() => updatePeriod(period)}
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
            {session?.user && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                <span className="text-sm text-gray-600">{session.user.name ?? session.user.email}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ログアウト
                </button>
              </div>
            )}
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
                onClick={() => pushTab(tab.href)}
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
