# AGENTS.md - Claude Code Usage Dashboard Implementation Guide for Codex

## Overview

Claude Code Usage Dashboardは、チーム全体のClaude Code利用状況を可視化するWebアプリケーション。
**デザインモック（UIモック）は既に完成している。** Codexの仕事は、モックデータを実データに置き換え、API・データ収集・AI Insights機能を実装すること。

### プロジェクト構造

```
claude-code-dashboard/
├── AGENTS.md                          ← このファイル（実装指示書）
├── docs/
│   ├── PRD.md                         ← 要件定義書（全14セクション）
│   ├── hooks-research.md              ← Claude Code hooks調査結果
│   └── data-collection-design.md      ← データ収集プラグイン技術仕様
├── src/
│   ├── app/
│   │   ├── layout.tsx                 ✅ DONE（デザインモック）
│   │   ├── page.tsx                   ✅ DONE（ダッシュボードOverview）
│   │   ├── globals.css                ✅ DONE
│   │   ├── analytics/
│   │   │   ├── tools/page.tsx         ✅ DONE（ツール分析）
│   │   │   └── tokens/page.tsx        ✅ DONE（プレースホルダー）
│   │   └── users/page.tsx             ✅ DONE（プレースホルダー）
│   ├── components/
│   │   ├── layout/
│   │   │   └── Header.tsx             ✅ DONE
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx            ✅ DONE
│   │   │   ├── SparkLine.tsx          ✅ DONE
│   │   │   ├── AIInsights.tsx         ✅ DONE
│   │   │   └── UserTable.tsx          ✅ DONE
│   │   └── tools/
│   │       ├── UsageTrend.tsx         ✅ DONE
│   │       ├── SkillDistribution.tsx  ✅ DONE
│   │       └── SkillBarChart.tsx      ✅ DONE
│   ├── lib/
│   │   ├── mock-data.ts              ✅ DONE → TO BE REPLACED with real data fetching
│   │   ├── api.ts                    🔧 TO BE IMPLEMENTED（APIクライアント）
│   │   ├── parser.ts                 🔧 TO BE IMPLEMENTED（JSONLパーサー）
│   │   └── aggregator.ts             🔧 TO BE IMPLEMENTED（集計ロジック）
│   ├── app/api/
│   │   └── v1/
│   │       ├── kpis/route.ts         🔧 TO BE IMPLEMENTED
│   │       ├── users/route.ts        🔧 TO BE IMPLEMENTED
│   │       ├── tools/[category]/route.ts  🔧 TO BE IMPLEMENTED
│   │       ├── insights/route.ts     🔧 TO BE IMPLEMENTED
│   │       └── health/route.ts       🔧 TO BE IMPLEMENTED
│   ├── types/
│   │   └── index.ts                  ✅ DONE（拡張が必要）
│   └── hooks/                        🔧 TO BE IMPLEMENTED（React hooks）
├── scripts/
│   ├── cc-logger.sh                  🔧 TO BE IMPLEMENTED（データ収集hookスクリプト）
│   ├── cc-aggregate.sh               🔧 TO BE IMPLEMENTED（集計スクリプト）
│   └── cc-install.sh                 🔧 TO BE IMPLEMENTED（インストーラー）
├── package.json                       ✅ DONE
├── tailwind.config.ts                 ✅ DONE
├── tsconfig.json                      ✅ DONE
├── .env.example                       🔧 TO BE CREATED
└── vercel.json                        🔧 TO BE CREATED
```

---

## Tech Stack (already installed)

| パッケージ | バージョン | 用途 |
|-----------|-----------|------|
| next | 16.1.6 | フレームワーク（App Router） |
| react / react-dom | 19.2.3 | UI |
| tailwindcss | 4.x | スタイリング |
| recharts | 3.7.0 | グラフ（折れ線・ドーナツ・棒グラフ） |
| lucide-react | 0.563.0 | アイコン |
| @radix-ui/react-tabs | 1.1.13 | タブUI |
| @radix-ui/react-select | 2.2.6 | セレクトUI |
| typescript | 5.x | 型安全 |

### 追加インストールが必要なパッケージ

```bash
npm install @google/generative-ai swr
```

| パッケージ | 用途 |
|-----------|------|
| @google/generative-ai | Gemini API（AI Insights生成） |
| swr | データフェッチ + キャッシュ |

---

## Implementation Tasks (in order)

### Phase 1: データ収集プラグイン

#### Task 1.1: hookスクリプト `scripts/cc-logger.sh` の実装

**ファイル**: `scripts/cc-logger.sh`

完全な実装コードが `docs/data-collection-design.md` セクション4.1に記載されている。そのまま使用すること。

