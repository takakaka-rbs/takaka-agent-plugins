# takaka-agent-plugins

Claude Code (Agent SDK) 向けプラグインの管理リポジトリです。

## 概要

各プラグインは `plugins/<name>/` に格納され、`claude plugin` コマンドでインストールして使います。

## ディレクトリ構成

```
takaka-agent-plugins/
├── .claude-plugin/
│   └── marketplace.json               # マーケットプレイスレジストリ
├── plugins/
│   ├── orchestrator/                  # コアプラグイン（ルーティング・タスク分解）
│   ├── requirements-specificater/     # 要件定義書の作成・更新
│   ├── openapi-specificater/          # OpenAPI仕様書（OpenSpec.yml）の作成・更新
│   ├── github-issue-creator/          # GitHub Issueの対話形式での作成
│   └── git-commit-pusher/             # 変更の分割コミット・プッシュ
├── template/                          # 新規プラグイン作成用ひな型
├── docs/
│   └── plugin-spec.md                 # プラグイン仕様
└── CONTRIBUTING.md
```

各プラグインは共通して以下の構成を持ちます（`docs/`・`agents/`・`.mcp.json` はプラグインによって有無が異なります）。

```
plugins/<name>/
├── .claude-plugin/
│   └── plugin.json      # メタデータ（マニフェスト）
├── README.md
├── agents/              # サブエージェント定義
├── skills/              # スラッシュコマンド（エントリーポイント）
└── docs/                # テンプレート・ガイド等の同梱ドキュメント
```

## プラグイン一覧

| プラグイン名                            | バージョン | エントリーポイント | 説明                                                                                        |
| --------------------------------------- | ---------- | ------------------ | ------------------------------------------------------------------------------------------- |
| [orchestrator](./plugins/orchestrator/) | 0.1.2      | `orchestrator-master` エージェント / `/route` | **コアプラグイン** — 全リクエストのエントリーポイント。適切なプラグインへルーティング・調整 |
| [requirements-specificater](./plugins/requirements-specificater/) | 0.1.0 | `/requirements-specificater` | 対話・コードベース調査・Web調査を通じて要件定義書を作成・更新する |
| [openapi-specificater](./plugins/openapi-specificater/) | 0.1.0 | `/openapi-specificater` | 要件定義書（REQ-F-XXX）を参照し、APIの機能仕様書として通用するレベルのOpenAPI仕様書（OpenSpec.yml）を作成・更新する |
| [github-issue-creator](./plugins/github-issue-creator/) | 0.1.0 | `/github-issue-creator` | ユーザーの指示からGitHub Issueを対話形式で作成する（GitHub MCP優先・gh CLI補完、複数一括対応） |
| [git-commit-pusher](./plugins/git-commit-pusher/) | 0.1.0 | `/git-commit-pusher` | 変更を内容ごとに分割し、commitlint準拠のConventional Commitメッセージ（英語）でコミット・プッシュする |

## ドキュメント作成プラグインの連携

要件定義から仕様書作成までを、要件ID（`REQ-F-XXX`）をキーに連携する設計です。参照は常に「仕様書 → 要件定義書」の一方向です。

```
要件定義書（requirements-specificater）  … サービスが満たすべき要件を抽象的に定義する
  ↑ REQ-F-XXX を参照
OpenSpec.yml（openapi-specificater）     … 要件を満たす具体的なAPIを定義する
画面仕様書（別プラグイン・予定）          … 要件を満たす具体的な画面を定義する
```

---

## インストール

### CLI からインストール

#### 1. Claude CLI をインストール

**Windows:**

```powershell
irm https://claude.ai/install.ps1 | iex
```

**macOS / Linux:**

```bash
curl -fsSL https://claude.ai/install.sh | sh
```

インストール後、表示されたパスを PATH に追加してターミナルを再起動します。

#### 2. マーケットプレイスを登録

```bash
# GitHub リポジトリから（HTTPS）
claude plugin marketplace add https://github.com/<your-org>/takaka-agent-plugins

# ローカルパスから（未 push の場合）
claude plugin marketplace add /path/to/takaka-agent-plugins
```

#### 3. プラグインをインストール

```bash
claude plugin install orchestrator@takaka-agent-plugins
```

---

### チャットからインストール

Claude Code のチャット欄に直接入力します（CLI のインストールは不要）。

#### 1. マーケットプレイスを登録

```
/plugin marketplace add https://github.com/<your-org>/takaka-agent-plugins
```

#### 2. プラグインをインストール

```
/plugin install orchestrator@takaka-agent-plugins
```

---

## 使い方

インストール後、`orchestrator-master` エージェントが自動的に利用可能になります。

すべてのリクエストはオーケストレーターを経由して適切なプラグインへ振り分けられます。特定のプラグインを直接使いたい場合は、各プラグインのスラッシュコマンドを実行します。

```
/requirements-specificater 在庫管理システムのリプレイス。既存システムはExcel運用。
/openapi-specificater docs/requirements/my-service.md
/github-issue-creator
/git-commit-pusher
```

自動ルーティングを迂回して特定のエージェントに直接委譲する場合は `/route` を使います。

```
/route requirements-specificater requirements-researcher 既存システムの現行機能を調査してほしい
```

---

## 新しいプラグインを追加する

[CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。  
`template/` ディレクトリをコピーして開発を始められます。

## ライセンス

MIT
