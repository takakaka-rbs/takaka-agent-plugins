# takaka-agent-plugins

Claude Code (Agent SDK) 向けプラグインの管理リポジトリです。

## 概要

各プラグインは `plugins/<name>/` に格納され、`claude plugin` コマンドでインストールして使います。

## ディレクトリ構成

```
takaka-agent-plugins/
├── .claude-plugin/
│   └── marketplace.json         # マーケットプレイスレジストリ
├── plugins/
│   └── orchestrator/            # コアプラグイン
│       ├── .claude-plugin/
│       │   └── plugin.json      # メタデータ（マニフェスト）
│       ├── README.md
│       ├── agents/
│       │   ├── master.md        # orchestrator-master エージェント
│       │   └── planner.md       # orchestrator-planner エージェント
│       └── skills/
│           └── route/
│               └── SKILL.md     # /route スキル
├── template/                    # 新規プラグイン作成用ひな型
├── docs/
│   └── plugin-spec.md           # プラグイン仕様
└── CONTRIBUTING.md
```

## プラグイン一覧

| プラグイン名                            | バージョン | 説明                                                                                        |
| --------------------------------------- | ---------- | ------------------------------------------------------------------------------------------- |
| [orchestrator](./plugins/orchestrator/) | 0.1.1      | **コアプラグイン** — 全リクエストのエントリーポイント。適切なプラグインへルーティング・調整 |
| [requirements-specificater](./plugins/requirements-specificater/) | 0.1.0 | 対話・コードベース調査・Web調査を通じて要件定義書を作成・更新する |
| [github-issue-creator](./plugins/github-issue-creator/) | 0.1.0 | ユーザーの指示からGitHub Issueを対話形式で作成する（GitHub MCP優先・gh CLI補完、複数一括対応） |

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

すべてのリクエストはオーケストレーターを経由して適切なプラグインへ振り分けられます。

```
/route orchestrator planner タスクを分解してほしい
```

---

## 新しいプラグインを追加する

[CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。  
`template/` ディレクトリをコピーして開発を始められます。

## ライセンス

MIT
