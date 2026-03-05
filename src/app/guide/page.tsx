"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  MessageSquare,
  Cpu,
  Plug,
  Terminal,
  Activity,
  Clock,
  PieChart,
  Target,
  Lightbulb,
  BookOpen,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Database,
  Eye,
  Brain,
  Layers,
  Gauge,
  Search,
} from "lucide-react";

/* ─── Section data ─── */

interface GuideSection {
  id: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${color}`}>
      {children}
    </span>
  );
}

function MetricCard({
  icon,
  iconBg,
  label,
  description,
  example,
  tip,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description: string;
  example?: string;
  tip?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-gray-900">{label}</h4>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
        </div>
      </div>
      {example && (
        <div className="bg-gray-50 rounded-lg px-3 py-2 mt-2">
          <p className="text-[11px] text-gray-600 leading-relaxed">
            <span className="font-semibold text-gray-700">例: </span>
            {example}
          </p>
        </div>
      )}
      {tip && (
        <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-2">
          <p className="text-[11px] text-amber-800 leading-relaxed">
            <span className="font-semibold">Tip: </span>
            {tip}
          </p>
        </div>
      )}
    </div>
  );
}

function VisualExample({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <div className="my-4">
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 overflow-hidden">
        {children}
      </div>
      <p className="text-[11px] text-gray-400 mt-1.5 text-center">{caption}</p>
    </div>
  );
}

function MiniSparkline() {
  const points = [2, 5, 3, 8, 6, 9, 7, 12, 10, 14, 11, 16];
  const max = Math.max(...points);
  const w = 120;
  const h = 32;
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * w} ${h - (p / max) * h}`)
    .join(" ");
  return (
    <svg width={w} height={h} className="inline-block">
      <path d={path} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MockKPICard({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 min-w-[140px]">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
      <div className="flex items-end justify-between mt-1">
        <span className="text-lg font-bold text-gray-900">{value}</span>
        <div className="flex items-center gap-0.5">
          {positive ? (
            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
          ) : (
            <ArrowDownRight className="w-3 h-3 text-red-500" />
          )}
          <span className={`text-[11px] font-medium ${positive ? "text-emerald-600" : "text-red-600"}`}>{change}</span>
        </div>
      </div>
      <div className="mt-1.5">
        <MiniSparkline />
      </div>
    </div>
  );
}

function InsightTypeBadge({ type, color, borderColor }: { type: string; color: string; borderColor: string }) {
  return (
    <div className={`flex items-center gap-2 bg-white rounded-lg border-l-4 px-3 py-2 shadow-sm`} style={{ borderLeftColor: borderColor }}>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>{type}</span>
    </div>
  );
}

const sections: GuideSection[] = [
  {
    id: "overview",
    icon: <Eye className="w-5 h-5" />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    title: "ダッシュボード全体像",
    subtitle: "データの仕組みと画面構成を理解する",
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
            <Database className="w-6 h-6 text-blue-600 mb-3" />
            <h4 className="text-sm font-bold text-gray-900 mb-1">データソース</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Claude Codeのセッションログ（JSONL）をSupabaseに日別集約。イベント種別・タイムスタンプ・ユーザーID・モデルID・プロジェクト名等を記録。
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-100">
            <Clock className="w-6 h-6 text-purple-600 mb-3" />
            <h4 className="text-sm font-bold text-gray-900 mb-1">期間フィルター</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              右上の切り替えボタンで表示期間を選択。前同期間との差分から変化率を算出。
            </p>
            <div className="flex gap-1 mt-3">
              {["1D", "7D", "30D", "All"].map((p) => (
                <span
                  key={p}
                  className={`px-2 py-0.5 text-[10px] rounded-md font-medium ${
                    p === "7D" ? "bg-white text-gray-900 shadow-sm border border-gray-200" : "text-gray-400 bg-gray-100"
                  }`}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
            <Activity className="w-6 h-6 text-emerald-600 mb-3" />
            <h4 className="text-sm font-bold text-gray-900 mb-1">リアルタイム同期</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Supabaseと定期同期。手動同期も /api/v1/sync で実行可能。データは常に最新を反映。
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            画面構成
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {[
              { name: "ダッシュボード", desc: "KPI + インサイト + ユーザー概況", color: "bg-blue-100 text-blue-700" },
              { name: "ツール分析", desc: "4カテゴリ別の深掘り分析", color: "bg-violet-100 text-violet-700" },
              { name: "トークン", desc: "API消費量の監視", color: "bg-amber-100 text-amber-700" },
              { name: "ユーザー", desc: "個人別の詳細データ", color: "bg-emerald-100 text-emerald-700" },
              { name: "ガイド", desc: "このページ", color: "bg-slate-200 text-slate-600" },
            ].map((tab) => (
              <div key={tab.name} className={`rounded-lg px-3 py-2 ${tab.color}`}>
                <p className="text-[11px] font-bold">{tab.name}</p>
                <p className="text-[9px] mt-0.5 opacity-75">{tab.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "kpis",
    icon: <BarChart3 className="w-5 h-5" />,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    title: "KPI指標の見方",
    subtitle: "6つの主要指標がチーム全体の活用度を示す",
    content: (
      <div className="space-y-6">
        <VisualExample caption="KPIカードの実際の表示イメージ（数値・変化率・スパークライン）">
          <div className="flex gap-3 overflow-x-auto pb-1">
            <MockKPICard label="Skill実行数" value="234" change="+18.5%" positive />
            <MockKPICard label="Subagent数" value="89" change="+42.1%" positive />
            <MockKPICard label="MCP呼び出し" value="567" change="-5.2%" positive={false} />
          </div>
        </VisualExample>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            icon={<Zap className="w-5 h-5 text-amber-600" />}
            iconBg="bg-amber-50"
            label="Skill実行数"
            description="スラッシュコマンド（/commit, /review-pr等）の実行回数。高度な自動化機能の活用度。"
            example="急増→新スキル導入、急減→ワークフロー変更の可能性"
            tip="全員がcommit・review-prを使えているか確認しよう"
          />
          <MetricCard
            icon={<Brain className="w-5 h-5 text-violet-600" />}
            iconBg="bg-violet-50"
            label="Subagent数"
            description="Explore・Plan等の専門エージェント起動回数。複雑なタスクの並列処理度。"
            example="多い=高度活用、少ない=単純な対話中心"
            tip="Subagentが多い人のワークフローをチームに共有しよう"
          />
          <MetricCard
            icon={<Plug className="w-5 h-5 text-cyan-600" />}
            iconBg="bg-cyan-50"
            label="MCP呼び出し"
            description="外部ツール連携（Slack, Drive, Notion等）の呼び出し回数。統合活用度。"
            example="Slack通知、GoogleDrive読み書き、Notion更新"
            tip="MCP活用が少ない人に便利な連携方法を共有しよう"
          />
          <MetricCard
            icon={<MessageSquare className="w-5 h-5 text-blue-600" />}
            iconBg="bg-blue-50"
            label="メッセージ"
            description="ユーザー→Claude Codeの入力メッセージ総数。チーム全体の対話量。"
            example="1人あたり50件/日なら活発、5件/日なら低調"
          />
          <MetricCard
            icon={<Users className="w-5 h-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            label="アクティブユーザー"
            description="選択期間内にClaude Codeを使用したユーザー数 / 全登録ユーザー数。"
            tip="アクティブ率が低い場合、セットアップ支援が必要かも"
          />
          <MetricCard
            icon={<Terminal className="w-5 h-5 text-gray-600" />}
            iconBg="bg-gray-100"
            label="セッション"
            description="Claude Codeの起動〜終了を1セッション。セッション/人で1日の平均利用回数がわかる。"
            example="セッション数 ÷ アクティブ人数 = 1人あたり平均回数"
          />
        </div>
      </div>
    ),
  },
  {
    id: "trends",
    icon: <TrendingUp className="w-5 h-5" />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    title: "トレンドの読み方",
    subtitle: "スパークラインと変化率で傾向を素早く把握",
    content: (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              スパークライン
            </h4>
            <div className="bg-gray-50 rounded-lg p-4 mb-3 flex items-center justify-center">
              <MiniSparkline />
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">直近12日間の日別推移をミニグラフで表示</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">右肩上がり = 利用拡大傾向で良好</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">右肩下がり = 利用縮小、原因調査推奨</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-500" />
              変化率（%表示）
            </h4>
            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-3 bg-emerald-50 rounded-lg px-3 py-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <div>
                  <span className="text-sm font-bold text-emerald-700">+50%</span>
                  <p className="text-[10px] text-emerald-600">前期間の1.5倍に増加</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-red-50 rounded-lg px-3 py-2">
                <ArrowDownRight className="w-4 h-4 text-red-600" />
                <div>
                  <span className="text-sm font-bold text-red-700">-30%</span>
                  <p className="text-[10px] text-red-600">前期間の0.7倍に減少</p>
                </div>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              <p className="text-[11px] text-amber-800">
                <span className="font-bold">注意: </span>
                減少=悪いとは限らない。MCPの減少は外部依存を減らした可能性も。文脈で判断する。
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "insights",
    icon: <Sparkles className="w-5 h-5" />,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    title: "AIインサイト",
    subtitle: "Gemini AIが自動分析するパターンとアドバイス",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          利用データをGemini AIが分析し、4つのカテゴリでインサイトカードを自動生成します。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              type: "TREND UP",
              color: "text-blue-700",
              bgColor: "bg-blue-50",
              borderColor: "#3b82f6",
              icon: <TrendingUp className="w-4 h-4 text-blue-600" />,
              desc: "利用増加しているツールやパターン。新しい活用方法が広まっている兆候。",
              action: "→ 増加しているスキルをチーム全体に展開する機会",
            },
            {
              type: "TREND DOWN",
              color: "text-red-700",
              bgColor: "bg-red-50",
              borderColor: "#ef4444",
              icon: <TrendingDown className="w-4 h-4 text-red-600" />,
              desc: "利用減少しているツールやパターン。ワークフロー変更や問題の可能性。",
              action: "→ 減少原因を調査し、必要なら改善策を打つ",
            },
            {
              type: "POWER USER",
              color: "text-purple-700",
              bgColor: "bg-purple-50",
              borderColor: "#8b5cf6",
              icon: <Zap className="w-4 h-4 text-purple-600" />,
              desc: "特に高度・頻繁な利用をしているユーザーを特定。",
              action: "→ ベストプラクティスの共有元として活用",
            },
            {
              type: "USECASE INSIGHT",
              color: "text-emerald-700",
              bgColor: "bg-emerald-50",
              borderColor: "#10b981",
              icon: <Target className="w-4 h-4 text-emerald-600" />,
              desc: "特定プロジェクトやユースケースでの効果的な利用パターン。",
              action: "→ 成功事例を横展開する参考に",
            },
          ].map((item) => (
            <div
              key={item.type}
              className={`rounded-xl border-l-4 p-4 ${item.bgColor}`}
              style={{ borderLeftColor: item.borderColor }}
            >
              <div className="flex items-center gap-2 mb-2">
                {item.icon}
                <span className={`text-[11px] font-bold uppercase tracking-wider ${item.color}`}>{item.type}</span>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed mb-2">{item.desc}</p>
              <p className="text-[11px] font-medium text-gray-500">{item.action}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "tools-analysis",
    icon: <Cpu className="w-5 h-5" />,
    color: "text-violet-600",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    title: "ツール分析ページ",
    subtitle: "4カテゴリ別にツール利用を深掘りする",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              tab: "Skill",
              color: "bg-amber-500",
              desc: "スラッシュコマンド（/commit, /review-pr等）の利用分布",
              examples: "/commit, /review-pr, /codex-collab",
            },
            {
              tab: "Subagent",
              color: "bg-violet-500",
              desc: "専門エージェントの利用分布",
              examples: "Explore, Plan, general-purpose",
            },
            {
              tab: "MCP",
              color: "bg-cyan-500",
              desc: "外部サービス連携ツールの利用状況",
              examples: "Slack, Google Drive, Notion",
            },
            {
              tab: "Command",
              color: "bg-gray-500",
              desc: "Bashコマンドの実行傾向",
              examples: "git, npm, python, bash",
            },
          ].map((item) => (
            <div key={item.tab} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow">
              <div className={`w-8 h-1 rounded-full ${item.color} mb-3`} />
              <h4 className="text-sm font-bold text-gray-900 mb-1">{item.tab}</h4>
              <p className="text-[11px] text-gray-500 leading-relaxed mb-2">{item.desc}</p>
              <p className="text-[10px] text-gray-400 font-mono">{item.examples}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
          <h4 className="text-sm font-bold text-gray-900 mb-3">各タブで見られるグラフ</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2">
              <PieChart className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-700">円グラフ</p>
                <p className="text-[11px] text-gray-500">カテゴリ内のシェア分布</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <BarChart3 className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-700">棒グラフ</p>
                <p className="text-[11px] text-gray-500">TOP10ランキング</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Activity className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-700">折れ線</p>
                <p className="text-[11px] text-gray-500">時間帯別トレンド</p>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-[11px] text-gray-500">
              さらに<span className="font-semibold text-gray-700">「By User」</span>でユーザー別、
              <span className="font-semibold text-gray-700">「By Usecase」</span>でプロジェクト別の内訳も確認可能。
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "patterns",
    icon: <Search className="w-5 h-5" />,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    title: "数字で読む利用傾向",
    subtitle: "指標の数値パターンから利用スタイルを判断する",
    content: (
      <div className="space-y-6">
        <p className="text-sm text-gray-600">
          各指標の数値レンジごとに、どのような利用傾向があるかを示します。個人詳細ページと合わせて読むと、各メンバーの活用度がより明確になります。
        </p>

        {/* Skill */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Skill実行数（7日間ベース）</h4>
          </div>
          <div className="space-y-2">
            {[
              { range: "0", label: "未利用", color: "bg-gray-100 text-gray-600 border-gray-200", desc: "スキルを全く使っていない。基本操作のみで、自動化の恩恵を受けていない状態。", action: "/commit や /review-pr など基本スキルの存在を共有し、ハンズオン体験を提供する" },
              { range: "1〜10", label: "初級", color: "bg-blue-50 text-blue-700 border-blue-200", desc: "基本スキルを試し始めた段階。commit等の頻出スキルに限定されている可能性が高い。", action: "利用中のスキル以外に便利なスキルがないか、スキル一覧を確認してもらう" },
              { range: "11〜50", label: "中級", color: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "複数のスキルを日常的に活用。ワークフローに組み込めている。", action: "どのスキルが特に効果的か共有してもらい、チーム全体に横展開する" },
              { range: "50+", label: "ヘビー", color: "bg-purple-50 text-purple-700 border-purple-200", desc: "スキルをフル活用。自動化率が高く、効率的なワークフローが確立されている。", action: "このユーザーの使い方をパワーユーザー事例としてチームに共有する" },
            ].map((item) => (
              <div key={item.range} className={`rounded-lg border px-4 py-3 ${item.color}`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold min-w-[48px]">{item.range}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{item.label}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90 mb-1">{item.desc}</p>
                <p className="text-[10px] opacity-70"><span className="font-semibold">Next Action:</span> {item.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subagent */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
              <Brain className="w-4 h-4 text-violet-600" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">Subagent利用数（7日間ベース）</h4>
          </div>
          <div className="space-y-2">
            {[
              { range: "0", label: "未利用", color: "bg-gray-100 text-gray-600 border-gray-200", desc: "サブエージェントを使っていない。単純な一問一答の対話のみ。", action: "「複雑なタスクはSubagentに分割できる」ことを伝え、Exploreエージェントの活用例を共有" },
              { range: "1〜10", label: "試用", color: "bg-blue-50 text-blue-700 border-blue-200", desc: "Explore等の基本エージェントを試し始めた段階。並列処理の概念は理解し始めている。", action: "Plan エージェントで実装計画を立ててから作業する流れを提案する" },
              { range: "11〜30", label: "活用", color: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "タスクの複雑さに応じてエージェントを使い分けている。効率的な開発フロー。", action: "general-purpose エージェントでの並列作業やworktree活用も検討" },
              { range: "30+", label: "上級", color: "bg-purple-50 text-purple-700 border-purple-200", desc: "複雑なタスクを細かく分解し、エージェントを駆使。チームワーク型のAI活用。", action: "エージェント活用のベストプラクティスをドキュメント化してチームに共有" },
            ].map((item) => (
              <div key={item.range} className={`rounded-lg border px-4 py-3 ${item.color}`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold min-w-[48px]">{item.range}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{item.label}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90 mb-1">{item.desc}</p>
                <p className="text-[10px] opacity-70"><span className="font-semibold">Next Action:</span> {item.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* MCP */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
              <Plug className="w-4 h-4 text-cyan-600" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">MCP呼び出し数（7日間ベース）</h4>
          </div>
          <div className="space-y-2">
            {[
              { range: "0", label: "未連携", color: "bg-gray-100 text-gray-600 border-gray-200", desc: "外部サービス連携を使っていない。Claude Code内で完結する作業のみ。", action: "Slack通知やDrive読み書きなど、すぐ使える連携を1つ試してもらう" },
              { range: "1〜20", label: "基本連携", color: "bg-blue-50 text-blue-700 border-blue-200", desc: "1〜2サービスとの連携を利用。Slack投稿やDrive読み取り等の基本操作。", action: "Notion・Calendar等の他サービスも連携すると業務範囲が広がることを伝える" },
              { range: "21〜100", label: "統合活用", color: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "複数サービスを横断的に活用。情報収集→加工→発信のワークフローが確立。", action: "特に効果的な連携パターンをチームに共有してもらう" },
              { range: "100+", label: "フル活用", color: "bg-purple-50 text-purple-700 border-purple-200", desc: "外部サービスとの高度な統合。業務の大部分をClaude Code起点で処理。", action: "MCPツールの安定性やレート制限に注意。エラー率も合わせて確認" },
            ].map((item) => (
              <div key={item.range} className={`rounded-lg border px-4 py-3 ${item.color}`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold min-w-[48px]">{item.range}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{item.label}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90 mb-1">{item.desc}</p>
                <p className="text-[10px] opacity-70"><span className="font-semibold">Next Action:</span> {item.action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Message per session */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">メッセージ数 / セッション数の比率</h4>
          </div>
          <p className="text-xs text-gray-500 mb-3">1セッションあたり何回メッセージを送っているかで、対話スタイルがわかります。</p>
          <div className="space-y-2">
            {[
              { range: "1〜5", label: "短セッション", color: "bg-gray-100 text-gray-600 border-gray-200", desc: "1回の起動で少ないやり取り。簡単な質問やワンショットタスクが中心。", insight: "効率的に使えている場合もあるが、Claude Codeの能力を活かしきれていない可能性も" },
              { range: "6〜20", label: "標準セッション", color: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "適度な対話量。タスクを段階的に進め、フィードバックを活かしている。", insight: "最も生産性が高いゾーン。1つのセッションで完結度の高い成果が出ている" },
              { range: "21〜50", label: "長セッション", color: "bg-amber-50 text-amber-700 border-amber-200", desc: "長い対話を続けている。複雑なタスクに取り組んでいるか、試行錯誤が多い。", insight: "成果が出ていればOK。ただしコンテキスト圧縮が発生し精度が下がる可能性に注意" },
              { range: "50+", label: "超長セッション", color: "bg-red-50 text-red-700 border-red-200", desc: "1セッションに依存しすぎ。コンテキスト限界やループに陥っている可能性。", insight: "タスクを小さく分割してセッションを切り替える方法を提案する" },
            ].map((item) => (
              <div key={item.range} className={`rounded-lg border px-4 py-3 ${item.color}`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold min-w-[48px]">{item.range}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{item.label}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90 mb-1">{item.desc}</p>
                <p className="text-[10px] opacity-70"><span className="font-semibold">Insight:</span> {item.insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Model usage patterns */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-indigo-600" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">モデル利用比率の傾向</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                pattern: "Opus 90%+",
                title: "Opus一極集中型",
                color: "border-l-indigo-500 bg-indigo-50/50",
                desc: "最高性能モデルのみ使用。品質最重視だがコストが高い。",
                advice: "単純タスク（ファイル検索・テンプレ修正等）はSonnet/Haikuに切り替えでコスト大幅削減可能",
              },
              {
                pattern: "Sonnet 50%+",
                title: "Sonnet中心型",
                color: "border-l-blue-500 bg-blue-50/50",
                desc: "コスパ重視の使い方。中程度の複雑さのタスクが多い。",
                advice: "バランスの良い使い方。複雑なアーキテクチャ設計はOpusに切り替えると精度UP",
              },
              {
                pattern: "Haiku 30%+",
                title: "コスト最適化型",
                color: "border-l-cyan-500 bg-cyan-50/50",
                desc: "コスト意識が高く、タスクに応じてモデルを使い分けている。",
                advice: "理想的なモデル使い分け。Haikuの回答品質に問題がなければ続けてOK",
              },
              {
                pattern: "均等分布",
                title: "バランス型",
                color: "border-l-emerald-500 bg-emerald-50/50",
                desc: "各モデルを状況に応じて切り替えている。適応力が高い。",
                advice: "タスク複雑度に合ったモデル選択ができている。チームのお手本パターン",
              },
            ].map((item) => (
              <div key={item.pattern} className={`rounded-xl border-l-4 border border-gray-100 p-4 ${item.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-gray-500 bg-white px-1.5 py-0.5 rounded">{item.pattern}</span>
                </div>
                <h5 className="text-xs font-bold text-gray-800 mb-1">{item.title}</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed mb-1.5">{item.desc}</p>
                <p className="text-[10px] text-gray-500"><span className="font-semibold">Advice:</span> {item.advice}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tool category patterns */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-teal-600" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">ツールカテゴリ分布の傾向</h4>
          </div>
          <p className="text-xs text-gray-500 mb-3">個人詳細ページの円グラフの分布パターンから、利用スタイルが読み取れます。</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                title: "Bash偏重型",
                icon: <Terminal className="w-4 h-4 text-gray-600" />,
                bg: "bg-gray-50",
                pattern: "Bash 50%以上",
                desc: "ターミナル操作中心。ビルド・テスト・Git操作が多い開発者タイプ。",
                tips: "エディタ系ツール（Read/Edit/Write）も活用すると対話内で完結できるタスクが増える",
              },
              {
                title: "MCP偏重型",
                icon: <Plug className="w-4 h-4 text-cyan-600" />,
                bg: "bg-cyan-50",
                pattern: "MCP 40%以上",
                desc: "外部サービス連携が中心。情報収集・レポート・通知系の業務が多い。",
                tips: "連携先のAPI制限に注意。バッチ処理やキャッシュ活用でMCP呼び出しを最適化",
              },
              {
                title: "Subagent偏重型",
                icon: <Brain className="w-4 h-4 text-violet-600" />,
                bg: "bg-violet-50",
                pattern: "Subagent 30%以上",
                desc: "複雑なリサーチやプランニングが多い。戦略的な使い方。",
                tips: "Exploreが多い→調査系、Planが多い→設計系、general-purposeが多い→並列実行型",
              },
              {
                title: "Read/Edit偏重型",
                icon: <BookOpen className="w-4 h-4 text-emerald-600" />,
                bg: "bg-emerald-50",
                pattern: "ファイル操作 50%以上",
                desc: "コードの読み書きが中心。実装タスクに集中している開発者タイプ。",
                tips: "Grepも活用すると大規模コードベースの検索効率が大幅に上がる",
              },
              {
                title: "バランス型",
                icon: <Gauge className="w-4 h-4 text-blue-600" />,
                bg: "bg-blue-50",
                pattern: "偏りなし",
                desc: "様々なツールを均等に活用。幅広い業務をClaude Codeで処理。",
                tips: "最も効率的な利用パターン。特定ツールに偏らず柔軟に対応できている",
              },
              {
                title: "メッセージ偏重型",
                icon: <MessageSquare className="w-4 h-4 text-rose-600" />,
                bg: "bg-rose-50",
                pattern: "ツール利用少",
                desc: "対話（質問→回答）が中心。ツール活用が少なく、ChatGPT的な使い方。",
                tips: "Claude Codeの真価はツール連携。Read/Edit/Bashの活用を促すと生産性が大幅向上",
              },
            ].map((item) => (
              <div key={item.title} className={`rounded-xl p-4 ${item.bg} border border-transparent hover:border-gray-200 transition-colors`}>
                <div className="flex items-center gap-2 mb-2">
                  {item.icon}
                  <h5 className="text-xs font-bold text-gray-800">{item.title}</h5>
                </div>
                <span className="inline-block text-[9px] font-semibold text-gray-500 bg-white/80 px-1.5 py-0.5 rounded mb-1.5">{item.pattern}</span>
                <p className="text-[11px] text-gray-600 leading-relaxed mb-1.5">{item.desc}</p>
                <div className="bg-white/60 rounded px-2 py-1.5">
                  <p className="text-[10px] text-gray-500"><span className="font-semibold">Tips:</span> {item.tips}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly patterns */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
              <Clock className="w-4 h-4 text-orange-600" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">時間帯別パターンの傾向</h4>
          </div>
          <p className="text-xs text-gray-500 mb-3">個人詳細ページの時間帯別ヒートマップから、働き方のパターンが見えます。</p>
          <div className="space-y-2">
            {[
              { pattern: "9〜18時に集中", label: "ビジネスタイム型", color: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "標準的な業務時間内に利用。健全なワークスタイル。", insight: "安定した利用パターン。このリズムを維持できると生産性が最も高い" },
              { pattern: "早朝（5〜8時）に集中", label: "アーリーバード型", color: "bg-blue-50 text-blue-700 border-blue-200", desc: "朝の集中時間にClaude Codeを活用。計画的なタスク処理。", insight: "朝の生産性が高い人に多いパターン。タスクの優先順位が明確な傾向" },
              { pattern: "深夜（22〜3時）に集中", label: "ナイトオウル型", color: "bg-amber-50 text-amber-700 border-amber-200", desc: "深夜に利用が集中。締め切り前の追い込みや、個人の作業時間帯の可能性。", insight: "慢性的なら働き方の見直しを検討。スポットなら締め切り対応の可能性" },
              { pattern: "まんべんなく分散", label: "オールタイム型", color: "bg-purple-50 text-purple-700 border-purple-200", desc: "時間帯に偏りがない。常にClaude Codeを傍らに置いて業務している。", insight: "Claude Codeが日常ツールとして定着している。業務効率化の成功パターン" },
              { pattern: "特定の数時間のみ", label: "スポット利用型", color: "bg-gray-100 text-gray-600 border-gray-200", desc: "限定的な時間帯のみ使用。特定タスクの時だけ起動している。", insight: "Claude Codeの用途が限定的。他の業務にも活用できないか検討の余地あり" },
            ].map((item) => (
              <div key={item.pattern} className={`rounded-lg border px-4 py-3 ${item.color}`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-bold">{item.pattern}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75">{item.label}</span>
                </div>
                <p className="text-[11px] leading-relaxed opacity-90 mb-1">{item.desc}</p>
                <p className="text-[10px] opacity-70"><span className="font-semibold">Insight:</span> {item.insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Permission mode patterns */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
              <Shield className="w-4 h-4 text-pink-600" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">パーミッションモードの傾向</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                mode: "default 主体",
                color: "border-l-gray-400 bg-gray-50",
                desc: "標準モード。毎回ツール実行の許可を確認。慎重だが安全。",
                advice: "信頼できるタスクはacceptEditsに切り替えると操作スピードが大幅UP",
              },
              {
                mode: "acceptEdits 主体",
                color: "border-l-blue-400 bg-blue-50/50",
                desc: "ファイル編集を自動許可。コーディング作業の効率を重視。",
                advice: "最も実用的な設定。本番環境に影響するファイルは注意が必要",
              },
              {
                mode: "plan モード多用",
                color: "border-l-violet-400 bg-violet-50/50",
                desc: "計画モードを頻繁に使用。実装前に計画をレビューする慎重派。",
                advice: "品質重視の良いパターン。大規模変更時は特に有効",
              },
              {
                mode: "bypassPermissions",
                color: "border-l-amber-400 bg-amber-50/50",
                desc: "全権限をバイパス。最速だが操作リスクが最も高い。",
                advice: "経験豊富なユーザー向け。本番環境では非推奨。開発環境限定で使うべき",
              },
            ].map((item) => (
              <div key={item.mode} className={`rounded-xl border-l-4 border border-gray-100 p-4 ${item.color}`}>
                <h5 className="text-xs font-bold text-gray-800 mb-1">{item.mode}</h5>
                <p className="text-[11px] text-gray-600 leading-relaxed mb-1.5">{item.desc}</p>
                <p className="text-[10px] text-gray-500"><span className="font-semibold">Advice:</span> {item.advice}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "user-detail",
    icon: <Users className="w-5 h-5" />,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-200",
    title: "個人詳細ページ",
    subtitle: "各メンバーの利用パターンを深く理解する",
    content: (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          ユーザー一覧からメンバー名をクリックすると、個人の利用詳細ページに遷移します。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              icon: <Activity className="w-4 h-4 text-blue-600" />,
              bg: "bg-blue-50",
              title: "日別アクティビティ",
              desc: "日ごとのイベント推移。安定利用か、波があるかが一目でわかる。",
            },
            {
              icon: <Clock className="w-4 h-4 text-purple-600" />,
              bg: "bg-purple-50",
              title: "時間帯別ヒートマップ",
              desc: "0〜23時（JST）の活動分布。深夜利用が多い場合は要注意。",
            },
            {
              icon: <PieChart className="w-4 h-4 text-cyan-600" />,
              bg: "bg-cyan-50",
              title: "ツールカテゴリ分布",
              desc: "MCP偏重→API連携中心、Bash偏重→CLI作業中心とワークスタイルが見える。",
            },
            {
              icon: <Zap className="w-4 h-4 text-amber-600" />,
              bg: "bg-amber-50",
              title: "スキル利用詳細",
              desc: "どのスラッシュコマンドをどれだけ使っているか。自動化の活用度がわかる。",
            },
            {
              icon: <Plug className="w-4 h-4 text-emerald-600" />,
              bg: "bg-emerald-50",
              title: "MCP連携ツール",
              desc: "Slack・Drive・Notion等、外部サービスとの連携頻度の内訳。",
            },
            {
              icon: <Brain className="w-4 h-4 text-indigo-600" />,
              bg: "bg-indigo-50",
              title: "モデル利用比率",
              desc: "Opus/Sonnet/Haikuの使い分け。コスト最適化の参考になる。",
            },
            {
              icon: <Shield className="w-4 h-4 text-pink-600" />,
              bg: "bg-pink-50",
              title: "パーミッションモード",
              desc: "default/plan/acceptEdits等の権限設定の分布。安全性の指標。",
            },
            {
              icon: <Cpu className="w-4 h-4 text-violet-600" />,
              bg: "bg-violet-50",
              title: "サブエージェントタイプ",
              desc: "Explore/Plan/general-purpose等の使い分け。タスク複雑度の指標。",
            },
            {
              icon: <Target className="w-4 h-4 text-rose-600" />,
              bg: "bg-rose-50",
              title: "プロジェクト別利用",
              desc: "どのプロジェクトでClaude Codeを使っているか。業務範囲が見える。",
            },
          ].map((item) => (
            <div key={item.title} className={`rounded-xl p-4 ${item.bg} border border-transparent hover:border-gray-200 transition-colors`}>
              <div className="flex items-center gap-2 mb-1.5">
                {item.icon}
                <h4 className="text-xs font-bold text-gray-800">{item.title}</h4>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "tokens",
    icon: <Database className="w-5 h-5" />,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    title: "トークン使用量",
    subtitle: "API消費コストを監視する",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-2">トークンとは</h4>
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              Claude APIでのテキスト処理単位。入力（プロンプト）と出力（レスポンス）両方で消費。
              日本語は英語の約1.5〜2倍のトークンを消費します。
            </p>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">英語 "Hello world"</span>
                <span className="font-mono font-medium text-gray-700">2 tokens</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">日本語 "こんにちは世界"</span>
                <span className="font-mono font-medium text-gray-700">5 tokens</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h4 className="text-sm font-bold text-gray-900 mb-2">コスト最適化のポイント</h4>
            <ul className="space-y-2">
              {[
                "巨大ファイルの不必要な読み込みを避ける",
                "同じ処理の繰り返しリトライを減らす",
                "単純タスクにはHaikuモデルを活用する",
                "急激なスパイクがあれば原因を調査する",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs text-gray-600">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "tips",
    icon: <Lightbulb className="w-5 h-5" />,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    title: "活用のベストプラクティス",
    subtitle: "ダッシュボードを使ったチーム改善のアクション",
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              emoji: "📅",
              title: "週次レビュー",
              desc: "毎週月曜に「7D」フィルターで先週分を確認。KPI変化率とAIインサイトからチームの活用トレンドを把握する。",
              priority: "推奨頻度: 週1回",
              priorityColor: "bg-blue-50 text-blue-700",
            },
            {
              emoji: "🏆",
              title: "パワーユーザーからの学び",
              desc: "Totalが多いユーザーの詳細ページを開き、よく使うスキルやMCPツールを確認。効果的な使い方をチーム全体に共有する。",
              priority: "即効性: 高い",
              priorityColor: "bg-emerald-50 text-emerald-700",
            },
            {
              emoji: "🔍",
              title: "未利用メンバーのフォロー",
              desc: "アクティブ率が低い場合、個人詳細ページで最終利用日を確認。セットアップ問題や利用障壁がないかヒアリングする。",
              priority: "重要度: 高い",
              priorityColor: "bg-amber-50 text-amber-700",
            },
            {
              emoji: "🔗",
              title: "MCP活用の推進",
              desc: "MCP呼び出しが少ないメンバーに、Slack連携やDrive連携の便利な使い方を紹介。業務効率が大幅に向上する可能性。",
              priority: "効果: 業務効率化",
              priorityColor: "bg-violet-50 text-violet-700",
            },
            {
              emoji: "⚠️",
              title: "異常検知",
              desc: "通常の3倍以上のスパイクや、2週連続のマイナストレンドは要注意。原因を調査し対策を打つ。",
              priority: "緊急度: 状況による",
              priorityColor: "bg-red-50 text-red-700",
            },
            {
              emoji: "💡",
              title: "モデル最適化",
              desc: "個人詳細のモデル利用比率を確認し、単純タスクにOpusを使っているケースがあればHaikuへの切り替えを推奨。コスト削減に直結。",
              priority: "効果: コスト削減",
              priorityColor: "bg-cyan-50 text-cyan-700",
            },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed mb-2">{item.desc}</p>
                  <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${item.priorityColor}`}>
                    {item.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "schema",
    icon: <BookOpen className="w-5 h-5" />,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
    title: "データスキーマ",
    subtitle: "イベントログに含まれるフィールド一覧",
    content: (
      <div>
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Field</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">説明</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">例</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { field: "event", desc: "イベント種別", example: "user_prompt, tool_use, session_start, subagent_start", color: "text-blue-600 bg-blue-50" },
                { field: "ts", desc: "タイムスタンプ（ISO 8601）", example: "2026-03-05T09:30:00Z", color: "text-purple-600 bg-purple-50" },
                { field: "sid", desc: "セッションID（一連の対話を識別）", example: "abc-123-def", color: "text-cyan-600 bg-cyan-50" },
                { field: "uid", desc: "ユーザーID（個人を識別）", example: "user_xxxx", color: "text-emerald-600 bg-emerald-50" },
                { field: "mid", desc: "モデルID（使用モデル）", example: "claude-opus-4-6, claude-sonnet-4-6", color: "text-indigo-600 bg-indigo-50" },
                { field: "pmode", desc: "パーミッションモード", example: "default, plan, acceptEdits", color: "text-pink-600 bg-pink-50" },
                { field: "project", desc: "プロジェクトパス", example: "my-ai-team, claude-code-dashboard", color: "text-amber-600 bg-amber-50" },
                { field: "is_skill", desc: "スキル実行フラグ", example: "true / false", color: "text-orange-600 bg-orange-50" },
                { field: "skill_name", desc: "実行されたスキル名", example: "commit, review-pr, codex-collab", color: "text-rose-600 bg-rose-50" },
                { field: "category", desc: "ツールカテゴリ", example: "mcp, bash, subagent", color: "text-violet-600 bg-violet-50" },
                { field: "tool", desc: "具体的なツール名", example: "Read, Edit, Bash, Grep", color: "text-teal-600 bg-teal-50" },
                { field: "agent_type", desc: "サブエージェントタイプ", example: "Explore, Plan, general-purpose", color: "text-gray-600 bg-gray-100" },
              ].map((row) => (
                <tr key={row.field} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5">
                    <span className={`inline-block font-mono text-[11px] font-medium px-1.5 py-0.5 rounded ${row.color}`}>
                      {row.field}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-700">{row.desc}</td>
                  <td className="px-4 py-2.5 text-[11px] text-gray-400 font-mono hidden sm:table-cell">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
];

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1440px] mx-auto px-6 py-6">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(139,92,246,0.1),transparent_50%)]" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <Badge color="bg-blue-500/20 text-blue-300">Guide</Badge>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              ダッシュボード活用ガイド
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl leading-relaxed">
              Claude Code Usage Dashboardの全指標の意味、トレンドの読み方、個人データの見方、
              そしてチーム改善に活かすアクションプランを解説します。
            </p>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sticky sidebar TOC */}
          <nav className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-6">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Contents</p>
              <ul className="space-y-0.5">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                    >
                      <span className={`flex-shrink-0 ${section.color}`}>{section.icon}</span>
                      <span className="truncate">{section.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-8">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className={`rounded-2xl border ${section.borderColor} overflow-hidden`}
              >
                <div className={`${section.bgColor} px-6 py-5`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center ${section.color}`}>
                      {section.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{section.title}</h2>
                      <p className="text-xs text-gray-500">{section.subtitle}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white px-6 py-6">
                  {section.content}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
