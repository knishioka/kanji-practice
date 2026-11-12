import { forwardRef, useCallback, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useStore } from '../store/useStore';
import type { Settings } from '../types';
import { generateFilename, generatePDF } from '../utils/pdf';
import { runAndRecordOnSuccess } from '../utils/practiceHistory';
import { PrintablePages } from './PrintablePages';

interface Props {
  onGenerate: () => void;
}

export const PrintPreview = forwardRef<HTMLDivElement, Props>(function PrintPreview(
  { onGenerate },
  ref,
) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { settings, questions, addPracticeHistory } = useStore();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const printSnapshotRef = useRef<{
    settings: Settings;
    questionCount: number;
    kanjiChars: string[];
  } | null>(null);

  const handlePrint = useReactToPrint({
    contentRef,
    onAfterPrint: () => {
      const snapshot = printSnapshotRef.current;
      if (!snapshot) return;
      addPracticeHistory(snapshot.questionCount, snapshot.kanjiChars, snapshot.settings);
      printSnapshotRef.current = null;
    },
  });

  // forwardRefとローカルrefを統合するコールバック
  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      contentRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  const handlePDFDownload = async () => {
    if (!contentRef.current) return;

    const exportedSettings = { ...settings };
    const kanjiChars = questions.map((q) => q.kanji.char);
    setIsGeneratingPDF(true);
    try {
      await runAndRecordOnSuccess(
        () => generatePDF(contentRef.current!, generateFilename(exportedSettings.title)),
        () => addPracticeHistory(questions.length, kanjiChars, exportedSettings),
      );
    } catch (error) {
      console.error('PDF生成エラー:', error);
      alert('PDFの生成に失敗しました');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* コントロールボタン */}
      <div className="flex flex-wrap gap-3 no-print">
        <button
          onClick={onGenerate}
          disabled={questions.length === 0}
          className="btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          問題を生成
        </button>
        <button
          onClick={() => {
            printSnapshotRef.current = {
              settings: { ...settings },
              questionCount: questions.length,
              kanjiChars: questions.map((q) => q.kanji.char),
            };
            handlePrint();
          }}
          disabled={questions.length === 0}
          className="px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: questions.length > 0 ? '#059669' : '#9ca3af',
            color: 'white',
            boxShadow: questions.length > 0 ? '0 2px 4px rgba(5, 150, 105, 0.3)' : 'none',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          印刷
        </button>
        <button
          onClick={handlePDFDownload}
          disabled={questions.length === 0 || isGeneratingPDF}
          className="px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: questions.length > 0 && !isGeneratingPDF ? '#7c3aed' : '#9ca3af',
            color: 'white',
            boxShadow:
              questions.length > 0 && !isGeneratingPDF
                ? '0 2px 4px rgba(124, 58, 237, 0.3)'
                : 'none',
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {isGeneratingPDF ? 'PDF生成中...' : 'PDF保存'}
        </button>
      </div>

      {/* プレビュー - PrintablePagesコンポーネントを使用 */}
      <PrintablePages ref={setRefs} questions={questions} settings={settings} />
    </div>
  );
});
