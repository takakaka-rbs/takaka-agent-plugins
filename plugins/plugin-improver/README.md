# plugin-improver

セッション中に検出した「スキル/エージェント定義と実作業のズレ」をフィードバックとして自動記録し、`/self-improve` スキルで takaka-agent-plugins 本体の定義へ反映するプラグインです。プラグインエコシステムの継続的な自己改善サイクルを担います。

## 概要

改善サイクルは**収集**と**反映**の二段構えです。

```
セッション中                          任意のタイミング
┌─────────────────────────┐          ┌─────────────────────────────┐
│ Stop フック（prompt型）  │          │ /self-improve スキル         │
│ 定義とのズレを検出したら │ ───────▶ │ フィードバックを読み、       │
│ .claude/plugin-feedback/ │  蓄積    │ SKILL.md / agents/*.md を    │
│ に気づきを記録           │          │ 編集して commit & push       │
└─────────────────────────┘          └─────────────────────────────┘
                                              │
                                              ▼
                                     claude plugin update で各環境へ配布
```

1. **収集（自動）**: Stop フックがエージェントの応答終了時に「このセッションで定義と実作業のズレがなかったか」を評価し、あった場合のみ `.claude/plugin-feedback/` に気づきを記録させます。ズレがなければ何もしないため、通常の作業を妨げません
2. **反映（承認制）**: `/self-improve` を実行すると、蓄積されたフィードバックを分類・統合し、takaka-agent-plugins リポジトリの該当定義への更新計画を提示します。承認後に編集・バージョンアップ・コミット・プッシュまで行います

**ユーザーの承認なしに定義が書き換わることはありません。**

## フィードバックファイルの形式

`.claude/plugin-feedback/<YYYYMMDD-HHmmss>-<プラグイン名>.md`

```markdown
---
plugin: git-commit-pusher
component: skills/git-commit-pusher/SKILL.md
status: pending
---

## 状況
detached HEAD 状態のリポジトリでコミットを依頼された

## 定義とのズレ
ステップ0の前提チェックに detached HEAD の確認がなく、ステップ5で初めて失敗に気づいた

## 改善案
ステップ0に `git symbolic-ref -q HEAD` によるブランチ確認を追加する
```

- `status: pending` — 未反映（`/self-improve` の処理対象）
- 反映後は `applied` / `rejected` に更新され `.claude/plugin-feedback/archive/` へ移動されます

## 構成要素

| コンポーネント | ファイル | 説明 |
|---|---|---|
| Hook | `hooks/hooks.json` | Stop イベントの prompt 型フック。定義とのズレを検出した場合のみフィードバックの記録を指示する |
| Skill | `skills/self-improve/SKILL.md` | `/self-improve` スラッシュコマンド。フィードバックの分類→更新計画の提示→承認→編集→コミット・プッシュ→アーカイブを制御する |

## セットアップ

```bash
# 反映先リポジトリ（takaka-agent-plugins のソース）の場所を指定（任意）
export TAKAKA_PLUGINS_REPO=/path/to/takaka-agent-plugins
```

環境変数がない場合、`/self-improve` はカレントプロジェクト周辺を探索し、見つからなければ `gh repo clone` を提案します。プッシュには git-commit-pusher プラグインと同様に gh CLI または git credential 設定が必要です。

## 使い方

フィードバックの収集は自動です。反映したいタイミングで以下を実行します。

```
/self-improve
```

特定のプラグインだけ反映したい場合は引数で指示できます。

```
/self-improve git-commit-pusher のフィードバックだけ反映して
```

## 動作ポリシー

- **邪魔をしない**: ズレがないセッションでは Stop フックは何もしない。同じ気づきの重複記録もしない
- **承認必須**: 更新計画をユーザーが承認してから定義を編集する
- **ソースのみ編集**: プラグインキャッシュ（`~/.claude/plugins/cache/`）は編集せず、必ず git 管理下のリポジトリソースへ反映する
- **最小変更**: フィードバックの反映に必要な最小限の編集に留め、定義の全面書き換えをしない
- **バージョン整合**: 定義を変更したプラグインは `plugin.json` と `marketplace.json` のバージョンを揃えてパッチアップする

## 更新履歴

### 0.1.0

- 初期リリース: Stop フックによるフィードバック収集と `/self-improve` スキルを追加
