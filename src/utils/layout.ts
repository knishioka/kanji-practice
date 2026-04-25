/**
 * レイアウト計算ユーティリティ
 * A4印刷レイアウトに関する全ての計算を集約
 */

import {
  A4,
  PRACTICE_COLUMNS,
  SENTENCE_LAYOUT,
  WRITING_MODE_SAFE_WIDTH_MM,
} from '../constants/print';
import type { PrintMode } from '../types';

/**
 * レイアウト計算用のオプション
 * モード固有のパラメータを受け取るために使用
 */
export interface LayoutOptions {
  /** 例文写経モードの練習行数（省略時は1で現状互換） */
  sentencePracticeRows?: number;
}

/**
 * 例文写経モード1問の高さ式（mm）
 *   cellSize × (FURIGANA_PADDING_RATIO + EXAMPLE_ROW_RATIO + PRACTICE_ROW_RATIO × N) + BOTTOM_MARGIN_MM
 */
function getSentenceRowHeight(cellSize: number, practiceRows: number): number {
  const ratio =
    SENTENCE_LAYOUT.FURIGANA_PADDING_RATIO +
    SENTENCE_LAYOUT.EXAMPLE_ROW_RATIO +
    SENTENCE_LAYOUT.PRACTICE_ROW_RATIO * practiceRows;
  return cellSize * ratio + SENTENCE_LAYOUT.BOTTOM_MARGIN_MM;
}

/**
 * モード別の1問あたりの推定行高さ(mm)を返す
 *
 * 注意: これらの値はCSSマージンの単純合計ではなく、
 * 実際のブラウザレンダリング結果を元にチューニングした経験値。
 * フォントのline-height、flex配置、ブラウザ固有のマージン折り畳み等を
 * 考慮しているため、コンポーネント側のmargin値と一致しない場合がある。
 *
 * @param cellSize - マスサイズ (mm)
 * @param mode - プリントモード
 * @param options - モード固有のオプション（sentencePracticeRows等）
 * @returns 推定行高さ (mm)
 */
export function getRowHeight(cellSize: number, mode: PrintMode, options?: LayoutOptions): number {
  switch (mode) {
    case 'sentence': {
      // 例文写経: ふりがなパディング + お手本行 + 練習行(N) + 問題間マージン
      const practiceRows = options?.sentencePracticeRows ?? SENTENCE_LAYOUT.MIN_PRACTICE_ROWS;
      return getSentenceRowHeight(cellSize, practiceRows);
    }
    case 'homophone':
      // 同音異字: 読み見出し + 最大3選択肢 + マージン（経験値）
      return cellSize * 2.6;
    case 'readingWriting':
      // 読み書き統合: 読み行 + 書き行 + 問題間マージン（経験値）
      return cellSize * 2 + 6;
    case 'reading':
    case 'writing':
    case 'strokeCount':
    case 'radical':
    case 'okurigana':
    case 'antonym':
    case 'strokeOrder':
      return cellSize + 6;
    default: {
      const _exhaustive: never = mode;
      console.error(`未対応のモード: ${_exhaustive}`);
      return cellSize + 6;
    }
  }
}

/**
 * 1ページあたりの問題数を計算
 * @param cellSize - マスサイズ (mm)
 * @param mode - プリントモード
 * @param options - モード固有のオプション（sentencePracticeRows等）
 * @returns 1ページに収まる問題数
 */
export function calculateRowsPerPage(
  cellSize: number,
  mode: PrintMode,
  options?: LayoutOptions,
): number {
  const availableHeight = A4.SAFE_CONTENT_HEIGHT_MM - A4.HEADER_HEIGHT_MM - A4.FOOTER_HEIGHT_MM;
  return Math.max(1, Math.floor(availableHeight / getRowHeight(cellSize, mode, options)));
}

/**
 * 例文写経モードの練習行数の動的上限を計算
 * 「A4 1ページに最低 MIN_QUESTIONS_PER_PAGE 問が収まる」制約と
 * 教育的疲労上限 EDU_MAX_PRACTICE_ROWS の小さい方を返す
 *
 * 計算式の導出:
 *   minQ × (cellSize × (1.3 + N) + BOTTOM) ≤ availableHeight
 *   ⇔ N ≤ (availableHeight / minQ − BOTTOM) / cellSize − 1.3
 *
 * @param cellSize - マスサイズ (mm)
 * @returns 練習行数の上限 (≧ MIN_PRACTICE_ROWS)
 */
