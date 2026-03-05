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
