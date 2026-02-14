# Claude Code Dashboard セットアップガイド

Claude Code の利用状況を可視化するダッシュボードです。
セットアップは **1コマンド** で完了します。

**ダッシュボードURL**: https://claude-code-dashboard-chi.vercel.app

---

## 前提条件

- macOS（Apple Silicon / Intel 対応）
- Claude Code がインストール済み
- `jq` がインストール済み（未インストールの場合: `brew install jq`）
- Git のユーザー設定済み（`git config user.email` が設定されていること）

---

## セットアップ手順

### Step 1: リポジトリをクローン

```bash
git clone https://github.com/UC5454/claude-code-dashboard.git
```

### Step 2: インストーラーを実行

```bash
bash claude-code-dashboard/scripts/cc-install.sh
```

これだけで完了。以下が自動的に行われます:

| 処理 | 内容 |
|------|------|
| ディレクトリ作成 | `~/.claude-code-dashboard/` にログ・データ・スクリプト用フォルダを作成 |
| スクリプトコピー | `cc-logger.sh`, `cc-aggregate.sh` を `~/.claude-code-dashboard/scripts/` に配置 |
| Hooks設定 | `~/.claude/settings.json` にClaude Code Hooksを自動マージ（既存設定は保持） |
| プロファイル生成 | GitメールアドレスからユーザーIDを生成し `user-profile.json` に保存 |

### Step 3: ダッシュボードにログイン

1. https://claude-code-dashboard-chi.vercel.app にアクセス
2. `@digital-gorilla.co.jp` のGoogleアカウントでログイン
3. Claude Code を使い始めると、自動的にデータが収集・表示される

---

## 仕組み

```
Claude Code 操作
    │
    ▼
cc-logger.sh（Hooks経由で自動実行）
    │
    ├── ローカル保存: ~/.claude-code-dashboard/logs/YYYY-MM-DD.jsonl
    │
    └── Supabase同期: 30秒デバウンスでクラウドに自動アップロード
                          │
                          ▼
                    ダッシュボード表示
```

- Claude Code のセッション開始/終了、プロンプト送信、ツール使用などのイベントを自動記録
- ローカルのJSONLファイルに書き込み後、Supabase Storageにバックグラウンド同期
- ダッシュボードはSupabaseからデータを取得して表示

---

## 収集されるデータ

| イベント | 記録内容 |
|----------|----------|
| セッション開始/終了 | タイムスタンプ、プロジェクト名、モデル名 |
| プロンプト送信 | 文字数（プロンプト本文は記録しない） |
| ツール使用 | ツール名、カテゴリ（bash/file_edit/search等） |
| ツールエラー | ツール名、エラーメッセージ先頭100文字 |
| サブエージェント | エージェントタイプ、開始/停止 |

**プロンプトの本文やコード内容は一切記録されません。**

---

## ダッシュボードで見れること

- 日別/時間帯別のアクティビティ
- ツール使用の分布（カテゴリ別）
- プロジェクト別の利用状況
- セッション一覧
- ユーザー別の詳細ページ（`/users/[uid]`）

---

## トラブルシューティング

### Q: `jq` がないと言われた

```bash
brew install jq
```

### Q: Gitメールが未設定

```bash
git config --global user.email "your-name@digital-gorilla.co.jp"
git config --global user.name "Your Name"
```

設定後に `cc-install.sh` を再実行してください。

### Q: ダッシュボードにデータが表示されない

1. `~/.claude-code-dashboard/logs/` にJSONLファイルがあるか確認
2. Claude Code で何か操作してみる（プロンプト送信やツール使用）
3. 30秒待ってからダッシュボードをリロード

```bash
# ログファイルの確認
ls -la ~/.claude-code-dashboard/logs/

# 最新ログの中身を確認
tail -5 ~/.claude-code-dashboard/logs/$(date -u +%Y-%m-%d).jsonl
```

### Q: Hooksが正しく設定されているか確認したい

```bash
cat ~/.claude/settings.json | jq '.hooks'
```

`SessionStart`, `SessionEnd`, `UserPromptSubmit`, `PostToolUse` 等のキーに `cc-logger.sh` が含まれていればOK。

### Q: 手動でデータを集計したい

```bash
bash ~/.claude-code-dashboard/scripts/cc-aggregate.sh
```

集計結果は `~/.claude-code-dashboard/data/aggregated.json` に出力されます。

---

## アンインストール

```bash
# 1. Hooksを手動で削除（settings.jsonからcc-logger.sh関連のエントリを削除）
# 2. データディレクトリを削除
rm -rf ~/.claude-code-dashboard
```
