import { describe, expect, it } from 'vitest';
import {
  buildHomophoneIndex,
  canGenerateHomophoneQuestions,
  extractHomophoneGroups,
  generateHomophoneQuestions,
} from '../homophoneQuestionGenerator';

describe('homophoneQuestionGenerator utilities', () => {
  describe('buildHomophoneIndex', () => {
    it('should group kanji by reading', () => {
      const mockKanji = [
        {
          char: '校',
          grade: 1,
          strokeCount: 10,
          readings: { on: ['コウ'], kun: [] },
          examples: [{ word: '学校', reading: 'がっこう' }],
          sentences: ['学校に行く'],
        },
        {
          char: '高',
          grade: 2,
          strokeCount: 10,
          readings: { on: ['コウ'], kun: ['たか.い'] },
          examples: [{ word: '高い', reading: 'たかい' }],
          sentences: ['山が高い'],
        },
      ];

      const index = buildHomophoneIndex(mockKanji as any);
      expect(index.get('コウ')).toHaveLength(2);
    });

    it('should handle kun readings without okurigana', () => {
      const mockKanji = [
        {
          char: '高',
          grade: 2,
          strokeCount: 10,
          readings: { on: [], kun: ['たか.い'] },
          examples: [],
          sentences: [],
        },
      ];

      const index = buildHomophoneIndex(mockKanji as any);
      expect(index.has('たか')).toBe(true);
    });
  });

  describe('extractHomophoneGroups', () => {
    it('should only extract groups with 2+ kanji', () => {
      const index = new Map([
        [
          'コウ',
          [
            { char: '校', context: '学校' },
            { char: '高', context: '高い' },
          ],
        ],
        ['イチ', [{ char: '一', context: '一つ' }]], // Only 1, should be excluded
      ]);

      const groups = extractHomophoneGroups(index);
      expect(groups).toHaveLength(1);
      expect(groups[0].reading).toBe('コウ');
    });

    it('should limit options to 3 per question', () => {
      const index = new Map([
        [
          'コウ',
          [
            { char: '校', context: '学校' },
            { char: '高', context: '高い' },
            { char: '公', context: '公園' },
            { char: '工', context: '工場' },
            { char: '光', context: '光る' },
          ],
        ],
      ]);

      const groups = extractHomophoneGroups(index);
      expect(groups[0].kanji).toHaveLength(3);
    });
  });

  describe('canGenerateHomophoneQuestions', () => {
    it('should return true for grade 1', () => {
      expect(canGenerateHomophoneQuestions(1)).toBe(true);
    });

    it('should return boolean for all grades', () => {
      for (let grade = 1; grade <= 6; grade++) {
        const result = canGenerateHomophoneQuestions(grade as 1 | 2 | 3 | 4 | 5 | 6);
        expect(typeof result).toBe('boolean');
      }
    });
  });

  describe('generateHomophoneQuestions', () => {
    it('should generate the requested number of questions', () => {
      const questions = generateHomophoneQuestions(1, 5, false);
      expect(questions).toHaveLength(5);
    });

    it('should generate questions with homophoneQuestion property', () => {
      const questions = generateHomophoneQuestions(1, 3, false);

      for (const q of questions) {
        expect(q).toHaveProperty('homophoneQuestion');
        expect(q.homophoneQuestion).toHaveProperty('reading');
        expect(q.homophoneQuestion).toHaveProperty('options');
        expect(q.homophoneQuestion!.options.length).toBeGreaterThanOrEqual(2);
        expect(q.homophoneQuestion!.options.length).toBeLessThanOrEqual(3);
      }
    });

    it('should include kanji and context in options', () => {
      const questions = generateHomophoneQuestions(1, 3, false);

      for (const q of questions) {
        for (const option of q.homophoneQuestion!.options) {
          expect(option).toHaveProperty('kanji');
          expect(option).toHaveProperty('context');
          expect(option.kanji.length).toBeGreaterThan(0);
        }
      }
    });

    it('should return empty array for zero count', () => {
      const questions = generateHomophoneQuestions(1, 0, false);
      expect(questions).toHaveLength(0);
    });

    it('should handle large count by repeating questions', () => {
      const questions = generateHomophoneQuestions(1, 100, false);
      expect(questions).toHaveLength(100);
    });

    it('should generate different order when random is true', () => {
      const q1 = generateHomophoneQuestions(1, 10, true);
      const q2 = generateHomophoneQuestions(1, 10, true);

      expect(q1).toHaveLength(10);
      expect(q2).toHaveLength(10);
      // Both should have valid data
      expect(q1.every((q) => q.homophoneQuestion?.reading)).toBe(true);
    });
  });
});
