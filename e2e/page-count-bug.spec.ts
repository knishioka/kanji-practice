import { expect, test } from '@playwright/test';

test.describe('ページ数維持テスト (#20)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('.a4-page');
  });

  test('ページ数5→生成→フッターが1/5', async ({ page }) => {
    // 読み練習モードを選択
    await page.click('text=読み練習');
    await page.locator('.a4-page').first().waitFor();

    // ページ数スライダーを5に設定
    const pageSlider = page.locator('input[type="range"][min="1"][max="20"]');
    await pageSlider.fill('5');
    // 5ページ分のA4ページが生成されるのを待つ
    await expect(page.locator('.a4-page')).toHaveCount(5);

    // スライダーの値が5であることを確認
    expect(await pageSlider.inputValue()).toBe('5');

    // 「問題を生成」ボタンをクリック
    await page.click('text=問題を生成');
    // 再生成後も5ページ維持されることを確認
    await expect(page.locator('.a4-page')).toHaveCount(5);

    // スライダーの値が5のまま維持されることを確認
    expect(await pageSlider.inputValue()).toBe('5');

    // フッターのページ表示を確認 - 1/5であるべき
    const footerText = await page.locator('.a4-page').first().textContent();
    const pageInfo = footerText?.match(/(\d+)\/(\d+)/);
    expect(pageInfo).not.toBeNull();
    expect(pageInfo![1]).toBe('1');
    expect(pageInfo![2]).toBe('5');
  });

  test('ページ数10→書き順モード→生成→フッターが1/10', async ({ page }) => {
    // 書き順モードを選択
    await page.click('text=書き順');
    await page.locator('.a4-page').first().waitFor();

    // ページ数スライダーを10に設定
    const pageSlider = page.locator('input[type="range"][min="1"][max="20"]');
    await pageSlider.fill('10');
    // 10ページ分のA4ページが生成されるのを待つ
    await expect(page.locator('.a4-page')).toHaveCount(10);

    // 「問題を生成」ボタンをクリック
    await page.click('text=問題を生成');
    // 再生成後も10ページ維持されることを確認
    await expect(page.locator('.a4-page')).toHaveCount(10);

    // スライダーの値が10のまま維持されることを確認
    expect(await pageSlider.inputValue()).toBe('10');

    // フッターのページ表示を確認
    const footerText = await page.locator('.a4-page').first().textContent();
    const pageInfo = footerText?.match(/(\d+)\/(\d+)/);
    expect(pageInfo).not.toBeNull();
    expect(pageInfo![2]).toBe('10');
  });

  test('印刷・PDF保存ボタンが複数ページ時にも有効', async ({ page }) => {
    // ページ数スライダーを3に設定
    const pageSlider = page.locator('input[type="range"][min="1"][max="20"]');
    await pageSlider.fill('3');
    // 3ページ分のA4ページが生成されるのを待つ
    await expect(page.locator('.a4-page')).toHaveCount(3);

    // 印刷ボタンが有効であることを確認
    const printButton = page.getByRole('button', { name: '印刷' });
    await expect(printButton).toBeEnabled();

    // PDF保存ボタンが有効であることを確認
    const pdfButton = page.getByRole('button', { name: 'PDF保存' });
    await expect(pdfButton).toBeEnabled();
  });
});
