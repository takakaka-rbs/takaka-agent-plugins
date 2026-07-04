# コントリビューションガイド

## 新しいプラグインを追加する

### 1. ブランチを作成

```bash
git checkout -b add/your-plugin-name
```

### 2. テンプレートをコピー

```bash
cp -r template plugins/your-plugin-name
```

### 3. 各ファイルを編集

| ファイル | 必須 | 編集内容 |
|---|---|---|
| `.claude-plugin/plugin.json` | 必須 | `name`, `version`, `description`, `author`, `homepage`, `keywords` を更新 |
| `README.md` | 推奨 | プラグインの使い方を記述 |
| `agents/*.md` | 任意 | エージェントが不要なら削除 |
| `skills/*/SKILL.md` | 任意 | スキルが不要なら削除 |
| `hooks/*.sh` | 任意 | フックが不要なら削除 |
| `settings.json` | 任意 | 使うフックのみ残す、不要なら削除 |
| `.mcp.json` | 任意 | MCPサーバーが不要なら削除 or `{}` に |

### 4. agents/ の .md frontmatter を更新

```yaml
---
name: your-agent-name        # ← ファイル名と合わせる
description: Use this agent when you need to [具体的なユースケース].
model: claude-sonnet-4-6
tools:
  - Read
  # 必要なツールのみ列挙
---
```

### 5. README.md のプラグイン一覧に追記

ルートの `README.md` にある「プラグイン一覧」テーブルへ追記してください。

### 6. プルリクエストを作成

PR タイトル: `add: <plugin-name>`

---

## 既存プラグインを更新する

1. `plugin.json` の `version` を semver に従って上げる
2. `README.md` の「更新履歴」に変更内容を追記
3. PR タイトル: `update: <plugin-name> v<version>`

---

## プラグインを削除する

1. `plugins/<plugin-name>/` ディレクトリを削除
2. ルート `README.md` のプラグイン一覧から削除
3. PR タイトル: `remove: <plugin-name>`

---

## PR 作成前チェックリスト

- [ ] `.claude-plugin/plugin.json` の全必須フィールドが埋まっている（ルート直下ではなく `.claude-plugin/` 内に置く）
- [ ] `agents/*.md` がある場合、`name` と `description` frontmatter が記入されている
- [ ] `skills/*/SKILL.md` がある場合、`name` frontmatter が記入されている
- [ ] `hooks/*.sh` に実行権限がある（`chmod +x`）
- [ ] `settings.json` で使うフックスクリプトのパスが `.claude/hooks/...` になっている
- [ ] `README.md` に使い方が記載されている
- [ ] ルートの `README.md` プラグイン一覧が更新されている
- [ ] プラグイン名がケバブケースになっている
