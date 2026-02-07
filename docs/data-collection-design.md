# データ収集プラグイン技術仕様

## 概要

Claude Codeのhooks機能を利用して、利用状況データを収集するプラグインの技術仕様書。
hookスクリプトが各イベントをJSONLファイルに記録し、集計スクリプトがダッシュボードUIにデータを提供する。

---

## 1. アーキテクチャ

```
Claude Code
    |
    v
[Hook Events] --> [cc-logger.sh] --> [~/.claude-code-dashboard/logs/YYYY-MM-DD.jsonl]
                                           |
                                           v
                                  [cc-aggregate.sh] (cron / on-demand)
                                           |
                                           v
                              [~/.claude-code-dashboard/data/aggregated.json]
                                           |
                                           v
                                   [Next.js Dashboard UI]
```

### コンポーネント

| コンポーネント | 役割 |
|--------------|------|
| `cc-logger.sh` | hookから呼ばれるメインロガースクリプト。stdinからJSONを読み、JSONLに追記 |
| `cc-aggregate.sh` | JSONLを集計してダッシュボード用JSONを生成 |
| `settings.json` の hooks設定 | Claude Codeにhookを登録 |

---

## 2. 収集イベント一覧

### 2.1 セッションイベント

| イベント | hookイベント | 収集データ |
|---------|------------|-----------|
| session_start | `SessionStart` | session_id, source, model, timestamp |
| session_end | `SessionEnd` | session_id, reason, timestamp |

### 2.2 プロンプトイベント

| イベント | hookイベント | 収集データ |
|---------|------------|-----------|
| user_prompt | `UserPromptSubmit` | session_id, prompt_length, is_skill_command, skill_name, timestamp |

**注意**: プロンプトの全文は保存しない（プライバシー配慮）。文字数とスキルコマンド判定のみ。

### 2.3 ツール使用イベント

| イベント | hookイベント | マッチャー | 収集データ |
|---------|------------|-----------|-----------|
| tool_use | `PostToolUse` | `*`（全ツール） | session_id, tool_name, tool_category, file_path (Edit/Write時), command (Bash時の先頭トークンのみ), duration_hint, timestamp |

**tool_category分類:**

| tool_name パターン | category |
|-------------------|----------|
| `Bash` | bash |
| `Edit`, `Write` | file_edit |
| `Read` | file_read |
| `Glob`, `Grep` | search |
| `Task` | subagent |
| `WebFetch`, `WebSearch` | web |
| `mcp__*` | mcp |
| `Skill` | skill |
| その他 | other |

### 2.4 サブエージェントイベント

| イベント | hookイベント | 収集データ |
|---------|------------|-----------|
| subagent_start | `SubagentStart` | session_id, agent_id, agent_type, timestamp |
| subagent_stop | `SubagentStop` | session_id, agent_id, agent_type, timestamp |

### 2.5 タスクイベント

| イベント | hookイベント | 収集データ |
|---------|------------|-----------|
| task_completed | `TaskCompleted` | session_id, task_id, task_subject, teammate_name, team_name, timestamp |

### 2.6 チームイベント

| イベント | hookイベント | 収集データ |
|---------|------------|-----------|
| teammate_idle | `TeammateIdle` | session_id, teammate_name, team_name, timestamp |

### 2.7 コンパクションイベント

| イベント | hookイベント | 収集データ |
|---------|------------|-----------|
| compaction | `PreCompact` | session_id, trigger, timestamp |

### 2.8 ツール失敗イベント

| イベント | hookイベント | 収集データ |
|---------|------------|-----------|
| tool_failure | `PostToolUseFailure` | session_id, tool_name, error_summary, timestamp |

---

## 3. JSONLスキーマ定義

### 3.1 共通フィールド

全イベントに含まれるフィールド:

```typescript
interface BaseEvent {
  // イベント種別
  event: string;
  // タイムスタンプ (ISO 8601)
  ts: string;
  // セッションID
  sid: string;
  // ユーザー識別子 (git config user.email のハッシュ)
  uid: string;
  // マシン識別子 (hostname のハッシュ)
  mid: string;
  // Claude Codeのパーミッションモード
  pmode: string;
  // プロジェクトディレクトリ（最後のパスコンポーネントのみ）
  project: string;
}
```

