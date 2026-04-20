/**
 * 設定パネルで使用する定数とマッピング
 */

import { CELL_SIZE } from '../../constants/print';
import type { Grade, GridStyle, PrintMode, Settings } from '../../types';
import { calculateRecommendedPracticeColumns } from '../../utils/layout';

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
  {
    value: 'antonym',
    label: '対義語・類義語',
    desc: '反対/似た意味の漢字を答える',
  },
  {
    value: 'readingWriting',
    label: '読み・書き練習',
    desc: '読みと書きを同時に練習する',
  },
];

// グリッドスタイルオプション
export const gridStyles: { value: GridStyle; label: string }[] = [
  { value: 'cross', label: '十字ガイド' },
  { value: 'dots', label: 'ドットガイド' },
  { value: 'none', label: 'ガイドなし' },
];

type LearningPresetSettingKey =
  | 'grade'
  | 'mode'
  | 'pageCount'
  | 'cellSize'
  | 'practiceColumns'
  | 'showHint'
  | 'title'
  | 'gridStyle';

export type LearningPresetSettings = Pick<Settings, LearningPresetSettingKey>;

export type LearningPresetId = 'kanken9-reading' | 'kanken9-writing' | 'kanken8-preview';

export interface LearningPreset {
  id: LearningPresetId;
  label: string;
  description: string;
  settings: LearningPresetSettings;
}

function createLearningPresetSettings(
  overrides: Partial<LearningPresetSettings>,
): LearningPresetSettings {
  return {
    grade: 2,
    mode: 'reading',
    pageCount: 1,
    cellSize: CELL_SIZE.DEFAULT,
    practiceColumns: calculateRecommendedPracticeColumns(CELL_SIZE.DEFAULT),
    showHint: false,
    title: '漢字練習プリント',
    gridStyle: 'none',
    ...overrides,
  };
}

export const learningPresets: LearningPreset[] = [
  {
    id: 'kanken9-reading',
    label: '9級 読み定着',
    description: '2年生の漢字を大きめ表示で読み中心に反復します。',
    settings: createLearningPresetSettings({
      grade: 2,
      mode: 'reading',
      pageCount: 2,
      cellSize: 17,
      practiceColumns: calculateRecommendedPracticeColumns(17),
      showHint: false,
      title: '9級 読み定着プリント',
    }),
  },
  {
    id: 'kanken9-writing',
    label: '9級 書き取り',
    description: '2年生の漢字を十字ガイド付きでしっかり書き取ります。',
    settings: createLearningPresetSettings({
      grade: 2,
      mode: 'writing',
      pageCount: 2,
      cellSize: CELL_SIZE.DEFAULT,
      practiceColumns: calculateRecommendedPracticeColumns(CELL_SIZE.DEFAULT),
      showHint: true,
      title: '9級 書き取りプリント',
      gridStyle: 'cross',
    }),
  },
  {
    id: 'kanken8-preview',
    label: '8級 先取り',
    description: '3年生の漢字を1ページだけ軽めに触れて負荷を抑えます。',
    settings: createLearningPresetSettings({
      grade: 3,
      mode: 'reading',
      pageCount: 1,
      cellSize: 18,
      practiceColumns: calculateRecommendedPracticeColumns(18),
      showHint: false,
      title: '8級 先取りプリント',
    }),
  },
];

const learningPresetMap = learningPresets.reduce<Record<LearningPresetId, LearningPreset>>(
  (map, preset) => {
    map[preset.id] = preset;
    return map;
  },
  {} as Record<LearningPresetId, LearningPreset>,
);

export function getLearningPresetSettings(id: LearningPresetId): LearningPresetSettings {
  return { ...learningPresetMap[id].settings };
}

export function applyLearningPreset(settings: Settings, id: LearningPresetId): Settings {
  return { ...settings, ...getLearningPresetSettings(id) };
}

export function getMatchingLearningPresetId(settings: Settings): LearningPresetId | null {
  for (const preset of learningPresets) {
    const isMatch = Object.entries(preset.settings).every(([key, value]) => {
      const settingsKey = key as keyof Settings;
      return settings[settingsKey] === value;
    });

    if (isMatch) {
      return preset.id;
    }
  }

  return null;
}

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
  readingWriting: {
    practiceColumns: true,
    gridStyle: true,
    showHint: true,
    cellSizeLabel: 'マスサイズ',
  },
};
