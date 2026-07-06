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
│   ├── screen-specificater/           # 画面仕様書の作成・更新
│   ├── github-issue-creator/          # GitHub Issueの対話形式での作成
│   ├── git-commit-pusher/             # 変更の分割コミット・プッシュ
│   ├── code-implementer/              # 仕様書からのアプリコード自動実装（実装〜テスト〜修正ループ）
│   └── plugin-improver/               # 定義と実作業のズレの収集・定義への反映（自己改善）
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
| [orchestrator](./plugins/orchestrator/) | 0.3.1      | SessionStart フック / `/route` | **コアプラグイン** — ルーティング表と運用規則（初回一括確認・以降は自動完遂）をコンテキスト注入し、メイン会話をオーケストレーターとして適切なプラグインへルーティング・調整させる |
| [requirements-specificater](./plugins/requirements-specificater/) | 0.2.0 | `/requirements-specificater` | コードベース調査・Web調査を通じて要件定義書を作成・更新する（質問は実行前確認の1回のみ） |
| [openapi-specificater](./plugins/openapi-specificater/) | 0.2.0 | `/openapi-specificater` | 要件定義書（REQ-F-XXX）を参照し、APIの機能仕様書として通用するレベルのOpenAPI仕様書（OpenSpec.yml）を作成・更新する（質問は実行前確認の1回のみ） |
| [screen-specificater](./plugins/screen-specificater/) | 0.2.0 | `/screen-specificater` | 要件定義書（REQ-F-XXX）とOpenSpec.yml（API-XXX）を参照し、コンポーネント配置・イベントハンドラー・表示制御まで記述した画面仕様書（Markdown）を作成・更新する（質問は実行前確認の1回のみ） |
| [github-issue-creator](./plugins/github-issue-creator/) | 0.2.0 | `/github-issue-creator` | ユーザーの指示からGitHub Issueを作成する（GitHub MCP優先・gh CLI補完、複数一括対応。質問は実行前確認の1回のみ） |
| [git-commit-pusher](./plugins/git-commit-pusher/) | 0.2.0 | `/git-commit-pusher` | 変更を内容ごとに分割し、commitlint準拠のConventional Commitメッセージ（英語）でコミット・プッシュする（質問は実行前確認の1回のみ） |
| [code-implementer](./plugins/code-implementer/) | 0.1.0 | `/code-implementer` | API仕様書（OpenSpec.yml）・画面仕様書を入力に、対象リポジトリのアプリコードを「調査→計画→実装→テスト→修正ループ」で自動実装する（Spring / Vue3 / PostgreSQL。質問は実行前確認の1回のみ） |
| [plugin-improver](./plugins/plugin-improver/) | 0.1.1 | Stopフック / `/self-improve` | セッション中に検出した定義と実作業のズレを自動記録し、承認のうえでSKILL/エージェント定義本体へ反映する |

## ドキュメント作成プラグインの連携

要件定義から仕様書作成までを、要件ID（`REQ-F-XXX`）とAPI ID（`API-XXX`）をキーに連携する設計です。参照は常に「仕様書 → 要件定義書」「画面仕様書 → OpenSpec.yml」の一方向です。

```
要件定義書（requirements-specificater）  … サービスが満たすべき要件を抽象的に定義する
  ↑ REQ-F-XXX を参照
OpenSpec.yml（openapi-specificater）     … 要件を満たす具体的なAPIを定義する
  ↑ API-XXX を参照（REQ-F-XXX は要件定義書を参照）
画面仕様書（screen-specificater）        … 要件を満たす具体的な画面を定義する
  ↑ API-XXX / SCR-XXX を参照
実装コード + テスト（code-implementer）  … 仕様書を根拠にアプリコードを自動実装・テストする
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

インストール後、新しいセッションを開始すると SessionStart フックがルーティング表をコンテキスト注入し、メイン会話がオーケストレーターとして機能します。

チャットに依頼を書くだけで、メイン会話が適切なプラグイン（実行前確認を伴う作業はスキル、調査のみの独立作業はサブエージェント）へ振り分けます。各スキルの質問はタスク開始時の実行前確認1回のみで、以降は自動で完遂します（不可逆な破壊的操作のみ例外として実行前に確認）。特定のプラグインを直接使いたい場合は、各プラグインのスラッシュコマンドを実行します。

```
/requirements-specificater 在庫管理システムのリプレイス。既存システムはExcel運用。
/openapi-specificater docs/requirements/my-service.md
/screen-specificater docs/screens/index.md
/github-issue-creator
/git-commit-pusher
/code-implementer docs/api/OpenSpec.yml の API-005 を実装して
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
