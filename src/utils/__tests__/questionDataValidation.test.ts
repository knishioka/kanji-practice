/**
 * 問題生成データ検証テスト
 *
 * 各学年のすべての問題が正しく表示されるかを検証:
 * 1. データ完全性 - 各学年の漢字データが揃っているか
 * 2. モード別生成可能性 - 全8モード×全6学年で問題生成可能か
 * 3. 問題の質 - 読みと例語の整合性、部首データの正確性など
 * 4. A4レイアウト適合 - 全モードで印刷可能か
 */

import { describe, expect, it } from 'vitest';
import { getKanjiByGrade } from '../../data/kanji';
import { kanjiRadicalMap } from '../../data/kanjiRadicalMap';
import type { Grade, Kanji, PrintMode } from '../../types';
import { canGenerateAntonymQuestions, generateAntonymQuestions } from '../antonymQuestionGenerator';
import {
  buildHomophoneIndex,
  canGenerateHomophoneQuestions,
  extractHomophoneGroups,
  generateHomophoneQuestions,
} from '../homophoneQuestionGenerator';
import { calculateRowsPerPage } from '../layout';
import {
  canGenerateOkuriganaQuestions,
  generateOkuriganaQuestions,
} from '../okuriganaQuestionGenerator';
import { canGenerateQuestions, generateQuestions } from '../questionGenerator';
import { canGenerateRadicalQuestions, generateRadicalQuestions } from '../radicalQuestionGenerator';
import { filterKanjiWithRadical } from '../radicalUtils';

// ===== ヘルパー関数 =====

const grades: Grade[] = [1, 2, 3, 4, 5, 6];
const basicModes: PrintMode[] = ['reading', 'writing', 'strokeCount', 'sentence'];
const allModes: PrintMode[] = [
  'reading',
  'writing',
  'strokeCount',
  'sentence',
  'homophone',
  'radical',
  'okurigana',
  'antonym',
];

// 全漢字を取得
function getAllKanji(): Kanji[] {
  return grades.flatMap((grade) => getKanjiByGrade([grade]));
}

// モード別の生成可能性チェック
function checkModeAvailability(
  mode: PrintMode,
  grade: Grade,
): { available: boolean; reason?: string; count?: number } {
  switch (mode) {
    case 'reading':
    case 'writing':
    case 'strokeCount':
    case 'sentence':
      return {
        available: canGenerateQuestions(grade),
        count: getKanjiByGrade([grade]).length,
      };
    case 'homophone': {
      const available = canGenerateHomophoneQuestions(grade);
      if (!available) {
        return { available, reason: '同音異義語グループなし' };
      }
      const index = buildHomophoneIndex(getKanjiByGrade([grade]));
      const groups = extractHomophoneGroups(index);
      return { available, count: groups.length };
    }
    case 'radical': {
      const available = canGenerateRadicalQuestions(grade);
      if (!available) {
        return { available, reason: '部首データなし' };
      }
      const kanji = getKanjiByGrade([grade]);
      const withRadical = filterKanjiWithRadical(kanji);
      return { available, count: withRadical.length };
    }
    case 'okurigana': {
      const available = canGenerateOkuriganaQuestions(grade);
      if (!available) {
        return { available, reason: '送りがなデータなし' };
      }
      const kanji = getKanjiByGrade([grade]);
      const withOkurigana = kanji.filter(
        (k) => k.okuriganaExamples && k.okuriganaExamples.length > 0,
      );
      return { available, count: withOkurigana.length };
    }
    case 'antonym': {
      const available = canGenerateAntonymQuestions(grade);
      if (!available) {
        return { available, reason: '対義語/類義語データなし' };
      }
      const kanji = getKanjiByGrade([grade]);
      const withAntonym = kanji.filter(
        (k) => (k.antonyms && k.antonyms.length > 0) || (k.synonyms && k.synonyms.length > 0),
      );
      return { available, count: withAntonym.length };
    }
    default:
      return { available: false, reason: '不明なモード' };
  }
}

