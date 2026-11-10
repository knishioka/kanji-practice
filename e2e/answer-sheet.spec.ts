import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { A4, CELL_SIZE } from '../src/constants/print';
import type { PrintMode } from '../src/types';
import { mmToPx } from '../src/utils/units';

const answerModes: PrintMode[] = [
  'reading',
  'strokeCount',
  'radical',
  'okurigana',
  'homophone',
  'antonym',
];

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('mode-selector-reading').click();
});

test('既定はオフで、オンにしても問題の順序は変わらず再読み込みでも保持する', async ({ page }) => {
  const checkbox = page.getByLabel('解答ページをつける');
  await expect(checkbox).not.toBeChecked();
  await expect(page.getByTestId('answer-sheet')).toHaveCount(0);
  const before = await page.locator('.a4-page').first().innerText();
  await checkbox.check();
  await expect(page.getByTestId('answer-sheet')).toHaveCount(1);
  expect(await page.locator('.a4-page').first().innerText()).toBe(before);
  await page.reload();
  await expect(page.getByLabel('解答ページをつける')).toBeChecked();
  await expect(page.getByTestId('answer-sheet')).toHaveCount(1);
});

test('非対応の全モードは無効化して理由を示し、解答ページを出力しない', async ({ page }) => {
  await page.getByLabel('解答ページをつける').check();
  for (const mode of ['writing', 'sentence', 'strokeOrder', 'readingWriting']) {
    await page.getByTestId(`mode-selector-${mode}`).click();
    await expect(page.getByLabel('解答ページをつける')).toBeDisabled();
    await expect(page.locator('#answer-sheet-unavailable')).toBeVisible();
    await expect(page.getByTestId('answer-sheet')).toHaveCount(0);
  }
  await page.getByTestId('mode-selector-reading').click();
  await expect(page.getByLabel('解答ページをつける')).toBeChecked();
});

for (const mode of answerModes) {
  test(`${mode}: 1年生・問題10ページの解答が末尾に並びA4安全領域に収まる`, async ({ page }) => {
    await page.getByTestId(`mode-selector-${mode}`).click();
    await page.getByLabel('ページ数', { exact: true }).fill('10');
    await page
      .locator(`input[type="range"][min="${CELL_SIZE.MIN}"][max="${CELL_SIZE.MAX}"]`)
      .fill('12');
    await page.getByLabel('解答ページをつける').check();
    const questions = page.locator('.a4-page:not([data-testid="answer-sheet"])');
    await expect(questions).toHaveCount(10);
    const answers = page.getByTestId('answer-sheet');
    await expect(answers.first()).toBeVisible();
    await expect(page.locator('.a4-page').last()).toHaveAttribute('data-testid', 'answer-sheet');
    const questionCount = await questions.locator('.avoid-break').count();
    await expect(answers.locator('tbody tr')).toHaveCount(questionCount);
    expect(
      await answers
        .locator('tbody tr')
        .evaluateAll((rows) => rows.map((row) => Number(row.getAttribute('data-question-number')))),
    ).toEqual(Array.from({ length: questionCount }, (_, i) => i + 1));
    const perPage = questionCount / 10;
    const references = await answers.locator('tbody tr td:first-child').allTextContents();
    expect(references.map(Number)).toEqual(
      Array.from({ length: questionCount }, (_, i) => Math.floor(i / perPage) + 1),
    );

    for (const media of ['screen', 'print'] as const) {
      await page.emulateMedia({ media });
      const measurements = await answers.evaluateAll((pages) =>
        pages.map((el) => {
          const rect = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const safeRight = rect.right - parseFloat(style.paddingRight);
          const safeBottom = rect.bottom - parseFloat(style.paddingBottom);
          return {
            width: rect.width,
            height: rect.height,
            overflow: el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight,
            contentFits: Array.from(el.querySelectorAll('th, td, h2, p')).every((child) => {
              const box = child.getBoundingClientRect();
              return box.right <= safeRight + 1 && box.bottom <= safeBottom + 1;
            }),
          };
        }),
      );
      for (const measured of measurements) {
        expect(Math.abs(measured.width - mmToPx(A4.WIDTH_MM))).toBeLessThan(2);
        expect(Math.abs(measured.height - mmToPx(A4.HEIGHT_MM))).toBeLessThan(2);
        expect(measured.overflow).toBe(false);
        expect(measured.contentFits).toBe(true);
      }
    }
  });
}

test('解答のタイトルとスクリーンショット（名前・日付欄なし）', async ({ page }) => {
  await page.getByLabel('ランダム出題').uncheck();
  await page.getByPlaceholder('漢字練習プリント').fill('読みの確認プリント');
  await page.getByLabel('解答ページをつける').check();
  const answer = page.getByTestId('answer-sheet');
  await expect(answer.getByRole('heading')).toHaveText('解答 — 読みの確認プリント');
  await expect(answer).not.toContainText('なまえ');
  await expect(answer).not.toContainText('ひづけ');
  await expect(answer).toHaveScreenshot('a4-answer-sheet.png', {
    maxDiffPixels: 100,
    style: '.no-print { visibility: hidden; }',
  });
});

test('長いタイトル・問題20ページでも解答ページがA4からはみ出さない', async ({ page }) => {
  await page
    .getByPlaceholder('漢字練習プリント')
    .fill('漢字の読みを確認する練習プリント'.repeat(10));
  await page.getByLabel('ページ数', { exact: true }).fill('20');
  await page.getByLabel('解答ページをつける').check();
  for (const media of ['screen', 'print'] as const) {
    await page.emulateMedia({ media });
    const bounds = await page.getByTestId('answer-sheet').evaluateAll((pages) =>
      pages.map((el) => {
        const rect = el.getBoundingClientRect();
        const safeBottom = rect.bottom - parseFloat(getComputedStyle(el).paddingBottom);
        return {
          height: rect.height,
          lastRowBottom: el.querySelector('tbody tr:last-child')!.getBoundingClientRect().bottom,
          safeBottom,
        };
      }),
    );
    expect(bounds.length).toBeGreaterThan(1);
    for (const box of bounds) {
      expect(Math.abs(box.height - mmToPx(A4.HEIGHT_MM))).toBeLessThan(2);
      expect(box.lastRowBottom).toBeLessThanOrEqual(box.safeBottom);
    }
  }
});

test('PDF保存とブラウザ印刷のPDFに解答が含まれ、履歴から設定を戻せる', async ({ page }) => {
  test.setTimeout(90000);
  await page.getByLabel('解答ページをつける').check();
  const expectedPages = await page.locator('.a4-page').count();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'PDF保存', exact: true }).click();
  const download = await downloadPromise;
  expect(await download.failure()).toBeNull();
  const downloadPath = await download.path();
  expect(downloadPath).not.toBeNull();
  const pdf = await readFile(downloadPath!);
  expect(pdf.toString('latin1').match(/\/Type \/Page\b/g)).toHaveLength(expectedPages);

  // Chromiumの印刷エンジンでも改ページ数が一致することを確認する。
  const printed = await page.pdf({ preferCSSPageSize: true });
  expect(printed.toString('latin1').match(/\/Type \/Page\b/g)).toHaveLength(expectedPages);
  await page.getByLabel('解答ページをつける').uncheck();
  await page.getByRole('button', { name: '同じ設定で作る' }).first().click();
  await expect(page.getByLabel('解答ページをつける')).toBeChecked();
  await expect(page.getByTestId('answer-sheet')).toHaveCount(1);
});
