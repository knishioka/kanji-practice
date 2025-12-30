/**
 * 同音異字問題生成ユーティリティ
 * 同じ読みで異なる漢字を区別する問題を生成
 */

import { getKanjiByGrade } from '../data/kanji';
import type { Grade, Kanji, Question } from '../types';

/**
 * 同音異字のグループ
 */
interface HomophoneGroup {
  reading: string;
  kanji: { char: string; context: string }[];
}

/**
 * 漢字プールから同音異字インデックスを構築
 * 読みごとに漢字をグループ化
 */
export function buildHomophoneIndex(
  kanjiPool: Kanji[],
): Map<string, { char: string; context: string }[]> {
  const index = new Map<string, { char: string; context: string }[]>();

  for (const kanji of kanjiPool) {
    // 音読みをインデックスに追加
    for (const onReading of kanji.readings.on) {
      // 例文から文脈を取得
      const context = kanji.sentences[0] || kanji.examples[0]?.word || kanji.char;

      if (!index.has(onReading)) {
        index.set(onReading, []);
      }
      index.get(onReading)!.push({ char: kanji.char, context });
    }

    // 訓読みもインデックスに追加（送りがなを除去した形で）
    for (const kunReading of kanji.readings.kun) {
      // 送りがな（.以降）を除去
      const baseReading = kunReading.split('.')[0] || kunReading;
      const context = kanji.sentences[0] || kanji.examples[0]?.word || kanji.char;

      if (!index.has(baseReading)) {
        index.set(baseReading, []);
      }
      // 重複を避ける
      const existing = index.get(baseReading)!;
      if (!existing.some((item) => item.char === kanji.char)) {
        existing.push({ char: kanji.char, context });
      }
    }
  }

  return index;
}

/**
 * 同音異字グループを抽出（2つ以上の漢字がある読みのみ）
 * A4レイアウトに収めるため、最大3つの漢字に制限
 */
const MAX_OPTIONS_PER_QUESTION = 3;

export function extractHomophoneGroups(
  index: Map<string, { char: string; context: string }[]>,
): HomophoneGroup[] {
  const groups: HomophoneGroup[] = [];

  for (const [reading, kanjiList] of index) {
    if (kanjiList.length >= 2) {
      // 最大3つに制限（A4レイアウトに収めるため）
      const limitedKanji = kanjiList.slice(0, MAX_OPTIONS_PER_QUESTION);
      groups.push({ reading, kanji: limitedKanji });
    }
  }

  return groups;
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
 * 同音異字問題を生成
 * @param grade - 対象学年
 * @param count - 生成する問題数
 * @param random - ランダム出題するか
 * @returns 生成された問題配列
 */
export function generateHomophoneQuestions(
  grade: Grade,
  count: number,
  random: boolean,
): Question[] {
  const kanjiPool = getKanjiByGrade([grade]);

  if (kanjiPool.length === 0) {
    return [];
  }

  const index = buildHomophoneIndex(kanjiPool);
  const groups = extractHomophoneGroups(index);

  if (groups.length === 0) {
    return [];
  }

  // 各グループから問題を生成
  const questions: Question[] = [];
  const orderedGroups = random ? shuffleArray(groups) : groups;

  let groupIndex = 0;
  while (questions.length < count && groups.length > 0) {
    const group = orderedGroups[groupIndex % orderedGroups.length];

    // グループの最初の漢字を正解として使用
    const targetKanji = kanjiPool.find((k) => k.char === group.kanji[0].char);

    if (targetKanji) {
      // char を kanji にマッピング
      const options = (random ? shuffleArray(group.kanji) : group.kanji).map((opt) => ({
        kanji: opt.char,
        context: opt.context,
      }));

      questions.push({
        kanji: targetKanji,
        reading: group.reading,
        homophoneQuestion: {
          reading: group.reading,
          options,
        },
      });
    }

    groupIndex++;

    // 全グループを使い切ったらシャッフルして再利用
    if (groupIndex >= orderedGroups.length && questions.length < count) {
      groupIndex = 0;
      if (random) {
        // 再シャッフル
        const reshuffled = shuffleArray(orderedGroups);
        orderedGroups.splice(0, orderedGroups.length, ...reshuffled);
      }
    }
  }

  return questions.slice(0, count);
}

/**
 * 同音異字問題を生成可能かチェック
 * @param grade - 対象学年
 * @returns 2つ以上の漢字を持つ同音グループが存在するか
 */
export function canGenerateHomophoneQuestions(grade: Grade): boolean {
  const kanjiPool = getKanjiByGrade([grade]);
  if (kanjiPool.length === 0) {
    return false;
  }

  const index = buildHomophoneIndex(kanjiPool);
  const groups = extractHomophoneGroups(index);

  return groups.length > 0;
}
