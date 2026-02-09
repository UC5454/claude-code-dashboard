#!/bin/bash
# Claude Code Dashboard インストーラー
# 1. ~/.claude-code-dashboard/ ディレクトリ構造作成
# 2. スクリプトコピー + 実行権限付与
# 3. ~/.claude/settings.json にhooks設定をマージ（既存hooks保持）
# 4. user-profile.json 生成
# 5. jqインストール確認

set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "cc-install.sh: jq is required. Install jq first." >&2
  exit 1
fi

BASE_DIR="$HOME/.claude-code-dashboard"
SCRIPTS_DIR="$BASE_DIR/scripts"
LOGS_DIR="$BASE_DIR/logs"
DATA_DIR="$BASE_DIR/data"
CLAUDE_DIR="$HOME/.claude"
SETTINGS_FILE="$CLAUDE_DIR/settings.json"

mkdir -p "$SCRIPTS_DIR" "$LOGS_DIR" "$DATA_DIR" "$CLAUDE_DIR"

SCRIPT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp "$SCRIPT_ROOT/cc-logger.sh" "$SCRIPTS_DIR/cc-logger.sh"
cp "$SCRIPT_ROOT/cc-aggregate.sh" "$SCRIPTS_DIR/cc-aggregate.sh"
chmod +x "$SCRIPTS_DIR/cc-logger.sh" "$SCRIPTS_DIR/cc-aggregate.sh"

if [[ ! -f "$SETTINGS_FILE" ]]; then
  echo '{}' > "$SETTINGS_FILE"
fi

HOOKS_JSON=$(cat <<'JSON'
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
JSON
)

LOGGER_CMD="~/.claude-code-dashboard/scripts/cc-logger.sh"
TMP_FILE=$(mktemp)
jq --argjson new_hooks "$HOOKS_JSON" --arg logger_cmd "$LOGGER_CMD" '
  .hooks //= {} |
  reduce ($new_hooks.hooks | to_entries[]) as $e (.;
    .hooks[$e.key] = (
      [(.hooks[$e.key] // [])[] | select(.hooks[0].command != $logger_cmd)] +
      $e.value
    )
  )
' "$SETTINGS_FILE" > "$TMP_FILE"
mv "$TMP_FILE" "$SETTINGS_FILE"

GIT_NAME=$(git config user.name 2>/dev/null || echo "unknown")
GIT_EMAIL=$(git config user.email 2>/dev/null || echo "unknown")
HOST_NAME=$(hostname 2>/dev/null || echo "unknown")
OS_NAME=$(uname -s | tr '[:upper:]' '[:lower:]')
UID_HASH=$(echo -n "$GIT_EMAIL" | shasum -a 256 | cut -c1-8)
MID_HASH=$(echo -n "$HOST_NAME" | shasum -a 256 | cut -c1-8)
REGISTERED_AT=$(date -u +%Y-%m-%dT%H:%M:%S.000Z)

jq -n \
  --arg uid "$UID_HASH" \
  --arg mid "$MID_HASH" \
  --arg git_name "$GIT_NAME" \
  --arg git_email "$GIT_EMAIL" \
  --arg hostname "$HOST_NAME" \
  --arg os "$OS_NAME" \
  --arg registered_at "$REGISTERED_AT" \
  '{uid:$uid,mid:$mid,git_name:$git_name,git_email:$git_email,hostname:$hostname,os:$os,registered_at:$registered_at}' \
  > "$BASE_DIR/user-profile.json"

echo "Install completed: $BASE_DIR"
