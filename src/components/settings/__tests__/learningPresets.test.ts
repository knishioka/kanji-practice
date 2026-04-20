import { describe, expect, it } from 'vitest';
import type { Settings } from '../../../types';
import {
  applyLearningPreset,
  getLearningPresetSettings,
  getMatchingLearningPresetId,
  learningPresets,
} from '../config';

const baseSettings: Settings = {
  grade: 6,
  mode: 'antonym',
  pageCount: 4,
  random: false,
  gridStyle: 'none',
  cellSize: 25,
  practiceColumns: 3,
  showHint: false,
  title: 'カスタム設定',
};

describe('learning presets', () => {
  it('defines the three learner presets with the required fields', () => {
    expect(learningPresets.map(({ label }) => label)).toEqual([
      '9級 読み定着',
      '9級 書き取り',
      '8級 先取り',
    ]);

    for (const preset of learningPresets) {
      expect(preset.settings).toMatchObject({
        grade: expect.any(Number),
        mode: expect.any(String),
        pageCount: expect.any(Number),
        cellSize: expect.any(Number),
        practiceColumns: expect.any(Number),
        showHint: expect.any(Boolean),
        title: expect.any(String),
      });
    }
  });

  it('applies the 9級 読み定着 preset as grade 2 reading practice', () => {
    const next = applyLearningPreset(baseSettings, 'kanken9-reading');

    expect(next).toMatchObject({
      grade: 2,
      mode: 'reading',
      pageCount: 2,
      cellSize: 17,
      practiceColumns: 6,
      showHint: false,
      title: '9級 読み定着プリント',
    });
    expect(next.random).toBe(false);
    expect(next.gridStyle).toBe('none');
  });

  it('applies the 9級 書き取り preset with guided writing defaults', () => {
    const next = applyLearningPreset(baseSettings, 'kanken9-writing');

    expect(next).toMatchObject({
      grade: 2,
      mode: 'writing',
      pageCount: 2,
      cellSize: 15,
      practiceColumns: 7,
      showHint: true,
      title: '9級 書き取りプリント',
      gridStyle: 'cross',
    });
  });

  it('applies the 8級 先取り preset as a lighter grade 3 start point', () => {
    const next = applyLearningPreset(baseSettings, 'kanken8-preview');

    expect(next).toMatchObject({
      grade: 3,
      mode: 'reading',
      pageCount: 1,
      cellSize: 18,
      practiceColumns: 5,
      showHint: false,
      title: '8級 先取りプリント',
    });
  });

  it('detects the active preset only while its values still match', () => {
    const applied = applyLearningPreset(baseSettings, 'kanken9-writing');
    expect(getMatchingLearningPresetId(applied)).toBe('kanken9-writing');

    const customized: Settings = {
      ...applied,
      title: '9級 書き取りプリント（復習）',
    };
    expect(getMatchingLearningPresetId(customized)).toBeNull();
  });

  it('overwrites manual changes when another preset is selected', () => {
    const writingPreset = getLearningPresetSettings('kanken9-writing');
    const next = applyLearningPreset(
      {
        ...baseSettings,
        ...getLearningPresetSettings('kanken9-reading'),
        pageCount: 6,
        cellSize: 12,
        practiceColumns: 11,
        showHint: true,
        title: '個別に変更したタイトル',
      },
      'kanken9-writing',
    );

    expect(next).toMatchObject(writingPreset);
  });
});
