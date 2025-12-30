# React ルール

## コンポーネント

- 関数コンポーネントのみ使用
- 重い処理には `useMemo` と `useCallback` を使用
- 複雑なロジックはカスタムフックに抽出

## 状態管理

- グローバル状態は Zustand ストアを使用
- UI専用の状態はローカルステートを使用
- 設定は Zustand ミドルウェアで localStorage に永続化

## スタイリング

- Tailwind CSS クラスを使用
- テーマは CSS 変数で定義（index.css）
- 印刷用スタイルは `@media print` または `.no-print` クラス

## A4レイアウト（重要）

- **全てのレイアウト計算は `src/utils/layout.ts` の関数を使用すること**
- **全ての定数は `src/constants/print.ts` から取得すること**
- **寸法にマジックナンバーを使用しないこと**
- レイアウト変更時はユニットテストとE2Eテストで確認
