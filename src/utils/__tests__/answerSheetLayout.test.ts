import { describe, expect, it } from 'vitest';
import { A4, ANSWER_SHEET_LAYOUT } from '../../constants/print';
import { calculateAnswerRowsPerPage } from '../layout';

describe('answer sheet pagination', () => {
  it('reserves space for the header, table headings and footer within the A4 safe area', () => {
    const rows = calculateAnswerRowsPerPage('漢字練習プリント');
    expect(rows).toBeGreaterThan(0);
    expect(
      rows * ANSWER_SHEET_LAYOUT.ROW_HEIGHT_MM +
        A4.HEADER_HEIGHT_MM +
        A4.FOOTER_HEIGHT_MM +
        ANSWER_SHEET_LAYOUT.TABLE_HEADER_HEIGHT_MM,
    ).toBeLessThanOrEqual(A4.SAFE_CONTENT_HEIGHT_MM);
  });

  it('reduces rows for wrapped titles and keeps at least one row', () => {
    expect(calculateAnswerRowsPerPage('長'.repeat(150))).toBeLessThan(
      calculateAnswerRowsPerPage('漢字練習プリント'),
    );
    expect(calculateAnswerRowsPerPage('長'.repeat(1000))).toBe(1);
  });
});
