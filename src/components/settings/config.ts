/**
 * 設定パネルで使用する定数とマッピング
 */

import type { Grade, GridStyle, PrintMode } from '../../types';

// 学年オプション
export const grades: { value: Grade; label: string }[] = [
  { value: 1, label: '1年生 (10級)' },
  { value: 2, label: '2年生 (9級)' },
  { value: 3, label: '3年生 (8級)' },
  { value: 4, label: '4年生 (7級)' },
  { value: 5, label: '5年生 (6級)' },
  { value: 6, label: '6年生 (5級)' },
];

// プリントモードオプション
export const modes: { value: PrintMode; label: string; desc: string }[] = [
  { value: 'reading', label: '読み練習', desc: '漢字を見て読み方を書く' },
  { value: 'writing', label: '書き練習', desc: '読み方を見て漢字を書く' },
  { value: 'strokeCount', label: '画数', desc: '漢字の画数を答える' },
  { value: 'strokeOrder', label: '書き順', desc: '書き順を見て練習する' },
  { value: 'sentence', label: '例文写経', desc: '例文を見て書き写す' },
  { value: 'homophone', label: '同音異字', desc: '同じ読みで異なる漢字を区別' },
  { value: 'radical', label: '部首', desc: '漢字の部首を答える' },
  { value: 'okurigana', label: '送りがな', desc: '正しい送りがなを書く' },
  { value: 'antonym', label: '対義語・類義語', desc: '反対/似た意味の漢字を答える' },
];

// グリッドスタイルオプション
export const gridStyles: { value: GridStyle; label: string }[] = [
  { value: 'cross', label: '十字ガイド' },
  { value: 'dots', label: 'ドットガイド' },
  { value: 'none', label: 'ガイドなし' },
];

// モードごとの設定適用マップ
export interface ModeSettingsConfig {
  practiceColumns: boolean;
  gridStyle: boolean;
  showHint: boolean;
  cellSizeLabel: string;
}

export const modeSettings: Record<PrintMode, ModeSettingsConfig> = {
  reading: {
    practiceColumns: false,
    gridStyle: false,
    showHint: false,
    cellSizeLabel: '漢字サイズ',
  },
  writing: {
    practiceColumns: true,
    gridStyle: true,
    showHint: true,
    cellSizeLabel: 'マスサイズ',
  },
  strokeCount: {
    practiceColumns: false,
    gridStyle: false,
    showHint: false,
    cellSizeLabel: '漢字サイズ',
  },
  sentence: {
    practiceColumns: false,
    gridStyle: true,
    showHint: false,
    cellSizeLabel: 'マスサイズ',
  },
  homophone: {
    practiceColumns: false,
    gridStyle: false,
    showHint: false,
    cellSizeLabel: '漢字サイズ',
  },
  radical: {
    practiceColumns: false,
    gridStyle: false,
    showHint: false,
    cellSizeLabel: '漢字サイズ',
  },
  okurigana: {
    practiceColumns: false,
    gridStyle: true,
    showHint: true,
    cellSizeLabel: 'マスサイズ',
  },
  antonym: {
    practiceColumns: false,
    gridStyle: false,
    showHint: false,
    cellSizeLabel: '漢字サイズ',
  },
  strokeOrder: {
    practiceColumns: true,
    gridStyle: true,
    showHint: false,
    cellSizeLabel: 'マスサイズ',
  },
};
