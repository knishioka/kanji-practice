/**
 * 問題生成ユーティリティ
 * 漢字問題の生成ロジックを集約
 */

import { allKanji, getKanjiByGradeFiltered } from '../data/kanji';
import type { Grade, Kanji, Question } from '../types';
import { isKanjiChar } from './sentenceRuby';

/**
 * 問題候補の型
 */
interface QuestionCandidate {
  kanji: Kanji;
  example: { word: string; reading: string };
  sentence?: string;
}

const HIRAGANA_READING_PATTERN = /^[\u3041-\u3096\u30FC]+$/;

/**
 * 指定学年までに学習済みの漢字セットを生成
 */
function createAllowedKanjiSet(grade: Grade): Set<string> {
  return new Set(allKanji.filter((kanji) => kanji.grade <= grade).map((kanji) => kanji.char));
}

/**
 * テキスト内の漢字がすべて学習済みか判定
 *
 * 々は漢字ではなく繰り返し記号のため、学年別漢字セットに含まれていなくても許可する。
 */
function containsOnlyAllowedKanji(text: string, allowedKanji: Set<string>): boolean {
  return Array.from(text).every(
    (char) => char === '々' || !isKanjiChar(char) || allowedKanji.has(char),
  );
}

/**
 * ルビパーサーで扱えるひらがな表記へ正規化する。
 */
function normalizeReadingForRuby(reading: string): string | undefined {
  const normalized = Array.from(reading)
    .map((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code >= 0x30a1 && code <= 0x30f6 ? String.fromCodePoint(code - 0x60) : char;
    })
    .join('');

  return HIRAGANA_READING_PATTERN.test(normalized) ? normalized : undefined;
}

/**
 * 熟語全体の読みを流用せず、対象漢字自身の読みから安全な読みを選ぶ。
 */
function getFallbackReading(kanji: Kanji): string | undefined {
  for (const reading of [...kanji.readings.kun, ...kanji.readings.on]) {
    const normalized = normalizeReadingForRuby(reading);
    if (normalized) return normalized;
  }

  return undefined;
}

/**
 * 安全な例語がない場合も書き練習の対象漢字を残せるよう、
 * 対象漢字単体とかなの読みへフォールバックする。
 */
function createFallbackExample(kanji: Kanji): QuestionCandidate['example'] {
  return { word: kanji.char, reading: getFallbackReading(kanji) ?? '' };
}

/**
 * 例文候補がない場合も例文写経で対象漢字を表示できるよう、
 * 対象漢字単体のルビ表記へフォールバックする。
 */
function createFallbackSentence(kanji: Kanji): string {
  const reading = getFallbackReading(kanji);
  return reading ? `{${kanji.char}|${reading}}` : kanji.char;
}

/**
 * 漢字プールから問題候補を生成
 * 各漢字の例語ごとに問題候補を作成（同じ漢字でも異なる読みの問題を生成可能）
 */
function createQuestionPool(kanjiPool: Kanji[], allowedKanji: Set<string>): QuestionCandidate[] {
  const pool: QuestionCandidate[] = [];

  for (const kanji of kanjiPool) {
    const safeExamples = kanji.examples.filter((example) =>
      containsOnlyAllowedKanji(example.word, allowedKanji),
    );
    const examples = safeExamples.length > 0 ? safeExamples : [createFallbackExample(kanji)];
    const safeSentences = kanji.sentences.filter((sentence) =>
      containsOnlyAllowedKanji(sentence, allowedKanji),
    );

    for (const example of examples) {
      // 例文がある場合はランダムに1つ選択
      const sentence =
        safeSentences.length > 0
          ? safeSentences[Math.floor(Math.random() * safeSentences.length)]
          : createFallbackSentence(kanji);
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
 * @param excludedChars - 除外する漢字の配列
 * @returns 生成された問題配列
 */
export function generateQuestions(
  grade: Grade,
  count: number,
  random: boolean,
  excludedChars: string[] = [],
): Question[] {
  const kanjiPool = getKanjiByGradeFiltered([grade], excludedChars);

  if (kanjiPool.length === 0) {
    return [];
  }

  const allowedKanji = createAllowedKanjiSet(grade);
  const questionPool = createQuestionPool(kanjiPool, allowedKanji);
  const selected = selectCandidates(questionPool, count, random);

  return candidatesToQuestions(selected);
}

/**
 * 問題生成可能かチェック
 * @param grade - 対象学年
 * @param excludedChars - 除外する漢字の配列
 * @returns 漢字データが存在するか
 */
export function canGenerateQuestions(grade: Grade, excludedChars: string[] = []): boolean {
  const kanjiPool = getKanjiByGradeFiltered([grade], excludedChars);
  return kanjiPool.length > 0;
}
