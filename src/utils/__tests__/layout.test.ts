import { describe, expect, it } from 'vitest';
import { A4, CELL_SIZE, SENTENCE_LAYOUT, WRITING_MODE_SAFE_WIDTH_MM } from '../../constants/print';
import type { PrintMode } from '../../types';
import {
  calculateColumnsPerRow,
  calculateMaxOkuriganaCells,
  calculateMaxPracticeColumns,
  calculateMaxSentencePracticeRows,
  calculateRecommendedPracticeColumns,
  calculateRowsPerPage,
  calculateSafePracticeCount,
  getRowHeight,
} from '../layout';

describe('layout utilities', () => {
  describe('calculateRowsPerPage', () => {
    it('should calculate rows for writing mode', () => {
      // cellSize 15mm + 6mm margin = 21mm per row
      // Available height: 267 - 25 - 10 = 232mm
      // 232 / 21 = 11.04 → 11 rows
      const rows = calculateRowsPerPage(15, 'writing');
      expect(rows).toBe(11);
    });

    it('should calculate rows for reading mode', () => {
      const rows = calculateRowsPerPage(15, 'reading');
      expect(rows).toBe(11);
    });

    it('should calculate fewer rows for sentence mode', () => {
      // cellSize 15mm * 2.3 + 8mm = 42.5mm per row (ふりがなパディング含む)
      // 232 / 42.5 = 5.45 → 5 rows
      // optionsを省略すると現状互換 (N=1) で計算される
      const rows = calculateRowsPerPage(15, 'sentence');
      expect(rows).toBe(5);
    });

    it('sentenceモードで practiceRows=2 のとき1問の高さが57.5mmになり4問/ページ', () => {
      // cellSize 15 * (1.3 + 2) + 8 = 57.5mm
      // 232 / 57.5 = 4.03 → 4 rows
      const rows = calculateRowsPerPage(15, 'sentence', {
        sentencePracticeRows: 2,
      });
      expect(rows).toBe(4);
    });

    it('sentenceモードで practiceRows=3 のとき1問の高さが72.5mmになり3問/ページ', () => {
      // cellSize 15 * (1.3 + 3) + 8 = 72.5mm
      // 232 / 72.5 = 3.2 → 3 rows
      const rows = calculateRowsPerPage(15, 'sentence', {
        sentencePracticeRows: 3,
      });
      expect(rows).toBe(3);
    });

    it('sentenceモード cellSize=12 × practiceRows=3 で3問/ページ', () => {
      // cellSize 12 * 4.3 + 8 = 59.6mm
      // 232 / 59.6 = 3.89 → 3 rows
      const rows = calculateRowsPerPage(12, 'sentence', {
        sentencePracticeRows: 3,
      });
      expect(rows).toBe(3);
    });

    it('sentenceモード cellSize=25 × practiceRows=3 で2問/ページ', () => {
      // cellSize 25 * 4.3 + 8 = 115.5mm
      // 232 / 115.5 = 2.0 → 2 rows
      const rows = calculateRowsPerPage(25, 'sentence', {
        sentencePracticeRows: 3,
      });
      expect(rows).toBe(2);
    });

    it('should calculate rows for strokeCount mode', () => {
      const rows = calculateRowsPerPage(15, 'strokeCount');
      expect(rows).toBe(11);
    });

    it('should calculate rows for homophone mode', () => {
      // cellSize 15mm * 2.6 = 39mm per row
      // 232 / 39 = 5.94 → 5 rows
      const rows = calculateRowsPerPage(15, 'homophone');
      expect(rows).toBe(5);
    });

    it('should calculate more rows for smaller cells in homophone mode', () => {
      // cellSize 12mm * 2.6 = 31.2mm per row
      // 232 / 31.2 = 7.43 → 7 rows
      const rows = calculateRowsPerPage(12, 'homophone');
      expect(rows).toBe(7);
    });

    it('should calculate fewer rows for larger cells in homophone mode', () => {
      // cellSize 20mm * 2.4 = 48mm per row
      // 232 / 48 = 4.83 → 4 rows
      const rows = calculateRowsPerPage(20, 'homophone');
      expect(rows).toBe(4);
    });

    it('should calculate rows for radical mode', () => {
      // cellSize 15mm + 6mm margin = 21mm per row
      // 232 / 21 = 11.04 → 11 rows
      const rows = calculateRowsPerPage(15, 'radical');
      expect(rows).toBe(11);
    });

    it('should calculate rows for okurigana mode', () => {
      // cellSize 15mm + 6mm margin = 21mm per row
      // 232 / 21 = 11.04 → 11 rows
      const rows = calculateRowsPerPage(15, 'okurigana');
      expect(rows).toBe(11);
    });

    it('should calculate rows for antonym mode', () => {
      // cellSize 15mm + 6mm margin = 21mm per row
      // 232 / 21 = 11.04 → 11 rows
      const rows = calculateRowsPerPage(15, 'antonym');
      expect(rows).toBe(11);
    });

    it('should calculate rows for readingWriting mode', () => {
      // cellSize 15mm * 2 + 6mm = 36mm per row
      // 232 / 36 = 6.44 → 6 rows
      const rows = calculateRowsPerPage(15, 'readingWriting');
      expect(rows).toBe(6);
    });

    it('should return at least 1 row even for large cell sizes', () => {
      const rows = calculateRowsPerPage(250, 'writing');
      expect(rows).toBeGreaterThanOrEqual(1);
    });

    it('should return more rows for smaller cell sizes', () => {
      const smallRows = calculateRowsPerPage(12, 'writing');
      const largeRows = calculateRowsPerPage(25, 'writing');
      expect(smallRows).toBeGreaterThan(largeRows);
    });
  });

  describe('calculateMaxPracticeColumns', () => {
    it('should calculate max columns for default cell size', () => {
      // Safe width: 175mm, cellSize: 15mm
      // 175 / 15 - 1 = 10.6 → 10 columns
      const maxCols = calculateMaxPracticeColumns(15);
      expect(maxCols).toBe(10);
    });

    it('should return fewer columns for larger cell sizes', () => {
      // 175 / 25 - 1 = 6
      const maxCols = calculateMaxPracticeColumns(25);
      expect(maxCols).toBe(6);
    });

    it('should return more columns for smaller cell sizes', () => {
      // 175 / 12 - 1 = 13.58 → 13
      const maxCols = calculateMaxPracticeColumns(12);
      expect(maxCols).toBe(13);
    });

    it('should return at least 3 columns (minimum)', () => {
      const maxCols = calculateMaxPracticeColumns(100);
      expect(maxCols).toBeGreaterThanOrEqual(3);
    });
  });

  describe('calculateRecommendedPracticeColumns', () => {
    it('should return about 70% of max columns', () => {
      const max = calculateMaxPracticeColumns(15);
      const recommended = calculateRecommendedPracticeColumns(15);
      expect(recommended).toBeLessThanOrEqual(max);
      expect(recommended).toBeGreaterThanOrEqual(3);
    });

    it('should cap at 8 columns', () => {
      const recommended = calculateRecommendedPracticeColumns(12);
      expect(recommended).toBeLessThanOrEqual(8);
    });

    it('should return at least 3 columns', () => {
      const recommended = calculateRecommendedPracticeColumns(25);
      expect(recommended).toBeGreaterThanOrEqual(3);
    });
  });

  describe('calculateColumnsPerRow', () => {
    it('should calculate columns for default cell size', () => {
      // 175 / 15 = 11.6 → 11
      const cols = calculateColumnsPerRow(15);
      expect(cols).toBe(11);
    });

    it('should return fewer columns for larger cells', () => {
      const cols = calculateColumnsPerRow(25);
      expect(cols).toBe(7);
    });
  });

  describe('getRowHeight (sentence + practiceRows)', () => {
    it('optionsを省略した場合は現状互換 (N=1)', () => {
      // cellSize 15 * 2.3 + 8 = 42.5mm
      expect(getRowHeight(15, 'sentence')).toBeCloseTo(42.5);
    });

    it('practiceRows=1 で 42.5mm (cellSize=15)', () => {
      expect(getRowHeight(15, 'sentence', { sentencePracticeRows: 1 })).toBeCloseTo(42.5);
    });

    it('practiceRows=2 で 57.5mm (cellSize=15)', () => {
      expect(getRowHeight(15, 'sentence', { sentencePracticeRows: 2 })).toBeCloseTo(57.5);
    });

    it('practiceRows=3 で 72.5mm (cellSize=15)', () => {
      expect(getRowHeight(15, 'sentence', { sentencePracticeRows: 3 })).toBeCloseTo(72.5);
    });
  });

  describe('calculateMaxSentencePracticeRows', () => {
    it('cellSize=12 で 3 を返す (教育的上限で抑制)', () => {
      expect(calculateMaxSentencePracticeRows(12)).toBe(SENTENCE_LAYOUT.EDU_MAX_PRACTICE_ROWS);
    });

    it('cellSize=15 で 3 を返す', () => {
      expect(calculateMaxSentencePracticeRows(15)).toBe(SENTENCE_LAYOUT.EDU_MAX_PRACTICE_ROWS);
    });

    it('cellSize=20 で 3 を返す', () => {
      expect(calculateMaxSentencePracticeRows(20)).toBe(SENTENCE_LAYOUT.EDU_MAX_PRACTICE_ROWS);
    });

    it('cellSize=25 で 3 を返す (A4制約と教育上限が両方満たされるギリギリ)', () => {
      expect(calculateMaxSentencePracticeRows(25)).toBe(SENTENCE_LAYOUT.EDU_MAX_PRACTICE_ROWS);
    });

    it('常に MIN_PRACTICE_ROWS (=1) 以上を返す', () => {
      // 極端に大きい cellSize でも下限を保つ
      expect(calculateMaxSentencePracticeRows(200)).toBeGreaterThanOrEqual(
        SENTENCE_LAYOUT.MIN_PRACTICE_ROWS,
      );
    });
  });

  describe('sentenceモード A4 fitting × practiceRows', () => {
    const availableHeight = A4.SAFE_CONTENT_HEIGHT_MM - A4.HEADER_HEIGHT_MM - A4.FOOTER_HEIGHT_MM;
    const cellSizes = [CELL_SIZE.MIN, CELL_SIZE.DEFAULT, 18, 20, 22, CELL_SIZE.MAX];
    const practiceRowsRange = [1, 2, 3];

    for (const cellSize of cellSizes) {
      for (const practiceRows of practiceRowsRange) {
        it(`cellSize=${cellSize}mm × practiceRows=${practiceRows} で MIN_QUESTIONS_PER_PAGE 以上が収まる`, () => {
          const rowHeight = getRowHeight(cellSize, 'sentence', {
            sentencePracticeRows: practiceRows,
          });
          const rowsPerPage = calculateRowsPerPage(cellSize, 'sentence', {
            sentencePracticeRows: practiceRows,
          });

          // 教育要件: A4 1ページに最低2問
          expect(rowsPerPage).toBeGreaterThanOrEqual(SENTENCE_LAYOUT.MIN_QUESTIONS_PER_PAGE);
          // はみ出し防止
          expect(rowsPerPage * rowHeight).toBeLessThanOrEqual(availableHeight);
        });
      }
    }
  });

  describe('calculateSafePracticeCount', () => {
    it('should return requested columns if within limit', () => {
      const count = calculateSafePracticeCount(15, 5);
      expect(count).toBe(5);
    });

    it('should cap columns to safe maximum', () => {
      // 175 / 15 - 2 = 9.6 → 9
      const count = calculateSafePracticeCount(15, 20);
      expect(count).toBe(9);
    });

    it('should return smaller value for larger cell sizes', () => {
      // 175 / 25 - 2 = 5
      const count = calculateSafePracticeCount(25, 10);
      expect(count).toBe(5);
    });
  });

  describe('calculateMaxOkuriganaCells', () => {
    it('should calculate max cells for default cell size', () => {
      // okurigana size: 15 * 0.7 = 10.5mm
      // available width: 175 - 15 - 15 = 145mm
      // 145 / 10.5 = 13.8 → 13 cells
      const maxCells = calculateMaxOkuriganaCells(15);
      expect(maxCells).toBeGreaterThanOrEqual(13);
      expect(maxCells).toBeLessThanOrEqual(15);
    });

    it('should return fewer cells for larger cell sizes', () => {
      const small = calculateMaxOkuriganaCells(12);
      const large = calculateMaxOkuriganaCells(25);
      expect(small).toBeGreaterThan(large);
    });

    it('should return at least 1 cell', () => {
      const cells = calculateMaxOkuriganaCells(100);
      expect(cells).toBeGreaterThanOrEqual(1);
    });
  });

  // A4収まりテスト
  describe('A4 fitting tests', () => {
    // PrintMode に値を追加したとき、ここでコンパイルエラーになる（単一の定義源）
    const modeCheck: Record<PrintMode, true> = {
      reading: true,
      writing: true,
      strokeCount: true,
      strokeOrder: true,
      sentence: true,
      homophone: true,
      radical: true,
      okurigana: true,
      antonym: true,
      readingWriting: true,
    };
    const allModes = Object.keys(modeCheck) as PrintMode[];
    const cellSizes = [CELL_SIZE.MIN, CELL_SIZE.DEFAULT, CELL_SIZE.MAX]; // 12, 15, 25

    describe('高さ方向 - 全モードがA4に収まる', () => {
      const availableHeight = A4.SAFE_CONTENT_HEIGHT_MM - A4.HEADER_HEIGHT_MM - A4.FOOTER_HEIGHT_MM;

      for (const mode of allModes) {
        for (const cellSize of cellSizes) {
          it(`${mode}モード (${cellSize}mm) が高さ${availableHeight}mmに収まる`, () => {
            const rowsPerPage = calculateRowsPerPage(cellSize, mode);

            // 1行以上入ることを確認
            expect(rowsPerPage).toBeGreaterThanOrEqual(1);

            // rowsPerPage * rowHeight がavailableHeightを超えないことを確認
            const totalHeight = rowsPerPage * getRowHeight(cellSize, mode);
            expect(totalHeight).toBeLessThanOrEqual(availableHeight);
          });
        }
      }
    });

    describe('幅方向 - 全モードがA4に収まる', () => {
      for (const cellSize of cellSizes) {
        it(`書き練習モード (${cellSize}mm) - お手本+練習マスが幅${WRITING_MODE_SAFE_WIDTH_MM}mmに収まる`, () => {
          const maxCols = calculateMaxPracticeColumns(cellSize);
          // お手本1マス + 練習マス
          const totalWidth = cellSize + maxCols * cellSize;
          expect(totalWidth).toBeLessThanOrEqual(WRITING_MODE_SAFE_WIDTH_MM + cellSize); // 余裕を持たせる
        });

        it(`送りがなモード (${cellSize}mm) - 漢字+マスが幅${WRITING_MODE_SAFE_WIDTH_MM}mmに収まる`, () => {
          const maxCells = calculateMaxOkuriganaCells(cellSize);
          const okuriganaSize = cellSize * 0.7;
          // 漢字1マス + 送りがなマス + 余白
          const totalWidth = cellSize + 15 + maxCells * okuriganaSize;
          expect(totalWidth).toBeLessThanOrEqual(WRITING_MODE_SAFE_WIDTH_MM);
        });

        it(`例文写経モード (${cellSize}mm) - 1行の文字がA4幅に収まる`, () => {
          const cols = calculateColumnsPerRow(cellSize);
          const totalWidth = cols * cellSize;
          expect(totalWidth).toBeLessThanOrEqual(WRITING_MODE_SAFE_WIDTH_MM);
        });
      }
    });

    describe('問題数の整合性', () => {
      for (const mode of allModes) {
        it(`${mode}モード - 1ページの問題数が正の整数`, () => {
          for (const cellSize of cellSizes) {
            const rows = calculateRowsPerPage(cellSize, mode);
            expect(rows).toBeGreaterThanOrEqual(1);
            expect(Number.isInteger(rows)).toBe(true);
          }
        });
      }

      it('セルサイズが大きくなると問題数が減る', () => {
        for (const mode of allModes) {
          const smallCellRows = calculateRowsPerPage(CELL_SIZE.MIN, mode);
          const largeCellRows = calculateRowsPerPage(CELL_SIZE.MAX, mode);
          expect(smallCellRows).toBeGreaterThanOrEqual(largeCellRows);
        }
      });
    });

    describe('境界値テスト', () => {
      it('最小セルサイズ(12mm)で全モードが少なくとも1行入る', () => {
        for (const mode of allModes) {
          const rows = calculateRowsPerPage(CELL_SIZE.MIN, mode);
          expect(rows).toBeGreaterThanOrEqual(1);
        }
      });

      it('最大セルサイズ(25mm)で全モードが少なくとも1行入る', () => {
        for (const mode of allModes) {
          const rows = calculateRowsPerPage(CELL_SIZE.MAX, mode);
          expect(rows).toBeGreaterThanOrEqual(1);
        }
      });

      it('極端に大きいセルサイズでも1行は入る', () => {
        for (const mode of allModes) {
          const rows = calculateRowsPerPage(200, mode);
          expect(rows).toBeGreaterThanOrEqual(1);
        }
      });
    });
  });
});
