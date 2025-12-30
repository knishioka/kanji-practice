import { useCallback, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import type { Grade, PrintMode, Question } from '../types';
import {
  canGenerateAntonymQuestions,
  generateAntonymQuestions,
} from '../utils/antonymQuestionGenerator';
import {
  canGenerateHomophoneQuestions,
  generateHomophoneQuestions,
} from '../utils/homophoneQuestionGenerator';
import { calculateMaxPracticeColumns, calculateRowsPerPage } from '../utils/layout';
import {
  canGenerateOkuriganaQuestions,
  generateOkuriganaQuestions,
} from '../utils/okuriganaQuestionGenerator';
import { canGenerateQuestions, generateQuestions } from '../utils/questionGenerator';
import {
  canGenerateRadicalQuestions,
  generateRadicalQuestions,
} from '../utils/radicalQuestionGenerator';
import { GradeSelector, ModeSelector, PrintOptions } from './settings';

export function SettingsPanel() {
  const { settings, setSettings, setQuestions } = useStore();

  // 1ページあたりの問題数
  const rowsPerPage = useMemo(
    () => calculateRowsPerPage(settings.cellSize, settings.mode),
    [settings.cellSize, settings.mode],
  );

  // 合計問題数
  const totalQuestions = settings.pageCount * rowsPerPage;

  // 最大練習マス数
  const maxPracticeColumns = useMemo(
    () => calculateMaxPracticeColumns(settings.cellSize),
    [settings.cellSize],
  );

  // モードに応じた問題生成関数
  const generateQuestionsForMode = useCallback(
    (grade: Grade, mode: PrintMode, count: number, random: boolean): Question[] => {
      switch (mode) {
        case 'homophone':
          if (!canGenerateHomophoneQuestions(grade)) return [];
          return generateHomophoneQuestions(grade, count, random);
        case 'radical':
          if (!canGenerateRadicalQuestions(grade)) return [];
          return generateRadicalQuestions(grade, count, random);
        case 'okurigana':
          if (!canGenerateOkuriganaQuestions(grade)) return [];
          return generateOkuriganaQuestions(grade, count, random);
        case 'antonym':
          if (!canGenerateAntonymQuestions(grade)) return [];
          return generateAntonymQuestions(grade, count, random);
        default:
          if (!canGenerateQuestions(grade)) return [];
          return generateQuestions(grade, count, random);
      }
    },
    [],
  );

  // 初期ロード時と設定変更時に問題を生成
  useEffect(() => {
    if (settings.grade) {
      const questions = generateQuestionsForMode(
        settings.grade,
        settings.mode,
        totalQuestions,
        settings.random,
      );
      setQuestions(questions);
    }
  }, [
    settings.grade,
    settings.mode,
    totalQuestions,
    settings.random,
    setQuestions,
    generateQuestionsForMode,
  ]);

  return (
    <div className="kanji-card p-6 space-y-6">
      <div
        className="flex items-center gap-3 pb-4"
        style={{ borderBottom: '2px solid var(--color-border-light)' }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
          style={{
            background:
              'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
          }}
        >
          設
        </div>
        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
          プリント設定
        </h2>
      </div>

      <GradeSelector value={settings.grade} onChange={(grade) => setSettings({ grade })} />

      <ModeSelector value={settings.mode} onChange={(mode) => setSettings({ mode })} />

      <PrintOptions
        settings={settings}
        rowsPerPage={rowsPerPage}
        totalQuestions={totalQuestions}
        maxPracticeColumns={maxPracticeColumns}
        onSettingsChange={setSettings}
      />
    </div>
  );
}
