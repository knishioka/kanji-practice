import { useRef } from 'react';
import { DebugOverlay } from './components/DebugOverlay';
import { PrintPreview } from './components/PrintPreview';
import { SettingsPanel } from './components/SettingsPanel';
import { useStore } from './store/useStore';

function App() {
  const { regenerate } = useStore();
  const printRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
      {/* Skip links */}
      <a href="#settings" className="skip-link no-print">
        設定へスキップ
      </a>
      <a href="#preview" className="skip-link no-print">
        プレビューへスキップ
      </a>

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
          <div id="settings" tabIndex={-1} className="no-print">
            <SettingsPanel />
          </div>

          {/* プレビュー */}
          <div id="preview" tabIndex={-1} className="lg:col-span-2">
            <div className="preview-area">
              <div className="flex items-center justify-between mb-4 no-print">
                <h2 className="section-title text-lg">プレビュー</h2>
              </div>
              <PrintPreview ref={printRef} onGenerate={regenerate} />
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer
        className="border-t mt-8 no-print"
        style={{
          borderColor: 'var(--color-border)',
          background: 'var(--color-bg-card)',
        }}
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