### 3.2 各イベントのスキーマ

#### session_start

```json
{
  "event": "session_start",
  "ts": "2026-02-07T10:30:00.000Z",
  "sid": "abc123",
  "uid": "a1b2c3d4",
  "mid": "e5f6g7h8",
  "pmode": "bypassPermissions",
  "project": "my-ai-team",
  "source": "startup",
  "model": "claude-opus-4-6"
}
```

#### session_end

```json
{
  "event": "session_end",
  "ts": "2026-02-07T11:00:00.000Z",
  "sid": "abc123",
  "uid": "a1b2c3d4",
  "mid": "e5f6g7h8",
  "pmode": "bypassPermissions",
  "project": "my-ai-team",
  "reason": "prompt_input_exit"
}
```

#### user_prompt

```json
{
  "event": "user_prompt",
  "ts": "2026-02-07T10:31:00.000Z",
  "sid": "abc123",
  "uid": "a1b2c3d4",
  "mid": "e5f6g7h8",
  "pmode": "bypassPermissions",
  "project": "my-ai-team",
  "prompt_len": 142,
  "is_skill": true,
  "skill_name": "commit"
}
```

#### tool_use

```json
{
  "event": "tool_use",
  "ts": "2026-02-07T10:31:05.000Z",
  "sid": "abc123",
  "uid": "a1b2c3d4",
  "mid": "e5f6g7h8",
  "pmode": "bypassPermissions",
  "project": "my-ai-team",
  "tool": "Bash",
  "category": "bash",
  "detail": "npm"
}
```

`detail` フィールドの内容はツールにより異なる:
- **Bash**: コマンドの先頭トークン（`npm`, `git`, `python`等）
- **Edit/Write**: ファイル拡張子（`.ts`, `.py`等）
- **Read**: ファイル拡張子
- **Glob/Grep**: パターンの先頭10文字
- **Task**: `subagent_type`
- **mcp__***: MCPサーバー名（`mcp__github__*` → `github`）
- **WebFetch/WebSearch**: ドメインまたはクエリの先頭語

#### tool_failure

```json
{
  "event": "tool_failure",
  "ts": "2026-02-07T10:31:10.000Z",
  "sid": "abc123",
  "uid": "a1b2c3d4",
  "mid": "e5f6g7h8",
  "pmode": "bypassPermissions",
  "project": "my-ai-team",
  "tool": "Bash",
  "error_head": "Command exited with non-zero"
}
```

#### subagent_start / subagent_stop

```json
{
  "event": "subagent_start",
  "ts": "2026-02-07T10:32:00.000Z",
  "sid": "abc123",
  "uid": "a1b2c3d4",
  "mid": "e5f6g7h8",
  "pmode": "bypassPermissions",
  "project": "my-ai-team",
  "agent_id": "agent-xyz",
  "agent_type": "Explore"
}
```

#### task_completed

```json
{
  "event": "task_completed",
  "ts": "2026-02-07T10:35:00.000Z",
  "sid": "abc123",
  "uid": "a1b2c3d4",
  "mid": "e5f6g7h8",
  "pmode": "bypassPermissions",
  "project": "my-ai-team",
  "task_id": "task-001",
  "task_subject": "Implement auth",
  "teammate": "implementer",
  "team": "my-project"
}
```

#### teammate_idle

```json
{
  "event": "teammate_idle",
  "ts": "2026-02-07T10:36:00.000Z",
  "sid": "abc123",
  "uid": "a1b2c3d4",
  "mid": "e5f6g7h8",
  "pmode": "bypassPermissions",
  "project": "my-ai-team",
  "teammate": "researcher",
  "team": "my-project"
}
```

#### compaction

```json
{
  "event": "compaction",
  "ts": "2026-02-07T10:40:00.000Z",
  "sid": "abc123",
  "uid": "a1b2c3d4",
  "mid": "e5f6g7h8",
  "pmode": "bypassPermissions",
  "project": "my-ai-team",
  "trigger": "auto"
}
```

---

## 4. Hookスクリプト実装方針

### 4.1 メインロガー: `cc-logger.sh`

