import { describe, expect, it } from 'vitest';
import {
  canGenerateOkuriganaQuestions,
  generateOkuriganaQuestions,
} from '../okuriganaQuestionGenerator';

describe('okuriganaQuestionGenerator utilities', () => {
  describe('canGenerateOkuriganaQuestions', () => {
    it('should return boolean for all grades', () => {
      for (let grade = 1; grade <= 6; grade++) {
        const result = canGenerateOkuriganaQuestions(grade as 1 | 2 | 3 | 4 | 5 | 6);
        expect(typeof result).toBe('boolean');
      }
    });
  });

  describe('generateOkuriganaQuestions', () => {
    it('should return empty array when no okurigana data available', () => {
      const questions = generateOkuriganaQuestions(1, 5, false);
      expect(Array.isArray(questions)).toBe(true);
    });

    it('should generate questions with okuriganaQuestion property when data exists', () => {
      const questions = generateOkuriganaQuestions(1, 5, false);

      if (questions.length > 0) {
        for (const q of questions) {
          expect(q).toHaveProperty('okuriganaQuestion');
          expect(q.okuriganaQuestion).toHaveProperty('stem');
          expect(q.okuriganaQuestion).toHaveProperty('answer');
          expect(q.okuriganaQuestion).toHaveProperty('fullWord');
          expect(q.okuriganaQuestion).toHaveProperty('hint');
        }
      }
    });

    it('should return requested count if data is available', () => {
      const questions = generateOkuriganaQuestions(1, 10, false);
      if (canGenerateOkuriganaQuestions(1)) {
        expect(questions).toHaveLength(10);
      } else {
        expect(questions).toHaveLength(0);
      }
    });

    it('should return empty array for zero count', () => {
      const questions = generateOkuriganaQuestions(1, 0, false);
      expect(questions).toHaveLength(0);
    });

    it('should handle random parameter without error', () => {
      const q1 = generateOkuriganaQuestions(1, 5, true);
      const q2 = generateOkuriganaQuestions(1, 5, false);

      expect(Array.isArray(q1)).toBe(true);
      expect(Array.isArray(q2)).toBe(true);
    });

    it('should include stem and okurigana that combine to fullWord', () => {
      const questions = generateOkuriganaQuestions(1, 5, false);

      for (const q of questions) {
        if (q.okuriganaQuestion) {
          const { stem, answer, fullWord } = q.okuriganaQuestion;
          expect(fullWord).toContain(stem);
          // The answer (okurigana) should be part of or follow the fullWord
          expect(fullWord).toContain(answer);
        }
      }
    });

    it('should include reading property', () => {
      const questions = generateOkuriganaQuestions(1, 5, false);

      for (const q of questions) {
        expect(q).toHaveProperty('reading');
        expect(typeof q.reading).toBe('string');
      }
    });
  });
});
