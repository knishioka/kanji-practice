import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SENTENCE_LAYOUT } from '../../../constants/print';
import type { PrintMode, Settings } from '../../../types';
import { PrintOptions } from '../PrintOptions';

const baseSettings: Settings = {
  grade: 1,
  mode: 'reading',
  pageCount: 1,
  random: true,
  gridStyle: 'cross',
  cellSize: 15,
  practiceColumns: 6,
  sentencePracticeRows: SENTENCE_LAYOUT.DEFAULT_PRACTICE_ROWS,
  showHint: false,
  showAnswerSheet: false,
  title: '漢字練習プリント',
  showNameField: true,
  showDateField: true,
  nameLabel: 'なまえ',
  dateLabel: 'ひづけ',
};

function renderOptions(mode: PrintMode, showAnswerSheet: boolean) {
  const html = renderToStaticMarkup(
    createElement(PrintOptions, {
      settings: { ...baseSettings, mode, showAnswerSheet },
      rowsPerPage: 10,
      totalQuestions: 10,
      maxPracticeColumns: 10,
      maxSentencePracticeRows: 5,
      onSettingsChange: () => {},
    }),
  );
  const checkbox = html.match(/<input\b[^>]*\/>(?=<span\b[^>]*>解答ページをつける<\/span>)/)?.[0];
  expect(checkbox).toBeDefined();
  return { html, checkbox: checkbox ?? '' };
}

describe('PrintOptions answer sheet checkbox', () => {
  it.each<PrintMode>([
    'writing',
    'sentence',
    'strokeOrder',
    'readingWriting',
  ])('disables and unchecks the checkbox with an accessible reason for %s', (mode) => {
    const { html, checkbox } = renderOptions(mode, true);

    expect(checkbox).toContain('disabled=""');
    expect(checkbox).not.toContain('checked=""');
    expect(checkbox).toContain('aria-describedby="answer-sheet-unavailable"');
    expect(html).toMatch(
      /<p\b[^>]*id="answer-sheet-unavailable"[^>]*>このモードはお手本を使う練習のため、解答ページはありません。<\/p>/,
    );
  });

  describe.each<PrintMode>([
    'reading',
    'strokeCount',
    'radical',
    'okurigana',
    'homophone',
    'antonym',
  ])('%s', (mode) => {
    it.each([false, true])('enables the checkbox and reflects showAnswerSheet=%s', (enabled) => {
      const { html, checkbox } = renderOptions(mode, enabled);

      expect(checkbox).not.toContain('disabled=""');
      expect(checkbox.includes('checked=""')).toBe(enabled);
      expect(checkbox).not.toContain('aria-describedby');
      expect(html).not.toContain('answer-sheet-unavailable');
    });
  });
});
