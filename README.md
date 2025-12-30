# 漢字練習プリント

小学1〜6年生向け（漢検10級〜5級対応）の漢字練習プリント作成ツールです。
A4サイズで印刷可能なプリントを生成し、PDF出力もサポートしています。

## 機能

- **読み練習**: 漢字の読み方を答える問題
- **書き練習**: 読みを見て漢字を書く練習
- **画数問題**: 漢字の画数を答える問題
- **書き順練習**: 漢字の書き順を確認しながら書く練習
- **例文写経**: 例文を書き写す練習
- **同音異字**: 同じ読みの異なる漢字を選ぶ問題
- **部首問題**: 漢字の部首を答える問題
- **送りがな**: 送りがなを正しく書く問題
- **対義語・類義語**: 対義語・類義語を答える問題

## クイックスタート

### 必要環境

- Node.js 22以上
- npm 10以上

### インストール

```bash
git clone https://github.com/YOUR_USERNAME/kanji-practice.git
cd kanji-practice
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

### ビルド

```bash
npm run build
npm run preview  # ビルド結果を確認
```

## 開発コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run lint` | Biomeでリント実行 |
| `npm run format` | Biomeでフォーマット |
| `npm run check` | リント + フォーマットチェック |
| `npm run check:fix` | リント + フォーマット自動修正 |
| `npm run test:unit` | ユニットテスト実行 |
| `npm run test:unit:watch` | ユニットテスト（ウォッチモード） |
| `npm run test` | E2Eテスト実行 |

## 技術スタック

- **フレームワーク**: React 19 + TypeScript
- **ビルドツール**: Vite 7
- **スタイリング**: Tailwind CSS v4
- **状態管理**: Zustand (localStorage永続化)
- **PDF生成**: jsPDF + html2canvas
- **リンター/フォーマッター**: Biome
- **テスト**: Vitest (unit) + Playwright (e2e)

## プロジェクト構造

```
src/
├── components/           # Reactコンポーネント
│   ├── print/           # 印刷用問題コンポーネント
│   └── settings/        # 設定パネル関連
├── constants/           # 定数（A4サイズなど）
├── data/               # 漢字データ
│   └── grades/         # 学年別データ
├── store/              # Zustand状態管理
├── types.ts            # TypeScript型定義
└── utils/              # ユーティリティ関数
    └── __tests__/      # ユニットテスト
e2e/                    # E2Eテスト
```

## 印刷について

- A4サイズ（210mm × 297mm）に最適化
- マージン15mmを確保
- ブラウザの印刷機能またはPDF保存が利用可能

### 推奨印刷設定

- 用紙サイズ: A4
- 余白: なし（アプリ側でマージン設定済み）
- 背景のグラフィック: オン

## ライセンス

MIT License