**要件**:
- stdinからClaude Code hook入力JSONを読み取る
- `hook_event_name` でイベント種別を判定し、case文で分岐
- 共通フィールド（event, ts, sid, uid, mid, pmode, project）を抽出
- イベント固有フィールドを抽出
- `~/.claude-code-dashboard/logs/YYYY-MM-DD.jsonl` にappend
- jqを使用してJSON構築

**イベント対応表**:

| hook_event_name | 出力event | 主要フィールド |
|-----------------|-----------|---------------|
| SessionStart | session_start | source, model |
| SessionEnd | session_end | reason |
| UserPromptSubmit | user_prompt | prompt_len, is_skill, skill_name |
| PostToolUse | tool_use | tool, category, detail |
| PostToolUseFailure | tool_failure | tool, error_head |
| SubagentStart | subagent_start | agent_id, agent_type |
| SubagentStop | subagent_stop | agent_id, agent_type |
| TaskCompleted | task_completed | task_id, task_subject, teammate, team |
| TeammateIdle | teammate_idle | teammate, team |
| PreCompact | compaction | trigger |

**tool_category分類ロジック**:

| tool_nameパターン | category |
|-------------------|----------|
| Bash | bash |
| Edit, Write | file_edit |
| Read | file_read |
| Glob, Grep | search |
| Task | subagent |
| WebFetch, WebSearch | web |
| mcp__* | mcp |
| その他 | other |

#### Task 1.2: インストーラー `scripts/cc-install.sh`

**ファイル**: `scripts/cc-install.sh`

```bash
#!/bin/bash
# Claude Code Dashboard インストーラー
# 1. ~/.claude-code-dashboard/ ディレクトリ構造作成
# 2. スクリプトコピー + 実行権限付与
# 3. ~/.claude/settings.json にhooks設定をマージ（既存hooks保持）
# 4. user-profile.json 生成
# 5. jqインストール確認
```

**hooks設定マージ**: `docs/data-collection-design.md` セクション4.2のJSON設定を `~/.claude/settings.json` の `hooks` キーにマージする。既存のhooks設定（例: Notification）は絶対に上書きしない。jqの `*` マージ演算子を使用。

**user-profile.json生成**:
```json
{
  "uid": "<git email SHA-256先頭8文字>",
  "mid": "<hostname SHA-256先頭8文字>",
  "git_name": "<git config user.name>",
  "git_email": "<git config user.email>",
  "hostname": "<hostname>",
  "os": "<uname -s | tr '[:upper:]' '[:lower:]'>",
  "registered_at": "<ISO 8601 timestamp>"
}
```

#### Task 1.3: `.env.example` 作成

**ファイル**: `.env.example`

```env
# Gemini API (AI Insights用)
GEMINI_API_KEY=

# データ収集
LOG_DIR=~/.claude-code-dashboard/logs
LOG_RETENTION_DAYS=90

# 認証 (設定時にBasic認証が有効化される)
DASHBOARD_AUTH_TOKEN=

# AI Insights
INSIGHTS_CACHE_TTL_SEC=3600
INSIGHTS_MAX_COUNT=5

# アプリ設定
NEXT_PUBLIC_APP_TITLE=Claude Code Usage Dashboard
NODE_ENV=development
```

---

### Phase 2: バックエンドAPI

#### Task 2.1: JSONLパーサー `src/lib/parser.ts`

```typescript
// JSONLファイルを読み込み、型付きイベント配列を返す
export function parseJSONL(filePath: string): BaseEvent[];

// 日付範囲でフィルター
export function filterByDateRange(events: BaseEvent[], start: Date, end: Date): BaseEvent[];

// ユーザーでフィルター
export function filterByUser(events: BaseEvent[], uid: string): BaseEvent[];

// イベント種別でフィルター
export function filterByEventType(events: BaseEvent[], eventType: string): BaseEvent[];

// 複数のJSONLファイルを日付範囲で読み込み
export function loadEvents(logDir: string, startDate: Date, endDate: Date): BaseEvent[];
```

**注意**:
- 不正なJSON行はスキップ（エラーログ出力）
- 10万行でも5秒以内で処理（ストリーム処理を使用）
- ファイルが存在しない日付はスキップ

#### Task 2.2: 集計ロジック `src/lib/aggregator.ts`

```typescript
// KPIサマリー集計
export function aggregateKPIs(events: BaseEvent[], period: Period): KPISummary;

// ユーザー別集計
export function aggregateByUser(events: BaseEvent[]): UserSummary[];

// ツールカテゴリ別集計（スキル/サブエージェント/MCP/コマンド）
export function aggregateByToolCategory(events: BaseEvent[], category: ToolCategory): ToolAnalysis;

// 前期比計算
export function calculateChangeRate(current: number, previous: number): number;

// スパークラインデータ生成（過去N日分の日次集計）
export function generateSparkline(events: BaseEvent[], days: number): number[];

// 時系列トレンドデータ生成
export function generateTrend(events: BaseEvent[], granularity: 'hour' | 'day'): TrendDataPoint[];
```

