# CLAUDE.md - 漢字練習プリント

## プロジェクト概要

小学1〜6年生向け（漢検10級〜5級対応）の漢字練習プリント作成ツール。
A4サイズで印刷可能なプリントを生成し、PDF出力もサポート。

## 技術スタック

- **フレームワーク**: React 19 + TypeScript
- **ビルドツール**: Vite 7
- **スタイリング**: Tailwind CSS v4
- **状態管理**: Zustand (localStorage永続化)
- **PDF生成**: jsPDF + html2canvas
- **テスト**: Playwright (e2e) + Vitest (unit)

## プロジェクト構造

```
src/
├── components/           # Reactコンポーネント
│   ├── SettingsPanel.tsx # 設定パネル
│   ├── PrintPreview.tsx  # 印刷プレビュー
│   ├── PrintablePages.tsx # 印刷用ページ
│   ├── WritingGrid.tsx   # 練習マス
│   └── DebugOverlay.tsx  # デバッグ用オーバーレイ
├── constants/
│   └── print.ts          # A4印刷に関する定数
├── utils/
│   ├── layout.ts         # レイアウト計算
│   ├── questionGenerator.ts # 問題生成
│   ├── pdf.ts            # PDF生成
│   └── __tests__/        # ユニットテスト
├── store/
│   └── useStore.ts       # Zustandストア
├── data/
│   └── kanji.ts          # 漢字データ（全学年）
├── types.ts              # TypeScript型定義
├── App.tsx               # メインコンポーネント
└── main.tsx              # エントリポイント
```

## 開発コマンド

```bash
npm run dev         # 開発サーバー起動 (localhost:5173)
npm run build       # プロダクションビルド
npm run preview     # ビルド結果のプレビュー
npm run check       # Biome lint + format チェック
npm run check:fix   # Biome lint + format 自動修正
npm run test        # e2eテスト (Playwright)
npm run test:unit   # ユニットテスト (Vitest)
npm run test:unit:watch  # ユニットテスト (ウォッチモード)
```

## 重要な制約

### A4印刷レイアウト

- **用紙サイズ**: 210mm × 297mm
- **マージン**: 15mm
- **安全印刷領域**: 180mm × 267mm
- **定数ファイル**: `src/constants/print.ts`

すべてのレイアウト計算は `src/utils/layout.ts` の関数を使用すること。
マジックナンバーを直接書かないこと。

### html2canvasの制限

html2canvas は Tailwind CSS v4 の `oklch` カラーをサポートしていない。
PDF生成前に `convertOklchColors()` で色を変換する必要がある。

```typescript
// src/utils/pdf.ts
export function convertOklchColors(element: HTMLElement): void
```

### 問題生成

問題生成は `src/utils/questionGenerator.ts` を使用。
例語ベースで生成するため、同じ漢字でも異なる読みの問題が生成される。

## 主要な型定義

```typescript
// src/types.ts
type Grade = 1 | 2 | 3 | 4 | 5 | 6;
type PrintMode = 'reading' | 'writing' | 'strokeCount' | 'sentence';
type GridStyle = 'cross' | 'dots' | 'none';

interface Settings {
  grade: Grade;
  mode: PrintMode;
  pageCount: number;
  random: boolean;
  gridStyle: GridStyle;
  cellSize: number;
  practiceColumns: number;
  showHint: boolean;
  title: string;
}
```

## プリントモードと学習設計

各モードは異なる学習目的に対応。組み合わせて使用することで効果的。

| モード | 学習目的 | 推奨場面 |
|--------|----------|----------|
| reading | 視覚→音声の想起 | 新出漢字の導入、読み確認テスト |
| writing | 音声→運動記憶 | 書き取り練習、定着確認 |
| strokeCount | 構造分析・観察力 | 漢字学習の基礎固め、漢検対策 |
| sentence | 文脈理解・運筆 | 応用力、自然な用法の習得 |

**学習順序の目安**: strokeCount → reading → writing → sentence
（構造理解 → 認識 → 産出 → 応用）

