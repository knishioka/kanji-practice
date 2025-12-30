import { forwardRef, useMemo } from 'react';
import type { Question, Settings } from '../types';
import {
  calculateColumnsPerRow,
  calculateMaxOkuriganaCells,
  calculateRowsPerPage,
  calculateSafePracticeCount,
} from '../utils/layout';
import {
  AntonymQuestion,
  HomophoneQuestion,
  OkuriganaQuestion,
  PageFooter,
  PageHeader,
  RadicalQuestion,
  ReadingQuestion,
  SentenceQuestion,
  StrokeCountQuestion,
  StrokeOrderQuestion,
  WritingQuestion,
} from './print';

interface Props {
  questions: Question[];
  settings: Settings;
}

// 配列をチャンクに分割
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export const PrintablePages = forwardRef<HTMLDivElement, Props>(function PrintablePages(
  { questions, settings },
  ref,
) {
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const rowsPerPage = useMemo(
    () => calculateRowsPerPage(settings.cellSize, settings.mode),
    [settings.cellSize, settings.mode],
  );

  const pages = useMemo(() => chunkArray(questions, rowsPerPage), [questions, rowsPerPage]);

  const safePracticeCount = useMemo(
    () => calculateSafePracticeCount(settings.cellSize, settings.practiceColumns),
    [settings.cellSize, settings.practiceColumns],
  );

  const safeColumnsPerRow = useMemo(
    () => calculateColumnsPerRow(settings.cellSize),
    [settings.cellSize],
  );

  const maxOkuriganaCells = useMemo(
    () => calculateMaxOkuriganaCells(settings.cellSize),
    [settings.cellSize],
  );

  if (questions.length === 0) {
    return (
      <div ref={ref} className="a4-page mx-auto shadow-lg">
        <div className="flex items-center justify-center h-64 text-gray-400">
          「問題を生成」をクリックしてください
        </div>
      </div>
    );
  }

  const renderQuestion = (question: Question, index: number, pageIndex: number) => {
    const questionNumber = pageIndex * rowsPerPage + index + 1;

    switch (settings.mode) {
      case 'sentence':
        return (
          <SentenceQuestion
            key={index}
            question={question}
            questionNumber={questionNumber}
            cellSize={settings.cellSize}
            columnsPerRow={safeColumnsPerRow}
          />
        );
      case 'strokeCount':
        return (
          <StrokeCountQuestion
            key={index}
            question={question}
            questionNumber={questionNumber}
            cellSize={settings.cellSize}
          />
        );
      case 'reading':
        return (
          <ReadingQuestion
            key={index}
            question={question}
            questionNumber={questionNumber}
            cellSize={settings.cellSize}
          />
        );
      case 'writing':
        return (
          <WritingQuestion
            key={index}
            question={question}
            questionNumber={questionNumber}
            cellSize={settings.cellSize}
            practiceCount={safePracticeCount}
            gridStyle={settings.gridStyle}
            showHint={settings.showHint}
          />
        );
      case 'homophone':
        return (
          <HomophoneQuestion
            key={index}
            question={question}
            questionNumber={questionNumber}
            cellSize={settings.cellSize}
          />
        );
      case 'radical':
        return (
          <RadicalQuestion
            key={index}
            question={question}
            questionNumber={questionNumber}
            cellSize={settings.cellSize}
          />
        );
      case 'okurigana':
        return (
          <OkuriganaQuestion
            key={index}
            question={question}
            questionNumber={questionNumber}
            cellSize={settings.cellSize}
            gridStyle={settings.gridStyle}
            showHint={settings.showHint}
            practiceCount={maxOkuriganaCells}
          />
        );
      case 'antonym':
        return (
          <AntonymQuestion
            key={index}
            question={question}
            questionNumber={questionNumber}
            cellSize={settings.cellSize}
          />
        );
      case 'strokeOrder':
        return (
          <StrokeOrderQuestion
            key={index}
            question={question}
            questionNumber={questionNumber}
            cellSize={settings.cellSize}
            practiceCount={safePracticeCount}
            gridStyle={settings.gridStyle}
          />
        );
    }
  };

  return (
    <div ref={ref}>
      {pages.map((pageQuestions, pageIndex) => (
        <div
          key={pageIndex}
          className="a4-page mx-auto shadow-lg print:shadow-none page-break flex flex-col"
        >
          <PageHeader
            title={settings.title}
            mode={settings.mode}
            date={today}
            isFirstPage={pageIndex === 0}
          />

          <div className="flex-grow">
            {pageQuestions.map((question, index) => renderQuestion(question, index, pageIndex))}
          </div>

          <PageFooter
            grade={settings.grade}
            currentPage={pageIndex + 1}
            totalPages={pages.length}
            mode={settings.mode}
          />
        </div>
      ))}
    </div>
  );
});