**KPISummary型**:
```typescript
interface KPISummary {
  skills: { current: number; previous: number; changeRate: number; sparkline: number[] };
  subagents: { current: number; previous: number; changeRate: number; sparkline: number[] };
  mcpCalls: { current: number; previous: number; changeRate: number; sparkline: number[] };
  messages: { current: number; previous: number; changeRate: number; sparkline: number[] };
  activeUsers: { active: number; total: number; rate: number };
  sessions: { current: number; previous: number; changeRate: number; sparkline: number[] };
}
```

#### Task 2.3: API Routes実装

##### GET /api/v1/kpis (`src/app/api/v1/kpis/route.ts`)

```typescript
export async function GET(request: NextRequest): Promise<NextResponse<KPISummary>> {
  // 1. クエリパラメータ（start, end）をパース
  // 2. loadEvents() でJSONLを読み込み
  // 3. aggregateKPIs() で集計
  // 4. JSONレスポンスを返却
}
```

##### GET /api/v1/users (`src/app/api/v1/users/route.ts`)

```typescript
export async function GET(request: NextRequest): Promise<NextResponse<UserSummary[]>> {
  // 1. クエリパラメータ（start, end, sort_by, sort_order）をパース
  // 2. loadEvents() + aggregateByUser()
  // 3. ソート処理
  // 4. user-profile.json からユーザー名を解決
}
```

##### GET /api/v1/tools/[category] (`src/app/api/v1/tools/[category]/route.ts`)

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
): Promise<NextResponse<ToolAnalysis>> {
  // 1. category パスパラメータをバリデーション（skills/subagents/mcp/commands）
  // 2. loadEvents() + aggregateByToolCategory()
  // 3. トレンド・分布・ランキングデータを生成
}
```

##### GET /api/v1/insights (`src/app/api/v1/insights/route.ts`)

```typescript
export async function GET(request: NextRequest): Promise<NextResponse<InsightsResponse>> {
  // 1. キャッシュ確認（TTL: INSIGHTS_CACHE_TTL_SEC）
  // 2. キャッシュヒット → キャッシュ返却
  // 3. キャッシュミス → 集計データをGemini APIに送信
  // 4. Gemini応答をパースしてInsightCard[]に変換
  // 5. キャッシュに保存
  // 6. レスポンス返却
}
```

**Gemini APIプロンプト**:
```
以下のClaude Code利用データを分析し、5つのインサイトをJSON形式で返してください。

インサイトの種類:
- TREND_UP: 増加トレンド（メトリクス名、変化率%、理由）
- TREND_DOWN: 減少トレンド（同上）
- POWER_USER: ヘビーユーザーの特定
- USECASE_INSIGHT: 主要なユースケースパターン

出力形式:
[
  { "type": "TREND_UP", "title": "タイトル", "description": "詳細", "metric": "メトリクス名", "change_rate": 数値 }
]

データ:
{集計JSON}
```

##### GET /api/v1/health (`src/app/api/v1/health/route.ts`)

```typescript
export async function GET(): Promise<NextResponse> {
  // ログディレクトリのサイズ、イベント総数を返す
}
```

---

### Phase 3: フロントエンドのモック→実データ接続

#### Task 3.1: APIクライアント `src/lib/api.ts`

```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function useKPIs(period: Period) {
  const { start, end } = periodToDateRange(period);
  return useSWR(`/api/v1/kpis?start=${start}&end=${end}`, fetcher);
}

export function useUsers(period: Period, sortBy: string, sortOrder: string) {
  return useSWR(`/api/v1/users?start=...&sort_by=${sortBy}&sort_order=${sortOrder}`, fetcher);
}

export function useToolAnalysis(category: ToolCategory, period: Period) {
  return useSWR(`/api/v1/tools/${category}?start=...`, fetcher);
}

export function useInsights(period: Period) {
  return useSWR(`/api/v1/insights?start=...`, fetcher, { refreshInterval: 3600000 });
}
```

#### Task 3.2: ページコンポーネントの実データ接続

**`src/app/page.tsx`（ダッシュボード）**:
- `mock-data.ts` のインポートを削除
- `useKPIs()`, `useUsers()`, `useInsights()` に置き換え
- ローディング状態・エラー状態のUI追加
- 期間フィルターの状態をURLクエリパラメータに同期

**`src/app/analytics/tools/page.tsx`（ツール分析）**:
- `useToolAnalysis()` に置き換え
- サブタブ切替でcategoryパラメータを変更

#### Task 3.3: 期間フィルターのグローバル状態管理

- React Context または URLクエリパラメータで期間状態を管理
- Header.tsxの期間ボタンクリック → 全ページのデータ再取得

---

### Phase 4: AI Insights（Gemini API連携）

#### Task 4.1: Gemini API統合

**ファイル**: `src/lib/gemini.ts`

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateInsights(aggregatedData: object): Promise<InsightCard[]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  // プロンプト構築 → API呼び出し → JSON解析 → InsightCard[]に変換
}
```

