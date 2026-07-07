# backlog-manager

EPIC・PBI を対象リポジトリの `docs/backlog/` 配下に**単純なマークダウン**として作成・更新・ステータス管理するプラグインです。

frontmatter の ID で **EPIC-XXX → PBI-XXX → REQ-F-XXX / API-XXX → GitHub Issue → 作業ブランチ**の連鎖を保つ設計で、requirements-specificater（要件定義）と github-issue-creator（Issue 化）の間を埋めます。この ID 連鎖は、将来の仕様と実装の整合性監査（トレーサビリティ）の土台になります。

## 概要

`/backlog-manager` スキルが以下を行います。

1. **実行前確認（唯一の質問タイミング）**: 対象リポジトリ・作業内容（起票/更新）・入力ソース・Issue 化まで行うかを、最大4問まで最初に1回だけ確認する（文脈から自明な項目は聞かない）
2. **既存バックログの調査**: `backlog-researcher` が既存 EPIC / PBI と次の連番・要件定義書（REQ-F-XXX）のカバー状況・関連 Issue / ブランチを調査する（重複起票の防止）
3. **ドラフト作成**: ID を採番し、検証可能な受け入れ条件を持つ EPIC / PBI をドラフトする（1 PBI = 1 ブランチ / 1 PR の粒度を目安に分割）
4. **書き込みと索引メンテ**: `docs/backlog/epics/` / `pbis/` へ書き込み、索引（`docs/backlog/README.md`）を同じ回で更新する
5. **Issue 化（選択時）**: ready の PBI を `/github-issue-creator` に委譲して Issue を作成し、Issue 番号を PBI へ書き戻す
6. **完了報告**: 作成・更新一覧、PBI ↔ REQ-F ↔ Issue の対応表、採用した仮定を開示する

**EPIC・PBI ファイルの削除と採番済み ID の変更だけは、実行前に必ず確認します。**

## 構成要素

| コンポーネント | ファイル | 説明 |
|---|---|---|
| Skill | `skills/backlog-manager/SKILL.md` | `/backlog-manager` スラッシュコマンド。調査からドラフト・書き込み・Issue 化・報告までの全体フローを制御する |
| Agent | `agents/backlog-researcher.md` | 既存バックログ・要件カバレッジ・Issue / ブランチ対応の読み取り調査 |

## 他プラグインとの関係

```
要件定義書（requirements-specificater） … REQ-F-XXX
  ↓ 参照して PBI を起票（requirements に REQ-F-XXX を記録）
EPIC / PBI（本プラグイン: docs/backlog/）
  ↓ ready の PBI を Issue 化
GitHub Issue（github-issue-creator）     … Issue 番号を PBI に書き戻す
  ↓ feature ブランチで実装（code-implementer / postgres-dev）
PR マージ時に status: done へ更新（/harvest-knowledge との併用を推奨）
```

- 起票の根拠に要件定義書を使う場合、先に `/requirements-specificater` で要件定義書を整備してください（自由記述からの起票も可能です）
- 作成したファイルのコミット・プッシュは `/git-commit-pusher` に委ねます

## 使い方

```
/backlog-manager
```

引数で対象と内容を直接指定することもできます。

```
/backlog-manager 要件定義書（docs/requirements/index.md）から PBI を起票して
/backlog-manager 通知機能の EPIC を作成して
/backlog-manager PBI-004 を done にして
```

## 前提条件

- 対象リポジトリが git 管理下にあること（`docs/backlog/` は初回実行時に初期化されます）
- Issue 化まで行う場合は github-issue-creator プラグインと GitHub MCP または gh CLI が利用できること

## インストール

```bash
# マーケットプレイス未登録の場合のみ
claude plugin marketplace add /path/to/takaka-agent-plugins

claude plugin install backlog-manager@takaka-agent-plugins
```

## 更新履歴

### 0.1.0

- 初期リリース: `/backlog-manager` スキル、`backlog-researcher` エージェントを追加