全イベントを1つのスクリプトで処理する。イベント種別は`hook_event_name`で分岐。

**設計方針:**
- **非ブロッキング**: 全hookはexit 0で即座に返す（Claude Codeの動作を妨げない）
- **async推奨**: PostToolUseなど頻発するイベントは`"async": true`で非同期実行
- **jq依存**: JSON解析にjqを使用（macOSにはデフォルトでは入っていないが、Homebrewで容易にインストール可能）
- **ファイルロック**: 複数hookの同時書き込みに対応するため、flockまたはatomic append使用

**スクリプト概要:**

```bash
#!/bin/bash
# cc-logger.sh - Claude Code利用データロガー

set -euo pipefail

LOG_DIR="$HOME/.claude-code-dashboard/logs"
mkdir -p "$LOG_DIR"

DATE=$(date -u +%Y-%m-%d)
LOG_FILE="$LOG_DIR/$DATE.jsonl"

# stdinからJSON入力を読み込み
INPUT=$(cat)

# 共通フィールドの抽出
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // empty')
EVENT_NAME=$(echo "$INPUT" | jq -r '.hook_event_name // empty')
PMODE=$(echo "$INPUT" | jq -r '.permission_mode // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)

# プロジェクト名（cwdの最後のコンポーネント）
PROJECT=$(basename "$CWD" 2>/dev/null || echo "unknown")

# ユーザーID（git emailのSHA256ハッシュ先頭8文字）
GIT_EMAIL=$(git config user.email 2>/dev/null || echo "unknown")
UID_HASH=$(echo -n "$GIT_EMAIL" | shasum -a 256 | cut -c1-8)

# マシンID（hostnameのSHA256ハッシュ先頭8文字）
MID_HASH=$(echo -n "$(hostname)" | shasum -a 256 | cut -c1-8)

# イベント種別に応じてログレコードを構築
case "$EVENT_NAME" in
  "SessionStart")
    SOURCE=$(echo "$INPUT" | jq -r '.source // empty')
    MODEL=$(echo "$INPUT" | jq -r '.model // empty')
    RECORD=$(jq -nc \
      --arg event "session_start" \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg uid "$UID_HASH" \
      --arg mid "$MID_HASH" \
      --arg pmode "$PMODE" \
      --arg project "$PROJECT" \
      --arg source "$SOURCE" \
      --arg model "$MODEL" \
      '{event:$event,ts:$ts,sid:$sid,uid:$uid,mid:$mid,pmode:$pmode,project:$project,source:$source,model:$model}')
    ;;

  "SessionEnd")
    REASON=$(echo "$INPUT" | jq -r '.reason // empty')
    RECORD=$(jq -nc \
      --arg event "session_end" \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg uid "$UID_HASH" \
      --arg mid "$MID_HASH" \
      --arg pmode "$PMODE" \
      --arg project "$PROJECT" \
      --arg reason "$REASON" \
      '{event:$event,ts:$ts,sid:$sid,uid:$uid,mid:$mid,pmode:$pmode,project:$project,reason:$reason}')
    ;;

  "UserPromptSubmit")
    PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')
    PROMPT_LEN=${#PROMPT}
    IS_SKILL=false
    SKILL_NAME=""
    if [[ "$PROMPT" == /* ]]; then
      IS_SKILL=true
      SKILL_NAME=$(echo "$PROMPT" | awk '{print $1}' | sed 's/^\///')
    fi
    RECORD=$(jq -nc \
      --arg event "user_prompt" \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg uid "$UID_HASH" \
      --arg mid "$MID_HASH" \
      --arg pmode "$PMODE" \
      --arg project "$PROJECT" \
      --argjson prompt_len "$PROMPT_LEN" \
      --argjson is_skill "$IS_SKILL" \
      --arg skill_name "$SKILL_NAME" \
      '{event:$event,ts:$ts,sid:$sid,uid:$uid,mid:$mid,pmode:$pmode,project:$project,prompt_len:$prompt_len,is_skill:$is_skill,skill_name:$skill_name}')
    ;;

  "PostToolUse")
    TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
    TOOL_INPUT=$(echo "$INPUT" | jq -c '.tool_input // {}')

    # tool category分類
    case "$TOOL_NAME" in
      Bash) CATEGORY="bash" ;;
      Edit|Write) CATEGORY="file_edit" ;;
      Read) CATEGORY="file_read" ;;
      Glob|Grep) CATEGORY="search" ;;
      Task) CATEGORY="subagent" ;;
      WebFetch|WebSearch) CATEGORY="web" ;;
      mcp__*) CATEGORY="mcp" ;;
      *) CATEGORY="other" ;;
    esac

    # detail抽出
    case "$TOOL_NAME" in
      Bash)
        DETAIL=$(echo "$INPUT" | jq -r '.tool_input.command // empty' | awk '{print $1}')
        ;;
      Edit|Write|Read)
        DETAIL=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' | sed 's/.*\./\./')
        ;;
      Glob|Grep)
        DETAIL=$(echo "$INPUT" | jq -r '.tool_input.pattern // empty' | cut -c1-10)
        ;;
      Task)
        DETAIL=$(echo "$INPUT" | jq -r '.tool_input.subagent_type // empty')
        ;;
      mcp__*)
        DETAIL=$(echo "$TOOL_NAME" | sed 's/mcp__\([^_]*\)__.*/\1/')
        ;;
      *)
        DETAIL=""
        ;;
    esac

    RECORD=$(jq -nc \
      --arg event "tool_use" \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg uid "$UID_HASH" \
      --arg mid "$MID_HASH" \
      --arg pmode "$PMODE" \
      --arg project "$PROJECT" \
      --arg tool "$TOOL_NAME" \
      --arg category "$CATEGORY" \
      --arg detail "$DETAIL" \
      '{event:$event,ts:$ts,sid:$sid,uid:$uid,mid:$mid,pmode:$pmode,project:$project,tool:$tool,category:$category,detail:$detail}')
    ;;

  "PostToolUseFailure")
    TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
    ERROR=$(echo "$INPUT" | jq -r '.error // empty' | cut -c1-100)
    RECORD=$(jq -nc \
      --arg event "tool_failure" \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg uid "$UID_HASH" \
      --arg mid "$MID_HASH" \
      --arg pmode "$PMODE" \
      --arg project "$PROJECT" \
      --arg tool "$TOOL_NAME" \
      --arg error_head "$ERROR" \
      '{event:$event,ts:$ts,sid:$sid,uid:$uid,mid:$mid,pmode:$pmode,project:$project,tool:$tool,error_head:$error_head}')
    ;;

  "SubagentStart")
    AGENT_ID=$(echo "$INPUT" | jq -r '.agent_id // empty')
    AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type // empty')
    RECORD=$(jq -nc \
      --arg event "subagent_start" \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg uid "$UID_HASH" \
      --arg mid "$MID_HASH" \
      --arg pmode "$PMODE" \
      --arg project "$PROJECT" \
      --arg agent_id "$AGENT_ID" \
      --arg agent_type "$AGENT_TYPE" \
      '{event:$event,ts:$ts,sid:$sid,uid:$uid,mid:$mid,pmode:$pmode,project:$project,agent_id:$agent_id,agent_type:$agent_type}')
    ;;

  "SubagentStop")
    AGENT_ID=$(echo "$INPUT" | jq -r '.agent_id // empty')
    AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type // empty')
    RECORD=$(jq -nc \
      --arg event "subagent_stop" \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg uid "$UID_HASH" \
      --arg mid "$MID_HASH" \
      --arg pmode "$PMODE" \
      --arg project "$PROJECT" \
      --arg agent_id "$AGENT_ID" \
      --arg agent_type "$AGENT_TYPE" \
      '{event:$event,ts:$ts,sid:$sid,uid:$uid,mid:$mid,pmode:$pmode,project:$project,agent_id:$agent_id,agent_type:$agent_type}')
    ;;

  "TaskCompleted")
    TASK_ID=$(echo "$INPUT" | jq -r '.task_id // empty')
    TASK_SUBJECT=$(echo "$INPUT" | jq -r '.task_subject // empty')
    TEAMMATE=$(echo "$INPUT" | jq -r '.teammate_name // empty')
    TEAM=$(echo "$INPUT" | jq -r '.team_name // empty')
    RECORD=$(jq -nc \
      --arg event "task_completed" \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg uid "$UID_HASH" \
      --arg mid "$MID_HASH" \
      --arg pmode "$PMODE" \
      --arg project "$PROJECT" \
      --arg task_id "$TASK_ID" \
      --arg task_subject "$TASK_SUBJECT" \
      --arg teammate "$TEAMMATE" \
      --arg team "$TEAM" \
      '{event:$event,ts:$ts,sid:$sid,uid:$uid,mid:$mid,pmode:$pmode,project:$project,task_id:$task_id,task_subject:$task_subject,teammate:$teammate,team:$team}')
    ;;

  "TeammateIdle")
    TEAMMATE=$(echo "$INPUT" | jq -r '.teammate_name // empty')
    TEAM=$(echo "$INPUT" | jq -r '.team_name // empty')
    RECORD=$(jq -nc \
      --arg event "teammate_idle" \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg uid "$UID_HASH" \
      --arg mid "$MID_HASH" \
      --arg pmode "$PMODE" \
      --arg project "$PROJECT" \
      --arg teammate "$TEAMMATE" \
      --arg team "$TEAM" \
      '{event:$event,ts:$ts,sid:$sid,uid:$uid,mid:$mid,pmode:$pmode,project:$project,teammate:$teammate,team:$team}')
    ;;

  "PreCompact")
    TRIGGER=$(echo "$INPUT" | jq -r '.trigger // empty')
    RECORD=$(jq -nc \
      --arg event "compaction" \
      --arg ts "$TIMESTAMP" \
      --arg sid "$SESSION_ID" \
      --arg uid "$UID_HASH" \
      --arg mid "$MID_HASH" \
      --arg pmode "$PMODE" \
      --arg project "$PROJECT" \
      --arg trigger "$TRIGGER" \
      '{event:$event,ts:$ts,sid:$sid,uid:$uid,mid:$mid,pmode:$pmode,project:$project,trigger:$trigger}')
    ;;

  *)
    # 未対応イベントは無視
    exit 0
    ;;
esac

# JSONLに追記（atomic append）
echo "$RECORD" >> "$LOG_FILE"

exit 0
```

