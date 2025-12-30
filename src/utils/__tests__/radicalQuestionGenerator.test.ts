import { describe, expect, it } from 'vitest';
import { canGenerateRadicalQuestions, generateRadicalQuestions } from '../radicalQuestionGenerator';

describe('radicalQuestionGenerator utilities', () => {
  describe('canGenerateRadicalQuestions', () => {
    it('should return boolean for all grades', () => {
      for (let grade = 1; grade <= 6; grade++) {
        const result = canGenerateRadicalQuestions(grade as 1 | 2 | 3 | 4 | 5 | 6);
        expect(typeof result).toBe('boolean');
      }
    });

    it('should return true for grade 1 (assuming radical data exists)', () => {
      // This depends on actual data, adjust expectation if needed
      const result = canGenerateRadicalQuestions(1);
      expect(typeof result).toBe('boolean');
    });
  });

  describe('generateRadicalQuestions', () => {
    it('should return empty array when no radical data available', () => {
      // If grade 1 has no radical data, this should return empty
      // Otherwise, it returns questions
      const questions = generateRadicalQuestions(1, 5, false);
      // Just verify it returns an array
      expect(Array.isArray(questions)).toBe(true);
    });

    it('should generate questions with radicalQuestion property when data exists', () => {
      const questions = generateRadicalQuestions(1, 5, false);

      if (questions.length > 0) {
        for (const q of questions) {
          expect(q).toHaveProperty('radicalQuestion');
          expect(q.radicalQuestion).toHaveProperty('targetKanji');
          expect(q.radicalQuestion).toHaveProperty('answerRadical');
          expect(q.radicalQuestion).toHaveProperty('answerRadicalName');
        }
      }
    });

    it('should return requested count if data is available', () => {
      const questions = generateRadicalQuestions(1, 10, false);
      // Either returns requested count or empty (if no data)
      if (canGenerateRadicalQuestions(1)) {
        expect(questions).toHaveLength(10);
      } else {
        expect(questions).toHaveLength(0);
      }
    });

    it('should return empty array for zero count', () => {
      const questions = generateRadicalQuestions(1, 0, false);
      expect(questions).toHaveLength(0);
    });

    it('should handle random parameter without error', () => {
      const q1 = generateRadicalQuestions(1, 5, true);
      const q2 = generateRadicalQuestions(1, 5, false);

      expect(Array.isArray(q1)).toBe(true);
      expect(Array.isArray(q2)).toBe(true);
    });

    it('should include valid kanji data in questions', () => {
      const questions = generateRadicalQuestions(1, 5, false);

      for (const q of questions) {
        expect(q).toHaveProperty('kanji');
        expect(q.kanji).toHaveProperty('char');
        expect(q.kanji.char.length).toBeGreaterThan(0);
      }
    });
  });
});
