/**
 * 対義語・類義語問題生成ユーティリティ
 * 漢字の対義語または類義語を答える問題を生成
 */

import { getKanjiByGrade } from '../data/kanji';
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
 * @param questionType - 出題タイプ（対義語/類義語/混合）
 * @returns 生成された問題配列
 */
export function generateAntonymQuestions(
  grade: Grade,
  count: number,
  random: boolean,
  questionType: 'antonym' | 'synonym' | 'mixed' = 'mixed',
): Question[] {
  // 学年に応じた漢字プールを取得
  const kanjiPool = getKanjiByGrade([grade]);

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

  // 重複を避けるためのセット（同じペアを両方向から出さない）
  const usedPairs = new Set<string>();
  const questions: Question[] = [];

  let pairIndex = 0;
  while (questions.length < count) {
    const pair = orderedPairs[pairIndex % orderedPairs.length];

    // 双方向の重複チェック（最初の周回のみ）
    const key1 = `${pair.source.char}-${pair.target.char}`;
    const key2 = `${pair.target.char}-${pair.source.char}`;

    if (pairIndex < orderedPairs.length) {
      // 最初の周回では重複を避ける
      if (!usedPairs.has(key1) && !usedPairs.has(key2)) {
        usedPairs.add(key1);
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
    } else {
      // 2周目以降はそのまま追加
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

    // 無限ループ防止
    if (pairIndex > orderedPairs.length * 10) {
      break;
    }
  }

  return questions.slice(0, count);
}

/**
 * 指定学年で対義語・類義語問題を生成できるかチェック
 * @param grade - 対象学年
 * @returns 対義語・類義語データを持つ漢字が存在するか
 */
export function canGenerateAntonymQuestions(grade: Grade): boolean {
  const kanjiPool = getKanjiByGrade([grade]);
  const pairs = extractPairs(kanjiPool);
  return pairs.length > 0;
}