#### Task 4.2: キャッシュ機構

- ファイルベースキャッシュ（`~/.claude-code-dashboard/data/insights-cache.json`）
- TTL: 環境変数 `INSIGHTS_CACHE_TTL_SEC`（デフォルト3600秒）
- キャッシュキー: 期間パラメータのハッシュ

---

## Design Rules (DO NOT CHANGE)

以下のデザイン要素は**変更禁止**。実データ接続時もデザインを維持すること。

1. **カラースキーム**:
   - ページ背景: `#f9fafb`
   - カード背景: `#ffffff`
   - テキスト: Tailwind標準（gray-900, gray-500等）
   - 増加: 緑系（`#22C55E` / `text-green-600`）
   - 減少: 赤系（`#EF4444` / `text-red-600`）

2. **レイアウト**:
   - KPIカード: 6列grid（デスクトップ）
   - AI Insights: 5枚横並び、左ボーダー色分け
   - テーブル: 1位黄色ハイライト、上位3位メダルアイコン

3. **コンポーネント構造**:
   - `components/` のディレクトリ構造を維持
   - コンポーネントのprops interfaceを維持（拡張はOK）

4. **日本語UI**: 全ラベル・テキストは日本語

5. **フォント・角丸・シャドウ**: 現在の `globals.css` の設定を維持

---

## Key Behavioral Rules

1. **hookスクリプトは非ブロッキング**: Claude Codeの動作を妨げない。PostToolUse等は `async: true`
2. **プロンプト全文は保存しない**: 文字数のみ。プライバシー配慮
3. **ファイルパスはフルパス保存しない**: 拡張子のみ
4. **コマンドは先頭トークンのみ**: `git`, `npm` 等。引数は記録しない
5. **ユーザー識別はハッシュ**: git emailのSHA-256先頭8文字
6. **既存hooks設定を破壊しない**: インストーラーはマージ、上書きしない
7. **ログローテーション**: 90日超のログは自動削除
8. **Gemini API呼び出しはキャッシュ**: 同一期間のInsightsは1時間キャッシュ

---

## Testing Checklist

### データ収集
- [ ] `cc-logger.sh` が全10イベントを正しくJSONLに記録する
- [ ] jqが未インストールの場合にエラーメッセージを表示する
- [ ] `cc-install.sh` が既存hooks設定を破壊せずマージする
- [ ] `cc-install.sh` が `user-profile.json` を正しく生成する
- [ ] ログファイルが日付ごとに分割される
- [ ] asyncのhookがClaude Codeの動作をブロックしない

### バックエンドAPI
- [ ] `/api/v1/kpis` が正しいKPIサマリーを返す
- [ ] `/api/v1/users` がユーザー別集計を返し、ソートが動作する
- [ ] `/api/v1/tools/:category` が4カテゴリ全てで正しいデータを返す
- [ ] `/api/v1/insights` がGemini APIを呼び出しInsightsを返す
- [ ] `/api/v1/insights` のキャッシュが正しく動作する（TTL内は再呼び出ししない）
- [ ] `/api/v1/health` がログサイズ・イベント総数を返す
- [ ] 不正なパラメータに対して400エラーを返す
- [ ] JSONLファイルが存在しない場合に空データ（ゼロ値）を返す

### フロントエンド
- [ ] ダッシュボードOverviewが実データで表示される
- [ ] KPIカードの前期比が正しく計算・表示される
- [ ] スパークラインが実データを反映する
- [ ] AI Insightsカードが表示される
- [ ] ユーザー別テーブルのソートが全カラムで動作する
- [ ] ツール分析の折れ線グラフが実データを表示する
- [ ] ドーナツチャート・棒グラフが実データを表示する
- [ ] 期間フィルター切替で全データが再取得・再描画される
- [ ] ローディング状態が表示される
- [ ] エラー状態が表示される

### パフォーマンス
- [ ] ダッシュボード初回表示: 3秒以内（LCP）
- [ ] フィルター変更後の再描画: 1秒以内
- [ ] 10万行JSONLの集計: 5秒以内

### デプロイ
- [ ] `npm run build` が成功する
- [ ] Vercel / Cloud Runにデプロイが成功する
- [ ] 環境変数設定後、本番環境で動作する
