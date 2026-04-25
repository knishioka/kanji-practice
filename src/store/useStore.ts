import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CELL_SIZE, SENTENCE_LAYOUT } from '../constants/print';
import type { ExcludedKanjiMap, Grade, Question, Settings } from '../types';
import {
  calculateMaxPracticeColumns,
  calculateMaxSentencePracticeRows,
  calculateRecommendedPracticeColumns,
} from '../utils/layout';

interface Store {
  settings: Settings;
  questions: Question[];
  excludedKanji: ExcludedKanjiMap;
  /** 問題再生成トリガー（インクリメントで再生成を要求） */
  generationCounter: number;
  setSettings: (s: Partial<Settings>) => void;
  setQuestions: (q: Question[]) => void;
  /** 問題再生成をトリガー（ランダム問題の再生成等） */
  regenerate: () => void;
  resetSettings: () => void;
  setExcludedKanji: (grade: Grade, chars: string[]) => void;
  toggleExcludedKanji: (grade: Grade, char: string) => void;
  clearExcludedKanji: (grade: Grade) => void;
}

// デフォルト設定（おすすめ値）
const defaultSettings: Settings = {
  grade: 1,
  mode: 'writing',
  pageCount: 1,
  random: true,
  gridStyle: 'cross',
  cellSize: CELL_SIZE.DEFAULT,
  practiceColumns: calculateRecommendedPracticeColumns(CELL_SIZE.DEFAULT),
  sentencePracticeRows: SENTENCE_LAYOUT.DEFAULT_PRACTICE_ROWS,
  showHint: false,
  title: '漢字練習プリント',
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      questions: [],
      excludedKanji: {},
      generationCounter: 0,
      regenerate: () => set((state) => ({ generationCounter: state.generationCounter + 1 })),
      setSettings: (s) =>
        set((state) => {
          const newSettings = { ...state.settings, ...s };

          // cellSizeが変更された場合、practiceColumnsを自動調整
          if (s.cellSize !== undefined) {
            const maxColumns = calculateMaxPracticeColumns(s.cellSize);
            if (newSettings.practiceColumns > maxColumns) {
              newSettings.practiceColumns = maxColumns;
            }
          }

          // practiceColumnsが最大値を超えないように制限
          if (s.practiceColumns !== undefined) {
            const maxColumns = calculateMaxPracticeColumns(newSettings.cellSize);
            newSettings.practiceColumns = Math.min(s.practiceColumns, maxColumns);
          }

          // cellSize変更時に sentencePracticeRows を動的上限にクランプ
          if (s.cellSize !== undefined) {
            const maxRows = calculateMaxSentencePracticeRows(s.cellSize);
            if (newSettings.sentencePracticeRows > maxRows) {
              newSettings.sentencePracticeRows = maxRows;
            }
          }

          // sentencePracticeRows指定時も上限・下限でクランプ
          if (s.sentencePracticeRows !== undefined) {
            const maxRows = calculateMaxSentencePracticeRows(newSettings.cellSize);
            newSettings.sentencePracticeRows = Math.max(
              SENTENCE_LAYOUT.MIN_PRACTICE_ROWS,
              Math.min(s.sentencePracticeRows, maxRows),
            );
          }

          return { settings: newSettings };
        }),
      setQuestions: (questions) => set({ questions }),
      resetSettings: () => set({ settings: defaultSettings }),
      setExcludedKanji: (grade, chars) =>
        set((state) => ({
          excludedKanji: { ...state.excludedKanji, [grade]: chars },
        })),
      toggleExcludedKanji: (grade, char) =>
        set((state) => {
          const current = state.excludedKanji[grade] || [];
          const newChars = current.includes(char)
            ? current.filter((c) => c !== char)
            : [...current, char];
          return {
            excludedKanji: { ...state.excludedKanji, [grade]: newChars },
          };
        }),
      clearExcludedKanji: (grade) =>
        set((state) => ({
          excludedKanji: { ...state.excludedKanji, [grade]: [] },
        })),
    }),
    {
      name: 'kanji-practice-settings',
      // 古いデータ形式からのマイグレーション
      migrate: (persistedState: unknown) => {
        const state = persistedState as {
          settings?: Record<string, unknown>;
          excludedKanji?: ExcludedKanjiMap;
        };
        if (state?.settings) {
          // grades (配列) から grade (単一) へのマイグレーション
          if ('grades' in state.settings && !('grade' in state.settings)) {
            const grades = state.settings.grades as number[];
            state.settings.grade = grades?.[0] || 1;
            delete state.settings.grades;
          }
          // count から pageCount へのマイグレーション
          if ('count' in state.settings && !('pageCount' in state.settings)) {
            state.settings.pageCount = 1;
            delete state.settings.count;
          }
          // v2 → v3: 例文写経の練習行数を新規追加（既存ユーザーはデフォルト2に）
          if (!('sentencePracticeRows' in state.settings)) {
            state.settings.sentencePracticeRows = SENTENCE_LAYOUT.DEFAULT_PRACTICE_ROWS;
          }
        }
        // excludedKanjiがない場合は空オブジェクトを設定
        if (!state?.excludedKanji) {
          state.excludedKanji = {};
        }
        return state;
      },
      version: 3,
    },
  ),
);
