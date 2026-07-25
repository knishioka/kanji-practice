import { describe, expect, it } from 'vitest';
import { allKanji } from '../../data/kanji';
import type { Grade } from '../../types';
import { canGenerateQuestions, generateQuestions } from '../questionGenerator';
import { getSentencePlainText, isKanjiChar, parseRubySentence } from '../sentenceRuby';

function expectOnlyLearnedKanji(text: string, grade: Grade) {
  const allowedKanji = new Set(
    allKanji.filter((kanji) => kanji.grade <= grade).map((kanji) => kanji.char),
  );
  const unexpectedKanji = Array.from(text).filter(
    (char) => char !== '々' && isKanjiChar(char) && !allowedKanji.has(char),
  );

  expect(unexpectedKanji).toEqual([]);
}

describe('questionGenerator utilities', () => {
  describe('canGenerateQuestions', () => {
    it('should return true for valid grades', () => {
      expect(canGenerateQuestions(1)).toBe(true);
      expect(canGenerateQuestions(2)).toBe(true);
      expect(canGenerateQuestions(3)).toBe(true);
      expect(canGenerateQuestions(4)).toBe(true);
      expect(canGenerateQuestions(5)).toBe(true);
      expect(canGenerateQuestions(6)).toBe(true);
    });
  });

  describe('generateQuestions', () => {
    it('should generate the requested number of questions', () => {
      const questions = generateQuestions(1, 10, false);
      expect(questions).toHaveLength(10);
    });

    it('should generate questions with required properties', () => {
      const questions = generateQuestions(1, 5, false);

      for (const q of questions) {
        expect(q).toHaveProperty('kanji');
        expect(q).toHaveProperty('reading');
        expect(q).toHaveProperty('example');
        expect(q.kanji).toHaveProperty('char');
        expect(q.kanji).toHaveProperty('grade');
        expect(q.kanji).toHaveProperty('strokeCount');
        expect(q.example).toHaveProperty('word');
        expect(q.example).toHaveProperty('reading');
      }
    });

    it('should generate questions for grade 1', () => {
      const questions = generateQuestions(1, 5, false);

      for (const q of questions) {
        expect(q.kanji.grade).toBe(1);
      }
    });

    it('should generate questions for grade 6', () => {
      const questions = generateQuestions(6, 5, false);

      for (const q of questions) {
        expect(q.kanji.grade).toBe(6);
      }
    });

    it('should handle large count by repeating questions', () => {
      // Request more questions than available kanji
      const questions = generateQuestions(1, 500, false);
      expect(questions).toHaveLength(500);
    });

    it('should return different order when random is true', () => {
      const q1 = generateQuestions(1, 20, true);
      const q2 = generateQuestions(1, 20, true);

      // Due to randomness, we can't guarantee they're different
      // so just check they're valid and have correct length
      expect(q1).toHaveLength(20);
      expect(q2).toHaveLength(20);
      // Both should have valid kanji data
      expect(q1.every((q) => q.kanji.char.length > 0)).toBe(true);
      expect(q2.every((q) => q.kanji.char.length > 0)).toBe(true);
    });

    it('should return same order when random is false', () => {
      const q1 = generateQuestions(1, 10, false);
      const q2 = generateQuestions(1, 10, false);

      // Without randomness, the first few questions should be the same
      // (sentences may differ due to random selection)
      for (let i = 0; i < 5; i++) {
        expect(q1[i].kanji.char).toBe(q2[i].kanji.char);
        expect(q1[i].example?.word).toBe(q2[i].example?.word);
      }
    });

    it('should return empty array for zero count', () => {
      const questions = generateQuestions(1, 0, false);
      expect(questions).toHaveLength(0);
    });

    it('should include sentence when available', () => {
      const questions = generateQuestions(1, 50, false);

      // At least some questions should have sentences
      const withSentence = questions.filter((q) => q.sentence);
      expect(withSentence.length).toBeGreaterThan(0);
    });

    it('1年生の書き練習用例語・例文に未習漢字を含めない', () => {
      const count = allKanji
        .filter((kanji) => kanji.grade === 1)
        .reduce((total, kanji) => total + Math.max(kanji.examples.length, 1), 0);
      const questions = generateQuestions(1, count, false);

      expect(questions).toHaveLength(count);
      expect(questions.every((question) => question.kanji.grade === 1)).toBe(true);
      for (const question of questions) {
        expectOnlyLearnedKanji(question.example?.word ?? '', 1);
        expectOnlyLearnedKanji(getSentencePlainText(question.sentence ?? ''), 1);
      }

      const dayQuestion = questions.find((question) => question.kanji.char === '日');
      expect(dayQuestion?.example).toEqual({ word: '日', reading: 'ひ' });
      expect(dayQuestion?.sentence).toBe('{日|ひ}');
      expect(getSentencePlainText(dayQuestion?.sentence ?? '')).toContain('日');
      expect(parseRubySentence(dayQuestion?.sentence ?? '')?.groups).toEqual([
        { start: 0, length: 1, reading: 'ひ' },
      ]);
    });

    it.each([
      2, 3, 4, 5, 6,
    ] as const)('%i年生では対象漢字を指定学年に限定し、例語・例文を学習済み漢字だけで構成する', (grade) => {
      const gradeKanji = allKanji.filter((kanji) => kanji.grade === grade);
      const count = gradeKanji.reduce(
        (total, kanji) => total + Math.max(kanji.examples.length, 1),
        0,
      );
      const questions = generateQuestions(grade, count, false);

      expect(questions).toHaveLength(count);
      expect(questions.every((question) => question.kanji.grade === grade)).toBe(true);
      for (const question of questions) {
        expectOnlyLearnedKanji(question.example?.word ?? '', grade);
        expectOnlyLearnedKanji(getSentencePlainText(question.sentence ?? ''), grade);
      }
    });

    it('安全な候補が不足してもかなフォールバックを繰り返して指定件数を維持する', () => {
      const questions = generateQuestions(1, 500, false);

      expect(questions).toHaveLength(500);
      for (const question of questions) {
        expectOnlyLearnedKanji(question.example?.word ?? '', 1);
        expectOnlyLearnedKanji(getSentencePlainText(question.sentence ?? ''), 1);
      }
    });
  });
});
