import { expect, test } from '@playwright/test';

// A4サイズ定義 (px at 96 DPI)
const A4_WIDTH_PX = Math.round((210 / 25.4) * 96); // ~794px
const A4_HEIGHT_PX = Math.round((297 / 25.4) * 96); // ~1123px
const MARGIN_PX = Math.round((15 / 25.4) * 96); // ~57px
const TOLERANCE_PX = 10; // 許容誤差

test.describe('印刷レイアウトテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // 問題を生成
    await page.click('button:has-text("問題を生成")');
    // 生成完了を待つ
    await page.waitForSelector('.a4-page');
  });

  test('A4ページサイズが正しい', async ({ page }) => {
    const a4Page = page.locator('.a4-page').first();
    const box = await a4Page.boundingBox();

    expect(box).not.toBeNull();
    if (box) {
      // 幅が A4 サイズに近いか
      expect(Math.abs(box.width - A4_WIDTH_PX)).toBeLessThan(TOLERANCE_PX);
      // 高さが A4 サイズ以上か
      expect(box.height).toBeGreaterThanOrEqual(A4_HEIGHT_PX - TOLERANCE_PX);
    }
  });

  test('コンテンツがはみ出していない', async ({ page }) => {
    const a4Page = page.locator('.a4-page').first();

    // scrollWidth と clientWidth を比較
    const hasOverflow = await a4Page.evaluate((el) => {
      return el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
    });

    expect(hasOverflow).toBe(false);
  });

  test('パディングが正しく設定されている', async ({ page }) => {
    const a4Page = page.locator('.a4-page').first();

    const padding = await a4Page.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return {
        top: parseFloat(style.paddingTop),
        right: parseFloat(style.paddingRight),
        bottom: parseFloat(style.paddingBottom),
        left: parseFloat(style.paddingLeft),
      };
    });

    // 各パディングが 15mm (~57px) に近いか
    expect(Math.abs(padding.top - MARGIN_PX)).toBeLessThan(TOLERANCE_PX);
    expect(Math.abs(padding.right - MARGIN_PX)).toBeLessThan(TOLERANCE_PX);
    expect(Math.abs(padding.bottom - MARGIN_PX)).toBeLessThan(TOLERANCE_PX);
    expect(Math.abs(padding.left - MARGIN_PX)).toBeLessThan(TOLERANCE_PX);
  });

  test('問題行が表示されている', async ({ page }) => {
    // 問題行が存在するか
    const questionRows = page.locator('.avoid-break');
    const count = await questionRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('フッターが表示されている', async ({ page }) => {
    // フッターテキストを確認
    const footer = page.locator('.a4-page >> text=/\\d+\\/\\d+/');
    await expect(footer.first()).toBeVisible();
  });
});

test.describe('PDF生成テスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("問題を生成")');
    await page.waitForSelector('.a4-page');
  });

  test('PDFボタンが有効になる', async ({ page }) => {
    const pdfButton = page.locator('button:has-text("PDF保存")');
    await expect(pdfButton).toBeEnabled();
  });

  test('PDFダウンロードが開始される', async ({ page }) => {
    // コンソールエラーを監視
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // PDFボタンをクリック
    await page.click('button:has-text("PDF保存")');

    // ボタンが生成中状態になるか確認
    await expect(page.locator('button:has-text("PDF生成中")')).toBeVisible({ timeout: 10000 });

    // 生成完了を待つ (ボタンが元に戻る)
    await expect(page.locator('button:has-text("PDF保存")')).toBeVisible({ timeout: 60000 });

    // PDF生成エラーがないことを確認
    const pdfErrors = errors.filter((e) => e.includes('PDF') || e.includes('jspdf'));
    expect(pdfErrors).toHaveLength(0);
  });
});

test.describe('印刷プレビューテスト', () => {
  test('印刷用CSSが適用される', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("問題を生成")');
    await page.waitForSelector('.a4-page');

    // 印刷メディアをエミュレート
    await page.emulateMedia({ media: 'print' });

    // no-print要素が非表示になるか
    const noPrintElements = page.locator('.no-print');
    const count = await noPrintElements.count();

    for (let i = 0; i < count; i++) {
      const isVisible = await noPrintElements.nth(i).isVisible();
      expect(isVisible).toBe(false);
    }
  });

  test('ページサイズ変更時にレイアウトが調整される', async ({ page }) => {
    await page.goto('/');

    // マスサイズを変更
    const slider = page.locator('input[type="range"]').nth(2); // cellSizeスライダー
    await slider.fill('25');

    await page.click('button:has-text("問題を生成")');
    await page.waitForSelector('.a4-page');

    // コンテンツがはみ出していないか
    const a4Page = page.locator('.a4-page').first();
    const hasOverflow = await a4Page.evaluate((el) => {
      return el.scrollWidth > el.clientWidth;
    });

    expect(hasOverflow).toBe(false);
  });
});

test.describe('ビジュアルリグレッションテスト', () => {
  test('A4ページのスクリーンショット', async ({ page }) => {
    await page.goto('/');

    // 設定を固定（再現性のため）
    await page.click('button:has-text("問題を生成")');
    await page.waitForSelector('.a4-page');

    // A4ページのスクリーンショットを撮影
    const a4Page = page.locator('.a4-page').first();
    await expect(a4Page).toHaveScreenshot('a4-page-default.png', {
      maxDiffPixels: 100,
    });
  });

  test('設定変更後のスクリーンショット', async ({ page }) => {
    await page.goto('/');

    // 書き練習モードに変更（buttonに変更）
    await page.click('button:has-text("書き練習")');

    await page.click('button:has-text("問題を生成")');
    await page.waitForSelector('.a4-page');

    const a4Page = page.locator('.a4-page').first();
    await expect(a4Page).toHaveScreenshot('a4-page-writing-mode.png', {
      maxDiffPixels: 100,
    });
  });
});
