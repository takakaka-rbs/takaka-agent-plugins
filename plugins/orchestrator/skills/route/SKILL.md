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
2. `plugins/<plugin-name>/agents/<agent-name>.md` の存在を確認する
3. ファイルが存在する場合 — そのエージェントに直接タスクを委譲する
4. ファイルが存在しない場合 — `plugins/` 配下の全エージェントを一覧表示して使用可能な選択肢を提示する

## Examples

```
/route example-plugin example-agent プラグイン構成について教えて
```

```
/route orchestrator planner 以下の複雑なタスクを分解してほしい: ...
```