### 4.2 hooks設定

`~/.claude/settings.json` に追加するhook設定:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude-code-dashboard/scripts/cc-logger.sh",
            "timeout": 5
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude-code-dashboard/scripts/cc-logger.sh",
            "timeout": 5
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude-code-dashboard/scripts/cc-logger.sh",
            "timeout": 5
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude-code-dashboard/scripts/cc-logger.sh",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ],
    "PostToolUseFailure": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude-code-dashboard/scripts/cc-logger.sh",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ],
    "SubagentStart": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude-code-dashboard/scripts/cc-logger.sh",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude-code-dashboard/scripts/cc-logger.sh",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ],
    "TaskCompleted": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude-code-dashboard/scripts/cc-logger.sh",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ],
    "TeammateIdle": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude-code-dashboard/scripts/cc-logger.sh",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ],
    "PreCompact": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude-code-dashboard/scripts/cc-logger.sh",
            "async": true,
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

**設計ポイント:**
- **SessionStart / UserPromptSubmit**: 同期実行（`async`なし）。これらはセッション開始直後やプロンプト処理前に必要で、高速（5秒タイムアウト）
- **PostToolUse等の頻発イベント**: `async: true` で非同期。Claude Codeの動作をブロックしない
- **Notification**: 収集対象外（ダッシュボードに不要。既存のnotify-if-long.shと競合回避）
- **PreToolUse**: 収集対象外（PostToolUseで十分。PreToolUseはバリデーション用途に温存）

