# dev-knowledge-harvester

ブランチ作業で得た学び（ハマりどころ・確立した規約・手順）を、**次のセッションの自分と各プラグインが使える形**で対象リポジトリに蓄積するプラグインです。

「書く」だけでなく「読ませる」ところまでを設計に含めています。再利用手順は `.claude/skills/` の独自スキル（自動読込）、単発の知見は `docs/knowledge/*.md`、その索引は `CLAUDE.md`（全セッションで自動読込）に置くため、追加のフックなしで code-implementer や specificater 系プラグインが以降のセッションでナレッジを参照できます。

## 概要

`/harvest-knowledge` スキルが以下を行います。

1. **実行前確認（唯一の質問タイミング）**: 対象リポジトリ・収穫範囲・保存規約（初回のみ）・除外事項を、最大4問まで最初に1回だけ確認する（文脈から自明な項目は聞かない）
2. **作業内容の収集**: ブランチ差分（`git diff <base>...HEAD`）とセッションの作業記録から、「コードを読むだけでは分からない」「次の手戻りを減らす」候補だけを抽出する
3. **既存ナレッジの調査**: `knowledge-researcher` が既存の独自スキル・ナレッジMD・CLAUDE.md 索引を調査し、候補ごとに新規/追記/破棄を判定する
4. **分類と書き込み**: 再利用手順 → 独自スキル、単発の知見 → ナレッジMD（frontmatter で REQ-F-XXX / API-XXX / PBI-XXX / Issue とリンク）、既存が古ければ更新
5. **索引メンテ**: `CLAUDE.md` の「開発ナレッジ索引」セクションを1件1行で自動更新する（本文は書かない）
6. **完了報告**: 作成・更新・除外の一覧と理由、採用した仮定を開示する

**既存ナレッジ・既存スキルの削除や大部分の書き換えだけは、実行前に必ず確認します。**

## 構成要素

| コンポーネント | ファイル | 説明 |
|---|---|---|
| Skill | `skills/harvest-knowledge/SKILL.md` | `/harvest-knowledge` スラッシュコマンド。収集から索引メンテ・報告までの全体フローを制御する |
| Agent | `agents/knowledge-researcher.md` | 既存ナレッジ資産の読み取り調査と、候補ごとの新規/追記/破棄の判定 |

## 他プラグインとの関係

```
ブランチ作業（code-implementer / postgres-dev / 手作業）
  ↓ 作業完了時に /harvest-knowledge
独自スキル（.claude/skills/） + ナレッジMD（docs/knowledge/） + CLAUDE.md 索引
  ↓ 以降のセッションで自動参照
code-implementer / specificater 系の調査フェーズが速く・正確になる
```

- plugin-improver が「プラグイン定義側」の学習ループを担うのに対し、本プラグインは「開発対象リポジトリ側」の学習ループを担います
- 蓄積したファイルのコミット・プッシュは `/git-commit-pusher` に委ねます
- PBI/EPIC のステータス更新は `/backlog-manager` の担当です（作業の締めに両方を呼ぶ運用を推奨）

## 使い方

```
/harvest-knowledge
```

引数で対象と範囲を直接指定することもできます。

```
/harvest-knowledge 今回のブランチの学びを蓄積して
/harvest-knowledge /path/to/repo VRT のベースライン運用だけ記録して
```

## 前提条件

- 対象リポジトリが git 管理下にあること
- 保存規約はデフォルト（`.claude/skills/` / `docs/knowledge/` / `CLAUDE.md` 索引）以外を使う場合、実行前確認で指定できます

## インストール

```bash
# マーケットプレイス未登録の場合のみ
claude plugin marketplace add /path/to/takaka-agent-plugins

claude plugin install dev-knowledge-harvester@takaka-agent-plugins
```

## 更新履歴

### 0.1.0

- 初期リリース: `/harvest-knowledge` スキル、`knowledge-researcher` エージェントを追加
