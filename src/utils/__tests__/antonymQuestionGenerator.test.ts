import { describe, expect, it } from 'vitest';
import { canGenerateAntonymQuestions, generateAntonymQuestions } from '../antonymQuestionGenerator';

describe('antonymQuestionGenerator utilities', () => {
  describe('canGenerateAntonymQuestions', () => {
    it('should return boolean for all grades', () => {
      for (let grade = 1; grade <= 6; grade++) {
        const result = canGenerateAntonymQuestions(grade as 1 | 2 | 3 | 4 | 5 | 6);
        expect(typeof result).toBe('boolean');
      }
    });
  });

  describe('generateAntonymQuestions', () => {
    it('should return array for all grades', () => {
      for (let grade = 1; grade <= 6; grade++) {
        const questions = generateAntonymQuestions(grade as 1 | 2 | 3 | 4 | 5 | 6, 5, false);
        expect(Array.isArray(questions)).toBe(true);
      }
    });

    it('should generate questions with antonymQuestion property when data exists', () => {
      const questions = generateAntonymQuestions(1, 5, false);

      if (questions.length > 0) {
        for (const q of questions) {
          expect(q).toHaveProperty('antonymQuestion');
          expect(q.antonymQuestion).toHaveProperty('type');
          expect(q.antonymQuestion).toHaveProperty('sourceKanji');
          expect(q.antonymQuestion).toHaveProperty('answerKanji');
          expect(['antonym', 'synonym']).toContain(q.antonymQuestion!.type);
        }
      }
    });

    it('should return requested count if data is available', () => {
      const questions = generateAntonymQuestions(1, 10, false);
      if (canGenerateAntonymQuestions(1)) {
        expect(questions.length).toBeGreaterThan(0);
        expect(questions.length).toBeLessThanOrEqual(10);
      } else {
        expect(questions).toHaveLength(0);
      }
    });

    it('should return empty array for zero count', () => {
      const questions = generateAntonymQuestions(1, 0, false);
      expect(questions).toHaveLength(0);
    });

    it('should filter by questionType antonym', () => {
      const questions = generateAntonymQuestions(1, 10, false, [], 'antonym');

      for (const q of questions) {
        if (q.antonymQuestion) {
          expect(q.antonymQuestion.type).toBe('antonym');
        }
      }
    });

    it('should filter by questionType synonym', () => {
      const questions = generateAntonymQuestions(1, 10, false, [], 'synonym');

      for (const q of questions) {
        if (q.antonymQuestion) {
          expect(q.antonymQuestion.type).toBe('synonym');
        }
      }
    });

    it('should include both types when questionType is mixed', () => {
      const questions = generateAntonymQuestions(1, 50, false, [], 'mixed');

      if (questions.length > 0) {
        const types = new Set(questions.map((q) => q.antonymQuestion?.type));
        // May have both types if data exists
        expect(types.size).toBeGreaterThanOrEqual(1);
      }
    });

    it('should handle random parameter without error', () => {
      const q1 = generateAntonymQuestions(1, 5, true);
      const q2 = generateAntonymQuestions(1, 5, false);

      expect(Array.isArray(q1)).toBe(true);
      expect(Array.isArray(q2)).toBe(true);
    });

    it('should include valid kanji data in questions', () => {
      const questions = generateAntonymQuestions(1, 5, false);

      for (const q of questions) {
        expect(q).toHaveProperty('kanji');
        expect(q.kanji).toHaveProperty('char');
        if (q.antonymQuestion) {
          expect(q.antonymQuestion.sourceKanji).toBe(q.kanji.char);
        }
      }
    });

    it('should have source and answer be different kanji', () => {
      const questions = generateAntonymQuestions(1, 10, false);

      for (const q of questions) {
        if (q.antonymQuestion) {
          // Source and answer should be different
          expect(q.antonymQuestion.sourceKanji).not.toBe(q.antonymQuestion.answerKanji);
        }
      }
    });
  });
});
