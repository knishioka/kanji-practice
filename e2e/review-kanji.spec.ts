import { expect, test } from '@playwright/test';

test('最近の練習から復習を混ぜ、比率を保存してプレビューを生成できる', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByLabel('復習を混ぜる', { exact: true })).not.toBeChecked();
  await expect(page.getByLabel('復習の比率', { exact: true })).toHaveValue('20');
  await expect(page.getByLabel('復習の比率', { exact: true })).toBeDisabled();
  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem('kanji-practice-settings') || '{}');
    const settings = saved.state.settings;
    saved.state.practiceHistory = [
      {
        id: 'review-test',
        executedAt: '2026-01-01T00:00:00Z',
        grade: 1,
        mode: 'writing',
        pageCount: 1,
        questionCount: 3,
        kanjiChars: ['森', '空', '花'],
        settings,
      },
    ];
    localStorage.setItem('kanji-practice-settings', JSON.stringify(saved));
  });
  await page.reload();
  await page.getByLabel('復習を混ぜる', { exact: true }).check();
  await page.getByLabel('復習の比率', { exact: true }).selectOption('30');
  await page.getByRole('button', { name: '問題を生成', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.locator('.a4-page')).toHaveCount(1);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const saved = JSON.parse(localStorage.getItem('kanji-practice-settings') || '{}');
        const count = Math.round(saved.state.questions.length * 0.3);
        return saved.state.questions
          .slice(0, count)
          .map((q: { kanji: { char: string } }) => q.kanji.char);
      }),
    )
    .toEqual(expect.arrayContaining(['森', '空', '花']));
  await page.reload();
  await expect(page.getByLabel('復習を混ぜる', { exact: true })).toBeChecked();
  await expect(page.getByLabel('復習の比率', { exact: true })).toHaveValue('30');
  expect(errors).toEqual([]);
  await testInfo.attach('復習を混ぜたプレビュー', {
    body: await page.screenshot(),
    contentType: 'image/png',
  });
});

test('対応外モードは復習を無効表示し、対応モードに戻すと設定を保持する', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('復習を混ぜる', { exact: true }).check();
  for (const mode of ['homophone', 'radical', 'okurigana', 'antonym']) {
    await page.getByTestId(`mode-selector-${mode}`).click();
    await expect(page.getByLabel('復習を混ぜる', { exact: true })).toBeDisabled();
    await expect(page.getByLabel('復習を混ぜる', { exact: true })).not.toBeChecked();
    await expect(page.getByLabel('復習の比率', { exact: true })).toBeDisabled();
    await expect(page.locator('#review-unavailable')).toBeVisible();
  }
  await page.getByTestId('mode-selector-reading').click();
  await expect(page.getByLabel('復習を混ぜる', { exact: true })).toBeChecked();
  await expect(page.getByRole('button', { name: '問題を生成', exact: true })).toBeEnabled();
});
