/**
 * 問題生成ユーティリティ
 * 漢字問題の生成ロジックを集約
 */

import { getKanjiByGrade } from '../data/kanji';
import type { Grade, Kanji, Question } from '../types';

/**
 * 問題候補の型
 */
interface QuestionCandidate {
  kanji: Kanji;
  example: { word: string; reading: string };
  sentence?: string;
}

/**
 * 漢字プールから問題候補を生成
 * 各漢字の例語ごとに問題候補を作成（同じ漢字でも異なる読みの問題を生成可能）
 */
function createQuestionPool(kanjiPool: Kanji[]): QuestionCandidate[] {
  const pool: QuestionCandidate[] = [];

  for (const kanji of kanjiPool) {
    for (const example of kanji.examples) {
      // 例文がある場合はランダムに1つ選択
      const sentence =
        kanji.sentences.length > 0
          ? kanji.sentences[Math.floor(Math.random() * kanji.sentences.length)]
          : undefined;
      pool.push({ kanji, example, sentence });
    }
  }

  return pool;
}

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
 * 問題候補から指定数を選択
 * プールが足りない場合は繰り返し使用
 */
function selectCandidates(
  pool: QuestionCandidate[],
  count: number,
  random: boolean,
): QuestionCandidate[] {
  if (pool.length === 0) return [];

  const selected: QuestionCandidate[] = [];

  if (random) {
    // ランダムにシャッフルして選択（足りなければ繰り返す）
    while (selected.length < count) {
      const shuffled = shuffleArray(pool);
      selected.push(...shuffled);
    }
  } else {
    // 順番に選択（足りなければ繰り返す）
    while (selected.length < count) {
      selected.push(...pool);
    }
  }

  return selected.slice(0, count);
}

/**
 * 問題候補をQuestion型に変換
 */
function candidatesToQuestions(candidates: QuestionCandidate[]): Question[] {
  return candidates.map(({ kanji, example, sentence }) => ({
    kanji,
    reading: example.reading,
    example,
    sentence,
  }));
}

/**
 * 問題を生成
 * @param grade - 対象学年
 * @param count - 生成する問題数
 * @param random - ランダム出題するか
 * @returns 生成された問題配列
 */
export function generateQuestions(grade: Grade, count: number, random: boolean): Question[] {
  const kanjiPool = getKanjiByGrade([grade]);

  if (kanjiPool.length === 0) {
    return [];
  }

  const questionPool = createQuestionPool(kanjiPool);
  const selected = selectCandidates(questionPool, count, random);

  return candidatesToQuestions(selected);
}

/**
 * 問題生成可能かチェック
 * @param grade - 対象学年
 * @returns 漢字データが存在するか
 */
export function canGenerateQuestions(grade: Grade): boolean {
  const kanjiPool = getKanjiByGrade([grade]);
  return kanjiPool.length > 0;
}
