import { forwardRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { generateFilename, generatePDF } from '../utils/pdf';
import { PrintablePages } from './PrintablePages';

interface Props {
  onGenerate: () => void;
}

export const PrintPreview = forwardRef<HTMLDivElement, Props>(function PrintPreview(
  { onGenerate },
  ref,
) {
  const { settings, questions } = useStore();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handlePDFDownload = async () => {
    if (!ref || !('current' in ref) || !ref.current) return;

    setIsGeneratingPDF(true);
    try {
      await generatePDF(ref.current, generateFilename(settings.title));
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
        <button onClick={onGenerate} className="btn-primary flex items-center gap-2">
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
          onClick={() => window.print()}
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
      <PrintablePages ref={ref} questions={questions} settings={settings} />
    </div>
  );
});