export function calculateMaxSentencePracticeRows(cellSize: number): number {
  const availableHeight = A4.SAFE_CONTENT_HEIGHT_MM - A4.HEADER_HEIGHT_MM - A4.FOOTER_HEIGHT_MM;
  const baseRatio = SENTENCE_LAYOUT.FURIGANA_PADDING_RATIO + SENTENCE_LAYOUT.EXAMPLE_ROW_RATIO;
  const heightForOne =
    availableHeight / SENTENCE_LAYOUT.MIN_QUESTIONS_PER_PAGE - SENTENCE_LAYOUT.BOTTOM_MARGIN_MM;
  const maxByLayout = Math.floor(
    heightForOne / cellSize / SENTENCE_LAYOUT.PRACTICE_ROW_RATIO - baseRatio,
  );
  return Math.max(
    SENTENCE_LAYOUT.MIN_PRACTICE_ROWS,
    Math.min(SENTENCE_LAYOUT.EDU_MAX_PRACTICE_ROWS, maxByLayout),
  );
}

/**
 * 最大練習マス数を計算（A4に収まる最大値）
 * @param cellSize - マスサイズ (mm)
 * @returns 最大練習マス数
 */
export function calculateMaxPracticeColumns(cellSize: number): number {
  // お手本1マスを引いた残りの幅で計算
  return Math.max(PRACTICE_COLUMNS.MIN, Math.floor(WRITING_MODE_SAFE_WIDTH_MM / cellSize) - 1);
}

/**
 * おすすめ練習マス数を計算
 * 最大値の70%程度で、適度な余白を確保
 * @param cellSize - マスサイズ (mm)
 * @returns おすすめ練習マス数
 */
export function calculateRecommendedPracticeColumns(cellSize: number): number {
  const max = calculateMaxPracticeColumns(cellSize);
  return Math.max(PRACTICE_COLUMNS.MIN, Math.min(8, Math.floor(max * 0.7)));
}

/**
 * 例文写経モードでの1行あたりの文字数を計算
 * @param cellSize - マスサイズ (mm)
 * @returns 1行に収まる文字数
 */
export function calculateColumnsPerRow(cellSize: number): number {
  return Math.floor(WRITING_MODE_SAFE_WIDTH_MM / cellSize);
}

/**
 * 安全な練習マス数を計算（はみ出し防止）
 * @param cellSize - マスサイズ (mm)
 * @param requestedColumns - 要求されたマス数
 * @returns はみ出さない範囲で調整されたマス数
 */
export function calculateSafePracticeCount(cellSize: number, requestedColumns: number): number {
  const maxCells = Math.floor(WRITING_MODE_SAFE_WIDTH_MM / cellSize) - 2; // -2 for example + spacing
  return Math.min(requestedColumns, maxCells);
}

/**
 * 送りがなモードでの最大練習マス数を計算
 * @param cellSize - マスサイズ (mm)
 * @returns 1行に収まる最大マス数（漢字1マス + 番号を除く）
 */
export function calculateMaxOkuriganaCells(cellSize: number): number {
  // 送りがなのマスは cellSize * 0.7
  const okuriganaSize = cellSize * 0.7;
  // 利用可能幅から漢字マス(cellSize)と番号・余白(約15mm)を引いた残りで計算
  const availableWidth = WRITING_MODE_SAFE_WIDTH_MM - cellSize - 15;
  return Math.max(1, Math.floor(availableWidth / okuriganaSize));
}

/**
 * 書き取り問題での最適な練習マス数を計算
 * 単語欄の幅を考慮して、1行に収まる最大マス数を返す
 * @param cellSize - マスサイズ (mm)
 * @param requestedColumns - 要求されたマス数
 * @returns 最適な練習マス数
 */
export function calculateOptimalPracticeCount(cellSize: number, requestedColumns: number): number {
  // レイアウト構成要素の幅 (mm)
  const questionNumberWidth = 6; // 問題番号
  const gap = 3; // 要素間のギャップ
  const wordSectionWidth = cellSize * 2.5; // 単語欄（最大4文字程度）

  // 利用可能な幅を計算
  const usedWidth = questionNumberWidth + gap + wordSectionWidth + gap;
  const availableWidth = A4.SAFE_CONTENT_WIDTH_MM - usedWidth;

  // 練習マス数を計算
  const maxCells = Math.floor(availableWidth / cellSize);

  return Math.max(PRACTICE_COLUMNS.MIN, Math.min(requestedColumns, maxCells));
}