**問題生成時の考慮点**:
- 同じ漢字でも複数の読み方で出題（例語ベース生成）
- ランダム出題で分散学習効果を促進
- 繰り返し出現で間隔反復に近い効果

モードごとの設定適用は `src/components/settings/config.ts` で管理。

## 漢字データの更新

漢字データは `src/data/kanji.ts` に格納。

```typescript
interface Kanji {
  char: string;           // 漢字
  grade: Grade;           // 学年
  readings: {
    on: string[];         // 音読み
    kun: string[];        // 訓読み
  };
  strokeCount: number;    // 画数
  examples: {             // 例語
    word: string;
    reading: string;
  }[];
  sentences: string[];    // 例文
}
```

## テスト

### ユニットテスト (Vitest)

`src/utils/__tests__/` に配置。

```bash
npm run test:unit
```

カバレッジ:
- `layout.ts`: レイアウト計算関数
- `questionGenerator.ts`: 問題生成関数

### e2eテスト (Playwright)

`e2e/` に配置。

```bash
npm run test
```

テスト対象:
- A4レイアウト正確性
- PDF生成
- 印刷プレビュー

## 状態管理

Zustandストア (`src/store/useStore.ts`) で管理。
localStorage に `kanji-practice-settings` キーで永続化。

マイグレーション対応:
- `grades` → `grade` (配列から単一値)
- `count` → `pageCount` (ページ数ベース)

## よくある開発タスク

### 新しいプリントモードの追加

1. `src/types.ts` の `PrintMode` に追加
2. `src/components/SettingsPanel.tsx` の `modes` と `modeSettings` に追加
3. `src/components/PrintablePages.tsx` に表示ロジック追加
4. 必要に応じて `src/utils/layout.ts` の `calculateRowsPerPage` 更新

### レイアウト定数の変更

1. `src/constants/print.ts` の値を変更
2. ユニットテストを実行して影響確認
3. e2eテストで印刷レイアウト確認

### 漢字データの追加

1. `src/data/kanji.ts` にデータ追加
2. ユニットテストで問題生成確認

## Claude Code 統合

### ディレクトリ構造

```
.claude/
├── settings.json     # プロジェクト設定・Hooks
├── commands/         # Slashコマンド
│   ├── validate-kanji.md     # 漢字データ検証
│   ├── check-layout.md       # PDFレイアウト検証
│   └── evaluate-questions.md # 問題品質評価
├── agents/           # サブエージェント
│   └── edu-content-validator.md  # 教育コンテンツ検証
└── rules/            # 開発ルール
    ├── general.md            # 全般ルール
    ├── react.md              # React基本
    ├── testing.md            # テスト方針
    ├── frontend/
    │   ├── components.md     # コンポーネント設計
    │   └── print.md          # A4印刷レイアウト
    ├── data/
    │   └── kanji-format.md   # 漢字データ形式
    └── education/
        ├── learning-theory.md    # 学習理論
        └── content-quality.md    # コンテンツ品質基準
```

### Slashコマンド

```bash
/validate-kanji [学年]   # 漢字データの整合性チェック
/check-layout [モード]   # PDFレイアウトの多角的検証
/evaluate-questions      # 問題の教育的品質評価
```

### サブエージェント

- **edu-content-validator**: 教育コンテンツ品質検証
  - 漢字データ変更時に自動起動
  - 学習理論・漢検基準に基づく評価

### Hooks（自動実行）

- **PostToolUse**: ファイル編集後に自動フォーマット（Biome）

### 重要コマンド

```bash
# コミット前の確認
npm run check:fix    # Biome lint + format

# テスト実行
npm run test:unit    # 高速フィードバック
npm run test         # E2E（低速）

# 型チェック
npx tsc --noEmit
```

### 重要ファイル

レイアウト修正時:
1. まず `src/constants/print.ts` を確認
2. `src/utils/layout.ts` の関数を使用
3. `npm run test:unit` で計算を検証
4. `npm run test` でビジュアル出力を確認

漢字データ追加時:
1. `src/data/grades/gradeN.ts` にデータ追加
2. `/validate-kanji N` で検証
3. `/evaluate-questions --grade N` で品質確認
