import { useCallback, useMemo, useRef } from 'react';
import { DebugOverlay } from './components/DebugOverlay';
import { PrintPreview } from './components/PrintPreview';
import { SettingsPanel } from './components/SettingsPanel';
import { useStore } from './store/useStore';
import {
  canGenerateAntonymQuestions,
  generateAntonymQuestions,
} from './utils/antonymQuestionGenerator';
import {
  canGenerateHomophoneQuestions,
  generateHomophoneQuestions,
} from './utils/homophoneQuestionGenerator';
import { calculateRowsPerPage } from './utils/layout';
import {
  canGenerateOkuriganaQuestions,
  generateOkuriganaQuestions,
} from './utils/okuriganaQuestionGenerator';
import {
  canGenerateQuestions,
  generateQuestions as generateQuestionsUtil,
} from './utils/questionGenerator';
import {
  canGenerateRadicalQuestions,
  generateRadicalQuestions,
} from './utils/radicalQuestionGenerator';

function App() {
  const { settings, setQuestions } = useStore();
  const printRef = useRef<HTMLDivElement>(null);

  const rowsPerPage = useMemo(
    () => calculateRowsPerPage(settings.cellSize, settings.mode),
    [settings.cellSize, settings.mode],
  );

  const totalQuestions = settings.pageCount * rowsPerPage;

  const handleGenerateQuestions = useCallback(() => {
    // モードに応じた問題生成
    switch (settings.mode) {
      case 'homophone': {
        if (!canGenerateHomophoneQuestions(settings.grade)) {
          alert('選択した学年に同音異字のデータがありません');
          return;
        }
        const questions = generateHomophoneQuestions(
          settings.grade,
          totalQuestions,
          settings.random,
        );
        setQuestions(questions);
        break;
      }
      case 'radical': {
        if (!canGenerateRadicalQuestions(settings.grade)) {
          alert('選択した学年に部首データがありません。漢字データに部首情報を追加してください。');
          return;
        }
        const questions = generateRadicalQuestions(settings.grade, totalQuestions, settings.random);
        setQuestions(questions);
        break;
      }
      case 'okurigana': {
        if (!canGenerateOkuriganaQuestions(settings.grade)) {
          alert(
            '選択した学年に送りがなデータがありません。漢字データに送りがな情報を追加してください。',
          );
          return;
        }
        const questions = generateOkuriganaQuestions(
          settings.grade,
          totalQuestions,
          settings.random,
        );
        setQuestions(questions);
        break;
      }
      case 'antonym': {
        if (!canGenerateAntonymQuestions(settings.grade)) {
          alert(
            '選択した学年に対義語・類義語データがありません。漢字データに対義語・類義語情報を追加してください。',
          );
          return;
        }
        const questions = generateAntonymQuestions(settings.grade, totalQuestions, settings.random);
        setQuestions(questions);
        break;
      }
      default: {
        if (!canGenerateQuestions(settings.grade)) {
          alert('選択した学年に漢字データがありません');
          return;
        }
        const questions = generateQuestionsUtil(settings.grade, totalQuestions, settings.random);
        setQuestions(questions);
      }
    }
  }, [settings.grade, settings.mode, settings.random, totalQuestions, setQuestions]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* ヘッダー */}
      <header className="kanji-header no-print">
        <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm">
              漢
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide">漢字練習プリント</h1>
              <p className="text-sm text-white/80 mt-0.5">小学校1〜6年生（漢検10級〜5級）対応</p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 設定パネル */}
          <div className="no-print">
            <SettingsPanel />
          </div>

          {/* プレビュー */}
          <div className="lg:col-span-2">
            <div className="preview-area">
              <div className="flex items-center justify-between mb-4 no-print">
                <h2 className="section-title text-lg">プレビュー</h2>
              </div>
              <PrintPreview ref={printRef} onGenerate={handleGenerateQuestions} />
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer
        className="border-t mt-8 no-print"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-card)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-5 text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            漢字練習プリント作成ツール
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)', opacity: 0.7 }}>
            A4サイズで印刷 / PDF保存に対応しています
          </p>
        </div>
      </footer>

      {/* デバッグオーバーレイ */}
      <DebugOverlay targetRef={printRef} />
    </div>
  );
}

export default App;
