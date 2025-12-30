/**
 * 部首問題生成ユーティリティ
 * 漢字の部首を答える問題を生成
 *
 * 30種の主要部首（漢検頻出）に限定して出題
 * 部首データを持つ漢字のみが出題対象
 */

import { getKanjiByGrade } from '../data/kanji';
import type { Grade, Question } from '../types';
import { filterKanjiWithRadical, resolveRadical } from './radicalUtils';

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
 * 部首問題を生成
 * @param grade - 対象学年
 * @param count - 生成する問題数
 * @param random - ランダム出題するか
 * @returns 生成された問題配列
 */
export function generateRadicalQuestions(grade: Grade, count: number, random: boolean): Question[] {
  const kanjiPool = getKanjiByGrade([grade]);
  // 新しいユーティリティを使用して部首データを持つ漢字のみをフィルタ
  const kanjiWithRadical = filterKanjiWithRadical(kanjiPool);

  if (kanjiWithRadical.length === 0) {
    return [];
  }

  const questions: Question[] = [];
  const orderedPool = random ? shuffleArray(kanjiWithRadical) : kanjiWithRadical;

  let poolIndex = 0;
  while (questions.length < count) {
    const kanji = orderedPool[poolIndex % orderedPool.length];

    // 新しいユーティリティを使用して部首を解決
    const radical = resolveRadical(kanji);
    if (radical) {
      questions.push({
        kanji,
        reading: kanji.readings.on[0] || kanji.readings.kun[0] || '',
        radicalQuestion: {
          targetKanji: kanji.char,
          answerRadical: radical.char,
          answerRadicalName: radical.name,
        },
      });
    }

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
  const kanjiWithRadical = filterKanjiWithRadical(kanjiPool);
  return kanjiWithRadical.length > 0;
}

/**
 * 指定学年で部首問題に使用可能な漢字数を取得
 * @param grade - 対象学年
 * @returns 部首データを持つ漢字の数
 */
export function getRadicalQuestionKanjiCount(grade: Grade): number {
  const kanjiPool = getKanjiByGrade([grade]);
  return filterKanjiWithRadical(kanjiPool).length;
}
