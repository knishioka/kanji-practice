# テストルール

## ユニットテスト (Vitest)

- 配置: `src/**/__tests__/*.test.ts`
- ユーティリティ関数と計算ロジックに集中
- 境界条件とエッジケースをテスト

## E2Eテスト (Playwright)

- 配置: `e2e/*.spec.ts`
- ユーザーワークフローとビジュアルリグレッションをテスト
- スナップショットは控えめに使用

## テスト対象

- レイアウト計算（A4フィッティング）
- 問題生成ロジック
- PDF生成（エラーなし）
- 印刷レイアウト（オーバーフローなし）

## スナップショット更新のタイミング

- ビジュアル変更が意図的な場合のみ
- `npx playwright test --update-snapshots` を実行
- 説明的なメッセージでスナップショットをコミット

## コマンド

```bash
# ユニットテスト
npm run test:unit

# E2Eテスト
npm run test

# テストUI
npm run test:unit:ui
npm run test:ui
```