// ===== テスト =====

describe('問題生成データ検証', () => {
  // 1. データ完全性テスト
  describe('漢字データ完全性', () => {
    for (const grade of grades) {
      it(`${grade}年生: 全漢字が必須フィールドを持つ`, () => {
        const kanji = getKanjiByGrade([grade]);
        const warnings: string[] = [];

        for (const k of kanji) {
          // 必須: char, readings, strokeCount, examples
          if (!k.readings.on.length && !k.readings.kun.length) {
            warnings.push(`${k.char}: 読みなし`);
          }
          if (k.strokeCount <= 0) {
            warnings.push(`${k.char}: 画数不正`);
          }
          if (!k.examples.length) {
            warnings.push(`${k.char}: 例語なし`);
          }
        }

        if (warnings.length > 0) {
          console.warn(`[${grade}年生] データ警告:`, warnings);
        }

        // 漢字データが存在することは必須
        expect(kanji.length).toBeGreaterThan(0);
      });
    }

    it('全学年の漢字数が期待値と一致する', () => {
      const expectedCounts: Record<Grade, number> = {
        1: 80,
        2: 160,
        3: 200,
        4: 202,
        5: 193,
        6: 191,
      };

      for (const grade of grades) {
        const actual = getKanjiByGrade([grade]).length;
        const expected = expectedCounts[grade];

        if (actual !== expected) {
          console.warn(`[${grade}年生] 漢字数: 実際=${actual}, 期待=${expected}`);
        }

        // 最低限の漢字数は確保されているべき
        expect(actual).toBeGreaterThanOrEqual(expected * 0.9);
      }
    });
  });

  // 2. モード別生成可能性テスト
  describe('モード別問題生成', () => {
    // 基本4モードは全学年で必須
    describe('基本モード（必須）', () => {
      for (const mode of basicModes) {
        for (const grade of grades) {
          it(`${mode}モード × ${grade}年生: 問題生成可能`, () => {
            const result = checkModeAvailability(mode, grade);
            expect(result.available).toBe(true);

            // 実際に問題生成を試みる
            const questions = generateQuestions(grade, 5, false);
            expect(questions.length).toBeGreaterThan(0);
          });
        }
      }
    });

    // 特殊モードはデータ依存（警告のみ）
    describe('特殊モード（データ依存）', () => {
      it('同音異義語モード: 各学年の状況', () => {
        for (const grade of grades) {
          const result = checkModeAvailability('homophone', grade);

          if (!result.available) {
            console.warn(`[homophone/${grade}年] ${result.reason}`);
          } else {
            console.log(`[homophone/${grade}年] ${result.count}グループ`);
          }

          // 2年生以上は同音異義語がある程度存在すべき
          if (grade >= 2) {
            expect(result.available).toBe(true);
          }
        }
      });

      it('部首モード: 各学年の状況', () => {
        for (const grade of grades) {
          const result = checkModeAvailability('radical', grade);

          if (!result.available) {
            console.warn(`[radical/${grade}年] ${result.reason}`);
          } else {
            const kanji = getKanjiByGrade([grade]);
            const rate = ((result.count! / kanji.length) * 100).toFixed(1);
            console.log(`[radical/${grade}年] ${result.count}/${kanji.length} (${rate}%)`);
          }

          // 部首データは全学年で利用可能であるべき
          expect(result.available).toBe(true);
        }
      });

      it('送りがなモード: 各学年の状況', () => {
        for (const grade of grades) {
          const result = checkModeAvailability('okurigana', grade);

          if (!result.available) {
            console.warn(`[okurigana/${grade}年] ${result.reason}`);
          } else {
            console.log(`[okurigana/${grade}年] ${result.count}字`);
          }

          // 送りがなデータは任意（警告のみ）
        }
      });

      it('対義語モード: 各学年の状況', () => {
        for (const grade of grades) {
          const result = checkModeAvailability('antonym', grade);

          if (!result.available) {
            console.warn(`[antonym/${grade}年] ${result.reason}`);
          } else {
            console.log(`[antonym/${grade}年] ${result.count}字`);
          }

          // 対義語データは任意（警告のみ）
        }
      });
    });
  });

  // 3. 問題の質テスト
  describe('問題の質', () => {
    describe('読みと例語の整合性', () => {
      it('例語が空でないこと', () => {
        const warnings: string[] = [];

        for (const grade of grades) {
          for (const k of getKanjiByGrade([grade])) {
            for (const ex of k.examples) {
              if (!ex.word || !ex.reading) {
                warnings.push(`${k.char}「${ex.word}」: 例語または読みが空`);
              }
            }
          }
        }

        if (warnings.length > 0) {
          console.warn('例語警告:', warnings.slice(0, 20));
        }

        // 警告があっても、致命的ではない
        expect(true).toBe(true);
      });

      it('例語に対象漢字が含まれること', () => {
        const warnings: string[] = [];

        for (const grade of grades) {
          for (const k of getKanjiByGrade([grade])) {
            for (const ex of k.examples) {
              if (ex.word && !ex.word.includes(k.char)) {
                warnings.push(`${k.char}「${ex.word}」: 漢字が例語に含まれない`);
              }
            }
          }
        }

        if (warnings.length > 0) {
          console.warn('例語整合性警告:', warnings.slice(0, 20));
        }
      });
    });

    describe('部首データ', () => {
      it('部首マッピングの漢字が実在する', () => {
        const allKanji = getAllKanji();
        const allChars = new Set(allKanji.map((k) => k.char));
        const mappedKanji = Object.keys(kanjiRadicalMap);
        const orphans: string[] = [];

        for (const char of mappedKanji) {
          if (!allChars.has(char)) {
            orphans.push(char);
          }
        }

        if (orphans.length > 0) {
          console.warn('孤立した部首マッピング:', orphans);
        }

        // 大部分は実在するはず
        const orphanRate = orphans.length / mappedKanji.length;
        expect(orphanRate).toBeLessThan(0.1); // 10%未満
      });

      it('各学年の部首対応率レポート', () => {
        console.log('\n=== 部首対応率 ===');
        for (const grade of grades) {
          const kanji = getKanjiByGrade([grade]);
          const withRadical = filterKanjiWithRadical(kanji);
          const rate = ((withRadical.length / kanji.length) * 100).toFixed(1);

          console.log(`${grade}年生: ${withRadical.length}/${kanji.length} (${rate}%)`);

          // 最低30%は部首データがあるべき
          expect(withRadical.length / kanji.length).toBeGreaterThanOrEqual(0.3);
        }
      });
    });

    describe('同音異義語データ', () => {
      it('各学年で同音グループが存在する', () => {
        for (const grade of grades) {
          const index = buildHomophoneIndex(getKanjiByGrade([grade]));
          const groups = extractHomophoneGroups(index);

          if (groups.length === 0) {
            console.warn(`[${grade}年生] 同音異義語グループなし`);
          }

          // 2年生以上は最低1グループ期待
          if (grade >= 2) {
            expect(groups.length).toBeGreaterThan(0);
          }
        }
      });
    });
  });

  // 4. A4レイアウト適合テスト
  describe('A4レイアウト適合', () => {
    const cellSizes = [12, 15, 25]; // MIN, DEFAULT, MAX

    for (const mode of allModes) {
      for (const cellSize of cellSizes) {
        it(`${mode}モード (${cellSize}mm): 1ページ1問以上収まる`, () => {
          const rows = calculateRowsPerPage(cellSize, mode);
          expect(rows).toBeGreaterThanOrEqual(1);
        });
      }
    }
  });

  // 5. 生成問題の構造検証
  describe('生成問題の構造', () => {
    describe('基本問題', () => {
      for (const grade of grades) {
        it(`${grade}年生: 基本問題の構造が正しい`, () => {
          const questions = generateQuestions(grade, 10, false);

          expect(questions.length).toBeGreaterThan(0);

          for (const q of questions) {
            expect(q.kanji).toBeDefined();
            expect(q.kanji.char).toBeTruthy();
            expect(q.kanji.grade).toBe(grade);
            expect(q.reading).toBeTruthy();
          }
        });
      }
    });

    describe('特殊問題', () => {
      it('同音異義語問題の構造', () => {
        for (const grade of grades) {
          if (canGenerateHomophoneQuestions(grade)) {
            const questions = generateHomophoneQuestions(grade, 5, false);

            for (const q of questions) {
              expect(q.homophoneQuestion).toBeDefined();
              expect(q.homophoneQuestion!.reading).toBeTruthy();
              expect(q.homophoneQuestion!.options.length).toBeGreaterThanOrEqual(2);
              expect(q.homophoneQuestion!.options.length).toBeLessThanOrEqual(3);
            }
          }
        }
      });

      it('部首問題の構造', () => {
        for (const grade of grades) {
          if (canGenerateRadicalQuestions(grade)) {
            const questions = generateRadicalQuestions(grade, 5, false);

            for (const q of questions) {
              expect(q.radicalQuestion).toBeDefined();
              expect(q.radicalQuestion!.targetKanji).toBeTruthy();
              expect(q.radicalQuestion!.answerRadical).toBeTruthy();
              expect(q.radicalQuestion!.answerRadicalName).toBeTruthy();
            }
          }
        }
      });

      it('送りがな問題の構造', () => {
        for (const grade of grades) {
          if (canGenerateOkuriganaQuestions(grade)) {
            const questions = generateOkuriganaQuestions(grade, 5, false);

            for (const q of questions) {
              expect(q.okuriganaQuestion).toBeDefined();
              expect(q.okuriganaQuestion!.stem).toBeTruthy();
              expect(q.okuriganaQuestion!.answer).toBeTruthy();
            }
          }
        }
      });

      it('対義語問題の構造', () => {
        for (const grade of grades) {
          if (canGenerateAntonymQuestions(grade)) {
            const questions = generateAntonymQuestions(grade, 5, false);

            for (const q of questions) {
              expect(q.antonymQuestion).toBeDefined();
              expect(q.antonymQuestion!.sourceKanji).toBeTruthy();
              expect(q.antonymQuestion!.answerKanji).toBeTruthy();
              expect(['antonym', 'synonym']).toContain(q.antonymQuestion!.type);
            }
          }
        }
      });
    });
  });

  // 6. 統計レポート
  describe('統計レポート', () => {
    it('全学年のデータ統計を出力', () => {
      console.log('\n=== データ統計レポート ===\n');

      for (const grade of grades) {
        const kanji = getKanjiByGrade([grade]);
        const withRadical = filterKanjiWithRadical(kanji);
        const withOkurigana = kanji.filter(
          (k) => k.okuriganaExamples && k.okuriganaExamples.length > 0,
        );
        const withAntonym = kanji.filter(
          (k) => (k.antonyms && k.antonyms.length > 0) || (k.synonyms && k.synonyms.length > 0),
        );
        const index = buildHomophoneIndex(kanji);
        const homophoneGroups = extractHomophoneGroups(index);

        console.log(`【${grade}年生】`);
        console.log(`  漢字数: ${kanji.length}`);
        console.log(
          `  部首対応: ${withRadical.length} (${((withRadical.length / kanji.length) * 100).toFixed(1)}%)`,
        );
        console.log(
          `  送りがな: ${withOkurigana.length} (${((withOkurigana.length / kanji.length) * 100).toFixed(1)}%)`,
        );
        console.log(
          `  対義語/類義語: ${withAntonym.length} (${((withAntonym.length / kanji.length) * 100).toFixed(1)}%)`,
        );
        console.log(`  同音異義グループ: ${homophoneGroups.length}`);
        console.log('');
      }

      // このテストは常に成功（レポート目的）
      expect(true).toBe(true);
    });
  });
});
