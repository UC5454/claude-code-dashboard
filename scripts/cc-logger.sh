#!/bin/bash
# cc-logger.sh - Claude Code利用データロガー

set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "cc-logger.sh: jq is required but not installed" >&2
  exit 0
fi

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
      WebFetch)
        DETAIL=$(echo "$INPUT" | jq -r '.tool_input.url // empty' | sed -E 's#https?://([^/]+).*#\1#' | cut -d: -f1)
        ;;
      WebSearch)
        DETAIL=$(echo "$INPUT" | jq -r '.tool_input.query // empty' | awk '{print $1}')
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

# Supabase Storageにバックグラウンド同期（30秒デバウンス）
SYNC_LOCK="/tmp/cc-logger-sync.lock"
SYNC_AGE=999
if [ -f "$SYNC_LOCK" ]; then
  SYNC_AGE=$(( $(date +%s) - $(stat -f %m "$SYNC_LOCK" 2>/dev/null || echo 0) ))
fi
if [ "$SYNC_AGE" -gt 30 ]; then
  touch "$SYNC_LOCK"
  (
    _SB_URL="https://vvyyyabwvoncugrvawdo.supabase.co"
    _SB_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2eXl5YWJ3dm9uY3VncnZhd2RvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDU2NjM2MCwiZXhwIjoyMDg2MTQyMzYwfQ.I_Qu96jIk4xsBtfNVfgihtleNiT_K9pyjh72TkSi3LY"
    # Upload to {uid}/{date}.jsonl path
    curl -s -o /dev/null \
      -X POST "${_SB_URL}/storage/v1/object/dashboard-logs/${UID_HASH}/${DATE}.jsonl" \
      -H "Authorization: Bearer ${_SB_KEY}" \
      -H "Content-Type: application/octet-stream" \
      -H "x-upsert: true" \
      --data-binary "@${LOG_FILE}" 2>/dev/null || true
    # Upload profile.json if exists
    _PROFILE="$HOME/.claude-code-dashboard/user-profile.json"
    if [ -f "$_PROFILE" ]; then
      curl -s -o /dev/null \
        -X POST "${_SB_URL}/storage/v1/object/dashboard-logs/${UID_HASH}/profile.json" \
        -H "Authorization: Bearer ${_SB_KEY}" \
        -H "Content-Type: application/json" \
        -H "x-upsert: true" \
        --data-binary "@${_PROFILE}" 2>/dev/null || true
    fi
  ) &
fi

exit 0
