import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// A4サイズ定義
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

// CSS標準DPI
const CSS_DPI = 96;

// mm を px に変換
function mmToPx(mm: number): number {
  return (mm / 25.4) * CSS_DPI;
}

/**
 * oklch色をrgbに変換するヘルパー
 * html2canvasはoklchをサポートしていないため
 */
function convertOklchColors(element: HTMLElement): void {
  const allElements = element.querySelectorAll('*');

  allElements.forEach((el) => {
    if (el instanceof HTMLElement) {
      const computedStyle = window.getComputedStyle(el);
      const style = el.style;

      // 主要なカラープロパティをチェック
      ['color', 'background-color', 'border-color', 'outline-color'].forEach((prop) => {
        const value = computedStyle.getPropertyValue(prop);
        if (value && value.includes('oklch')) {
          // oklchが含まれる場合、安全な色に置き換え
          if (prop === 'background-color') {
            style.setProperty(prop, 'transparent');
          } else {
            style.setProperty(prop, '#000000');
          }
        }
      });
    }
  });
}

/**
 * HTML要素をPDFとして生成・ダウンロード
 * @param element - PDF化する要素（.a4-pageを含む親要素）
 * @param filename - 保存するファイル名
 */
export async function generatePDF(element: HTMLElement, filename: string): Promise<void> {
  const pages = element.querySelectorAll('.a4-page');

  if (pages.length === 0) {
    throw new Error('印刷可能なページが見つかりません');
  }

  // px単位でjsPDFを初期化（より正確な制御のため）
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [mmToPx(A4_WIDTH_MM), mmToPx(A4_HEIGHT_MM)],
    hotfixes: ['px_scaling'],
  });

  const pageWidthPx = mmToPx(A4_WIDTH_MM);
  const pageHeightPx = mmToPx(A4_HEIGHT_MM);

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i] as HTMLElement;

    // ページをキャンバスに変換
    const canvas = await html2canvas(page, {
      scale: 2, // 高解像度
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      // A4サイズを明示的に指定
      width: mmToPx(A4_WIDTH_MM),
      height: mmToPx(A4_HEIGHT_MM),
      // 印刷用のスタイルを適用
      onclone: (_clonedDoc, clonedElement) => {
        // oklch色を互換性のある形式に変換
        convertOklchColors(clonedElement);

        // クローンされた要素に直接スタイルを適用
        clonedElement.style.width = `${A4_WIDTH_MM}mm`;
        clonedElement.style.height = `${A4_HEIGHT_MM}mm`;
        clonedElement.style.minHeight = `${A4_HEIGHT_MM}mm`;
        clonedElement.style.padding = '15mm';
        clonedElement.style.margin = '0';
        clonedElement.style.boxShadow = 'none';
        clonedElement.style.boxSizing = 'border-box';
        clonedElement.style.overflow = 'hidden';
        clonedElement.style.position = 'relative';
        clonedElement.style.backgroundColor = '#ffffff';
      },
    });

    const imgData = canvas.toDataURL('image/png');

    // 2ページ目以降は新しいページを追加
    if (i > 0) {
      pdf.addPage([mmToPx(A4_WIDTH_MM), mmToPx(A4_HEIGHT_MM)], 'portrait');
    }

    // キャンバスのアスペクト比を維持してPDFに追加
    const canvasAspectRatio = canvas.height / canvas.width;
    const pdfAspectRatio = pageHeightPx / pageWidthPx;

    let imgWidth = pageWidthPx;
    let imgHeight = pageHeightPx;
    let offsetX = 0;
    let offsetY = 0;

    if (canvasAspectRatio > pdfAspectRatio) {
      // キャンバスが縦長 - 幅に合わせる
      imgHeight = pageWidthPx * canvasAspectRatio;
      offsetY = (pageHeightPx - imgHeight) / 2;
    } else {
      // キャンバスが横長または同じ - 高さに合わせる
      imgWidth = pageHeightPx / canvasAspectRatio;
      offsetX = (pageWidthPx - imgWidth) / 2;
    }

    // 画像をPDFに追加
    pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight, undefined, 'FAST');
  }

  // PDFをダウンロード
  pdf.save(filename);
}

/**
 * 現在の日時からファイル名を生成
 */
export function generateFilename(prefix: string = '漢字練習'): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const timeStr = now.toTimeString().slice(0, 5).replace(':', '');
  return `${prefix}_${dateStr}_${timeStr}.pdf`;
}

/**
 * レイアウト検証ユーティリティ
 */
export interface LayoutValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  measurements: {
    pageWidth: number;
    pageHeight: number;
    contentWidth: number;
    contentHeight: number;
    overflow: boolean;
  };
}

export function validateLayout(element: HTMLElement): LayoutValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  // px を mm に変換
  const pxToMm = (px: number) => (px * 25.4) / CSS_DPI;

  const pageWidthMm = pxToMm(rect.width);
  const pageHeightMm = pxToMm(rect.height);

  // A4サイズチェック
  if (Math.abs(pageWidthMm - A4_WIDTH_MM) > 5) {
    errors.push(`幅が不正: ${pageWidthMm.toFixed(1)}mm (期待値: ${A4_WIDTH_MM}mm)`);
  }

  if (pageHeightMm < A4_HEIGHT_MM - 5) {
    warnings.push(`高さが不足: ${pageHeightMm.toFixed(1)}mm (最小: ${A4_HEIGHT_MM}mm)`);
  }

  // オーバーフローチェック
  const hasOverflow =
    element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight;

  if (hasOverflow) {
    errors.push('コンテンツがはみ出しています');
  }

  // パディングチェック
  const paddingTop = parseFloat(style.paddingTop);
  const paddingLeft = parseFloat(style.paddingLeft);
  const expectedPaddingPx = mmToPx(15);

  if (Math.abs(paddingTop - expectedPaddingPx) > 10) {
    warnings.push(`上パディングが不正: ${pxToMm(paddingTop).toFixed(1)}mm`);
  }

  if (Math.abs(paddingLeft - expectedPaddingPx) > 10) {
    warnings.push(`左パディングが不正: ${pxToMm(paddingLeft).toFixed(1)}mm`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    measurements: {
      pageWidth: pageWidthMm,
      pageHeight: pageHeightMm,
      contentWidth: pxToMm(element.scrollWidth),
      contentHeight: pxToMm(element.scrollHeight),
      overflow: hasOverflow,
    },
  };
}
