import { expect, test } from '@playwright/test';

test('開発環境ではレイアウトデバッグの導線を利用できる', async ({ page }) => {
  await page.goto('/');

  const debugButton = page.getByRole('button', { name: 'Debug', exact: true });
  await expect(debugButton).toBeVisible();

  await debugButton.click();
  await expect(page.getByText('レイアウトデバッグ', { exact: true })).toBeVisible();
});
