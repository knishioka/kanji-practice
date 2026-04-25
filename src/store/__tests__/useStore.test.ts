import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { CELL_SIZE, SENTENCE_LAYOUT } from '../../constants/print';
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
