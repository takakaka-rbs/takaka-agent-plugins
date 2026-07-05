# github-issue-creator

ユーザーの指示からGitHub Issueを対話形式で作成するプラグインです。GitHub MCPを優先し、MCPが対応しない操作はgh CLIで補完します。複数Issueの一括作成に対応しています。

## 概要

ユーザーがIssueにしたい内容を伝えると、`/github-issue-creator` スキルが以下を行います。

1. 対象リポジトリ（owner/repo）を特定してユーザーに確認する
2. 入力内容をIssue候補に分割・整理する（複数件の一括作成に対応）
3. 必要に応じて `issue-drafter` エージェントがコードベースを調査し、該当コード・再現手順・影響範囲を本文に反映する
4. ドラフト一覧を提示し、ユーザーの承認を得る
5. GitHub MCP（または gh CLI）でIssueを作成し、URL一覧を報告する

**ユーザーの承認なしにIssueが作成されることはありません。**

## 構成要素

| コンポーネント | ファイル | 説明 |
|---|---|---|
| Skill | `skills/github-issue-creator/SKILL.md` | `/github-issue-creator` スラッシュコマンド。対話の全体フローを制御する |
| Agent | `agents/issue-drafter.md` | Issue本文を充実させるコードベース調査を担当するサブエージェント |
| MCP | `.mcp.json` | GitHub公式MCPサーバー（リモート版）の接続設定 |
| テンプレート | `docs/issue-template.md` | リポジトリにIssueテンプレートがない場合の既定構成（バグ/機能追加/タスク） |

## セットアップ

### GitHub MCP（推奨・主経路）

`.mcp.json` はGitHubのリモートMCPサーバー（`https://api.githubcopilot.com/mcp/`）を使います。

**認証はOAuth（ブラウザ認証）です。PATの作成・管理は不要です。**

1. Claude Code 内で `/mcp` を実行する
2. `github` サーバーを選択し、Authenticate を実行する
3. ブラウザが開くのでGitHubアカウントでサインインする（初回のみ）

<details>
<summary>PATを使いたい場合（任意）</summary>

OAuthではなくPersonal Access Tokenを使う場合は、`.mcp.json` の `github` サーバーに以下を追記します。

```json
"headers": {
  "Authorization": "Bearer ${GITHUB_MCP_PAT}"
}
```

Fine-grained PAT なら対象リポジトリの Issues: Read and write 権限、Classic PAT なら repo スコープが必要です。

</details>

### gh CLI（フォールバック）

MCPが未接続の場合や、MCPツールが対応しない操作（Issueテンプレートの取得など）に使います。

```bash
gh auth login
gh auth status   # 認証確認
```

MCP・gh CLIのどちらか一方がセットアップされていれば動作します（両方あるのが理想）。

## 使い方

```
/github-issue-creator
```

対話形式で「何をIssueにするか」から確認します。

Issueにしたい内容を直接渡すこともできます。

```
/github-issue-creator ログイン後にセッションが30秒で切れるバグを修正したい
```

要件定義書などのファイルからまとめて起票する場合はパスを渡します。

```
/github-issue-creator docs/requirements/my-service.md
```

コード内のTODOコメントから起票したい場合はその旨を伝えます。

```
/github-issue-creator src/ 配下のTODOコメントをIssue化して
```

## 動作ポリシー

- **前提チェック優先**: GitHub MCP・gh CLIのどちらも使えない場合は、作業を始める前にセットアップ手順を案内して終了する（無駄な分析をしない）
- **承認必須**: ドラフトを提示し、ユーザーが承認した候補のみ作成する
- **MCP優先**: GitHub MCPツールを優先し、未接続・非対応操作のみgh CLIを使う
- **リポジトリ規約の尊重**: `.github/ISSUE_TEMPLATE/` があればその構成を優先。ラベルは既存のもののみ提案する
- **作成のみ**: Issueの編集・クローズ・コメントは対象外
- **一括上限**: 1回の実行で最大10件を目安（超える場合は分割を提案）

## 他プラグインとの連携

- `requirements-specificater` が出力した要件定義書のパスを渡すと、要件ID（REQ-F-XXX）単位でのIssue分割を提案します

## 更新履歴

### 0.1.0

- 初期リリース: `/github-issue-creator` スキル、`issue-drafter` エージェント、GitHub MCP設定、既定Issueテンプレートを追加