---

## 5. ユーザー識別方法

### 5.1 識別子の生成

| 識別子 | ソース | 方法 |
|--------|-------|------|
| `uid` (ユーザーID) | `git config user.email` | SHA-256ハッシュ先頭8文字 |
| `mid` (マシンID) | `hostname` | SHA-256ハッシュ先頭8文字 |
| `project` | `cwd`（hook入力から取得） | パスの最後のコンポーネント |

### 5.2 補足情報（初回セッション時に記録）

初回起動時に `~/.claude-code-dashboard/user-profile.json` を生成:

```json
{
  "uid": "a1b2c3d4",
  "mid": "e5f6g7h8",
  "git_name": "Chiba Yushi",
  "git_email": "y.chiba@digital-gorilla.co.jp",
  "hostname": "MacBook-Pro.local",
  "os": "darwin",
  "registered_at": "2026-02-07T10:00:00.000Z"
}
```

このファイルはダッシュボードUI上でユーザー名を表示するために使用。ログファイル自体にはハッシュのみ記録。

---

## 6. データ保存方式

### 6.1 ログファイル

- **場所**: `~/.claude-code-dashboard/logs/`
- **命名**: `YYYY-MM-DD.jsonl`（日付ごと）
- **形式**: JSONL（1行1イベント）
- **エンコーディング**: UTF-8

