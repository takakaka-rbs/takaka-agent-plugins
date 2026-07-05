# openapi-specificater

要件定義書（REQ-F-XXX）を参照しながら、OpenAPI 3.1 形式のAPI仕様書（OpenSpec.yml）を作成・更新するプラグインです。

単なるスキーマ定義ではなく、**実装者・利用者が仕様書だけでAPIを正しく実装・利用できる「APIの機能仕様書」** として通用するレベルまで記述することを品質基準としています。

## 概要

ユーザーが要件定義書やAPIのメモを渡すと、`/openapi-specificater` スキルが以下を行います。

1. 要件定義書の機能要件（REQ-F-XXX）から必要なAPIの一覧を設計し、ユーザーと合意する
2. 共通規約（認証・日時フォーマット・ページネーション・エラー形式）を決定する
3. 不足している情報を「コードベース調査」「Web調査」「ユーザーへの質問」で埋める
4. 各APIを記述レベルガイドのチェックリスト（利用場面・事前条件・ビジネスルール・副作用・全エラー条件・具体例）に沿って記述する
5. 要件とのトレーサビリティ（`x-requirements`）とAPI ID（`x-api-id: API-XXX`）を整備する

## 文書の役割分担

```
要件定義書（requirements-specificater） … サービスが満たすべき要件を定義する
  ↑ REQ-F-XXX を参照
OpenSpec.yml（本プラグイン）             … 要件を満たす具体的なAPIを定義する
画面仕様書（別プラグイン・予定）          … 要件を満たす具体的な画面を定義する
```

参照は常に「OpenSpec.yml → 要件定義書」の一方向です。各APIの `x-requirements` に対応する要件IDを記載し、要件定義書側にAPI番号は書きません。対応する要件が存在しないAPIが必要になった場合は、先に `/requirements-specificater` で要件を追加します。

## 記述レベルの基準

構文的に正しいだけのOpenAPI（summaryと型定義だけ）は成果物として不合格です。各APIについて以下が仕様書から読み取れることを完成条件とします。

- 誰が何のために呼ぶのか（利用場面・対応要件）
- 呼ぶための条件（認証・権限・リソースの状態）
- 業務ルール（境界値の挙動・冪等性・重複時の扱いなど）
- 副作用（データ変更・通知・外部連携）
- 起こりうるすべてのエラーと、その発生条件
- 現実的な値のリクエスト/レスポンス例

詳細な合否基準と良い例・悪い例は [docs/openapi-authoring-guide.md](docs/openapi-authoring-guide.md) を参照してください。

## 構成要素

| コンポーネント | ファイル | 説明 |
|---|---|---|
| Skill | `skills/openapi-specificater/SKILL.md` | `/openapi-specificater` スラッシュコマンド。対話の全体フローを制御する |
| Agent | `agents/openapi-researcher.md` | コードベース調査（ルーティング・DTO・バリデーション等）・Web調査を担当するサブエージェント |
| テンプレート | `docs/openapi-template.yml` | OpenSpec.yml のベーステンプレート（記入ガイド・共通components付き） |
| 記述レベルガイド | `docs/openapi-authoring-guide.md` | 「機能仕様書レベル」の合否基準チェックリストと良い例・悪い例 |

## ID採番ルール

| 項目 | 対象 | 説明 |
|---|---|---|
| `x-api-id: API-XXX` | 各操作（operation） | APIの不変ID。画面仕様書・実装・テストが参照するキーになる |
| `x-requirements: [REQ-F-XXX]` | 各操作 | このAPIが満たす機能要件ID。要件定義書に実在するIDのみ記載する |
| `x-open-issues: OPEN-XXX` | 文書ルート | 本書スコープの未確定事項（要件定義書のOPEN-XXXとは独立した採番） |

`XXX` は `001` から始まる3桁の連番です。**既存の仕様書を更新する際、既存の API-XXX・operationId は変更しません**（外部からの参照が壊れるため）。新規APIには新しい連番を割り当てます。

## 使い方

```
/openapi-specificater
```

新規作成・既存ファイルの更新・要件定義書の場所・出力先パスについて対話形式で確認しながら進みます。

既存のOpenSpec.ymlを更新する場合はパスを引数に渡せます。

```
/openapi-specificater docs/api/openspec.yml
```

要件定義書のパスやAPIのメモをそのまま渡して開始することもできます。

```
/openapi-specificater docs/requirements/my-service.md
/openapi-specificater 在庫管理システムのAPI。商品のCRUDと在庫数の増減操作が必要。
```

## インストール

```bash
PLUGIN=openapi-specificater
PROJECT=/path/to/your/project

cp -r agents/* $PROJECT/.claude/agents/
cp -r skills/* $PROJECT/.claude/skills/
```

## 更新履歴

### 0.1.0

- 初期リリース: `/openapi-specificater` スキル、`openapi-researcher` エージェント、OpenSpec.ymlテンプレート、記述レベルガイドを追加
