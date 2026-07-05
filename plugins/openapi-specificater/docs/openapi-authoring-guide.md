# OpenAPI仕様書 記述レベルガイド

openapi-specificater プラグインが生成する OpenAPI 仕様書（OpenSpec.yml）の品質基準です。
目標は **「実装者・利用者が本書だけでAPIを正しく実装・利用できる機能仕様書」** であり、
「ツールで生成できる最低限のスキーマ定義」ではありません。

`/openapi-specificater` スキルは、各APIを書き終えるたびに本ガイドのチェックリストで
自己監査し、満たさない項目を残したまま完成扱いにしてはいけません。

## 1. 何が「不足」で何が「十分」か

次の例は構文的には正しいOpenAPIですが、機能仕様書としては不足しています。

```yaml
# ✗ 不足している例
/users:
  get:
    operationId: getUsers
    summary: ユーザー一覧取得
    responses:
      "200":
        description: ユーザー一覧
        content:
          application/json:
            schema:
              type: array
              items:
                $ref: "#/components/schemas/User"
      "500":
        description: Internal Server Error
```

この記述では以下の質問に答えられません。**読者がこれらを実装者に口頭で確認しなければ
ならない時点で、仕様書として機能していません。**

- このAPIは誰が何のために呼ぶのか（どの要件・ユースケースに対応するのか）
- 認証は必要か。必要ならどのロールが呼べるのか
- 全件返るのか、ページネーションされるのか。順序は保証されるのか
- 退会済みユーザーは含まれるのか
- 401/403 は起こらないのか。500 はどういうときに返るのか

同じAPIを本プラグインの基準で書くと次のようになります。

```yaml
# ○ 十分な例
/users:
  get:
    operationId: getUsers
    x-api-id: API-001
    x-requirements:
      - REQ-F-004
    tags:
      - users
    summary: ユーザー一覧取得
    description: |
      登録済みユーザーの一覧をページネーション付きで取得する。
      管理画面のユーザー管理一覧（UC-003）で使用する。

      ### 利用場面

      管理者がユーザーの検索・状態確認を行うとき。

      ### 事前条件

      認証済みで、かつ管理者ロールを持つこと。

      ### ビジネスルール

      - 退会済みユーザーは含まれない（status=withdrawn は除外）
      - 並び順は登録日時の降順で固定
      - 該当ユーザーが0件の場合も 200 を返し、items は空配列となる

      ### 副作用

      なし（参照のみ）。
    security:
      - bearerAuth: []
    parameters:
      - $ref: "#/components/parameters/Page"
      - $ref: "#/components/parameters/Limit"
    responses:
      "200":
        description: ユーザー一覧。0件の場合は items が空配列
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/UserListResponse"
            examples:
              default:
                summary: 2件ヒットした場合
                value:
                  items:
                    - id: 1
                      name: 山田太郎
                      email: yamada@example.com
                      createdAt: "2026-01-15T09:30:00Z"
                    - id: 2
                      name: 佐藤花子
                      email: sato@example.com
                      createdAt: "2026-02-01T12:00:00Z"
                  page: 1
                  limit: 20
                  total: 2
      "400":
        $ref: "#/components/responses/BadRequest"   # page/limit が範囲外の場合
      "401":
        $ref: "#/components/responses/Unauthorized"
      "403":
        $ref: "#/components/responses/Forbidden"    # 管理者ロールを持たない場合
      "500":
        $ref: "#/components/responses/InternalServerError"
```

## 2. チェックリスト

### 2.1 文書全体

- [ ] `info.description` に目的・対象読者・要件定義書へのリンクがある
- [ ] `info.description` の共通規約に以下がある: 日時フォーマット / ページネーション方式 /
      エラーレスポンス共通形式と業務エラーコード一覧 / 認証の概要
- [ ] `servers` に環境ごとのURLと説明がある
- [ ] すべての `tags` に description があり、機能単位の「章」になっている
- [ ] ルートの `security` でデフォルトの認証要件が宣言されている

### 2.2 各操作（operation）ごと

