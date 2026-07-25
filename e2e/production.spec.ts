import { expect, test } from '@playwright/test';

test('production build ではデバッグ UI をマウントしない', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('.a4-page').first()).toBeVisible();

  await expect(page.getByRole('button', { name: 'Debug', exact: true })).toHaveCount(0);

  await page.keyboard.press('Control+Shift+D');
  await expect(page.getByText('レイアウトデバッグ', { exact: true })).toHaveCount(0);

  await expect(page.getByRole('button', { name: '問題を生成' })).toBeEnabled();
  await expect(page.getByRole('button', { name: '印刷' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'PDF保存' })).toBeEnabled();
});
