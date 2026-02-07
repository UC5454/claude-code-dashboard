# Claude Code Hooks 調査レポート

## 概要

Claude Codeのhooksは、CLIのライフサイクルの特定のポイントで自動実行されるユーザー定義のシェルコマンドまたはLLMプロンプト。操作のバリデーション、ポリシーの強制、コンテキストの追加、外部ツールとの統合に利用できる。

**公式ドキュメント:**
- [Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Hooks Guide](https://code.claude.com/docs/en/hooks-guide)

---

## 1. 設定ファイルの場所とスコープ

| 場所 | スコープ | 共有可否 |
|------|---------|----------|
| `~/.claude/settings.json` | 全プロジェクト共通（ユーザーレベル） | No（ローカル専用） |
| `.claude/settings.json` | 単一プロジェクト | Yes（リポジトリにコミット可能） |
| `.claude/settings.local.json` | 単一プロジェクト | No（gitignore対象） |
| Managed policy settings | 組織全体 | Yes（管理者制御） |
| Plugin `hooks/hooks.json` | プラグイン有効時 | Yes（プラグインにバンドル） |
| Skill/Agent frontmatter | コンポーネントアクティブ時 | Yes |

### 現在のユーザー設定（~/.claude/settings.json）

```json
{
  "permissions": {
    "defaultMode": "bypassPermissions"
  },
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  },
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/notify-if-long.sh"
          }
        ]
      }
    ]
  }
}
```

既存のNotification hookは通知音（Glass.aiff）を再生するのみ。

---

## 2. 利用可能なイベント一覧

### 全14イベント

| イベント | 発火タイミング | ブロック可否 | マッチャー対象 |
|---------|--------------|------------|--------------|
| **SessionStart** | セッション開始・再開時 | No | `startup`, `resume`, `clear`, `compact` |
| **UserPromptSubmit** | ユーザーがプロンプト送信時（処理前） | Yes | マッチャー非対応（常に発火） |
| **PreToolUse** | ツール実行前 | Yes（allow/deny/ask） | ツール名（`Bash`, `Edit`, `Write`, `Read`, `Glob`, `Grep`, `Task`, `WebFetch`, `WebSearch`, `mcp__*`） |
| **PermissionRequest** | パーミッションダイアログ表示時 | Yes | ツール名 |
| **PostToolUse** | ツール実行成功後 | No（フィードバックのみ） | ツール名 |
| **PostToolUseFailure** | ツール実行失敗後 | No | ツール名 |
| **Notification** | 通知送信時 | No | `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog` |
| **SubagentStart** | サブエージェント起動時 | No（コンテキスト注入可） | エージェントタイプ（`Bash`, `Explore`, `Plan`, カスタム名） |
| **SubagentStop** | サブエージェント完了時 | Yes | エージェントタイプ |
| **Stop** | メインエージェント応答完了時 | Yes | マッチャー非対応 |
| **TeammateIdle** | チームメイトがアイドルになる直前 | Yes（exit 2） | マッチャー非対応 |
| **TaskCompleted** | タスク完了マーク時 | Yes（exit 2） | マッチャー非対応 |
| **PreCompact** | コンテキスト圧縮前 | No | `manual`, `auto` |
| **SessionEnd** | セッション終了時 | No | `clear`, `logout`, `prompt_input_exit`, `bypass_permissions_disabled`, `other` |

---

## 3. Hook入力（stdin JSON）

### 共通フィールド（全イベント共通）

| フィールド | 説明 |
|-----------|------|
| `session_id` | セッション識別子 |
| `transcript_path` | 会話JSONのパス |
| `cwd` | hookが呼び出された時のカレントディレクトリ |
| `permission_mode` | 現在のパーミッションモード（`default`, `plan`, `acceptEdits`, `dontAsk`, `bypassPermissions`） |
| `hook_event_name` | 発火したイベント名 |

### イベント固有フィールド

#### PreToolUse / PostToolUse / PostToolUseFailure

| フィールド | 説明 |
|-----------|------|
| `tool_name` | ツール名（`Bash`, `Edit`, `Write`, `Read`, `Glob`, `Grep`, `Task`, `WebFetch`, `WebSearch`, `mcp__*`） |
| `tool_input` | ツールのパラメータ（ツールにより異なる） |
| `tool_use_id` | ツール使用ID |
| `tool_response` | ツールの応答（PostToolUseのみ） |
| `error` | エラー内容（PostToolUseFailureのみ） |
| `is_interrupt` | ユーザー中断かどうか（PostToolUseFailureのみ） |

#### tool_inputの構造（ツール別）

**Bash:**
```json
{
  "command": "npm test",
  "description": "Run test suite",
  "timeout": 120000,
  "run_in_background": false
}
```

**Write:**
```json
{
  "file_path": "/path/to/file.txt",
  "content": "file content"
}
```

**Edit:**
```json
{
  "file_path": "/path/to/file.txt",
  "old_string": "original text",
  "new_string": "replacement text",
  "replace_all": false
}
```

**Read:**
```json
{
  "file_path": "/path/to/file.txt",
  "offset": 10,
  "limit": 50
}
```

**Task (Subagent):**
```json
{
  "prompt": "Find all API endpoints",
  "description": "Find API endpoints",
  "subagent_type": "Explore",
  "model": "sonnet"
}
```

#### SessionStart

| フィールド | 説明 |
|-----------|------|
| `source` | 起動方法（`startup`, `resume`, `clear`, `compact`） |
| `model` | モデルID |
| `agent_type` | エージェント名（`--agent`指定時のみ） |

#### UserPromptSubmit

| フィールド | 説明 |
|-----------|------|
| `prompt` | ユーザーが送信したプロンプトテキスト |

#### Stop / SubagentStop

| フィールド | 説明 |
|-----------|------|
| `stop_hook_active` | Stopフックによる継続中かどうか |
| `agent_id` | エージェントID（SubagentStopのみ） |
| `agent_type` | エージェントタイプ（SubagentStopのみ） |
| `agent_transcript_path` | サブエージェントのトランスクリプトパス（SubagentStopのみ） |

#### SubagentStart

| フィールド | 説明 |
|-----------|------|
| `agent_id` | エージェントID |
| `agent_type` | エージェントタイプ |

#### TeammateIdle

| フィールド | 説明 |
|-----------|------|
| `teammate_name` | チームメイト名 |
| `team_name` | チーム名 |

#### TaskCompleted

| フィールド | 説明 |
|-----------|------|
| `task_id` | タスクID |
| `task_subject` | タスクタイトル |
| `task_description` | タスク詳細（optional） |
| `teammate_name` | チームメイト名（optional） |
| `team_name` | チーム名（optional） |

#### Notification

| フィールド | 説明 |
|-----------|------|
| `message` | 通知テキスト |
| `title` | 通知タイトル（optional） |
| `notification_type` | 通知タイプ |

#### PreCompact

| フィールド | 説明 |
|-----------|------|
| `trigger` | トリガー（`manual`, `auto`） |
| `custom_instructions` | ユーザー指定の指示 |

#### SessionEnd

| フィールド | 説明 |
|-----------|------|
| `reason` | 終了理由（`clear`, `logout`, `prompt_input_exit`, `bypass_permissions_disabled`, `other`） |

---

## 4. Hook出力（stdout/stderr/exit code）

### Exit Code

| コード | 意味 | 動作 |
|--------|------|------|
| **0** | 成功 | stdoutのJSONを処理。アクション続行 |
| **2** | ブロッキングエラー | stderrをClaudeにフィードバック。アクションをブロック |
| **その他** | 非ブロッキングエラー | stderrはverboseモードで表示。アクション続行 |

### JSON出力（exit 0時のみ処理）

#### 全イベント共通フィールド

| フィールド | デフォルト | 説明 |
|-----------|----------|------|
| `continue` | `true` | `false`でClaude完全停止 |
| `stopReason` | なし | `continue: false`時のユーザー表示メッセージ |
| `suppressOutput` | `false` | `true`でstdoutをverboseモードで非表示 |
| `systemMessage` | なし | ユーザーへの警告メッセージ |

#### PreToolUse固有

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow|deny|ask",
    "permissionDecisionReason": "理由",
    "updatedInput": { "修正後のtool_input" },
    "additionalContext": "追加コンテキスト"
  }
}
```

#### PostToolUse固有

```json
{
  "decision": "block",
  "reason": "理由",
  "hookSpecificOutput": {
    "hookEventName": "PostToolUse",
    "additionalContext": "追加情報",
    "updatedMCPToolOutput": "MCPツール出力の置換"
  }
}
```

#### Stop / SubagentStop固有

```json
{
  "decision": "block",
  "reason": "継続理由（必須）"
}
```

---

## 5. 環境変数

| 変数 | 説明 | 利用可能タイミング |
|------|------|-----------------|
| `$CLAUDE_PROJECT_DIR` | プロジェクトルートの絶対パス | 全hook |
| `$CLAUDE_CODE_REMOTE` | リモートWeb環境では`"true"` | 全hook |
| `$CLAUDE_ENV_FILE` | 環境変数永続化ファイルパス | **SessionStartのみ** |
| `${CLAUDE_PLUGIN_ROOT}` | プラグインルートディレクトリ | プラグインhookのみ |

---

## 6. Hookタイプ

### Command Hook（type: "command"）
- シェルコマンドを実行
- stdin: JSON入力、stdout/stderr/exit codeで結果を返す
- `async: true`でバックグラウンド実行可能（ブロック不可）

### Prompt Hook（type: "prompt"）
- LLMに単発プロンプトを送って評価
- `$ARGUMENTS`プレースホルダーでhook入力JSONを注入
- 応答: `{ "ok": true/false, "reason": "..." }`
- デフォルトモデル: Haiku（高速モデル）

### Agent Hook（type: "agent"）
- サブエージェントを起動し、マルチターンで検証
- Read, Grep, Globなどのツールを使用可能
- 最大50ターン
- 応答: Prompt Hookと同じ形式

---

## 7. データ収集に活用できるイベント

| 収集データ | 対応イベント | 取得方法 |
|-----------|------------|---------|
| **セッション開始/終了** | `SessionStart`, `SessionEnd` | `session_id`, `source`, `reason` |
| **ユーザープロンプト** | `UserPromptSubmit` | `prompt` |
| **ツール使用** | `PreToolUse`, `PostToolUse` | `tool_name`, `tool_input` |
| **Bash実行** | `PostToolUse` (matcher: `Bash`) | `tool_input.command` |
| **ファイル編集** | `PostToolUse` (matcher: `Edit\|Write`) | `tool_input.file_path` |
| **サブエージェント** | `SubagentStart`, `SubagentStop` | `agent_type`, `agent_id` |
| **MCP呼び出し** | `PostToolUse` (matcher: `mcp__.*`) | `tool_name` |
| **Skill実行** | `UserPromptSubmit` | `/`で始まるプロンプト |
| **通知** | `Notification` | `notification_type`, `message` |
| **タスク完了** | `TaskCompleted` | `task_id`, `task_subject` |
| **チームメイトアイドル** | `TeammateIdle` | `teammate_name`, `team_name` |
| **コンパクション** | `PreCompact` | `trigger` |

---

## 8. 設定フォーマット例

```json
{
  "hooks": {
    "イベント名": [
      {
        "matcher": "正規表現パターン（オプション）",
        "hooks": [
          {
            "type": "command",
            "command": "シェルコマンド",
            "timeout": 600,
            "async": false,
            "statusMessage": "スピナーメッセージ"
          }
        ]
      }
    ]
  }
}
```

---

## 9. 注意事項・制約

1. **hookはユーザーのシステム権限で実行される** - 任意のファイルアクセスが可能
2. **設定ファイルの直接編集は即座に反映されない** - `/hooks`メニューでの確認またはセッション再起動が必要
3. **PostToolUseはアクションのアンドゥ不可** - ツール実行後なので取り消せない
4. **PermissionRequestは非インタラクティブモード(`-p`)では発火しない** - PreToolUseを使うこと
5. **Stopフックは無限ループに注意** - `stop_hook_active`をチェックすること
6. **JSON出力はexit 0時のみ処理** - exit 2時はstderrのみ
7. **シェルプロファイルのecho文はJSON解析を妨害する** - `[[ $- == *i* ]]`で制御
8. **全マッチングフックは並列実行** - 同一ハンドラは自動重複排除
