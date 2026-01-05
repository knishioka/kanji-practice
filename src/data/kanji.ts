import type { Kanji } from '../types';
import { grade1 } from './grades/grade1';
import { grade2 } from './grades/grade2';
import { grade3 } from './grades/grade3';
import { grade4 } from './grades/grade4';
import { grade5 } from './grades/grade5';
import { grade6 } from './grades/grade6';

// 全漢字データをエクスポート
export const allKanji: Kanji[] = [...grade1, ...grade2, ...grade3, ...grade4, ...grade5, ...grade6];

// 学年別にフィルタリング
export const getKanjiByGrade = (grades: number[]): Kanji[] => {
  return allKanji.filter((k) => grades.includes(k.grade));
};

// 学年別にフィルタリング（除外漢字対応）
export const getKanjiByGradeFiltered = (
  grades: number[],
  excludedChars: string[] = [],
): Kanji[] => {
  return allKanji.filter((k) => grades.includes(k.grade) && !excludedChars.includes(k.char));
};

// ランダムに選択（データが足りない場合は繰り返す）
export const getRandomKanji = (kanji: Kanji[], count: number): Kanji[] => {
  if (kanji.length === 0) return [];

  const result: Kanji[] = [];
  while (result.length < count) {
    const shuffled = [...kanji].sort(() => Math.random() - 0.5);
    result.push(...shuffled);
  }
  return result.slice(0, count);
};
