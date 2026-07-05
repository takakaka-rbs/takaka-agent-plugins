---
name: route
description: Explicitly route a task to a specific plugin and agent, bypassing automatic orchestration. Useful when you know exactly which specialist you want.
invocation: user
---

# /route

指定したプラグイン・エージェントに直接タスクをルーティングします。自動ルーティングを迂回して特定のエージェントを呼び出したいときに使います。

## Usage

```
/route <plugin-name> <agent-name> <task>
```

## Instructions

1. `$ARGUMENTS` を解析して `plugin-name`, `agent-name`, タスク説明を取り出す
2. 指定されたエージェントの存在を確認する
   - Agent ツールで利用可能なエージェントタイプ一覧に `<plugin-name>:<agent-name>` があるかをまず確認する
   - 一覧で確認できない場合は、インストール済みプラグインキャッシュを走査する:
     `~/.claude/plugins/cache/takaka-agent-plugins/<plugin-name>/<バージョン>/agents/<agent-name>.md`
     （バージョンディレクトリが複数ある場合は最新バージョンを見る）
   - takaka-agent-plugins リポジトリ自体を開発中の場合のみ、リポジトリ内の
     `plugins/<plugin-name>/agents/<agent-name>.md` にフォールバックしてよい
3. エージェントが存在する場合 — Agent ツールでそのエージェントに直接タスクを委譲する
4. エージェントが存在しない場合 — 上記キャッシュ配下の全プラグインの `agents/*.md` を一覧表示して使用可能な選択肢を提示する

## Examples

```
/route requirements-specificater requirements-researcher 既存システムの現行機能を調査して要件候補をまとめて
```

```
/route github-issue-creator issue-drafter ログイン後にセッションが切れるバグの該当コードと再現条件を調査して
```

```
/route orchestrator orchestrator-planner 以下の複雑なタスクを分解してほしい: ...
```
