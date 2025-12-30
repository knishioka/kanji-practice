import { expect, test } from '@playwright/test';

test.describe('全モードA4レイアウト確認', () => {
  const modes = [
    { name: '読み練習', selector: '読み練習' },
    { name: '書き練習', selector: '書き練習' },
    { name: '画数', selector: '画数' },
    { name: '書き順', selector: '書き順' },
    { name: '例文写経', selector: '例文写経' },
    { name: '同音異字', selector: '同音異字' },
    { name: '部首', selector: '部首' },
    { name: '送りがな', selector: '送りがな' },
    { name: '対義語・類義語', selector: '対義語・類義語' },
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.a4-page');
  });

  for (const mode of modes) {
    test(`${mode.name}モードがA4 1ページに収まる`, async ({ page }) => {
      // モード選択
      await page.click(`text=${mode.selector}`);
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
      await page.click(`text=${mode.selector}`);
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
      await page.click(`text=${mode.selector}`);
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
