# AGENTS.md - kanji-practice

## Mission

小学 1〜6 年生（漢検 10 級〜5 級対応）向けの漢字練習プリント作成ツール。
A4 で印刷可能なプリントをブラウザで生成し、PDF 出力もサポートする。

## Stack

- 言語: TypeScript / React 19
- ビルドツール: Vite 7
- パッケージマネージャ: npm
- 主要ツール: Biome 2 (lint+format), TypeScript (typecheck), Vitest (unit), Playwright (e2e)
- スタイリング: Tailwind CSS v4
- 状態管理: Zustand (`localStorage` 永続化、key: `kanji-practice-settings`)
- PDF 生成: jsPDF + html2canvas

## Verification

このリポの検証エントリポイントは `./scripts/verify.sh` に統一する。

```bash
./scripts/verify.sh           # 人間可読 (text)
./scripts/verify.sh --json    # 構造化結果 (CI / Codex 用)
```

- 内部で **typecheck → lint → format → build → test** の順に実行する (軽い check を先に並べ早期失敗を可視化、`build` 段階で `tsc -b` が冗長に走るのを避ける順序)。
- 失敗時の exit code: `0` 全 pass / `1` 1 つ以上 fail / `2` 環境エラー。
- このリポは Biome 2 の `npm run check` が lint と format を兼ねるため、`format` step は `n/a`。
- 失敗 step の出力 (tail 200 行) は stderr に流すので、CI / Codex のコンソールから直接原因を確認できる (per-run の log は `$(mktemp -d)` 配下に置き、終了時に削除する)。
- 詳細は `scripts/verify.sh` 冒頭コメント、または workspace `docs/templates/verify-sh-template.sh` を参照。

## PR conventions

PR 本文は **日本語**、ブランチ名 / コミット / PR タイトルは英語。
本文の構造は workspace `docs/codex-playbook.md` の **"PR Description Standards"** に従う
(概要 / 変更内容 / 動作確認 / 受け入れ条件 / スコープ外 / 影響範囲 / レビュー観点)。

- リポ直下の `.github/PULL_REQUEST_TEMPLATE.md` は workspace `docs/templates/pull-request-template.md` の写し。
- 印刷レイアウトに影響する PR では、Playwright のスクリーンショット差分または `playwright-report/` の該当ケースを **動作確認** に必ず添付する。
- 漢字データ (`src/data/`) を変更する PR では `/validate-kanji` の出力を **動作確認** に貼る。

## Never touch

エージェントが触ってはいけないファイル / ディレクトリ:

- `src/data/kanji.ts` および `src/data/grades/*.ts` — 全学年の漢字データ SSOT。手動メンテのみ。
- `package-lock.json` — 依存追加・更新コミット以外で書き換えない。
- 自動生成: `dist/`, `playwright-report/`, `test-results/`, `node_modules/`。

> 削除・破壊的変更が必要なときは PR 本文の "影響範囲 / リスク" に明示してから提案する。

## Architectural invariants

崩したら設計が壊れる不変条件 (新人が違反しがちな順):

- A4 印刷の安全領域は **180mm × 267mm** 固定 (A4 210×297 − margin 15)。`src/constants/print.ts` を SSOT とし、コンポーネントでマジックナンバーを書かない。
- すべてのレイアウト計算は `src/utils/layout.ts` の関数を経由する。各コンポーネントで再計算しない。
- `PrintMode` (`reading | writing | strokeCount | sentence`) は exhaustive check 対象。`src/types.ts` を更新したら全 switch 文を追従させる。
- 問題生成は `src/utils/questionGenerator.ts` を介する (例語ベース、同一漢字でも読みのバリエーションを担保)。

## Known pitfalls

- **html2canvas は Tailwind CSS v4 の `oklch()` カラーをサポートしない**。PDF 生成前に `convertOklchColors()` (`src/utils/pdf.ts`) で sRGB 相当に変換する必要がある。新色を導入したら必ず PDF 出力でも確認する。
- localStorage マイグレーション (`grades`→`grade`, `count`→`pageCount`) があるため、ストア型を変えるときは互換ロジックを残す。

## Quality bar

- 必須チェック: `./scripts/verify.sh --json` の `build` / `lint` / `typecheck` / `test` がすべて `pass` (`format` は n/a)。
- ユニットテストカバレッジ目標: `src/utils/` の純関数 (layout, questionGenerator) は line 80%。
- E2E: A4 レイアウトのビジュアル regression を最低 1 ケース維持 (Playwright snapshot)。
- セキュリティ: 個人情報・トラッキングコードの追加禁止 (子供向けプリントツール)。