### 6.2 ログローテーション

| 設定 | 値 |
|------|---|
| 保持期間 | 90日 |
| ローテーション | 日次（新ファイル自動生成） |
| クリーンアップ | `cc-aggregate.sh`実行時に90日超のファイルを削除 |
| 最大ディスク使用量 | 推定: 1日あたり約100KB-1MB（利用量に依存） |

### 6.3 ディレクトリ構造

```
~/.claude-code-dashboard/
  logs/
    2026-02-07.jsonl
    2026-02-06.jsonl
    ...
  data/
    aggregated.json        # 集計済みデータ（ダッシュボード用）
    daily/
      2026-02-07.json      # 日次集計
      2026-02-06.json
  scripts/
    cc-logger.sh           # メインロガー
    cc-aggregate.sh        # 集計スクリプト
    cc-install.sh          # インストーラー
  user-profile.json        # ユーザープロファイル
```

---

## 7. 集計方法の設計

### 7.1 日次集計（`daily/*.json`）

```json
{
  "date": "2026-02-07",
  "sessions": {
    "total": 5,
    "by_project": { "my-ai-team": 3, "web-app": 2 },
    "by_model": { "claude-opus-4-6": 3, "claude-sonnet-4-5-20250929": 2 }
  },
  "prompts": {
    "total": 42,
    "avg_length": 156,
    "skills": { "commit": 3, "review-pr": 1 }
  },
  "tools": {
    "total": 187,
    "by_category": {
      "bash": 45,
      "file_edit": 38,
      "file_read": 52,
      "search": 22,
      "subagent": 8,
      "web": 5,
      "mcp": 12,
      "other": 5
    },
    "by_tool": {
      "Bash": 45,
      "Edit": 30,
      "Write": 8,
      "Read": 52,
      "Glob": 12,
      "Grep": 10,
      "Task": 8,
      "WebSearch": 3,
      "WebFetch": 2,
      "mcp__google-workspace__search_gmail_messages": 4,
      "mcp__notion__API-post-search": 8
    },
    "bash_commands": {
      "git": 15,
      "npm": 8,
      "node": 5,
      "python": 3
    },
    "file_extensions": {
      ".ts": 20,
      ".md": 15,
      ".json": 8
    }
  },
  "failures": {
    "total": 3,
    "by_tool": { "Bash": 2, "Edit": 1 }
  },
  "subagents": {
    "started": 8,
    "completed": 8,
    "by_type": { "Explore": 5, "Bash": 3 }
  },
  "tasks": {
    "completed": 4,
    "by_team": { "my-project": 4 }
  },
  "compactions": {
    "total": 2,
    "auto": 1,
    "manual": 1
  },
  "teammates": {
    "idle_count": 6,
    "by_name": { "researcher": 3, "implementer": 3 }
  }
}
```

### 7.2 ダッシュボード用集計（`aggregated.json`）

過去90日分の日次集計を統合し、以下の形式で出力:

