# takaka-agent-plugins

Claude Code (Agent SDK) 向けプラグインの管理リポジトリです。

## 概要

各プラグインは `plugins/<name>/` に格納され、`.claude/` ディレクトリ準拠の構成を持ちます。  
プロジェクトへのインストールは対応するサブディレクトリをコピーするだけです。

## ディレクトリ構成

```
takaka-agent-plugins/
├── plugins/
│   └── example-plugin/
│       ├── plugin.json          # メタデータ
│       ├── README.md
│       ├── agents/
│       │   └── example.md       # カスタムサブエージェント定義
│       ├── skills/
│       │   └── example-skill/
│       │       └── SKILL.md     # スラッシュコマンド定義
│       ├── hooks/
│       │   └── pre-tool-use.sh  # フックスクリプト
│       ├── settings.json        # フック配線設定
│       └── mcp.json             # MCPサーバー設定
├── template/                    # 新規プラグイン作成用ひな型
├── docs/
│   └── plugin-spec.md           # プラグイン仕様（全構成要素の説明）
└── CONTRIBUTING.md
```

## プラグイン一覧

| プラグイン名 | バージョン | 説明 |
|---|---|---|
| [example-plugin](./plugins/example-plugin/) | 0.1.0 | 構成参照用サンプルプラグイン |

## インストール

### 前提条件

- [Claude Code](https://claude.ai/code) がインストールされていること

### 手順

1. このリポジトリをクローン

```bash
git clone https://github.com/your-org/takaka-agent-plugins.git
```

2. インストールしたいプラグインの各コンポーネントをプロジェクトの `.claude/` へコピー

```bash
PLUGIN=example-plugin
PROJECT=/path/to/your/project

cp -r plugins/$PLUGIN/agents/*  $PROJECT/.claude/agents/
cp -r plugins/$PLUGIN/skills/*  $PROJECT/.claude/skills/
cp -r plugins/$PLUGIN/hooks/*   $PROJECT/.claude/hooks/
# settings.json と mcp.json は既存ファイルとマージが必要
```

> **Note**: `settings.json` と `mcp.json` は上書きではなくマージしてください。  
> 詳細は [plugin-spec.md](./docs/plugin-spec.md) を参照してください。

## 新しいプラグインを追加する

[CONTRIBUTING.md](./CONTRIBUTING.md) を参照してください。  
`template/` ディレクトリをコピーして開発を始められます。

## ライセンス

MIT
