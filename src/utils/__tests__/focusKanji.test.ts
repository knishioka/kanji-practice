import { describe, expect, it } from 'vitest';
import { allKanji } from '../../data/kanji';
import { generateAntonymQuestions } from '../antonymQuestionGenerator';
import { generateHomophoneQuestions } from '../homophoneQuestionGenerator';
import { generateOkuriganaQuestions } from '../okuriganaQuestionGenerator';
import {
  canGenerateQuestions,
  generateQuestions,
  getEffectiveExcludedChars,
} from '../questionGenerator';
import { generateRadicalQuestions } from '../radicalQuestionGenerator';

describe('重点漢字の出題対象', () => {
  it('未選択は従来と同じ学年の全漢字を対象にする', () => {
    expect(getEffectiveExcludedChars(1, ['一'], [])).toEqual(['一']);
    const questions = generateQuestions(1, 1000, false, [], []);
    expect(new Set(questions.map((q) => q.kanji.char))).toEqual(
      new Set(allKanji.filter((k) => k.grade === 1).map((k) => k.char)),
    );
  });

  it.each([false, true])('指定漢字だけを繰り返し出題し除外を優先する random=%s', (random) => {
    const questions = generateQuestions(1, 30, random, ['一'], ['一', '二', '海']);
    expect(questions).toHaveLength(30);
    expect(questions.every((q) => q.kanji.char === '二' && q.kanji.grade === 1)).toBe(true);
    expect(canGenerateQuestions(1, ['一'], ['一'])).toBe(false);
    expect(generateQuestions(1, 30, random, ['一'], ['一'])).toEqual([]);
    expect(canGenerateQuestions(1, [], ['海'])).toBe(false);
  });

  it.each([
    ['同音異字', generateHomophoneQuestions],
    ['部首', generateRadicalQuestions],
    ['送りがな', generateOkuriganaQuestions],
    ['対義語', generateAntonymQuestions],
  ] as const)('%s も同じ絞り込みを使い空集合を扱える', (_mode, generate) => {
    const baseline = generate(2, 10, false);
    expect(baseline.length).toBeGreaterThan(0);
    const focus = [
      ...new Set(
        baseline.flatMap((q) => [
          q.kanji.char,
          ...(q.homophoneQuestion?.options.map((o) => o.kanji) ?? []),
          ...(q.antonymQuestion
            ? [q.antonymQuestion.sourceKanji, q.antonymQuestion.answerKanji]
            : []),
        ]),
      ),
    ];
    const questions = generate(2, 20, false, getEffectiveExcludedChars(2, [], focus));
    expect(questions).toHaveLength(20);
    expect(questions.every((q) => focus.includes(q.kanji.char))).toBe(true);
    expect(generate(2, 20, true, getEffectiveExcludedChars(2, focus, focus))).toEqual([]);
  });
});
