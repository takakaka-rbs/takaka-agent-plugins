// commitlint.config.js
//
// Conventional Commits のルールを定義する。
// "type(scope): subject" の形式を強制する。
//
// ┌─────────────────────────────────────────────────────────────────┐
// │                     バージョニングの対応表                         │
// ├──────────────┬─────────────────┬────────────────────────────────┤
// │ type         │ バージョン変動   │ 例                              │
// ├──────────────┼─────────────────┼────────────────────────────────┤
// │ feat!        │ major up        │ 1.0.0 → 2.0.0                  │
// │ fix!         │ major up        │ 1.0.0 → 2.0.0                  │
// │ refactor!    │ major up        │ 1.0.0 → 2.0.0                  │
// │ feat         │ minor up        │ 1.0.0 → 1.1.0                  │
// │ fix          │ patch up        │ 1.0.0 → 1.0.1                  │
// │ perf         │ patch up        │ 1.0.0 → 1.0.1                  │
// │ refactor     │ patch up        │ 1.0.0 → 1.0.1                  │
// │ docs         │ 変動なし        │ タグは打たれない                 │
// │ style        │ 変動なし        │ タグは打たれない                 │
// │ test         │ 変動なし        │ タグは打たれない                 │
// │ build        │ 変動なし        │ タグは打たれない                 │
// │ ci           │ 変動なし        │ タグは打たれない                 │
// │ chore        │ 変動なし        │ タグは打たれない                 │
// │ revert       │ 変動なし        │ タグは打たれない                 │
// └──────────────┴─────────────────┴────────────────────────────────┘
//
// ! は破壊的変更（Breaking Change）を意味する。
// どの type に ! を付けても major up になる。
//
// プラグインの追加は feat、更新は fix か refactor、削除は chore を使う。
// バージョニングは release.yml の github-tag-action が
// main ブランチへの push 時にコミット履歴を解析して自動実行する。

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // 新機能・新プラグイン追加       → minor up
        'fix',      // バグ修正・プラグイン修正        → patch up
        'docs',     // ドキュメントのみの変更          → 変動なし
        'style',    // フォーマット等                  → 変動なし
        'refactor', // リファクタリング                → patch up
        'perf',     // パフォーマンス改善              → patch up
        'test',     // テストの追加・修正              → 変動なし
        'build',    // ビルド・依存関係の変更          → 変動なし
        'ci',       // CI 設定の変更                  → 変動なし
        'chore',    // その他（プラグイン削除など）     → 変動なし
        'revert',   // コミットの取り消し              → 変動なし
      ],
    ],
    // type は小文字
    'type-case': [2, 'always', 'lower-case'],
    // type は必須
    'type-empty': [2, 'never'],
    // subject（説明文）は必須
    'subject-empty': [2, 'never'],
    // subject の大文字・小文字チェックを無効化（日本語対応）
    'subject-case': [0],
    // subject の末尾にピリオド禁止
    'subject-full-stop': [2, 'never', '.'],
    // ヘッダーの最大文字数
    'header-max-length': [2, 'always', 100],
  },
}
