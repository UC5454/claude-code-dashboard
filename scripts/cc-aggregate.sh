#!/bin/bash
# Claude Code Dashboard 集計スクリプト
# - 90日超ログ削除
# - JSONLを集計して aggregated.json を生成

set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "cc-aggregate.sh: jq is required. Install jq first." >&2
  exit 1
fi

BASE_DIR="$HOME/.claude-code-dashboard"
LOG_DIR="${LOG_DIR:-$BASE_DIR/logs}"
DATA_DIR="$BASE_DIR/data"
DAILY_DIR="$DATA_DIR/daily"
RETENTION_DAYS="${LOG_RETENTION_DAYS:-90}"

mkdir -p "$LOG_DIR" "$DATA_DIR" "$DAILY_DIR"

# 90日超ログを削除
find "$LOG_DIR" -type f -name "*.jsonl" -mtime "+$RETENTION_DAYS" -delete 2>/dev/null || true

TMP_DAILY=$(mktemp)
TMP_SUMMARY=$(mktemp)
trap 'rm -f "$TMP_DAILY" "$TMP_SUMMARY"' EXIT

echo '[]' > "$TMP_DAILY"

total_sessions=0
total_prompts=0
total_tools=0
total_failures=0
total_subagents=0
total_tasks=0
total_compactions=0

for file in "$LOG_DIR"/*.jsonl; do
  [[ -e "$file" ]] || continue
  date_key=$(basename "$file" .jsonl)

  sessions=$(jq -cs '[.[] | select(.event=="session_start")] | length' "$file" 2>/dev/null || echo 0)
  prompts=$(jq -cs '[.[] | select(.event=="user_prompt")] | length' "$file" 2>/dev/null || echo 0)
  tools=$(jq -cs '[.[] | select(.event=="tool_use")] | length' "$file" 2>/dev/null || echo 0)
  failures=$(jq -cs '[.[] | select(.event=="tool_failure")] | length' "$file" 2>/dev/null || echo 0)

  total_sessions=$((total_sessions + sessions))
  total_prompts=$((total_prompts + prompts))
  total_tools=$((total_tools + tools))
  total_failures=$((total_failures + failures))
  total_subagents=$((total_subagents + $(jq -cs '[.[] | select(.event=="subagent_start")] | length' "$file" 2>/dev/null || echo 0)))
  total_tasks=$((total_tasks + $(jq -cs '[.[] | select(.event=="task_completed")] | length' "$file" 2>/dev/null || echo 0)))
  total_compactions=$((total_compactions + $(jq -cs '[.[] | select(.event=="compaction")] | length' "$file" 2>/dev/null || echo 0)))

  jq --arg date "$date_key" --argjson sessions "$sessions" --argjson prompts "$prompts" --argjson tools "$tools" --argjson failures "$failures" \
    '. + [{date:$date,sessions:$sessions,prompts:$prompts,tools:$tools,failures:$failures}]' \
    "$TMP_DAILY" > "$TMP_SUMMARY" && mv "$TMP_SUMMARY" "$TMP_DAILY"
done

from_date=$(jq -r 'if length==0 then "" else (sort_by(.date) | .[0].date) end' "$TMP_DAILY")
to_date=$(jq -r 'if length==0 then "" else (sort_by(.date) | .[-1].date) end' "$TMP_DAILY")

uid=""
git_name=""
git_email=""
if [[ -f "$BASE_DIR/user-profile.json" ]]; then
  uid=$(jq -r '.uid // ""' "$BASE_DIR/user-profile.json")
  git_name=$(jq -r '.git_name // ""' "$BASE_DIR/user-profile.json")
  git_email=$(jq -r '.git_email // ""' "$BASE_DIR/user-profile.json")
fi

jq -n \
  --arg generated_at "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" \
  --arg from "$from_date" \
  --arg to "$to_date" \
  --arg uid "$uid" \
  --arg name "$git_name" \
  --arg email "$git_email" \
  --argjson total_sessions "$total_sessions" \
  --argjson total_prompts "$total_prompts" \
  --argjson total_tool_uses "$total_tools" \
  --argjson total_failures "$total_failures" \
  --argjson total_subagents "$total_subagents" \
  --argjson total_tasks_completed "$total_tasks" \
  --argjson total_compactions "$total_compactions" \
  --slurpfile daily "$TMP_DAILY" \
  '{
    generated_at:$generated_at,
    period:{from:$from,to:$to},
    user:{uid:$uid,name:$name,email:$email},
    summary:{
      total_sessions:$total_sessions,
      total_prompts:$total_prompts,
      total_tool_uses:$total_tool_uses,
      total_failures:$total_failures,
      total_subagents:$total_subagents,
      total_tasks_completed:$total_tasks_completed,
      total_compactions:$total_compactions
    },
    daily:$daily[0],
    trends:{
      sessions_7d: (($daily[0] | sort_by(.date) | reverse | .[:7] | reverse | map(.sessions)) // []),
      tools_7d: (($daily[0] | sort_by(.date) | reverse | .[:7] | reverse | map(.tools)) // [])
    }
  }' > "$DATA_DIR/aggregated.json"

echo "Aggregated data updated: $DATA_DIR/aggregated.json"
