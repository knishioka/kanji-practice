import { expect, test } from '@playwright/test';
import type { PrintMode } from '../src/types';

// PrintMode に値を追加したとき、ここでコンパイルエラーになる（単一の定義源）
const modeDetails: Record<PrintMode, { name: string; selector: string }> = {
  reading: { name: '読み練習', selector: '読み練習' },
  writing: { name: '書き練習', selector: '書き練習' },
  strokeCount: { name: '画数', selector: '画数' },
  strokeOrder: { name: '書き順', selector: '書き順' },
  sentence: { name: '例文写経', selector: '例文写経' },
  homophone: { name: '同音異字', selector: '同音異字' },
  radical: { name: '部首', selector: '部首' },
  okurigana: { name: '送りがな', selector: '送りがな' },
  antonym: { name: '対義語・類義語', selector: '対義語・類義語' },
  readingWriting: { name: '読み・書き練習', selector: '読み・書き練習' },
};

test.describe('全モードA4レイアウト確認', () => {
  const modes = Object.entries(modeDetails).map(([mode, details]) => ({
    ...details,
    mode: mode as PrintMode,
  }));

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.a4-page');
  });

  for (const mode of modes) {
    test(`${mode.name}モードがA4 1ページに収まる`, async ({ page }) => {
      // モード選択
      await page.getByTestId(`mode-selector-${mode.mode}`).click();
      await page.waitForTimeout(500);

      // フッターのページ情報を取得
      const footer = await page.locator('.a4-page').first().textContent();
      const pageInfo = footer?.match(/(\d+)\/(\d+)/);

      console.log(`${mode.name}: ${pageInfo?.[0] || 'not found'}`);

      // 1ページであることを確認
      if (pageInfo) {
        expect(pageInfo[1]).toBe('1'); // 現在のページ
        expect(pageInfo[2]).toBe('1'); // 総ページ数
      }

      // スクリーンショット保存
      await page
        .locator('.a4-page')
        .first()
        .screenshot({
          path: `test-results/a4-${mode.name}.png`,
        });
    });
  }

  test('セルサイズ12mmで全モードがA4に収まる', async ({ page }) => {
    // 漢字サイズスライダーを探す（min=12, max=25）
    const cellSizeSlider = page.locator('input[type="range"][min="12"][max="25"]');

    for (const mode of modes) {
      await page.getByTestId(`mode-selector-${mode.mode}`).click();
      await page.waitForTimeout(200);
      await cellSizeSlider.fill('12');
      await page.waitForTimeout(300);

      const footer = await page.locator('.a4-page').first().textContent();
      const pageInfo = footer?.match(/(\d+)\/(\d+)/);

      console.log(`12mm ${mode.name}: ${pageInfo?.[0] || 'not found'}`);

      // 1ページであることを確認
      if (pageInfo) {
        expect(pageInfo[2]).toBe('1');
      }
    }
  });

  test('セルサイズ25mmで全モードがA4に収まる', async ({ page }) => {
    const cellSizeSlider = page.locator('input[type="range"][min="12"][max="25"]');

    for (const mode of modes) {
      await page.getByTestId(`mode-selector-${mode.mode}`).click();
      await page.waitForTimeout(200);
      await cellSizeSlider.fill('25');
      await page.waitForTimeout(300);

      const footer = await page.locator('.a4-page').first().textContent();
      const pageInfo = footer?.match(/(\d+)\/(\d+)/);

      console.log(`25mm ${mode.name}: ${pageInfo?.[0] || 'not found'}`);

      // 1ページであることを確認
      if (pageInfo) {
        expect(pageInfo[2]).toBe('1');
      }
    }
  });
});

test.describe('例文写経モード - 練習行数のA4収まり', () => {
  const sentencePracticeRowsSlider = 'input[aria-label="例文写経の練習行数"]';
  const cellSizeSliderSelector = 'input[type="range"][min="12"][max="25"]';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.a4-page');
    // 例文写経モードに切替
    await page.getByTestId('mode-selector-sentence').click();
    await page.waitForTimeout(300);
  });

  test('例文写経モード切替時に練習行数スライダーが表示される（デフォルト2行）', async ({
    page,
  }) => {
    const slider = page.locator(sentencePracticeRowsSlider);
    await expect(slider).toBeVisible();
    await expect(slider).toHaveValue('2');
  });

  test('cellSize=15 × 練習行数=2（デフォルト）でA4 1ページに収まりはみ出さない', async ({
    page,
  }) => {
    await page.locator(cellSizeSliderSelector).fill('15');
    await page.locator(sentencePracticeRowsSlider).fill('2');
    await page.waitForTimeout(400);

    const a4Page = page.locator('.a4-page').first();
    const hasOverflow = await a4Page.evaluate(
      (el) => el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight,
    );
    expect(hasOverflow).toBe(false);

    const footer = await a4Page.textContent();
    const pageInfo = footer?.match(/(\d+)\/(\d+)/);
    if (pageInfo) {
      expect(pageInfo[2]).toBe('1');
    }
  });

  test('cellSize=12 × 練習行数=3 でA4 1ページに収まる', async ({ page }) => {
    await page.locator(cellSizeSliderSelector).fill('12');
    await page.waitForTimeout(200);
    await page.locator(sentencePracticeRowsSlider).fill('3');
    await page.waitForTimeout(400);

    const a4Page = page.locator('.a4-page').first();
    const hasOverflow = await a4Page.evaluate(
      (el) => el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight,
    );
    expect(hasOverflow).toBe(false);

    const footer = await a4Page.textContent();
    const pageInfo = footer?.match(/(\d+)\/(\d+)/);
    if (pageInfo) {
      expect(pageInfo[2]).toBe('1');
    }
  });

  test('cellSize=25 × 練習行数=3 でも A4 1ページに最低2問入る', async ({ page }) => {
    await page.locator(cellSizeSliderSelector).fill('25');
    await page.waitForTimeout(200);
    await page.locator(sentencePracticeRowsSlider).fill('3');
    await page.waitForTimeout(400);

    const a4Page = page.locator('.a4-page').first();
    const hasOverflow = await a4Page.evaluate(
      (el) => el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight,
    );
    expect(hasOverflow).toBe(false);

    // ページ番号フッターから「N問/ページ × 1枚 = 計N問」を読み取り、≥2 を期待
    const totalText = await page.locator('text=/問\\/ページ/').first().textContent();
    const match = totalText?.match(/(\d+)問\/ページ/);
    if (match) {
      const rowsPerPage = Number(match[1]);
      expect(rowsPerPage).toBeGreaterThanOrEqual(2);
    }
  });

  test('reading モードに切替えると練習行数スライダーは非表示', async ({ page }) => {
    await page.getByTestId('mode-selector-reading').click();
    await page.waitForTimeout(300);
    const slider = page.locator(sentencePracticeRowsSlider);
    await expect(slider).toHaveCount(0);
  });
});
