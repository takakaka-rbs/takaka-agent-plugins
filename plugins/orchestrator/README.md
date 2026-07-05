# orchestrator

takaka-agent-plugins エコシステムの中枢プラグインです。すべてのユーザーリクエストはここを経由し、適切な専門プラグインエージェントへルーティングされます。

## 概要

このプラグインは 2 つのエージェントと 1 つのスキルで構成されます。

| コンポーネント | 名前 | 役割 |
|---|---|---|
| Agent | `orchestrator-master` | 全リクエストのエントリーポイント。ルーティング・委譲・結果統合 |
| Agent | `orchestrator-planner` | 複雑タスクの分解。実行プランをJSON形式で出力 |
| Skill | `/route` | 特定プラグインへの直接ルーティング（自動ルーティングを迂回） |

## アーキテクチャ

```
User Request
      │
      ▼
orchestrator-master          ← すべてのリクエストのエントリーポイント
      │
      ├─ シンプルなタスク ──────────────────────────► plugin-A / agent-X
      │
      └─ 複雑なタスク ──► orchestrator-planner
                               │  (実行プランJSON を返す)
                               ▼
                     step 1 → plugin-A / agent-X
                     step 2 → plugin-B / agent-Y  (step 1 完了後)
                     step 3 → plugin-C / agent-Z  (step 2 完了後)
                               │
                               ▼
                         結果を統合して返答
```

## 使い方

### 自動ルーティング（推奨）

`orchestrator-master` をデフォルトエージェントとして起動し、通常通りリクエストを送るだけです。

### 直接ルーティング

特定のエージェントを指定したいときは `/route` スキルを使います。

```
/route requirements-specificater requirements-researcher タスクの説明
```

## 新しいプラグインを追加したとき

`agents/master.md` の **Plugin Registry** テーブルに新しいプラグインとエージェントを追記してください。

```markdown
| `new-plugin` | `new-agent` | このエージェントが担当するタスクの説明 |
```

## インストール

```bash
PROJECT=/path/to/your/project

cp -r agents/*  $PROJECT/.claude/agents/
cp -r skills/*  $PROJECT/.claude/skills/
```

## 更新履歴

### 0.1.3

- プラグインレジストリに `screen-specificater`（画面仕様書の作成・更新）を追加

### 0.1.2

- プラグインレジストリに `openapi-specificater`（OpenAPI仕様書の作成・更新）を追加

### 0.1.1

- プラグインレジストリを実態に合わせて更新: 実在しない `example-plugin` を削除し、`requirements-specificater`・`github-issue-creator`・`git-commit-pusher` をスキルエントリーポイントとして登録
- スキルがエントリーポイントのプラグインへの委譲ルール（内部エージェントを直接呼ばない）を追加
- `/route` とREADMEの例を実在するプラグインに差し替え

### 0.1.0

- 初期リリース: `orchestrator-master`, `orchestrator-planner`, `/route`
