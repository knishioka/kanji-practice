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

// 解答一覧は折り返し用の行高と表見出しの領域を確保する。
export const ANSWER_SHEET_LAYOUT = {
  ROW_HEIGHT_MM: 16,
  TABLE_HEADER_HEIGHT_MM: 8,
  TITLE_FONT_SIZE_MM: 5,
  TITLE_LINE_HEIGHT_MM: 7.5,
  HEADER_MARGIN_BOTTOM_MM: 4,
  HEADER_PADDING_BOTTOM_MM: 3,
  HEADER_BORDER_WIDTH_PX: 1,
  DESCRIPTION_FONT_SIZE_MM: 3.5,
  DESCRIPTION_LINE_HEIGHT_MM: 5,
  DESCRIPTION_MARGIN_TOP_MM: 1,
} as const;

// 例文写経モードのレイアウト定数
// 1問の高さ式: cellSize × (FURIGANA_PADDING_RATIO + EXAMPLE_ROW_RATIO + PRACTICE_ROW_RATIO × N) + BOTTOM_MARGIN_MM
export const SENTENCE_LAYOUT = {
  FURIGANA_PADDING_RATIO: 0.3, // ふりがなパディング（cellSize比）
  EXAMPLE_ROW_RATIO: 1.0, // お手本行の高さ係数
  PRACTICE_ROW_RATIO: 1.0, // 練習1行あたりの高さ係数
  BOTTOM_MARGIN_MM: 8, // 問題間の下マージン
  DEFAULT_PRACTICE_ROWS: 2, // デフォルト練習行数（写経の最小有効反復）
  MIN_PRACTICE_ROWS: 1,
  EDU_MAX_PRACTICE_ROWS: 3, // 教育的負荷上限（同一例文の連続書写疲労を抑制）
  MIN_QUESTIONS_PER_PAGE: 2, // A4 1ページに最低限収める問題数
} as const;
