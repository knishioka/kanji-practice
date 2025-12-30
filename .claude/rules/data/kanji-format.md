# 漢字データフォーマットルール

## 必須フィールド

```typescript
interface Kanji {
  char: string;           // 漢字1文字
  grade: 1 | 2 | 3 | 4 | 5 | 6;  // 学年
  readings: {
    on: string[];         // 音読み（カタカナ）
    kun: string[];        // 訓読み（ひらがな）
  };
  strokeCount: number;    // 画数（1-30）
  examples: {             // 例語（最低2つ推奨）
    word: string;         // 対象漢字を含む語
    reading: string;      // 読み
  }[];
  sentences: string[];    // 例文（最低1つ）
}
```

## オプションフィールド

```typescript
// 送りがな
okuriganaExamples?: {
  stem: string;      // 漢字部分
  okurigana: string; // 送りがな部分
  word: string;      // 完全な形
  reading: string;   // 読み
}[];

// 対義語（同学年内に存在する漢字）
antonyms?: string[];

// 類義語（同学年内に存在する漢字）
synonyms?: string[];

// 部首情報
radical?: {
  char: string;   // 部首文字
  name: string;   // 部首名
};
```

## バリデーションルール

### 必須チェック
- `char`: 漢字1文字であること
- `readings`: on/kunの少なくとも一方に1つ以上
- `strokeCount`: 1以上30以下の整数
- `examples`: 最低1つ、word/reading両方必須
- `sentences`: 最低1つ

### 整合性チェック
- 例語のwordに対象漢字(char)が含まれること
- 対義語/類義語が同学年内に存在すること
- 重複漢字がないこと

## ファイル配置

```
src/data/
├── kanji.ts           # エクスポート用（全学年統合）
├── grades/
│   ├── grade1.ts      # 1年生（80字）
│   ├── grade2.ts      # 2年生（160字）
│   ├── grade3.ts      # 3年生（200字）
│   ├── grade4.ts      # 4年生（202字）
│   ├── grade5.ts      # 5年生（193字）
│   └── grade6.ts      # 6年生（191字）
├── radicals.ts        # 部首マスターデータ
└── kanjiRadicalMap.ts # 漢字→部首マッピング
```
