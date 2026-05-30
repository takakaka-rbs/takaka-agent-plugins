# your-plugin-name

プラグインの概要をここに書きます。

## 概要

このプラグインが何をするかの説明。

## 構成要素

| コンポーネント | ファイル | 説明 |
|---|---|---|
| Agent | `agents/example.md` | カスタムサブエージェント |
| Skill | `skills/example-skill/SKILL.md` | `/example-skill` スラッシュコマンド |
| Hook | `hooks/pre-tool-use.sh` | ツール実行前フック |
| MCP | `mcp.json` | MCPサーバー設定 |

## インストール

```bash
PLUGIN=your-plugin-name
PROJECT=/path/to/your/project

cp -r agents/*  $PROJECT/.claude/agents/
cp -r skills/*  $PROJECT/.claude/skills/
cp -r hooks/*   $PROJECT/.claude/hooks/
# settings.json / mcp.json は既存ファイルとマージしてください
```

## 更新履歴

### 0.1.0

- 初期リリース