- [ ] `operationId`（キャメルケースで一意）と `x-api-id`（API-XXX）がある
- [ ] `x-requirements` に対応する要件ID（REQ-F-XXX）が最低1つある
- [ ] `summary` が一覧表示で内容のわかる一文になっている
- [ ] `description` に以下の見出しがすべてある（該当なしの場合も「なし」と明記）
  - **利用場面**: どのユースケース・業務でいつ呼ばれるか
  - **事前条件**: 必要な認証・権限・リソースの状態
  - **ビジネスルール**: 業務的な制約、境界値の挙動（0件時・上限超過時など）、冪等性
  - **副作用**: データ変更・通知・外部連携（参照系は「なし（参照のみ）」）
- [ ] 認証不要のAPIには `security: []` が明示されている
- [ ] 全パラメータに description・型制約（min/max・pattern・enum・default）・example がある
- [ ] `requestBody` にリクエスト例（examples）がある
- [ ] `responses` に成功系 + そのAPIで起こりうる全エラーステータスがある（下の選定表を参照）
- [ ] API固有のエラー発生条件が description（ビジネスルール）またはレスポンス側コメントで読み取れる
- [ ] 成功レスポンスに現実的な値の examples がある

### 2.3 スキーマ（components/schemas）ごと

- [ ] リクエスト用・レスポンス用スキーマが分離されている（`XxxCreateRequest` / `XxxResponse` など。
      サーバー採番の id・createdAt をリクエスト側に含めない）
- [ ] 全プロパティに description があり、型名の言い換えではなく業務上の意味・制約を説明している
- [ ] 文字列に maxLength（必要なら minLength・pattern・format）、数値に minimum/maximum がある
- [ ] enum の各値の意味が description で説明されている
- [ ] null になりうるプロパティは型に `"null"` を含め、いつ null になるかを説明している
- [ ] `required` が明示されている
- [ ] 各プロパティまたはスキーマ単位で example がある

### 2.4 エラーステータス選定の目安

「そのAPIで実際に起こりうるもの」をすべて列挙します。機械的に全部並べるのではなく、
起こりえないステータスは載せません（例: 認証不要APIに 401 は不要）。

| ステータス | 載せる条件 |
|---|---|
| 400 | バリデーションのあるパラメータ・ボディを受け取る場合 |
| 401 | 認証が必要な場合 |
| 403 | 認証に加えてロール・所有者チェックがある場合 |
| 404 | パスパラメータでリソースを特定する場合 |
| 409 | 一意制約・状態遷移の制約・楽観ロックがある場合 |
| 422 | 形式は正しいが業務ルールで受け付けられない入力を 400 と区別したい場合（採用は任意。採用するなら共通規約に 400 との使い分けを明記） |
| 500 | 全API（共通レスポンスの $ref でよい） |

## 3. ID採番・トレーサビリティ

| 項目 | ルール |
|---|---|
| `x-api-id` | `API-XXX`（001からの3桁連番、必要なら桁を増やす）。**既存IDは変更・再採番しない** |
| `x-requirements` | 要件定義書に実在する `REQ-F-XXX` のみを書く。存在しないIDを発明しない |
| `x-open-issues` | 本書スコープの未確定事項を `OPEN-XXX` で管理（要件定義書のOPEN-XXXとは独立） |
| 参照方向 | 常に「本書 → 要件定義書」の一方向。要件定義書側にAPI番号は書かせない |

対応する要件が要件定義書に存在しないAPIを追加したくなった場合は、先に
requirements-specificater で要件を追加してもらうようユーザーに案内します。

## 4. 記述スタイル

- description などの説明文は日本語で書く。フィールド名・enum値・エラーコードは英語
- 日時の example は共通規約のフォーマット（ISO 8601 / UTC 推奨）に従った現実的な値にする
- example の値は「山田太郎」「yamada@example.com」のような現実的なダミーにする
  （"string"・"test" のようなプレースホルダーにしない）
- OpenAPI 3.1 では example（単数・非推奨）ではなく `examples` を使う
- 共通化できるもの（ページネーションパラメータ・エラーレスポンス）は components に
  定義して `$ref` で参照し、コピペで増やさない
