"use client";

import Header from "@/components/layout/Header";

const sections = [
  {
    id: "overview",
    title: "ダッシュボード概要",
    description: "このダッシュボードは、チーム全体のClaude Code利用状況をリアルタイムで可視化するツールです。",
    items: [
      {
        term: "データソース",
        detail:
          "各メンバーのClaude Codeセッションログ（JSONL形式）をSupabaseに集約し、日別に解析しています。ログにはイベント種別・タイムスタンプ・ユーザーID・セッションID・モデルID・プロジェクト名等が含まれます。",
      },
      {
        term: "期間フィルター",
        detail:
          "画面右上の「1D / 7D / 30D / All」で表示期間を切り替えられます。1D=直近24時間、7D=直近7日間、30D=直近30日間、All=全期間。前同期間との比較により変化率を算出します。",
      },
      {
        term: "更新タイミング",
        detail:
          "データは定期的にSupabaseと同期されます。手動同期はAPI（/api/v1/sync）経由で実行可能です。",
      },
    ],
  },
  {
    id: "kpis",
    title: "KPI指標の見方",
    description: "ダッシュボード上部の6つのカードが主要KPIです。各指標の意味と活用方法を解説します。",
    items: [
      {
        term: "Skill実行数",
        detail:
          "Claude Codeのスキル（/commit, /review-pr 等のスラッシュコマンド）が実行された回数。多いほどClaude Codeの高度な機能を活用できています。急増は新しいスキルの導入、急減はワークフロー変更の可能性。",
      },
      {
        term: "Subagent数",
        detail:
          "サブエージェント（Explore, Plan等の専門エージェント）が起動された回数。複雑なタスクを並列処理する際に使われます。多いほど高度な使い方をしている指標です。",
      },
      {
        term: "MCP呼び出し",
        detail:
          "外部ツール連携（Slack, Google Workspace, Notion等）のMCPツール呼び出し回数。外部サービスとの統合活用度を示します。",
      },
      {
        term: "メッセージ",
        detail:
          "ユーザーからClaude Codeへの入力メッセージ総数。チーム全体のClaude Code対話量を示す基本指標です。",
      },
      {
        term: "アクティブ / 全ユーザー",
        detail:
          "選択期間内にClaude Codeを使用したユーザー数 / 全登録ユーザー数。アクティブ率が低い場合、未利用メンバーへの利用促進が必要かもしれません。",
      },
      {
        term: "セッション",
        detail:
          "Claude Codeの起動〜終了を1セッションとしてカウント。1人が1日に複数セッションを持つことがあります。セッション数÷アクティブユーザー数で1人あたりの平均セッション数がわかります。",
      },
    ],
  },
  {
    id: "sparklines",
    title: "スパークラインとトレンド",
    description: "各KPIカードの右下に表示されるミニグラフと変化率の読み方です。",
    items: [
      {
        term: "スパークライン",
        detail:
          "直近12日間の日別推移をミニ折れ線グラフで表示。右肩上がりなら利用拡大傾向、右肩下がりなら利用縮小傾向です。",
      },
      {
        term: "変化率（%表示）",
        detail:
          "選択期間の値を前同期間と比較した増減率。例: 7D選択時、直近7日間 vs その前の7日間。+50%なら前期間の1.5倍、-30%なら0.7倍に減少したことを意味します。",
      },
      {
        term: "変化率の色",
        detail:
          "緑（+）= 増加傾向で良好。赤（-）= 減少傾向で注意。ただし「MCP呼び出し」の減少は外部ツール依存度が下がっただけの可能性もあり、一概に悪いとは限りません。文脈で判断してください。",
      },
    ],
  },
  {
    id: "ai-insights",
    title: "AIインサイト",
    description: "Gemini AIが利用データを分析し、自動生成するインサイトカードの読み方です。",
    items: [
      {
        term: "TREND UP（青）",
        detail:
          "利用が増加しているツールやパターンを検出。新しい活用方法が広まっている兆候です。",
      },
      {
        term: "TREND DOWN（赤）",
        detail:
          "利用が減少しているツールやパターンを検出。ワークフローの変更や問題の可能性を示唆します。",
      },
      {
        term: "POWER USER（紫）",
        detail:
          "特に高度・頻繁な利用をしているユーザーを特定。ベストプラクティスの共有元として注目。",
      },
      {
        term: "USECASE INSIGHT（緑）",
        detail:
          "特定のプロジェクトやユースケースでの利用パターンを分析。効果的な活用事例の発見に役立ちます。",
      },
    ],
  },
  {
    id: "tools",
    title: "ツール分析ページ",
    description: "「ツール分析」タブでは、4つのカテゴリ別にツール利用状況を深掘りできます。",
    items: [
      {
        term: "Skill タブ",
        detail:
          "スラッシュコマンド（/commit, /review-pr等）の利用分布。どのスキルが最も活用されているか、誰が使っているか、どのプロジェクトで使われているかを確認できます。",
      },
      {
        term: "Subagent タブ",
        detail:
          "サブエージェント（Explore, Plan, general-purpose等）の利用分布。タスクの複雑さや並列処理の活用度を把握できます。",
      },
      {
        term: "MCP タブ",
        detail:
          "MCP（Model Context Protocol）ツールの利用分布。Slack, Google Workspace, Notion等の外部サービス連携状況を確認できます。",
      },
      {
        term: "Command タブ",
        detail:
          "Bashコマンドの実行分布。git, npm, python等のコマンドライン操作の傾向を把握できます。",
      },
      {
        term: "グラフの見方",
        detail:
          "円グラフ=カテゴリ内のシェア、棒グラフ=TOP10ランキング、折れ線=時間帯別トレンド。「By User」タブでユーザー別、「By Usecase」タブでプロジェクト別の分布も確認できます。",
      },
    ],
  },
  {
    id: "tokens",
    title: "トークン使用量ページ",
    description: "Claude APIのトークン消費量を監視するページです。",
    items: [
      {
        term: "トークンとは",
        detail:
          "Claude APIでのテキスト処理単位。入力（プロンプト）と出力（レスポンス）の両方で消費されます。日本語は英語の約1.5〜2倍のトークンを消費します。",
      },
      {
        term: "コスト意識",
        detail:
          "トークン使用量はAPI利用コストに直結します。急激な増加がある場合、非効率な使い方（巨大ファイルの読み込み、不要な繰り返し処理等）が発生している可能性があります。",
      },
    ],
  },
  {
    id: "users",
    title: "ユーザー一覧・個人詳細ページ",
    description: "メンバー個別の利用状況を確認できます。",
    items: [
      {
        term: "ユーザー一覧テーブル",
        detail:
          "全メンバーのSkill/Subagent/MCP/Command/Message数を一覧表示。各列のヘッダーをクリックでソート可能。「Total」でランキング、「Last Active」で直近の活動を確認できます。",
      },
      {
        term: "個人詳細ページ",
        detail:
          "ユーザー名をクリックすると詳細ページに遷移。日別アクティビティ推移・時間帯別ヒートマップ・ツール分布・プロジェクト別利用・最近のセッション一覧を確認できます。",
      },
      {
        term: "日別アクティビティ",
        detail:
          "折れ線グラフで日ごとのイベント数を表示。安定的に使えているか、特定の日だけ急増/急減していないかを確認します。",
      },
      {
        term: "時間帯別ヒートマップ",
        detail:
          "0時〜23時（JST）の棒グラフで活動集中時間帯を表示。深夜の利用が多い場合は働き方の見直しが必要かもしれません。",
      },
      {
        term: "ツールカテゴリ分布",
        detail:
          "円グラフでそのユーザーがどのカテゴリのツールを多く使っているか表示。MCP偏重ならAPI連携中心、Bash偏重ならコマンドライン作業中心、とワークスタイルが見えます。",
      },
      {
        term: "プロジェクト別利用",
        detail:
          "横棒グラフでどのプロジェクトでClaude Codeを使っているか表示。特定プロジェクトでの利用が集中しているか、幅広く使えているかを確認します。",
      },
    ],
  },
  {
    id: "tips",
    title: "活用のヒント",
    description: "ダッシュボードを使ったチーム改善のポイントです。",
    items: [
      {
        term: "週次レビューに使う",
        detail:
          "毎週月曜日に「7D」フィルターで先週の利用状況を確認。KPI変化率とAIインサイトを読み、チームの活用トレンドを把握します。",
      },
      {
        term: "パワーユーザーからの学び",
        detail:
          "Totalが多いユーザーの詳細ページを開き、よく使うツールやスキルを確認。効果的な使い方をチーム全体に共有しましょう。",
      },
      {
        term: "未利用メンバーへのフォロー",
        detail:
          "アクティブ率が低い場合、個人詳細ページで最終利用日を確認。利用障壁がないか、セットアップに問題がないかヒアリングしましょう。",
      },
      {
        term: "MCP活用の推進",
        detail:
          "MCP呼び出しが少ないメンバーには、Slack連携やGoogleWorkspace連携等の便利な使い方を紹介すると、業務効率が大幅に向上する可能性があります。",
      },
      {
        term: "異常検知",
        detail:
          "急激なスパイク（通常の3倍以上）や長期的な減少トレンド（2週連続マイナス）は要注意。原因を調査し、必要に応じて対策を打ちましょう。",
      },
    ],
  },
];

