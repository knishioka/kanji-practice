# Reactコンポーネント設計ルール

## コンポーネント構造

### ファイル構成
- 1ファイル1コンポーネント
- コンポーネント名とファイル名は一致させる（PascalCase）
- サブコンポーネントは同じディレクトリに配置

### Props設計
```typescript
// 明示的な型定義
interface ComponentProps {
  required: string;
  optional?: number;
  children?: React.ReactNode;
}

// デフォルト値はオブジェクト分割で
function Component({ optional = 0, ...props }: ComponentProps) { }
```

## 状態管理

### Zustand使用パターン
```typescript
// src/store/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // state
      // actions
    }),
    { name: 'kanji-practice-settings' }
  )
);
```

### ローカル状態 vs グローバル状態
- **ローカル**: UIの一時的な状態（ホバー、フォーカス）
- **グローバル**: 永続化が必要な設定、複数コンポーネント間で共有

## A4レイアウト対応

### 印刷用コンポーネント
```tsx
// 印刷専用のスタイリング
<div className="print:block screen:hidden">
  {/* 印刷時のみ表示 */}
</div>

// A4サイズの指定
<div style={{
  width: '210mm',
  height: '297mm',
  padding: '15mm'
}}>
```

### 禁止事項
- マジックナンバーの直接記述（`src/constants/print.ts`を使用）
- oklch色の直接使用（PDF生成時に変換が必要）
