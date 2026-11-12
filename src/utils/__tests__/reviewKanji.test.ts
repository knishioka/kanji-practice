import { describe, expect, it } from 'vitest';
import type { Grade, PracticeHistoryEntry, ReviewRatio, Settings } from '../../types';
import { MAX_PRACTICE_HISTORY } from '../practiceHistory';
import { generateQuestions } from '../questionGenerator';
import { selectReviewKanji, supportsReview } from '../reviewKanji';

const settings: Settings = {
  grade: 1,
  mode: 'writing',
  pageCount: 1,
  random: true,
  reviewEnabled: false,
  reviewRatio: 20,
  gridStyle: 'cross',
  cellSize: 15,
  practiceColumns: 6,
  sentencePracticeRows: 2,
  showHint: false,
  showAnswerSheet: false,
  title: '練習',
  showNameField: true,
  showDateField: true,
  nameLabel: 'なまえ',
  dateLabel: 'ひづけ',
};

function entry(kanjiChars: string[], grade: Grade = 1): PracticeHistoryEntry {
  return {
    id: `history-${grade}`,
    executedAt: '2026-01-01T00:00:00Z',
    grade,
    mode: 'writing',
    pageCount: 1,
    questionCount: kanjiChars.length,
    kanjiChars,
    settings: { ...settings, grade },
  };
}

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

describe('review selection', () => {
  const chars = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

  it.each<[number, ReviewRatio, number]>([
    [10, 10, 1],
    [10, 20, 2],
    [10, 30, 3],
    [7, 20, 1],
    [5, 10, 1],
    [1, 20, 0],
    [0, 30, 0],
  ])('reserves the rounded ratio count=%s ratio=%s', (count, ratio, expected) => {
    expect(
      selectReviewKanji(1, count, ratio, [entry(chars)], chars, seededRandom(49)),
    ).toHaveLength(expected);
  });

  it('is reproducible with a seed and does not mutate inputs', () => {
    const history = [entry([...chars])];
    const before = structuredClone(history);
    const first = selectReviewKanji(1, 20, 30, history, chars, seededRandom(49));
    expect(selectReviewKanji(1, 20, 30, history, chars, seededRandom(49))).toEqual(first);
    expect(selectReviewKanji(1, 20, 30, history, chars, seededRandom(50))).not.toEqual(first);
    expect(history).toEqual(before);
  });

  it('uses only distinct eligible characters from same-grade recent history', () => {
    const history = [entry(['一', '一', '二', '海']), entry(['三'], 2), entry(['二', '四'])];
    expect(
      new Set(selectReviewKanji(1, 100, 30, history, ['一', '二', '三'], seededRandom(1))),
    ).toEqual(new Set(['一', '二']));
    expect(
      selectReviewKanji(
        1,
        100,
        30,
        [...Array.from({ length: MAX_PRACTICE_HISTORY }, () => entry([])), entry(['一'])],
        chars,
      ),
    ).toEqual([]);
  });

  it('returns the available subset or an empty selection without errors', () => {
    expect(selectReviewKanji(1, 20, 30, [], chars)).toEqual([]);
    expect(selectReviewKanji(1, 20, 30, [entry([])], chars)).toEqual([]);
    expect(selectReviewKanji(1, 20, 30, [entry(['一'])], [])).toEqual([]);
    expect(selectReviewKanji(1, 20, 30, [entry(['一'])], chars)).toEqual(['一']);
  });

  it('supports exactly the six modes using the ordinary generator', () => {
    for (const mode of [
      'reading',
      'writing',
      'sentence',
      'strokeCount',
      'strokeOrder',
      'readingWriting',
    ] as const) {
      expect(supportsReview(mode)).toBe(true);
    }
    for (const mode of ['homophone', 'radical', 'okurigana', 'antonym'] as const) {
      expect(supportsReview(mode)).toBe(false);
    }
  });
});

describe('review question generation', () => {
  it.each([false, true])('prioritizes eligible review characters random=%s', (random) => {
    const questions = generateQuestions(1, 10, random, ['一'], ['一', '二', '三'], {
      ratio: 20,
      history: [entry(['一', '二', '三', '四', '海'])],
      rng: seededRandom(49),
    });
    expect(questions).toHaveLength(10);
    expect(new Set(questions.slice(0, 2).map((q) => q.kanji.char))).toEqual(new Set(['二', '三']));
    expect(questions.every((q) => ['二', '三'].includes(q.kanji.char))).toBe(true);
  });

  it('fills shortages using ordinary questions and preserves the requested total', () => {
    const questions = generateQuestions(1, 20, false, [], [], {
      ratio: 30,
      history: [entry(['森'])],
    });
    expect(questions).toHaveLength(20);
    expect(questions[0].kanji.char).toBe('森');
    expect(questions.slice(1).map((q) => q.kanji.char)).toEqual(
      generateQuestions(1, 19, false).map((q) => q.kanji.char),
    );
  });

  it.each([
    { history: [] },
    { history: [entry([])] },
    { history: [entry(['海'], 2)] },
  ])('falls back to ordinary generation for an empty matching pool', ({ history }) => {
    const questions = generateQuestions(1, 10, false, [], [], { ratio: 20, history });
    expect(questions.map((q) => q.kanji.char)).toEqual(
      generateQuestions(1, 10, false).map((q) => q.kanji.char),
    );
  });

  it('returns no questions when every focused kanji is excluded', () => {
    expect(
      generateQuestions(1, 10, false, ['一'], ['一'], { ratio: 20, history: [entry(['一'])] }),
    ).toEqual([]);
  });
});
