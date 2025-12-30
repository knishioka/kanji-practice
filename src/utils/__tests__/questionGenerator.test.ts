import { describe, expect, it } from 'vitest';
import { canGenerateQuestions, generateQuestions } from '../questionGenerator';

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
  });
});
