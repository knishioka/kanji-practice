import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CELL_SIZE } from '../constants/print';
import type { Question, Settings } from '../types';
import { calculateMaxPracticeColumns, calculateRecommendedPracticeColumns } from '../utils/layout';

interface Store {
  settings: Settings;
  questions: Question[];
  setSettings: (s: Partial<Settings>) => void;
  setQuestions: (q: Question[]) => void;
  resetSettings: () => void;
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
  showHint: false,
  title: '漢字練習プリント',
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      questions: [],
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

          return { settings: newSettings };
        }),
      setQuestions: (questions) => set({ questions }),
      resetSettings: () => set({ settings: defaultSettings }),
    }),
    {
      name: 'kanji-practice-settings',
      // 古いデータ形式からのマイグレーション
      migrate: (persistedState: unknown) => {
        const state = persistedState as { settings?: Record<string, unknown> };
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
        }
        return state;
      },
      version: 1,
    },
  ),
);
