# CLAUDE.md - 漢字練習プリント (Claude Code 固有設定)

> プロジェクト概要 / 技術スタック / 制約 / レイアウト規約 / テスト方針などは
> **`AGENTS.md` を参照**してください。本ファイルは Claude Code 固有の設定 (sub-agents / slash commands / hooks) のみを記述します。

## ディレクトリ構造

```
.claude/
├── settings.json     # プロジェクト設定・Hooks
├── commands/         # Slash コマンド
│   ├── validate-kanji.md     # 漢字データ検証
│   ├── check-layout.md       # PDF レイアウト検証
│   └── evaluate-questions.md # 問題品質評価
├── agents/           # サブエージェント
│   └── edu-content-validator.md  # 教育コンテンツ検証
└── rules/            # 開発ルール
    ├── general.md            # 全般ルール
    ├── react.md              # React 基本
    ├── testing.md            # テスト方針
    ├── frontend/
    │   ├── components.md     # コンポーネント設計
    │   └── print.md          # A4 印刷レイアウト
    ├── data/
    │   └── kanji-format.md   # 漢字データ形式
    └── education/
        ├── learning-theory.md    # 学習理論
        └── content-quality.md    # コンテンツ品質基準
```

## Slash コマンド

```bash
/validate-kanji [学年]   # 漢字データの整合性チェック
/check-layout [モード]   # PDF レイアウトの多角的検証
/evaluate-questions      # 問題の教育的品質評価
```

## サブエージェント

- **edu-content-validator**: 教育コンテンツ品質検証
  - 漢字データ変更時に自動起動
  - 学習理論・漢検基準に基づく評価

## Hooks（自動実行）

- **PostToolUse**: ファイル編集後に自動フォーマット (Biome `npm run check:fix`)

## よく使う検証フロー

レイアウト修正時:

1. `src/constants/print.ts` を確認 (A4 安全領域 180×267mm の SSOT)
2. `src/utils/layout.ts` の関数を使用してレイアウト計算
3. `npm run test:unit` で計算ロジックを検証
4. `npm run test` (Playwright) でビジュアル出力を確認

漢字データ追加時:

1. `src/data/grades/gradeN.ts` にデータ追加
2. `/validate-kanji N` で整合性チェック
3. `/evaluate-questions --grade N` で品質確認

> ⚠️ 共通の検証は `./scripts/verify.sh --json` を使用してください (build / lint / typecheck / test を一括実行)。
