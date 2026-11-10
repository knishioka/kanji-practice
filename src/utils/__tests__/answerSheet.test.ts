import { describe, expect, it, vi } from 'vitest';
import type { PrintMode, Question } from '../../types';
import { generateAnswerRows, supportsAnswerSheet } from '../answerSheet';

const question: Question = {
  kanji: {
    char: '生',
    grade: 1,
    readings: { on: ['セイ', 'ショウ'], kun: ['い.きる', 'う.まれる'] },
    strokeCount: 5,
    examples: [{ word: '生活', reading: 'せいかつ' }],
    sentences: [],
  },
  reading: 'せいかつ',
  example: { word: '生活', reading: 'せいかつ' },
};

describe('answerSheet', () => {
  it.each<PrintMode>([
    'reading',
    'strokeCount',
    'radical',
    'okurigana',
    'homophone',
    'antonym',
  ])('supports %s', (mode) => expect(supportsAnswerSheet(mode)).toBe(true));

  it.each<PrintMode>([
    'writing',
    'sentence',
    'strokeOrder',
    'readingWriting',
  ])('does not generate answers for %s', (mode) => {
    expect(supportsAnswerSheet(mode)).toBe(false);
    expect(generateAnswerRows([question], mode, 2)).toEqual([]);
  });

  it('uses the selected reading and preserves repeated kanji, ordering, and page numbers', () => {
    const questions: Question[] = [
      question,
      { ...question, reading: 'うまれる', example: { word: '生まれる', reading: 'うまれる' } },
      { ...question, reading: 'なま', example: undefined },
    ];
    expect(generateAnswerRows(questions, 'reading', 2)).toEqual([
      { questionNumber: 1, questionPage: 1, prompt: '生活', answer: 'せいかつ' },
      { questionNumber: 2, questionPage: 1, prompt: '生まれる', answer: 'うまれる' },
      { questionNumber: 3, questionPage: 2, prompt: '生', answer: 'なま' },
    ]);
  });

  it('uses question.reading without inferring another reading from example or kanji data', () => {
    expect(generateAnswerRows([{ ...question, reading: 'しょう' }], 'reading', 10)[0].answer).toBe(
      'しょう',
    );
  });

  it('returns the stroke count from the question kanji', () => {
    expect(generateAnswerRows([question], 'strokeCount', 10)[0]).toMatchObject({
      prompt: '生',
      answer: '5画',
    });
  });

  it('includes both the radical and its name from the question payload', () => {
    const radical: Question = {
      ...question,
      radicalQuestion: { targetKanji: '海', answerRadical: '氵', answerRadicalName: 'さんずい' },
    };
    expect(generateAnswerRows([radical], 'radical', 10)[0]).toMatchObject({
      prompt: '海',
      answer: '氵（さんずい）',
    });
  });

  it('returns the completed word for okurigana', () => {
    const okurigana: Question = {
      ...question,
      okuriganaQuestion: { stem: '生', answer: 'まれる', fullWord: '生まれる' },
    };
    expect(generateAnswerRows([okurigana], 'okurigana', 10)[0]).toMatchObject({
      prompt: '生',
      answer: '生まれる',
    });
  });

  it('includes every numbered homophone subanswer in the original option order', () => {
    const homophone: Question = {
      ...question,
      homophoneQuestion: {
        reading: 'こう',
        options: [
          { kanji: '校', context: '学校' },
          { kanji: '工', context: '工場' },
          { kanji: '口', context: '人口' },
        ],
      },
    };
    expect(generateAnswerRows([homophone], 'homophone', 10)[0]).toMatchObject({
      prompt: 'こう',
      answer: '1) 校　2) 工　3) 口',
    });
  });

  it.each([
    ['antonym', '対義語'],
    ['synonym', '類義語'],
  ] as const)('includes the %s type label and answer', (type, label) => {
    const antonym: Question = {
      ...question,
      antonymQuestion: { type, sourceKanji: '大', answerKanji: '小' },
    };
    expect(generateAnswerRows([antonym], 'antonym', 10)[0]).toMatchObject({
      prompt: '大',
      answer: `${label}: 小`,
    });
  });

  it.each<PrintMode>([
    'radical',
    'okurigana',
    'homophone',
    'antonym',
  ])('preserves missing %s payload positions with a placeholder', (mode) => {
    const rows = generateAnswerRows([question, question, question], mode, 2);
    expect(
      rows.map(({ questionNumber, questionPage, answer }) => ({
        questionNumber,
        questionPage,
        answer,
      })),
    ).toEqual([
      { questionNumber: 1, questionPage: 1, answer: '—' },
      { questionNumber: 2, questionPage: 1, answer: '—' },
      { questionNumber: 3, questionPage: 2, answer: '—' },
    ]);
  });

  it('retains the question and page numbers after a missing optional payload', () => {
    const radical: Question = {
      ...question,
      radicalQuestion: { targetKanji: '海', answerRadical: '氵', answerRadicalName: 'さんずい' },
    };
    expect(generateAnswerRows([radical, question, radical], 'radical', 2)[2]).toEqual({
      questionNumber: 3,
      questionPage: 2,
      prompt: '海',
      answer: '氵（さんずい）',
    });
  });

  it('does not mutate questions or invoke randomness', () => {
    const questions = structuredClone([question, question]);
    const original = structuredClone(questions);
    const random = vi.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Answer sheets must not regenerate questions');
    });
    try {
      expect(generateAnswerRows(questions, 'reading', 1)).toHaveLength(2);
      expect(questions).toEqual(original);
      expect(random).not.toHaveBeenCalled();
    } finally {
      random.mockRestore();
    }
  });

  it('returns no rows for an empty question list', () => {
    expect(generateAnswerRows([], 'reading', 10)).toEqual([]);
  });
});
