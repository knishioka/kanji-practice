import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { CELL_SIZE, SENTENCE_LAYOUT } from '../../constants/print';
import type { PracticeHistoryEntry } from '../../types';
import { calculateMaxSentencePracticeRows } from '../../utils/layout';

// vitest が node 環境で動作するため、useStore (zustand persist) のロード前に localStorage をスタブする必要がある
const localStorageStore = new Map<string, string>();
const stubLocalStorage = {
  getItem: (key: string) => localStorageStore.get(key) ?? null,
  setItem: (key: string, value: string) => {
    localStorageStore.set(key, value);
  },
  removeItem: (key: string) => {
    localStorageStore.delete(key);
  },
  clear: () => {
    localStorageStore.clear();
  },
  key: (i: number) => Array.from(localStorageStore.keys())[i] ?? null,
  get length() {
    return localStorageStore.size;
  },
};
vi.stubGlobal('localStorage', stubLocalStorage);

// stub設定後に動的importで store を読み込む
const { useStore } = await import('../useStore');

describe('useStore - sentencePracticeRows', () => {
  beforeAll(() => {
    // localStorage が確実に存在することを確認
    expect(typeof localStorage.setItem).toBe('function');
  });

  beforeEach(() => {
    useStore.getState().resetSettings();
  });

  it('デフォルト値は SENTENCE_LAYOUT.DEFAULT_PRACTICE_ROWS', () => {
    const { settings } = useStore.getState();
    expect(settings.sentencePracticeRows).toBe(SENTENCE_LAYOUT.DEFAULT_PRACTICE_ROWS);
  });

  it('上限を超える値を指定すると動的上限にクランプされる', () => {
    useStore.getState().setSettings({ cellSize: CELL_SIZE.MAX });
    const max = calculateMaxSentencePracticeRows(CELL_SIZE.MAX);
    useStore.getState().setSettings({ sentencePracticeRows: 10 });
    expect(useStore.getState().settings.sentencePracticeRows).toBe(max);
  });

  it('MIN_PRACTICE_ROWS 未満を指定すると下限にクランプされる', () => {
    useStore.getState().setSettings({ sentencePracticeRows: 0 });
    expect(useStore.getState().settings.sentencePracticeRows).toBe(
      SENTENCE_LAYOUT.MIN_PRACTICE_ROWS,
    );
  });

  it('cellSize変更時に sentencePracticeRows が動的上限を超えていれば下げる', () => {
    useStore.getState().setSettings({
      cellSize: 12,
      sentencePracticeRows: SENTENCE_LAYOUT.EDU_MAX_PRACTICE_ROWS,
    });
    expect(useStore.getState().settings.sentencePracticeRows).toBe(
      SENTENCE_LAYOUT.EDU_MAX_PRACTICE_ROWS,
    );

    useStore.getState().setSettings({ cellSize: 25 });
    const expected = calculateMaxSentencePracticeRows(25);
    expect(useStore.getState().settings.sentencePracticeRows).toBeLessThanOrEqual(expected);
  });
});

describe('useStore - first page header settings', () => {
  beforeEach(() => {
    useStore.getState().resetSettings();
  });

  it('uses compatible defaults for the first page header', () => {
    const { settings } = useStore.getState();

    expect(settings.showNameField).toBe(true);
    expect(settings.showDateField).toBe(true);
    expect(settings.nameLabel).toBe('なまえ');
    expect(settings.dateLabel).toBe('ひづけ');
  });

  it('updates first page header visibility and labels', () => {
    useStore.getState().setSettings({
      showNameField: false,
      showDateField: false,
      nameLabel: 'Name',
      dateLabel: 'Date',
    });

    expect(useStore.getState().settings).toMatchObject({
      showNameField: false,
      showDateField: false,
      nameLabel: 'Name',
      dateLabel: 'Date',
    });
  });
});

describe('useStore - practice history', () => {
  beforeEach(() => {
    useStore.getState().resetSettings();
    useStore.getState().clearPracticeHistory();
  });

  it('stores a settings snapshot and trims history to the latest 20 entries', () => {
    useStore.getState().setSettings({ grade: 2, mode: 'reading', pageCount: 2 });

    for (let index = 0; index < 21; index += 1) {
      useStore.getState().addPracticeHistory(index + 1);
    }

    const { practiceHistory } = useStore.getState();
    expect(practiceHistory).toHaveLength(20);
    expect(practiceHistory[0]).toMatchObject({
      grade: 2,
      mode: 'reading',
      pageCount: 2,
      questionCount: 21,
      settings: { grade: 2, mode: 'reading', pageCount: 2 },
    });
    expect(practiceHistory.at(-1)?.questionCount).toBe(2);
  });

  it('restores saved settings and requests question regeneration', () => {
    useStore.getState().setSettings({ grade: 2, mode: 'writing', pageCount: 3 });
    useStore.getState().addPracticeHistory(24);
    const entry = useStore.getState().practiceHistory[0] as PracticeHistoryEntry;
    const generationCounter = useStore.getState().generationCounter;
    useStore.getState().setSettings({ grade: 5, mode: 'sentence', pageCount: 1 });

    useStore.getState().restorePracticeHistory(entry);

    expect(useStore.getState().settings).toEqual(entry.settings);
    expect(useStore.getState().generationCounter).toBe(generationCounter + 1);
  });

  it('clears all history', () => {
    useStore.getState().addPracticeHistory(8);

    useStore.getState().clearPracticeHistory();

    expect(useStore.getState().practiceHistory).toEqual([]);
  });

  it('migrates version 4 persisted settings without losing them', async () => {
    localStorage.setItem(
      'kanji-practice-settings',
      JSON.stringify({
        state: {
          settings: { ...useStore.getState().settings, grade: 4, pageCount: 3 },
          excludedKanji: { 4: ['愛'] },
        },
        version: 4,
      }),
    );

    await useStore.persist.rehydrate();

    expect(useStore.getState().settings).toMatchObject({ grade: 4, pageCount: 3 });
    expect(useStore.getState().excludedKanji).toEqual({ 4: ['愛'] });
    expect(useStore.getState().practiceHistory).toEqual([]);
  });
});
