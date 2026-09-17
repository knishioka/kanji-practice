import { expect, test } from '@playwright/test';

test('重点漢字を選択・保存し、除外優先の空状態から全解除で復帰する', async ({ page }, testInfo) => {
  await page.goto('./');
  await page.getByRole('button', { name: '重点漢字を選ぶ', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: '一', exact: true }).click();
  await expect(dialog.getByRole('button', { name: '一', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await dialog.getByRole('button', { name: '適用', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '重点漢字を選ぶ (1字を選択中)', exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => {
        const saved = JSON.parse(localStorage.getItem('kanji-practice-settings') || '{}');
        return [
          ...new Set(saved.state.questions.map((q: { kanji: { char: string } }) => q.kanji.char)),
        ];
      }),
    )
    .toEqual(['一']);
  await page.reload();
  await expect(
    page.getByRole('button', { name: '重点漢字を選ぶ (1字を選択中)', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '除外漢字を設定', exact: true }).click();
  await dialog.getByRole('button', { name: '一', exact: true }).click();
  await dialog.getByRole('button', { name: '適用', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('出題できる問題がありません');
  for (const name of ['問題を生成', '印刷', 'PDF保存']) {
    await expect(page.getByRole('button', { name, exact: true })).toBeDisabled();
  }
  await testInfo.attach('重点漢字と除外の重複時の案内', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
  await page.getByRole('button', { name: '重点漢字を全解除', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '問題を生成', exact: true })).toBeEnabled();
});

test('学年ごとに選択を保持し、キャンセルは保存しない', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: '重点漢字を選ぶ', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: '一', exact: true }).click();
  await dialog.getByRole('button', { name: 'キャンセル', exact: true }).click();
  await page.getByRole('button', { name: '重点漢字を選ぶ', exact: true }).click();
  await expect(dialog.getByRole('button', { name: '一', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await dialog.getByRole('button', { name: '一', exact: true }).click();
  await dialog.getByRole('button', { name: '適用', exact: true }).click();
  await page.getByRole('button', { name: /9級/ }).click();
  await expect(page.getByRole('button', { name: '重点漢字を選ぶ', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /10級/ }).click();
  await expect(
    page.getByRole('button', { name: '重点漢字を選ぶ (1字を選択中)', exact: true }),
  ).toBeVisible();
});
