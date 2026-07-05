# プラグイン仕様

Claude Code の `.claude/` ディレクトリ構成に準拠した仕様です。

## プラグインのディレクトリ構成

```
plugins/<plugin-name>/
├── .claude-plugin/
│   └── plugin.json              # プラグインマニフェスト（メタデータ）
├── README.md                    # 推奨: 使い方の説明
├── agents/
│   └── <agent-name>.md          # カスタムサブエージェント定義
├── skills/
│   └── <skill-name>/
│       └── SKILL.md             # スラッシュコマンド定義
│       └── [supporting files]   # スキルが使う補助ファイル
├── hooks/
│   └── pre-tool-use.sh          # フック用シェルスクリプト
│   └── post-tool-use.sh
│   └── session-start.sh
├── settings.json                # フック配線・権限設定
└── .mcp.json                    # MCPサーバー設定
```

> **注**: `plugin.json` は必ず `.claude-plugin/` ディレクトリ内に置きます（[公式リファレンス](https://code.claude.com/docs/en/plugins-reference)）。
> プラグインルート直下に置いた `plugin.json` は読み込まれません。
> マニフェスト自体は省略可能で、省略時はディレクトリ名がプラグイン名になります。

インストール先の `.claude/` への配置例:

```
.claude/
├── agents/          ← agents/ の .md をここへコピー
├── skills/          ← skills/ のディレクトリをここへコピー
├── hooks/           ← hooks/ のスクリプトをここへコピー
├── settings.json    ← settings.json をマージ
└── .mcp.json (プロジェクトルート) ← .mcp.json をマージ
```

---

## agents/ — カスタムサブエージェント

**ファイル形式**: YAML frontmatter + Markdown

```markdown
---
name: my-agent
description: Use this agent when you need to [use case].
model: claude-sonnet-4-6
tools:
  - Read
  - Bash
  - Glob
---

# My Agent

エージェントへのシステムプロンプトをここに書く。
```

**frontmatter フィールド**

| フィールド | 必須 | 説明 |
|---|---|---|
| `name` | 必須 | エージェントID（ケバブケース）|
| `description` | 必須 | いつこのエージェントを使うかの説明。Claude がサブエージェント選択に使う |
| `model` | 任意 | 省略するとセッションのモデルを継承 |
| `tools` | 任意 | 省略するとすべてのツールが使用可能 |

**命名規則**: ファイル名がそのままエージェント名になる（`my-agent.md` → `name: my-agent`）

---

## skills/ — スラッシュコマンド

**ファイル形式**: `skills/<skill-name>/SKILL.md`

```markdown
---
name: my-skill
description: 何をするスキルか
invocation: user
---

スキルの本文（指示・使い方）
$ARGUMENTS でユーザー引数を参照できる
```

**frontmatter フィールド**

| フィールド | 必須 | 説明 |
|---|---|---|
| `name` | 必須 | スラッシュコマンド名 → `/my-skill` |
| `description` | 推奨 | スキルの説明 |
| `invocation` | 推奨 | `user`（手動のみ）/ `auto`（Claude が自動起動可） |
| `disable-model-invocation` | 任意 | `true` にすると副作用のあるワークフローでの誤起動を防止 |

---

## hooks/ — フックスクリプト

フック本体はシェルスクリプト。**配線は `settings.json` の `hooks` キーで行う**。

**入力**: JSON が stdin に渡ってくる

```json
{
  "tool_name": "Bash",
  "tool_input": { "command": "ls -la" },
  "tool_response": "..."
}
```

**終了コード**

| コード | 意味 |
|---|---|
| `0` | 許可・成功 |
| `2` | ブロック（stderr のメッセージを Claude に表示） |
| その他 | エラー |

**イベント一覧**

| イベント | タイミング |
|---|---|
| `PreToolUse` | ツール実行前 |
| `PostToolUse` | ツール実行後 |
| `SessionStart` | セッション開始時 |
| `SessionEnd` | セッション終了時 |
| `Stop` | ターン完了時 |
| `UserPromptSubmit` | プロンプト送信前 |
| `PermissionRequest` | 権限ダイアログ発生時 |
| `Notification` | 通知イベント |

---

## settings.json — フック配線・権限

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "bash",
            "args": [".claude/hooks/pre-tool-use.sh"]
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": ["Bash(git *)"],
    "deny": []
  }
}
```

`matcher` は ツール名・正規表現・`*`（全ツール）・`mcp__server__tool` が使える。

---

## mcp.json — MCPサーバー設定

プロジェクトルートの `.mcp.json` に配置（バージョン管理で共有可能）。

```json
{
  "mcpServers": {
    "my-server": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@myorg/mcp-server"],
      "env": { "API_KEY": "${MY_API_KEY}" }
    }
  }
}
```

**サーバータイプ**

| タイプ | 説明 |
|---|---|
| `stdio` | ローカルプロセス（サブプロセス起動） |
| `http` | リモートHTTPエンドポイント |
| `ws` | WebSocket（双方向通信） |

---

## plugin.json スキーマ

配置場所: `<plugin-name>/.claude-plugin/plugin.json`

```json
{
  "$schema": "https://json.schemastore.org/claude-code-plugin-manifest.json",
  "name": "string — ケバブケース（必須）",
  "version": "string — semver (例: 1.0.0)",
  "description": "string",
  "author": {
    "name": "string",
    "url": "string"
  },
  "homepage": "string — URL",
  "license": "string (例: MIT)",
  "keywords": ["string"]
}
```
