# PDFレイアウト検証コマンド

A4印刷レイアウトが正しく設定されているかを多角的にチェックします。

## 検証項目

### 1. 定数チェック
- `src/constants/print.ts` の値が仕様通りか
  - 用紙サイズ: 210mm × 297mm
  - マージン: 15mm
  - 安全印刷領域: 180mm × 267mm

### 2. レイアウト計算
- `src/utils/layout.ts` の関数が正しく計算するか
  - `calculateRowsPerPage()`: 1ページあたりの行数
  - `calculateQuestionsPerPage()`: 1ページあたりの問題数
  - セルサイズ（12-25mm）に応じた計算

### 3. モード別レイアウト
各モードで問題が正しく配置されるか：
- reading: 読み問題
- writing: 書き取り問題
- strokeCount: 画数問題
- sentence: 例文問題
- homophone: 同音異義語
- radical: 部首問題
- okurigana: 送りがな問題
- antonym: 対義語/類義語問題

### 4. ビジュアル検証
- グリッドスタイル（cross/dots/none）の表示
- フォントサイズの適切性
- 印刷時のはみ出しがないか

## 使用方法

```
/check-layout [モード]
/check-layout --all  # 全モードチェック
/check-layout --visual  # ビルドしてブラウザで確認
```

## 実行手順

1. `npm run test:unit -- --grep "layout"` でユニットテスト実行
2. `src/constants/print.ts` の値を確認
3. `src/utils/layout.ts` のテスト結果を確認
4. 必要に応じてe2eテスト `npm run test` を実行

$ARGUMENTS でモードを指定した場合はそのモードのみ、指定がなければ全モードを検証します。
