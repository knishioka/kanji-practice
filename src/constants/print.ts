/**
 * A4印刷に関する定数
 * 全てのレイアウト計算で使用される中央管理された値
 */

// A4用紙サイズ (mm)
export const A4 = {
  WIDTH_MM: 210,
  HEIGHT_MM: 297,
  MARGIN_MM: 15,
  // 安全印刷領域 (マージンを除いた領域)
  SAFE_CONTENT_WIDTH_MM: 180, // 210 - 15*2
  SAFE_CONTENT_HEIGHT_MM: 267, // 297 - 15*2
  // ヘッダー・フッター
  HEADER_HEIGHT_MM: 25,
  FOOTER_HEIGHT_MM: 10,
} as const;

// セルサイズ設定 (mm)
export const CELL_SIZE = {
  MIN: 12,
  MAX: 25,
  DEFAULT: 15,
} as const;

// 練習マス設定
export const PRACTICE_COLUMNS = {
  MIN: 3,
  // 最大値は動的に計算 (calculateMaxPracticeColumns参照)
} as const;

// 書き練習モードでの安全なコンテンツ幅
// お手本1マス + 間隔を考慮した値
export const WRITING_MODE_SAFE_WIDTH_MM = 175;
