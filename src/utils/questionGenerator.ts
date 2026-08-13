/**
 * 問題生成ユーティリティ
 * 漢字問題の生成ロジックを集約
 */

import { allKanji, getKanjiByGradeFiltered } from '../data/kanji';
import type { Grade, Kanji, Question } from '../types';
import { getSentencePlainText, isKanjiChar } from './sentenceRuby';

/**
 * 問題候補の型
 */
interface QuestionCandidate {
  kanji: Kanji;
  example: { word: string; reading: string };
  sentence?: string;
}

const HIRAGANA_READING_PATTERN = /^[\u3041-\u3096\u30FC]+$/;
const RUBY_ANNOTATION_PATTERN = /\{([^|{}]+)\|([^|{}]+)\}/g;
const SINGLE_RUBY_NOUN_PATTERN = /^\{[^|{}]+\|[^|{}]+\}。$/;

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
  const standaloneExample = kanji.examples.find((example) => example.word === kanji.char);
  const standaloneReading = standaloneExample
    ? normalizeReadingForRuby(standaloneExample.reading)
    : undefined;
  if (standaloneReading) return standaloneReading;

  // 単独の漢字に送り仮名込みの訓読みを付けると表示と読みが一致しないため、
  // まず単独でも成立する音読みを優先する。
  for (const reading of [...kanji.readings.on, ...kanji.readings.kun]) {
    const normalized = normalizeReadingForRuby(reading);
    if (normalized) return normalized;
  }

  return undefined;
}

/**
 * 熟語ルビの先頭または末尾にある対象漢字を残し、残りを読みに置き換える。
 * 例: `{日曜日|にちようび}` → `{日|にち}ようび`
 */
function preserveTargetKanjiInRuby(
  annotation: string,
  annotatedWord: string,
  reading: string,
  kanji: Kanji,
): string | undefined {
  const wordChars = Array.from(annotatedWord);
  const normalizedReadings = [
    ...kanji.examples
      .filter((example) => example.word === kanji.char)
      .map((example) => normalizeReadingForRuby(example.reading)),
    ...[...kanji.readings.on, ...kanji.readings.kun].map(normalizeReadingForRuby),
  ]
    .filter((candidate): candidate is string => candidate !== undefined)
    .filter((candidate, index, candidates) => candidates.indexOf(candidate) === index)
    .sort((a, b) => b.length - a.length);

  if (wordChars[0] === kanji.char) {
    const targetReading = normalizedReadings.find((candidate) => reading.startsWith(candidate));
    if (targetReading)
      return `{${kanji.char}|${targetReading}}${reading.slice(targetReading.length)}`;
  }

  if (wordChars[wordChars.length - 1] === kanji.char) {
    const targetReading = normalizedReadings.find((candidate) => reading.endsWith(candidate));
    if (targetReading) {
      return `${reading.slice(0, -targetReading.length)}{${kanji.char}|${targetReading}}`;
    }
  }

  return annotation === `{${kanji.char}|${reading}}` ? annotation : undefined;
}

/**
 * 安全な例語がない場合も書き練習の対象漢字を残せるよう、
 * 対象漢字単体とかなの読みへフォールバックする。
 */
function createFallbackExample(kanji: Kanji): QuestionCandidate['example'] {
  return { word: kanji.char, reading: getFallbackReading(kanji) ?? '' };
}

/**
 * 未習漢字を含むルビをひらがなに置き換え、元の自然な例文を活用する。
 * 対象漢字と未習漢字が同じルビグループの場合は、対象漢字まで消えるため採用しない。
 */
function createGradeAppropriateSentence(
  sentence: string,
  kanji: Kanji,
  allowedKanji: Set<string>,
): string | undefined {
  let losesTargetKanji = false;
  let splitsTargetRuby = false;
  let simplified = sentence.replace(
    RUBY_ANNOTATION_PATTERN,
    (annotation, annotatedWord: string, reading: string) => {
      if (containsOnlyAllowedKanji(annotatedWord, allowedKanji)) return annotation;
      if (annotatedWord.includes(kanji.char)) {
        const preserved = preserveTargetKanjiInRuby(annotation, annotatedWord, reading, kanji);
        if (preserved) {
          splitsTargetRuby ||= preserved !== annotation;
          return preserved;
        }
        losesTargetKanji = true;
        return annotation;
      }
      return reading;
    },
  );

  if (losesTargetKanji) return undefined;
  if (splitsTargetRuby && SINGLE_RUBY_NOUN_PATTERN.test(sentence)) {
    simplified = `${simplified.slice(0, -1)}がある。`;
  } else if (splitsTargetRuby && sentence.endsWith('}。')) {
    // 熟語を分割した結果が名詞句の断片になる場合は、別の完結した例文を優先する。
    return undefined;
  }

  const plainText = getSentencePlainText(simplified);
  if (!plainText.includes(kanji.char) || !containsOnlyAllowedKanji(plainText, allowedKanji)) {
    return undefined;
  }

  return simplified;
}

/**
 * 利用できる例文がない場合も、1文字だけではなく完結した書写文を生成する。
 */
function createFallbackSentence(kanji: Kanji): string {
  const reading = getFallbackReading(kanji);
  const annotatedKanji = reading ? `{${kanji.char}|${reading}}` : kanji.char;
  return `「${annotatedKanji}」の{字|じ}をかく。`;
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
    const safeSentences = kanji.sentences
      .map((sentence) => createGradeAppropriateSentence(sentence, kanji, allowedKanji))
      .filter((sentence): sentence is string => sentence !== undefined);

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
