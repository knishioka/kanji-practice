// 学年（小1〜小6）
export type Grade = 1 | 2 | 3 | 4 | 5 | 6;

// 除外漢字マップ（学年ごと）
export type ExcludedKanjiMap = {
  [key in Grade]?: string[];
};

// 漢字データ
export interface Kanji {
  char: string;
  grade: Grade;
  readings: { on: string[]; kun: string[] };
  strokeCount: number;
  examples: { word: string; reading: string }[];
  sentences: string[];
  // 漢検対策用の追加データ（Phase 2以降で使用）
  radical?: {
    char: string;
    name: string;
    position?: 'left' | 'right' | 'top' | 'bottom' | 'enclosing' | 'other';
  };
  okuriganaExamples?: {
    stem: string;
    okurigana: string;
    word: string;
    reading: string;
  }[];
  antonyms?: string[];
  synonyms?: string[];
}

// プリント種類
export type PrintMode =
  | 'reading'
  | 'writing'
  | 'sentence'
  | 'strokeCount'
  | 'homophone'
  | 'radical'
  | 'okurigana'
  | 'antonym'
  | 'strokeOrder';

// グリッド種類
export type GridStyle = 'cross' | 'dots' | 'none';

// 設定
export interface Settings {
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

// 問題
export interface Question {
  kanji: Kanji;
  reading: string;
  example?: { word: string; reading: string };
  sentence?: string;
  // 漢検対策用
  homophoneQuestion?: {
    reading: string;
    options: { kanji: string; context: string }[];
  };
  radicalQuestion?: {
    targetKanji: string;
    answerRadical: string;
    answerRadicalName: string;
  };
  okuriganaQuestion?: {
    stem: string;
    answer: string;
    fullWord: string;
    hint?: string;
  };
  antonymQuestion?: {
    type: 'antonym' | 'synonym';
    sourceKanji: string;
    answerKanji: string;
  };
}
