# git-commit-pusher

未コミットの変更を内容ごとに分割し、リポジトリのcommitlint設定に沿ったConventional Commitメッセージ（英語）でコミットしてプッシュするプラグインです。

## 概要

`/git-commit-pusher` スキルが以下を行います。

1. **前提チェック**: gitリポジトリか、リモートがあるか、gh CLIが使えるかを最初に確認し、不足があれば即座に知らせる
2. リポジトリの `commitlint.config.js`（または `.commitlintrc*`）を読み、許可されたtype・文字数制限などの規約を把握する
3. `git status` / `git diff` で現在の変更を確認し、内容ごとに論理的なコミット単位へ分割する
4. コミット計画（メッセージ＋対象ファイル）を提示し、ユーザーの承認を得る
5. 承認された計画どおりにコミットし、プッシュする

**ユーザーの承認なしにコミット・プッシュされることはありません。**

## 実行手段について

`git commit` / `git push` はローカル操作のため **gitコマンド** で実行します。GitHub MCP（リモートAPI）はローカルの変更をコミットできないため、本プラグインでは使いません。プッシュの認証には gh CLI（`gh auth login`）または既存のgit credential設定を使います。

## 構成要素

| コンポーネント | ファイル | 説明 |
|---|---|---|
| Skill | `skills/git-commit-pusher/SKILL.md` | `/git-commit-pusher` スラッシュコマンド。前提チェック→規約把握→分割→承認→コミット→プッシュの全体フローを制御する |

## セットアップ

```bash
# git は必須
git --version

# gh CLI（プッシュの認証に推奨）
gh auth login
gh auth status
```

gitのcredential manager等で既にプッシュできる環境なら、gh CLIがなくても動作します（前提チェックで警告のみ出ます）。

## 使い方

```
/git-commit-pusher
```

現在の変更を分析し、コミット計画を提示します。

コミットのみでプッシュしない場合や、方針を伝えたい場合は引数で指示できます。

```
/git-commit-pusher プッシュはしないでコミットまで
/git-commit-pusher ドキュメントの変更だけコミットして
```

## 動作ポリシー

- **前提チェック優先**: ツール不足は作業開始前に通知（無駄な分析をしない）
- **承認必須**: コミット計画をユーザーが承認してから実行
- **フックを尊重**: husky / commitlint が拒否したらメッセージを修正して再試行。`--no-verify` は使わない
- **安全第一**: force push・履歴書き換え・機密ファイルの無断コミットをしない
- **メッセージは英語**のConventional Commits形式（`type(scope): subject`）。typeはリポジトリの `type-enum` 設定に従う

## 更新履歴

### 0.1.0

- 初期リリース: `/git-commit-pusher` スキルを追加
