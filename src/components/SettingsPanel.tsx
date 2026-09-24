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
import {
  calculateMaxPracticeColumns,
  calculateMaxSentencePracticeRows,
  calculateRowsPerPage,
} from '../utils/layout';
import {
  canGenerateOkuriganaQuestions,
  generateOkuriganaQuestions,
} from '../utils/okuriganaQuestionGenerator';
import {
  canGenerateQuestions,
  generateQuestions,
  getEffectiveExcludedChars,
} from '../utils/questionGenerator';
import {
  canGenerateRadicalQuestions,
  generateRadicalQuestions,
} from '../utils/radicalQuestionGenerator';
import { ExcludeKanjiModal } from './modals/ExcludeKanjiModal';
import {
  GradeSelector,
  getLearningPresetSettings,
  LearningPresetSelector,
  ModeSelector,
  PracticeHistory,
  PrintOptions,
} from './settings';

export function SettingsPanel() {
  const {
    settings,
    setSettings,
    setQuestions,
    excludedKanji,
    focusKanji,
    clearFocusKanji,
    generationCounter,
  } = useStore();
  const [isExcludeModalOpen, setIsExcludeModalOpen] = useState(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  const currentFocus = focusKanji[settings.grade] || [];
  const effectiveExcluded = useMemo(
    () =>
      getEffectiveExcludedChars(
        settings.grade,
        excludedKanji[settings.grade],
        focusKanji[settings.grade],
      ),
    [excludedKanji, focusKanji, settings.grade],
  );

  // 現在の学年の除外漢字（参照安定化のためメモ化）
  const currentExcluded = useMemo(
    () => excludedKanji[settings.grade] || [],
    [excludedKanji, settings.grade],
  );

  // 1ページあたりの問題数（sentenceモードは練習行数も加味）
  const rowsPerPage = useMemo(
    () =>
      calculateRowsPerPage(settings.cellSize, settings.mode, {
        sentencePracticeRows: settings.sentencePracticeRows,
      }),
    [settings.cellSize, settings.mode, settings.sentencePracticeRows],
  );

  // 合計問題数
  const totalQuestions = settings.pageCount * rowsPerPage;

  // 最大練習マス数
  const maxPracticeColumns = useMemo(
    () => calculateMaxPracticeColumns(settings.cellSize),
    [settings.cellSize],
  );

  // 例文写経の最大練習行数（cellSizeに応じて動的）
  const maxSentencePracticeRows = useMemo(
    () => calculateMaxSentencePracticeRows(settings.cellSize),
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

  // 初期ロード時・設定変更時・再生成トリガー時に問題を生成
  // biome-ignore lint/correctness/useExhaustiveDependencies: generationCounter is an intentional trigger for re-generation
  useEffect(() => {
    if (settings.grade) {
      const questions = generateQuestionsForMode(
        settings.grade,
        settings.mode,
        totalQuestions,
        settings.random,
        effectiveExcluded,
      );
      setGenerationError(questions.length === 0);
      setQuestions(questions);
    }
  }, [
    settings.grade,
    settings.mode,
    totalQuestions,
    settings.random,
    effectiveExcluded,
    generationCounter,
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

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex-1 p-2 rounded-lg text-sm"
          style={{ border: '1px dashed var(--color-border)', color: 'var(--color-primary)' }}
          onClick={() => setIsFocusModalOpen(true)}
        >
          {currentFocus.length > 0
            ? `重点漢字を選ぶ (${currentFocus.length}字を選択中)`
            : '重点漢字を選ぶ'}
        </button>
        {currentFocus.length > 0 && (
          <button type="button" className="text-sm" onClick={() => clearFocusKanji(settings.grade)}>
            重点漢字を全解除
          </button>
        )}
      </div>

      {generationError && (
        <p role="alert" className="text-sm" style={{ color: 'var(--color-primary)' }}>
          出題できる問題がありません。重点漢字・除外漢字の選択、学年またはモードを変更してください。
        </p>
      )}

      <LearningPresetSelector
        settings={settings}
        onSelect={(presetId) => setSettings(getLearningPresetSettings(presetId))}
      />

      <ModeSelector value={settings.mode} onChange={(mode) => setSettings({ mode })} />

      <PrintOptions
        settings={settings}
        rowsPerPage={rowsPerPage}
        totalQuestions={totalQuestions}
        maxPracticeColumns={maxPracticeColumns}
        maxSentencePracticeRows={maxSentencePracticeRows}
        onSettingsChange={setSettings}
      />

      <PracticeHistory />

      <ExcludeKanjiModal
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        grade={settings.grade}
        selectionMode="focus"
      />

      <ExcludeKanjiModal
        isOpen={isExcludeModalOpen}
        onClose={() => setIsExcludeModalOpen(false)}
        grade={settings.grade}
      />
    </div>
  );
}