```json
{
  "generated_at": "2026-02-07T12:00:00.000Z",
  "period": { "from": "2025-11-10", "to": "2026-02-07" },
  "user": {
    "uid": "a1b2c3d4",
    "name": "Chiba Yushi",
    "email": "y.chiba@digital-gorilla.co.jp"
  },
  "summary": {
    "total_sessions": 450,
    "total_prompts": 3200,
    "total_tool_uses": 15000,
    "total_failures": 120,
    "total_subagents": 800,
    "total_tasks_completed": 350,
    "total_compactions": 90
  },
  "daily": [
    { "date": "2026-02-07", "sessions": 5, "prompts": 42, "tools": 187, "failures": 3 },
    { "date": "2026-02-06", "sessions": 8, "prompts": 65, "tools": 280, "failures": 5 }
  ],
  "trends": {
    "sessions_7d": [5, 8, 6, 7, 4, 9, 5],
    "tools_7d": [187, 280, 220, 250, 180, 310, 190]
  },
  "breakdowns": {
    "tools_by_category": { "bash": 3500, "file_edit": 2800, "file_read": 4200 },
    "tools_by_name": { "Bash": 3500, "Read": 4200, "Edit": 2200 },
    "projects": { "my-ai-team": 200, "web-app": 150, "claude-code-dashboard": 100 },
    "models": { "claude-opus-4-6": 300, "claude-sonnet-4-5-20250929": 150 },
    "skills": { "commit": 45, "review-pr": 20, "pr": 15 },
    "mcp_servers": { "google-workspace": 500, "notion": 300, "claude-in-chrome": 100 }
  }
}
```

### 7.3 集計スクリプト実行タイミング

| トリガー | 方法 |
|---------|------|
| ダッシュボードアクセス時 | Next.js API route から `cc-aggregate.sh` を呼び出し |
| 定期実行（推奨） | cron: `0 * * * * ~/.claude-code-dashboard/scripts/cc-aggregate.sh` |
| 手動実行 | `~/.claude-code-dashboard/scripts/cc-aggregate.sh` |

---

## 8. インストール方針

### 8.1 インストーラー（`cc-install.sh`）

1. `~/.claude-code-dashboard/` ディレクトリ構造を作成
2. スクリプトファイルをコピーし実行権限を付与
3. `~/.claude/settings.json` のhooksセクションにロガー設定をマージ
4. 既存のhooksを破壊しないよう、既存設定を保持してマージ
5. `user-profile.json` を生成

### 8.2 アンインストーラー

1. `~/.claude/settings.json` からロガーhook設定を削除
2. `~/.claude-code-dashboard/` を削除（オプション: ログを残すか確認）

---

## 9. パフォーマンス考慮

| 項目 | 対策 |
|------|------|
| hookの実行速度 | 頻発イベントは`async: true`。同期hookは5秒タイムアウト |
| ディスクI/O | JSONLへのappend（O(1)）。読み取りは集計時のみ |
| jqの起動コスト | 1回のhookで複数回jqを呼ぶが、async hookなので影響は軽微 |
| ファイルサイズ | 1イベント約200-400バイト。1日1000イベントで約300KB |
| ログローテーション | 90日で最大約27MB。十分小さい |

---

## 10. セキュリティ考慮

| リスク | 対策 |
|--------|------|
| プロンプト内容の漏洩 | プロンプト全文は保存しない。文字数のみ |
| ファイルパスの漏洩 | 拡張子のみ抽出。フルパスは記録しない |
| コマンド内容の漏洩 | 先頭トークンのみ（`git`, `npm`等）。引数は記録しない |
| ユーザー情報の漏洩 | ハッシュ化したUID/MID。user-profile.jsonはローカルのみ |
| ファイルパーミッション | ログディレクトリは`700`、ファイルは`600` |

---

## 11. 既存hookとの共存

現在の`~/.claude/settings.json`には`Notification` hookが設定されている（`notify-if-long.sh`）。

データ収集hookは`Notification`イベントを使用しないため、競合なし。
インストーラーは既存のhook設定を保持したまま、新しいイベントのhookのみを追加する。

---

## 12. 今後の拡張

| 拡張 | 説明 |
|------|------|
| コスト推定 | モデル別のトークン使用量推定（transcript.jsonlの解析） |
| セッション時間計算 | session_start/endのペアリングによるセッション時間算出 |
| リアルタイム更新 | WebSocket/SSEによるダッシュボードのリアルタイム更新 |
| マルチユーザー | チーム向け集約サーバー |
| プラグイン化 | Claude Code pluginとしてパッケージング |
