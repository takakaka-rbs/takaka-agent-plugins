# code-implementer

API仕様書（OpenSpec.yml）・画面仕様書を入力として、対象リポジトリのアプリケーションコードを「**技術調査 → 実装計画 → 実装 → テスト → 修正ループ**」のワークフローで自動実装するプラグインです。

要件定義（requirements-specificater）→ API仕様（openapi-specificater）→ 画面仕様（screen-specificater）の上流工程プラグインの下流にあたり、仕様書からアプリコードまでを一貫して自動生成する体制の実装・テスト工程を担います。第一弾のサポートスタックは **Java: Spring Framework / Vue3 / PostgreSQL** です。

## 概要

`/code-implementer` スキルが以下を進行管理します。実装・テストの実作業は10個のサブエージェントに委譲されます。

1. **実行前確認（唯一の質問タイミング）**: 対象リポジトリ・仕様書の場所と実装スコープ・実行するテストレベル・修正ループの最大リトライ回数を、最大4問まで最初に1回だけ確認する（文脈から自明な項目は聞かない）
2. **調査**: `dev-researcher` が対象リポジトリの構成・規約・実行コマンドを調査し「リポジトリプロファイル」としてまとめる。プラグインは特定リポジトリに依存せず、このプロファイルが下流工程の唯一のリポジトリ固有情報源になる
3. **計画**: `dev-planner` が仕様書と調査結果から実装計画（TASK一覧・順序・影響範囲）を作成する（報告のみ、承認は待たない）
4. **実装**: `dev-backend`（API-XXX 単位で Spring を実装）・`dev-frontend`（SCR-XXX 単位で Vue3 を実装）が計画に従って実装し、ビルドが通ることを確認する
5. **テスト**: 単体（JUnit / Vitest）→ API（OpenAPI仕様書駆動・既存テストスタック優先）→ VRT（Storybook）→ E2E（Playwright）の順に、選択されたレベルを実行し、共通形式のレポートを出力する
6. **修正ループ**: 失敗時は `fix-planner` が原因を分類（実装起因 / テスト起因 / 仕様起因 / 環境起因）して修正計画を作成し、担当エージェントに再作業させて再テストする。実装起因のリトライはレベルごとに上限（デフォルト3回）まで
7. **完了報告**: 実装ファイル・テスト結果・採用した仮定・未解決課題（仕様起因・環境起因を含む）を開示する

## 構成要素

| コンポーネント | ファイル | 説明 |
|---|---|---|
| Skill | `skills/code-implementer/SKILL.md` | `/code-implementer` スラッシュコマンド。ワークフロー全体の進行管理・修正ループの制御 |
| Agent | `agents/dev-researcher.md` | リポジトリプロファイル調査・実装方式調査 |
| Agent | `agents/dev-planner.md` | 実装計画（TASK一覧・順序・影響範囲）の作成 |
| Agent | `agents/dev-backend.md` | Spring バックエンド実装（Controller / Service / Repository / Entity 相当） |
| Agent | `agents/dev-frontend.md` | Vue3 フロントエンド実装（画面コンポーネント・API呼び出し・状態管理） |
| Agent | `agents/test-unit-backend.md` | JUnit 単体テスト（Service 層中心）の作成・実行・レポート |
| Agent | `agents/test-unit-frontend.md` | Vitest 単体テスト（コンポーネント・ロジック）の作成・実行・レポート |
| Agent | `agents/test-api.md` | OpenAPI仕様書駆動のAPIテスト（正常系・エラー条件・ビジネスルール）。既存テストスタック優先で新規ツールは原則導入しない |
| Agent | `agents/test-vrt.md` | Storybook ストーリー作成と VRT 実行・レポート（未導入時は導入案内） |
| Agent | `agents/test-e2e.md` | Playwright E2E テスト（画面遷移・ユースケース単位）の作成・実行・レポート |
| Agent | `agents/fix-planner.md` | テスト失敗の分析・原因分類・修正計画の作成 |
| 設計ドキュメント | `docs/architecture.md` | ワークフロー全体設計・エージェント責務・修正ループ終了条件 |
| 成果物テンプレート | `docs/artifact-templates.md` | 調査レポート・実装計画・テスト結果・修正計画の共通形式 |

## 成果物の受け渡し

エージェント間の受け渡しは対象リポジトリ内の作業ディレクトリ `.claude/code-implementer/` のファイルを正とします（Git 管理外を推奨）。

```
<対象リポジトリ>/.claude/code-implementer/
├── research-report.md          # リポジトリプロファイル + 実装方式調査
├── implementation-plan.md      # 実装計画
├── test-reports/<level>-attempt<N>.md
└── fix-plans/fix-plan-attempt<N>.md
```

## 入力仕様書との関係

```
要件定義書（requirements-specificater） … REQ-F-XXX / UC-XXX
OpenSpec.yml（openapi-specificater）    … API-XXX
画面仕様書（screen-specificater）        … SCR-XXX / CMP-XXX / EVT-XXX
  ↓ 参照（本プラグインは仕様書を変更しない）
実装コード + テスト（本プラグイン）
```

実装・テストの期待値の根拠は常に仕様書です。仕様書の不備・矛盾を検出した場合はコードを仕様に合わせず「仕様起因の課題」として報告し、`/openapi-specificater` / `/screen-specificater` での修正を案内します。

## 使い方

```
/code-implementer
```

対象リポジトリ・仕様書の場所・実装スコープ・テストレベル・リトライ上限は、実行前確認（最大4問・自明な項目は省略）で最初に1回だけ確認し、以降は質問せずに完遂します。

引数で対象を直接指定することもできます。

```
/code-implementer /path/to/target-repo API-003 SCR-002
/code-implementer docs/api/OpenSpec.yml の API-005 を実装して
```

## 前提条件

- 対象リポジトリがローカルにあり、ビルド・テストが実行できる環境が整っていること（JDK / Node.js / Docker 等。環境不備は「環境起因」として検出・案内されます）
- 入力仕様書（OpenSpec.yml / 画面仕様書）が上流プラグインの形式で存在すること（片方のみでも、その範囲で実行可能）
- Storybook / Playwright が未導入の場合、VRT / E2E レベルは導入案内（SKIP）になります

## インストール

```bash
# マーケットプレイス未登録の場合のみ
claude plugin marketplace add /path/to/takaka-agent-plugins

claude plugin install code-implementer@takaka-agent-plugins
```

## 更新履歴

### 0.1.0

- 初期リリース: `/code-implementer` スキル、10エージェント（dev-researcher / dev-planner / dev-backend / dev-frontend / test-unit-backend / test-unit-frontend / test-api / test-vrt / test-e2e / fix-planner）、設計ドキュメント・成果物テンプレートを追加
