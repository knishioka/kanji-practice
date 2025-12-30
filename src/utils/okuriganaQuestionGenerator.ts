/**
 * 送りがな問題生成ユーティリティ
 * 正しい送りがなを書く問題を生成
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
 * 送りがなデータを持つ漢字をフィルタリング
 */
function getKanjiWithOkurigana(
  kanjiPool: Kanji[],
): { kanji: Kanji; example: NonNullable<Kanji['okuriganaExamples']>[number] }[] {
  const results: { kanji: Kanji; example: NonNullable<Kanji['okuriganaExamples']>[number] }[] = [];

  for (const kanji of kanjiPool) {
    if (kanji.okuriganaExamples && kanji.okuriganaExamples.length > 0) {
      for (const example of kanji.okuriganaExamples) {
        results.push({ kanji, example });
      }
    }
  }

  return results;
}

/**
 * 送りがな問題を生成
 * @param grade - 対象学年
 * @param count - 生成する問題数
 * @param random - ランダム出題するか
 * @returns 生成された問題配列
 */
export function generateOkuriganaQuestions(
  grade: Grade,
  count: number,
  random: boolean,
): Question[] {
  const kanjiPool = getKanjiByGrade([grade]);
  const okuriganaData = getKanjiWithOkurigana(kanjiPool);

  if (okuriganaData.length === 0) {
    return [];
  }

  const questions: Question[] = [];
  const orderedPool = random ? shuffleArray(okuriganaData) : okuriganaData;

  let poolIndex = 0;
  while (questions.length < count) {
    const { kanji, example } = orderedPool[poolIndex % orderedPool.length];

    questions.push({
      kanji,
      reading: example.reading,
      okuriganaQuestion: {
        stem: example.stem,
        answer: example.okurigana,
        fullWord: example.word,
        hint: example.reading,
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
 * 送りがな問題を生成可能かチェック
 * @param grade - 対象学年
 * @returns 送りがなデータを持つ漢字が存在するか
 */
export function canGenerateOkuriganaQuestions(grade: Grade): boolean {
  const kanjiPool = getKanjiByGrade([grade]);
  const okuriganaData = getKanjiWithOkurigana(kanjiPool);
  return okuriganaData.length > 0;
}
