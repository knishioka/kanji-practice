import { describe, expect, it } from 'vitest';
import { getKanjiByGrade, getKanjiByGradeFiltered } from '../../data/kanji';
import { generateAntonymQuestions } from '../antonymQuestionGenerator';
import { generateHomophoneQuestions } from '../homophoneQuestionGenerator';
import { generateOkuriganaQuestions } from '../okuriganaQuestionGenerator';
import { canGenerateQuestions, generateQuestions } from '../questionGenerator';
import { generateRadicalQuestions } from '../radicalQuestionGenerator';

describe('除外漢字フィルター機能', () => {
  describe('getKanjiByGradeFiltered', () => {
    it('除外リストが空の場合、全漢字を返す', () => {
      const all = getKanjiByGrade([1]);
      const filtered = getKanjiByGradeFiltered([1], []);
      expect(filtered.length).toBe(all.length);
    });

    it('指定した漢字が除外される', () => {
      const excluded = ['一', '二', '三'];
      const filtered = getKanjiByGradeFiltered([1], excluded);

      for (const kanji of filtered) {
        expect(excluded).not.toContain(kanji.char);
      }
    });

    it('除外後の漢字数が正しい', () => {
      const all = getKanjiByGrade([1]);
      const excluded = ['一', '二', '三', '四', '五'];
      const filtered = getKanjiByGradeFiltered([1], excluded);

      expect(filtered.length).toBe(all.length - excluded.length);
    });

    it('存在しない漢字を除外しても影響しない', () => {
      const all = getKanjiByGrade([1]);
      const excluded = ['龍', '鳳']; // 1年生に存在しない漢字
      const filtered = getKanjiByGradeFiltered([1], excluded);

      expect(filtered.length).toBe(all.length);
    });

    it('全漢字を除外すると空配列を返す', () => {
      const all = getKanjiByGrade([1]);
      const excluded = all.map((k) => k.char);
      const filtered = getKanjiByGradeFiltered([1], excluded);

      expect(filtered).toHaveLength(0);
    });
  });

  describe('generateQuestions with exclusions', () => {
    it('除外した漢字が問題に含まれない', () => {
      const excluded = ['一', '二', '三', '四', '五'];
      const questions = generateQuestions(1, 50, false, excluded);

      for (const q of questions) {
        expect(excluded).not.toContain(q.kanji.char);
      }
    });

    it('ランダムモードでも除外が機能する', () => {
      const excluded = ['山', '川', '森', '林'];
      const questions = generateQuestions(1, 30, true, excluded);

      for (const q of questions) {
        expect(excluded).not.toContain(q.kanji.char);
      }
    });

    it('全漢字を除外すると空配列を返す', () => {
      const all = getKanjiByGrade([1]);
      const excluded = all.map((k) => k.char);
      const questions = generateQuestions(1, 10, false, excluded);

      expect(questions).toHaveLength(0);
    });

    it('除外後も指定数の問題が生成される（繰り返しあり）', () => {
      // 70字を除外して残り10字から100問生成
      const all = getKanjiByGrade([1]);
      const excluded = all.slice(0, 70).map((k) => k.char);
      const questions = generateQuestions(1, 100, false, excluded);

      expect(questions).toHaveLength(100);
      // 除外漢字が含まれていないことを確認
      for (const q of questions) {
        expect(excluded).not.toContain(q.kanji.char);
      }
    });
  });

  describe('canGenerateQuestions with exclusions', () => {
    it('除外後も漢字が残っていればtrue', () => {
      const excluded = ['一', '二', '三'];
      expect(canGenerateQuestions(1, excluded)).toBe(true);
    });

    it('全漢字を除外するとfalse', () => {
      const all = getKanjiByGrade([1]);
      const excluded = all.map((k) => k.char);
      expect(canGenerateQuestions(1, excluded)).toBe(false);
    });
  });

  describe('他の問題生成関数での除外', () => {
    it('generateHomophoneQuestions - 除外が機能する', () => {
      const excluded = ['一', '二', '三'];
      const questions = generateHomophoneQuestions(1, 20, false, excluded);

      for (const q of questions) {
        expect(excluded).not.toContain(q.kanji.char);
      }
    });

    it('generateRadicalQuestions - 除外が機能する', () => {
      const excluded = ['山', '川', '木'];
      const questions = generateRadicalQuestions(1, 20, false, excluded);

      for (const q of questions) {
        expect(excluded).not.toContain(q.kanji.char);
      }
    });

    it('generateOkuriganaQuestions - 除外が機能する', () => {
      const excluded = ['上', '下', '大'];
      const questions = generateOkuriganaQuestions(1, 20, false, excluded);

      for (const q of questions) {
        expect(excluded).not.toContain(q.kanji.char);
      }
    });

    it('generateAntonymQuestions - 除外が機能する', () => {
      const excluded = ['上', '下'];
      const questions = generateAntonymQuestions(1, 20, false, excluded);

      for (const q of questions) {
        expect(excluded).not.toContain(q.kanji.char);
      }
    });
  });

  describe('複数学年での除外', () => {
    it('学年ごとに異なる除外リストが適用される', () => {
      const excluded1 = ['一', '二'];
      const excluded2 = ['東', '西'];

      const questions1 = generateQuestions(1, 20, false, excluded1);
      const questions2 = generateQuestions(2, 20, false, excluded2);

      // 1年生の問題に「一」「二」が含まれない
      for (const q of questions1) {
        expect(excluded1).not.toContain(q.kanji.char);
      }

      // 2年生の問題に「東」「西」が含まれない
      for (const q of questions2) {
        expect(excluded2).not.toContain(q.kanji.char);
      }
    });
  });
});
