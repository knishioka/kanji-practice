/**
 * レイアウト計算ユーティリティ
 * A4印刷レイアウトに関する全ての計算を集約
 */

import { A4, PRACTICE_COLUMNS, WRITING_MODE_SAFE_WIDTH_MM } from '../constants/print';
import type { PrintMode } from '../types';

/**
 * 1ページあたりの問題数を計算
 * @param cellSize - マスサイズ (mm)
 * @param mode - プリントモード
 * @returns 1ページに収まる問題数
 */
export function calculateRowsPerPage(cellSize: number, mode: PrintMode): number {
  const availableHeight = A4.SAFE_CONTENT_HEIGHT_MM - A4.HEADER_HEIGHT_MM - A4.FOOTER_HEIGHT_MM;

  // モードによって行の高さが異なる
  let rowHeight: number;
  switch (mode) {
    case 'sentence':
      // 例文写経: お手本行(cellSize) + 練習行(cellSize) + マージン(約16mm)
      // SentenceQuestion: mb-4 + 問題番号 + mb-1 + SentenceGrid(mb-2 + mb-4)
      rowHeight = cellSize * 2 + 16;
      break;
    case 'homophone':
      // 同音異字: 見出し(0.7) + 最大3選択肢(0.5*3=1.5) + マージン(0.3) = 2.5
      // 安全マージンを含めて2.8
      rowHeight = cellSize * 2.8;
      break;
    default:
      rowHeight = cellSize + 6; // その他は1行 + マージン
  }

  return Math.max(1, Math.floor(availableHeight / rowHeight));
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
