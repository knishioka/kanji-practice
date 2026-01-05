import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { ExcludeKanjiModal } from './modals/ExcludeKanjiModal';
import { GradeSelector, ModeSelector, PrintOptions } from './settings';

export function SettingsPanel() {
  const { settings, setSettings, setQuestions, excludedKanji } = useStore();
  const [isExcludeModalOpen, setIsExcludeModalOpen] = useState(false);

  // 現在の学年の除外漢字（参照安定化のためメモ化）
  const currentExcluded = useMemo(
    () => excludedKanji[settings.grade] || [],
    [excludedKanji, settings.grade],
  );

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
    (
      grade: Grade,
      mode: PrintMode,
      count: number,
      random: boolean,
      excluded: string[],
    ): Question[] => {
      switch (mode) {
        case 'homophone':
          if (!canGenerateHomophoneQuestions(grade, excluded)) return [];
          return generateHomophoneQuestions(grade, count, random, excluded);
        case 'radical':
          if (!canGenerateRadicalQuestions(grade, excluded)) return [];
          return generateRadicalQuestions(grade, count, random, excluded);
        case 'okurigana':
          if (!canGenerateOkuriganaQuestions(grade, excluded)) return [];
          return generateOkuriganaQuestions(grade, count, random, excluded);
        case 'antonym':
          if (!canGenerateAntonymQuestions(grade, excluded)) return [];
          return generateAntonymQuestions(grade, count, random, excluded);
        default:
          if (!canGenerateQuestions(grade, excluded)) return [];
          return generateQuestions(grade, count, random, excluded);
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
        currentExcluded,
      );
      setQuestions(questions);
    }
  }, [
    settings.grade,
    settings.mode,
    totalQuestions,
    settings.random,
    currentExcluded,
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

      <GradeSelector
        value={settings.grade}
        onChange={(grade) => setSettings({ grade })}
        excludedCount={currentExcluded.length}
        onOpenExcludeModal={() => setIsExcludeModalOpen(true)}
      />

      <ModeSelector value={settings.mode} onChange={(mode) => setSettings({ mode })} />

      <PrintOptions
        settings={settings}
        rowsPerPage={rowsPerPage}
        totalQuestions={totalQuestions}
        maxPracticeColumns={maxPracticeColumns}
        onSettingsChange={setSettings}
      />

      <ExcludeKanjiModal
        isOpen={isExcludeModalOpen}
        onClose={() => setIsExcludeModalOpen(false)}
        grade={settings.grade}
      />
    </div>
  );
}
