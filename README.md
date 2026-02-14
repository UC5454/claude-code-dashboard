# Claude Code Dashboard

チーム全体の Claude Code 利用状況をリアルタイムで可視化するダッシュボード。

**URL**: https://claude-code-dashboard-chi.vercel.app

---

## 使い始める（3分で完了）

### 1. jq をインストール（未インストールの場合）

```bash
brew install jq
```

### 2. リポジトリをクローン

```bash
git clone https://github.com/UC5454/claude-code-dashboard.git
```

### 3. インストーラーを実行

```bash
bash claude-code-dashboard/scripts/cc-install.sh
```

### 4. ダッシュボードにログイン

https://claude-code-dashboard-chi.vercel.app に `@digital-gorilla.co.jp` のGoogleアカウントでログイン。

以上。あとは Claude Code を普通に使うだけで、利用データが自動で記録・同期されます。

---

## 何が見れるか

| 機能 | 内容 |
|------|------|
| アクティビティ概要 | 日別・時間帯別の利用状況グラフ |
| ツール分布 | Bash / ファイル編集 / 検索 / MCP 等のカテゴリ別使用割合 |
| プロジェクト別 | どのプロジェクトでどれだけ使っているか |
| セッション一覧 | 各セッションの開始/終了・ツール使用数 |
| ユーザー詳細 | メンバーごとの詳細ページ |
| AI Insights | Gemini による利用傾向の分析・提案 |

---

## 何が記録されるか

- セッションの開始/終了時刻
- プロンプトの文字数（**本文は記録しません**）
- 使用したツールの名前とカテゴリ
- プロジェクト名（作業ディレクトリ名）

**コードの内容、プロンプトの本文、ファイルの中身は一切記録されません。**

---

## 仕組み

```
Claude Code を使う
    │
    ▼
cc-logger.sh が自動実行（Claude Code Hooks）
    │
    ├── ローカル保存: ~/.claude-code-dashboard/logs/YYYY-MM-DD.jsonl
    │
    └── Supabase に自動同期（30秒間隔）
                │
                ▼
          ダッシュボードに表示
```

---

## 困ったら

| 症状 | 対処 |
|------|------|
| `jq` がないと言われる | `brew install jq` |
| Git メールが未設定 | `git config --global user.email "name@digital-gorilla.co.jp"` |
| データが表示されない | Claude Code で何か操作 → 30秒待ち → リロード |
| Hooks が動いてるか確認 | `cat ~/.claude/settings.json \| jq '.hooks'` |

詳細なトラブルシューティングは [docs/setup-guide.md](docs/setup-guide.md) を参照。

---

## アンインストール

```bash
rm -rf ~/.claude-code-dashboard
```

`~/.claude/settings.json` から `cc-logger.sh` 関連の Hooks エントリを手動で削除してください。

---

## 技術スタック

Next.js 16 / React 19 / TypeScript / Tailwind CSS v4 / Recharts / NextAuth.js / Supabase Storage / Gemini API / Vercel
