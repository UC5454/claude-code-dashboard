"use client";

import Header from "@/components/layout/Header";
import { useKPIs, useUsers } from "@/lib/api";
import { usePeriod } from "@/hooks/usePeriod";

export default function TokensPage() {
  const { period } = usePeriod("7D");
  const kpis = useKPIs(period);
  const users = useUsers(period, "message", "desc");

  const totalMessages = kpis.data?.messages.current ?? 0;
  const activeUsers = kpis.data?.activeUsers.active ?? 0;
  const avgPerUser = activeUsers > 0 ? Math.round(totalMessages / activeUsers) : 0;

  const topUsers = (users.data ?? []).slice(0, 5);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">トークン使用量（近似）</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-gray-500">総メッセージ数</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalMessages.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-gray-500">アクティブユーザー</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{activeUsers.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
              <p className="text-xs text-gray-500">1人あたり平均メッセージ</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{avgPerUser.toLocaleString()}</p>
            </div>
          </div>
          {kpis.error && <p className="text-sm text-red-600 mt-3">トークン集計の取得に失敗しました。</p>}
          {kpis.isLoading && <p className="text-sm text-gray-500 mt-3">トークン集計を読み込み中...</p>}
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <h3 className="text-base font-bold text-gray-900 mb-4">メッセージ上位ユーザー</h3>
          <div className="space-y-3">
            {topUsers.map((user, idx) => (
              <div key={`${user.uid}-${idx}`} className="flex items-center justify-between border-b border-gray-50 pb-2">
                <span className="text-sm text-gray-700">{idx + 1}. {user.name}</span>
                <span className="text-sm font-semibold text-gray-900">{user.message.toLocaleString()}</span>
              </div>
            ))}
          </div>
          {users.error && <p className="text-sm text-red-600 mt-3">ユーザー集計の取得に失敗しました。</p>}
          {users.isLoading && <p className="text-sm text-gray-500 mt-3">ユーザー集計を読み込み中...</p>}
        </section>
      </main>
    </div>
  );
}