export default function GuidePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ダッシュボード活用ガイド
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            各指標の意味、トレンドの読み方、チーム改善への活用方法を解説します。
          </p>

          {/* Table of Contents */}
          <nav className="bg-gray-50 rounded-lg p-5 mb-8">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              目次
            </h3>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {sections.map((section, i) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {i + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map((section) => (
              <section key={section.id} id={section.id}>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {section.description}
                </p>
                <div className="bg-white rounded-lg border border-gray-100 shadow-sm divide-y divide-gray-100">
                  {section.items.map((item) => (
                    <div key={item.term} className="px-5 py-4">
                      <dt className="text-sm font-semibold text-gray-800 mb-1">
                        {item.term}
                      </dt>
                      <dd className="text-sm text-gray-600 leading-relaxed">
                        {item.detail}
                      </dd>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Data Schema Reference */}
          <section id="schema" className="mt-10">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              データスキーマ参考
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              各イベントに含まれるフィールドの一覧です。ダッシュボードの指標はこれらのフィールドから算出されています。
            </p>
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3 font-semibold text-gray-700">
                      フィールド
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-700">
                      説明
                    </th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-700">
                      例
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    { field: "event", desc: "イベント種別", example: "user_prompt, tool_use, session_start" },
                    { field: "ts", desc: "タイムスタンプ（ISO 8601）", example: "2026-03-05T09:30:00Z" },
                    { field: "sid", desc: "セッションID", example: "abc-123-def" },
                    { field: "uid", desc: "ユーザーID", example: "user_xxxx" },
                    { field: "mid", desc: "モデルID", example: "claude-opus-4-6" },
                    { field: "pmode", desc: "パーミッションモード", example: "default, plan, acceptEdits" },
                    { field: "project", desc: "プロジェクトパス", example: "my-ai-team" },
                    { field: "is_skill", desc: "スキル実行フラグ", example: "true / false" },
                    { field: "category", desc: "ツールカテゴリ", example: "mcp, bash, subagent" },
                    { field: "tool", desc: "ツール名", example: "Read, Edit, Bash" },
                  ].map((row) => (
                    <tr key={row.field}>
                      <td className="px-5 py-2.5 font-mono text-xs text-blue-700">
                        {row.field}
                      </td>
                      <td className="px-5 py-2.5 text-gray-700">{row.desc}</td>
                      <td className="px-5 py-2.5 text-gray-500 font-mono text-xs">
                        {row.example}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
