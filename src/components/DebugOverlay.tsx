import { useCallback, useEffect, useState } from 'react';
import { type LayoutValidation, validateLayout } from '../utils/pdf';

interface Props {
  targetRef: React.RefObject<HTMLElement | null>;
  enabled?: boolean;
}

// A4サイズ定義 (mm)
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MARGIN_MM = 15;

export function DebugOverlay({ targetRef, enabled = false }: Props) {
  const [isVisible, setIsVisible] = useState(enabled);
  const [validation, setValidation] = useState<LayoutValidation | null>(null);
  const [showGuides, setShowGuides] = useState(true);

  const runValidation = useCallback(() => {
    if (!targetRef.current) return;

    const pages = targetRef.current.querySelectorAll('.a4-page');
    if (pages.length === 0) {
      setValidation(null);
      return;
    }

    // 最初のページを検証
    const firstPage = pages[0] as HTMLElement;
    const result = validateLayout(firstPage);
    setValidation(result);
  }, [targetRef]);

  useEffect(() => {
    if (isVisible) {
      runValidation();
      // ResizeObserverでサイズ変更を監視
      const observer = new ResizeObserver(runValidation);
      if (targetRef.current) {
        observer.observe(targetRef.current);
      }
      return () => observer.disconnect();
    }
  }, [isVisible, runValidation, targetRef]);

  // キーボードショートカット (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible((v) => !v);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 px-3 py-1 bg-gray-800 text-white text-xs rounded-full opacity-50 hover:opacity-100 no-print"
        title="デバッグパネルを表示 (Ctrl+Shift+D)"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white border border-gray-300 rounded-lg shadow-lg no-print">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b rounded-t-lg">
        <span className="font-bold text-sm">レイアウトデバッグ</span>
        <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-gray-700">
          ×
        </button>
      </div>

      {/* コンテンツ */}
      <div className="p-3 space-y-3 text-xs">
        {/* 検証結果 */}
        {validation && (
          <>
            {/* ステータス */}
            <div
              className={`p-2 rounded ${
                validation.isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {validation.isValid ? '✓ レイアウト正常' : '✗ レイアウトに問題あり'}
            </div>

            {/* エラー */}
            {validation.errors.length > 0 && (
              <div className="space-y-1">
                <div className="font-bold text-red-600">エラー:</div>
                {validation.errors.map((e, i) => (
                  <div key={i} className="pl-2 text-red-600">
                    • {e}
                  </div>
                ))}
              </div>
            )}

            {/* 警告 */}
            {validation.warnings.length > 0 && (
              <div className="space-y-1">
                <div className="font-bold text-orange-600">警告:</div>
                {validation.warnings.map((w, i) => (
                  <div key={i} className="pl-2 text-orange-600">
                    • {w}
                  </div>
                ))}
              </div>
            )}

            {/* 測定値 */}
            <div className="space-y-1 border-t pt-2">
              <div className="font-bold">測定値:</div>
              <div className="grid grid-cols-2 gap-1 pl-2">
                <span>ページ幅:</span>
                <span
                  className={
                    Math.abs(validation.measurements.pageWidth - A4_WIDTH_MM) > 5
                      ? 'text-red-600'
                      : ''
                  }
                >
                  {validation.measurements.pageWidth.toFixed(1)}mm
                </span>
                <span>ページ高さ:</span>
                <span>{validation.measurements.pageHeight.toFixed(1)}mm</span>
                <span>コンテンツ幅:</span>
                <span
                  className={
                    validation.measurements.contentWidth > A4_WIDTH_MM - MARGIN_MM * 2
                      ? 'text-red-600'
                      : ''
                  }
                >
                  {validation.measurements.contentWidth.toFixed(1)}mm
                </span>
                <span>コンテンツ高さ:</span>
                <span>{validation.measurements.contentHeight.toFixed(1)}mm</span>
              </div>
            </div>

            {/* 期待値 */}
            <div className="space-y-1 border-t pt-2 text-gray-500">
              <div className="font-bold">期待値 (A4):</div>
              <div className="grid grid-cols-2 gap-1 pl-2">
                <span>用紙サイズ:</span>
                <span>
                  {A4_WIDTH_MM}mm × {A4_HEIGHT_MM}mm
                </span>
                <span>余白:</span>
                <span>{MARGIN_MM}mm</span>
                <span>印刷可能領域:</span>
                <span>
                  {A4_WIDTH_MM - MARGIN_MM * 2}mm × {A4_HEIGHT_MM - MARGIN_MM * 2}mm
                </span>
              </div>
            </div>
          </>
        )}

        {/* コントロール */}
        <div className="border-t pt-2 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showGuides}
              onChange={(e) => setShowGuides(e.target.checked)}
              className="w-3 h-3"
            />
            <span>ガイドライン表示</span>
          </label>

          <button
            onClick={runValidation}
            className="w-full px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            再検証
          </button>
        </div>

        {/* ショートカット */}
        <div className="text-gray-400 text-center">Ctrl+Shift+D で表示/非表示</div>
      </div>

      {/* ガイドラインオーバーレイ */}
      {showGuides && targetRef.current && <DebugGuides targetRef={targetRef} />}
    </div>
  );
}

// ガイドラインオーバーレイ
function DebugGuides({ targetRef }: { targetRef: React.RefObject<HTMLElement | null> }) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!targetRef.current) return;

    const updateRect = () => {
      const pages = targetRef.current?.querySelectorAll('.a4-page');
      if (pages && pages.length > 0) {
        setRect((pages[0] as HTMLElement).getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [targetRef]);

  if (!rect) return null;

  // 15mm余白を示すガイドライン (pxに変換)
  const marginPx = (MARGIN_MM / 25.4) * 96;

  return (
    <div
      className="fixed pointer-events-none border-2 border-dashed border-blue-500 no-print"
      style={{
        top: rect.top + marginPx,
        left: rect.left + marginPx,
        width: rect.width - marginPx * 2,
        height: rect.height - marginPx * 2,
        opacity: 0.5,
      }}
    >
      {/* コーナーマーカー */}
      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-blue-500" />
      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-blue-500" />
      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-blue-500" />
      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-blue-500" />

      {/* ラベル */}
      <div className="absolute -top-5 left-0 text-blue-500 text-xs bg-white px-1">
        印刷可能領域 (180mm × 267mm)
      </div>
    </div>
  );
}
