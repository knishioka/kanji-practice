/**
 * 部首問題生成ユーティリティ
 * 漢字の部首を答える問題を生成
 */

import { getKanjiByGrade } from '../data/kanji';
import type { Grade, Kanji, Question } from '../types';

/**
 * 配列をシャッフル（Fisher-Yates）
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 部首データを持つ漢字をフィルタリング
 */
function getKanjiWithRadical(kanjiPool: Kanji[]): Kanji[] {
  return kanjiPool.filter((k) => k.radical?.char && k.radical?.name);
}

/**
 * 部首問題を生成
 * @param grade - 対象学年
 * @param count - 生成する問題数
 * @param random - ランダム出題するか
 * @returns 生成された問題配列
 */
export function generateRadicalQuestions(grade: Grade, count: number, random: boolean): Question[] {
  const kanjiPool = getKanjiByGrade([grade]);
  const kanjiWithRadical = getKanjiWithRadical(kanjiPool);

  if (kanjiWithRadical.length === 0) {
    return [];
  }

  const questions: Question[] = [];
  const orderedPool = random ? shuffleArray(kanjiWithRadical) : kanjiWithRadical;

  let poolIndex = 0;
  while (questions.length < count) {
    const kanji = orderedPool[poolIndex % orderedPool.length];

    questions.push({
      kanji,
      reading: kanji.readings.on[0] || kanji.readings.kun[0] || '',
      radicalQuestion: {
        targetKanji: kanji.char,
        answerRadical: kanji.radical!.char,
        answerRadicalName: kanji.radical!.name,
      },
    });

    poolIndex++;

    // プールを使い切ったらシャッフルして再利用
    if (poolIndex >= orderedPool.length && questions.length < count) {
      poolIndex = 0;
      if (random) {
        const reshuffled = shuffleArray(orderedPool);
        orderedPool.splice(0, orderedPool.length, ...reshuffled);
      }
    }
  }

  return questions.slice(0, count);
}

/**
 * 部首問題を生成可能かチェック
 * @param grade - 対象学年
 * @returns 部首データを持つ漢字が存在するか
 */
export function canGenerateRadicalQuestions(grade: Grade): boolean {
  const kanjiPool = getKanjiByGrade([grade]);
  const kanjiWithRadical = getKanjiWithRadical(kanjiPool);
  return kanjiWithRadical.length > 0;
}
