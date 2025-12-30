# A4印刷レイアウトルール

## 基本仕様

| 項目 | 値 |
|------|-----|
| 用紙サイズ | 210mm × 297mm |
| マージン | 15mm（上下左右均等） |
| 安全印刷領域 | 180mm × 267mm |

## 定数の使用

```typescript
// 常にsrc/constants/print.tsから参照
import { A4_WIDTH_MM, A4_HEIGHT_MM, MARGIN_MM } from '@/constants/print';
```

### 禁止パターン
```typescript
// ❌ マジックナンバー
const width = 210;

// ✅ 定数使用
const width = A4_WIDTH_MM;
```

## レイアウト計算

```typescript
// src/utils/layout.tsの関数を使用
import {
  calculateRowsPerPage,
  calculateQuestionsPerPage
} from '@/utils/layout';
```

## グリッドスタイル

| スタイル | 用途 |
|---------|------|
| cross | 十字線（書き取り練習用） |
| dots | 点（なぞり書き用） |
| none | なし（確認テスト用） |

## PDF生成時の注意

### oklch色変換
```typescript
// html2canvasはoklchをサポートしない
import { convertOklchColors } from '@/utils/pdf';

// PDF生成前に必ず呼び出す
convertOklchColors(element);
```

## モード別レイアウト

各モードで異なるセル構成：
- **reading/writing**: 漢字セル + 練習列
- **strokeCount**: 漢字セル + 画数表示
- **sentence**: 漢字セル + 例文表示
- **homophone/radical/okurigana/antonym**: 専用レイアウト
