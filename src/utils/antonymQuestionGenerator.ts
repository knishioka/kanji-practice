/**
 * 対義語・類義語問題生成ユーティリティ
 * 漢字の対義語または類義語を答える問題を生成
 */

import { getKanjiByGradeFiltered } from '../data/kanji';
import type { Grade, Kanji, Question } from '../types';

interface AntonymPair {
  source: Kanji;
  target: Kanji;
  type: 'antonym' | 'synonym';
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
 * 指定学年の漢字から対義語・類義語ペアを抽出
 */
function extractPairs(kanjiPool: Kanji[]): AntonymPair[] {
  const pairs: AntonymPair[] = [];
  const charToKanji = new Map(kanjiPool.map((k) => [k.char, k]));

  for (const kanji of kanjiPool) {
    // 対義語
    if (kanji.antonyms) {
      for (const ant of kanji.antonyms) {
        const targetKanji = charToKanji.get(ant);
        // 学年範囲内の漢字のみ
        if (targetKanji) {
          pairs.push({
            source: kanji,
            target: targetKanji,
            type: 'antonym',
          });
        }
      }
    }
    // 類義語
    if (kanji.synonyms) {
      for (const syn of kanji.synonyms) {
        const targetKanji = charToKanji.get(syn);
        if (targetKanji) {
          pairs.push({
            source: kanji,
            target: targetKanji,
            type: 'synonym',
          });
        }
      }
    }
  }

  return pairs;
}

/**
 * 対義語・類義語問題を生成
 * @param grade - 対象学年
 * @param count - 生成する問題数
 * @param random - ランダム出題するか
 * @param excludedChars - 除外する漢字の配列
 * @param questionType - 出題タイプ（対義語/類義語/混合）
 * @returns 生成された問題配列
 */
export function generateAntonymQuestions(
  grade: Grade,
  count: number,
  random: boolean,
  excludedChars: string[] = [],
  questionType: 'antonym' | 'synonym' | 'mixed' = 'mixed',
): Question[] {
  // 学年に応じた漢字プールを取得
  const kanjiPool = getKanjiByGradeFiltered([grade], excludedChars);

  // ペアを抽出
  let pairs = extractPairs(kanjiPool);

  // 問題タイプでフィルタ
  if (questionType !== 'mixed') {
    pairs = pairs.filter((p) => p.type === questionType);
  }

  if (pairs.length === 0) {
    return [];
  }

  // シャッフルまたは順番に選択
  const orderedPairs = random ? shuffleArray(pairs) : pairs;

  // 使用済みペアを追跡（方向を区別：遠→近 と 近→遠 は別の問題）
  const usedDirectionalPairs = new Set<string>();
  const questions: Question[] = [];

  let cycleCount = 0;
  let pairIndex = 0;

  while (questions.length < count) {
    const pair = orderedPairs[pairIndex];
    const key = `${pair.source.char}-${pair.target.char}`;

    // 同じ方向の問題が未使用、または2周目以降なら追加
    if (!usedDirectionalPairs.has(key) || cycleCount > 0) {
      usedDirectionalPairs.add(key);
      questions.push({
        kanji: pair.source,
        reading: pair.source.readings.on[0] || pair.source.readings.kun[0] || '',
        antonymQuestion: {
          type: pair.type,
          sourceKanji: pair.source.char,
          answerKanji: pair.target.char,
        },
      });
    }

    pairIndex++;

    // 1周終了時にリセット
    if (pairIndex >= orderedPairs.length) {
      pairIndex = 0;
      cycleCount++;
      usedDirectionalPairs.clear();
      // ランダムモードなら再シャッフル
      if (random) {
        const reshuffled = shuffleArray(orderedPairs);
        orderedPairs.splice(0, orderedPairs.length, ...reshuffled);
      }
    }

    // 無限ループ防止（10周まで）
    if (cycleCount >= 10) {
      break;
    }
  }

  return questions.slice(0, count);
}

/**
 * 指定学年で対義語・類義語問題を生成できるかチェック
 * @param grade - 対象学年
 * @param excludedChars - 除外する漢字の配列
 * @returns 対義語・類義語データを持つ漢字が存在するか
 */
export function canGenerateAntonymQuestions(grade: Grade, excludedChars: string[] = []): boolean {
  const kanjiPool = getKanjiByGradeFiltered([grade], excludedChars);
  const pairs = extractPairs(kanjiPool);
  return pairs.length > 0;
}
