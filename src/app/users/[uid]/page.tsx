"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/layout/Header";
import AIInsights from "@/components/dashboard/AIInsights";
import { useUserDetail, useUserInsights } from "@/lib/api";
import { usePeriod } from "@/hooks/usePeriod";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ArrowLeft, Calendar, Clock, Layers, Terminal, Trash2 } from "lucide-react";

function formatDate(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateTime(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const jst = new Date(d.getTime() + 9 * 3600000);
  return `${jst.getUTCMonth() + 1}/${jst.getUTCDate()} ${String(jst.getUTCHours()).padStart(2, "0")}:${String(jst.getUTCMinutes()).padStart(2, "0")}`;
}

function formatInsightsTime(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const jst = new Date(d.getTime() + 9 * 3600000);
  return `${jst.getUTCMonth() + 1}/${jst.getUTCDate()} ${String(jst.getUTCHours()).padStart(2, "0")}:${String(jst.getUTCMinutes()).padStart(2, "0")}`;
}

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? "削除中..." : "削除する"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserDetailPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { period } = usePeriod("7D");
  const { data, isLoading, error } = useUserDetail(uid, period);
  const insights = useUserInsights(uid, period);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/v1/users/${encodeURIComponent(uid)}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      // Force cache bust on redirect
      window.location.href = "/users";
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "削除に失敗しました");
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const hourlyData = data?.hourlyActivity.map((count, hour) => ({
    hour: `${String(hour).padStart(2, "0")}`,
    count,
  })) ?? [];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1440px] mx-auto px-6 py-6">
        <Link
          href="/users"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          ユーザー一覧に戻る
        </Link>

        {isLoading && <p className="text-sm text-gray-500">読み込み中...</p>}
        {error && <p className="text-sm text-red-600">{error.message}</p>}
        {deleteError && <p className="text-sm text-red-600 mb-4">{deleteError}</p>}

        {data && (
          <>
            {/* Header Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{data.name}</h2>
                  <p className="text-xs text-gray-400 mb-4">UID: {data.uid}</p>
                </div>
                {session?.user?.isAdmin && (
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    ユーザー削除
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Layers className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">総イベント</p>
                    <p className="text-lg font-bold text-gray-900">{data.totalEvents.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Terminal className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">セッション数</p>
                    <p className="text-lg font-bold text-gray-900">{data.sessions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">初回利用</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(data.firstSeen)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">最終利用</p>
                    <p className="text-sm font-medium text-gray-900">{formatDate(data.lastSeen)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div className="mb-6">
              <AIInsights
                insights={insights.data?.insights}
                generatedAt={formatInsightsTime(insights.data?.generatedAt)}
                isLoading={insights.isLoading}
                error={insights.error?.message}
              />
            </div>

            {/* Daily Trend */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">日別アクティビティ</h3>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailyTrend}>
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
                      contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hourly Activity + Tool Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-1">時間帯別アクティビティ</h3>
                <p className="text-xs text-gray-400 mb-4">JST</p>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData} barSize={12}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                        interval={2}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#9ca3af" }}
                        tickLine={false}
                        axisLine={{ stroke: "#e5e7eb" }}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                        formatter={(value) => [`${value}件`, ""]}
                        labelFormatter={(label) => `${label}:00`}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">ツールカテゴリ分布</h3>
                {data.toolCategories.length > 0 ? (
                  <div className="flex items-center gap-6">
                    <div className="w-40 h-40 flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={data.toolCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {data.toolCategories.map((entry, idx) => (
                              <Cell key={idx} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                            formatter={(value) => [`${value}%`, ""]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                      {data.toolCategories.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="text-xs text-gray-600 flex-1">{item.name}</span>
                          <span className="text-xs font-medium text-gray-900">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">データなし</p>
                )}
              </div>
            </div>

            {/* Top Tools + Projects */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">よく使うツール</h3>
                {data.topTools.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.topTools} layout="vertical" barSize={14}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} width={100} />
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">データなし</p>
                )}
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">プロジェクト別</h3>
                {data.projects.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.projects} layout="vertical" barSize={14}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} width={120} />
                        <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }} />
                        <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">データなし</p>
                )}
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-4">最近のセッション</h3>
              {data.recentSessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">セッションID</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">開始時刻</th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase px-3 py-2">プロジェクト</th>
                        <th className="text-right text-xs font-medium text-gray-500 uppercase px-3 py-2">イベント数</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentSessions.map((session) => (
                        <tr key={session.sid} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-3 py-2 text-xs font-mono text-gray-500">{session.sid.slice(0, 12)}...</td>
                          <td className="px-3 py-2 text-sm text-gray-700">{formatDateTime(session.start)}</td>
                          <td className="px-3 py-2 text-sm text-gray-700">{session.project}</td>
                          <td className="px-3 py-2 text-sm text-right font-medium text-gray-900">{session.events}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-400">セッションデータなし</p>
              )}
            </div>
          </>
        )}
      </main>

      <ConfirmDialog
        open={showDeleteDialog}
        title="ユーザーデータの削除"
        message={`「${data?.name ?? uid}」のすべてのデータを削除します。この操作は取り消せません。`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={isDeleting}
      />
    </div>
  );
}
