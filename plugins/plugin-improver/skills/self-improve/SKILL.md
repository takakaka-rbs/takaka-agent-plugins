---
name: self-improve
description: セッション中に .claude/plugin-feedback/ へ蓄積されたフィードバック（スキル/エージェント定義と実作業のズレの記録）を読み込み、takaka-agent-plugins リポジトリの該当プラグイン定義（SKILL.md / agents/*.md）へ改善として反映する。更新計画を提示してユーザーの承認を得てから編集・コミット・プッシュを実行し、処理済みフィードバックをアーカイブする。
invocation: user
---

# /self-improve

`.claude/plugin-feedback/` に蓄積されたフィードバックをもとに、takaka-agent-plugins の SKILL / エージェント定義を更新するスキルです。

## フィードバックファイルの形式

このスキルが処理する入力は、plugin-improver の Stop フックによって以下の形式で記録されています。

```markdown
---
plugin: git-commit-pusher
component: skills/git-commit-pusher/SKILL.md
status: pending
---

## 状況
（どんな作業中に起きたか）

## 定義とのズレ
（定義の記述と実際に必要だった作業の差分）

## 改善案
（定義をどう直すべきか）
```

## ステップ0: 前提チェック（最優先・作業前に必ず実行）

1. `.claude/plugin-feedback/` が存在し、`status: pending` のフィードバックが1件以上あるか確認する。なければ「未処理のフィードバックはありません」と伝えて終了する
2. takaka-agent-plugins リポジトリの**ソース**（プラグインキャッシュではなく git 管理下の実体）を特定する。探索順:
   - 環境変数 `TAKAKA_PLUGINS_REPO` が指すパス
   - カレントプロジェクトおよびその親ディレクトリ配下の `takaka-agent-plugins/`（`.claude-plugin/marketplace.json` の存在で判定）
   - 見つからない場合: `gh repo clone` で一時ディレクトリへ clone することを提案し、ユーザーの承認を得て実行する
3. 特定したリポジトリで `git status --porcelain` を確認し、未コミットの変更が既にある場合はその旨をユーザーに伝える（このスキルの変更と混ざるのを防ぐため）

**注意: `~/.claude/plugins/cache/` 配下のファイルは絶対に編集しない。** キャッシュへの変更はプラグイン更新で消える。編集対象は必ず git 管理下のリポジトリソースとする。

## 全体フロー

### ステップ1: フィードバックの読み込みと分類

1. `status: pending` の全フィードバックを読み込む
2. `plugin` / `component` ごとにグループ化する
3. 内容が重複・矛盾するフィードバックは統合し、明らかに誤っているもの（定義を読み違えただけ等）は「反映しない」と判断して理由とともに除外リストに載せる

### ステップ2: 現行定義の確認と改善案の作成

各グループについて:

1. リポジトリソースの該当ファイル（`plugins/<plugin>/skills/*/SKILL.md` または `plugins/<plugin>/agents/*.md`）を読む
2. フィードバックの「改善案」をそのまま鵜呑みにせず、現行定義の設計意図・既存の構成（ステップ構造、制約セクション等）と整合する形で編集案を作る
3. 編集は**最小限かつ既存のスタイルに合わせる**。定義全体の書き直しはしない
4. description（SKILL frontmatter やエージェントの description）を変更する場合は、トリガー条件が変わることを明示する

### ステップ3: 更新計画の提示・承認（必須）

1. 以下の形式で更新計画を提示する

   ```
   更新1: plugins/git-commit-pusher/skills/git-commit-pusher/SKILL.md
     - ステップ0に○○のチェックを追加（フィードバック: 20260705-...md）
   更新2: plugins/orchestrator/agents/planner.md
     - ルーティング基準に△△を追記
   反映しないフィードバック: 20260701-...md（理由: ...）
   バージョン: git-commit-pusher 0.1.0 → 0.1.1
   ```

2. **ユーザーの承認なしに定義ファイルを編集しない**

### ステップ4: 編集とバージョン更新

承認された計画に沿って:

1. 該当の SKILL.md / agents/*.md を編集する
2. 変更したプラグインの `plugin.json` の `version` をパッチバージョンアップする
3. `.claude-plugin/marketplace.json` の該当プラグインエントリの `version` も同じ値に揃える
4. プラグインの README に記載された手順・説明が今回の変更と矛盾する場合は README も更新する

### ステップ5: コミット・プッシュ

1. git-commit-pusher プラグインが利用可能なら `/git-commit-pusher` を使う。使えない場合はその規約（Conventional Commits・英語・commitlint 準拠、例: `docs(git-commit-pusher): add prerequisite check for detached HEAD`）に従って自分でコミットする
2. main への直接プッシュが許可されていないリポジトリ設定の場合はブランチを切って push し、`gh pr create` で PR を作成する

### ステップ6: フィードバックのアーカイブ

1. 反映したフィードバックの frontmatter を `status: applied` に、除外したものを `status: rejected` に書き換え、`.claude/plugin-feedback/archive/` へ移動する
2. `pending` のフィードバックが残っていないことを確認する

### ステップ7: 結果サマリー

- 更新したファイルと変更概要の一覧
- バージョン変更（plugin.json / marketplace.json）
- コミット・プッシュ（または PR）の結果
- 反映を見送ったフィードバックとその理由
- 各利用環境への反映には `claude plugin update` が必要である旨の案内

## 制約

- **ユーザーの承認なしに定義ファイルを編集・コミット・プッシュしない**
- プラグインキャッシュ（`~/.claude/plugins/cache/`）は編集しない
- 1回の実行での変更は蓄積済みフィードバックの反映に限定し、頼まれていないリファクタリングや定義の全面書き換えをしない
- フィードバックに機密情報（トークン、社内URL等）が含まれる場合は、定義ファイルへ転記しない
- force push・履歴の書き換えを行わない

## 関連ドキュメント

- プラグイン概要・フィードバック収集の仕組み: [README.md](../../README.md)
