import { useCallback, useMemo, useState } from 'react';
import { getKanjiByGrade } from '../../data/kanji';
import { useStore } from '../../store/useStore';
import type { Grade } from '../../types';
import { grades } from '../settings/config';
import { Modal } from './Modal';

interface ExcludeKanjiModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: Grade;
  selectionMode?: 'exclude' | 'focus';
}

export function ExcludeKanjiModal({
  isOpen,
  onClose,
  grade,
  selectionMode = 'exclude',
}: ExcludeKanjiModalProps) {
  const store = useStore();
  const isFocus = selectionMode === 'focus';
  const excludedKanji = isFocus ? store.focusKanji : store.excludedKanji;
  const setExcludedKanji = isFocus ? store.setFocusKanji : store.setExcludedKanji;

  // 現在の学年の漢字一覧
  const kanjiList = useMemo(() => getKanjiByGrade([grade]), [grade]);

  // 一時的な除外リスト（モーダル内での編集用）
  const [tempExcluded, setTempExcluded] = useState<Set<string>>(
    new Set(excludedKanji[grade] || []),
  );

  // モーダルが開くたびに一時リストをリセット
  useMemo(() => {
    if (isOpen) {
      setTempExcluded(new Set(excludedKanji[grade] || []));
    }
  }, [isOpen, excludedKanji, grade]);

  const gradeLabel = grades.find((g) => g.value === grade)?.label || `${grade}年生`;

  // 漢字の除外/解除をトグル
  const handleToggle = useCallback((char: string) => {
    setTempExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(char)) {
        next.delete(char);
      } else {
        next.add(char);
      }
      return next;
    });
  }, []);

  // 全て除外
  const handleExcludeAll = useCallback(() => {
    setTempExcluded(new Set(kanjiList.map((k) => k.char)));
  }, [kanjiList]);

  // 全て解除
  const handleClearAll = useCallback(() => {
    setTempExcluded(new Set());
  }, []);

  // 適用
  const handleApply = useCallback(() => {
    setExcludedKanji(grade, Array.from(tempExcluded));
    onClose();
  }, [grade, tempExcluded, setExcludedKanji, onClose]);

  // キャンセル
  const handleCancel = useCallback(() => {
    setTempExcluded(new Set(excludedKanji[grade] || []));
    onClose();
  }, [excludedKanji, grade, onClose]);

  const excludedCount = tempExcluded.size;
  const totalCount = kanjiList.length;
  const availableCount = isFocus ? excludedCount || totalCount : totalCount - excludedCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={`${isFocus ? '重点漢字' : '除外漢字'}の設定 - ${gradeLabel}`}
    >
      {/* サマリー */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg-muted)' }}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            出題対象:{' '}
            <span style={{ color: 'var(--color-text)', fontWeight: 'bold' }}>
              {availableCount}字
            </span>{' '}
            / {totalCount}字
            {excludedCount > 0 && (
              <span style={{ color: 'var(--color-primary)' }}>
                {' '}
                ({excludedCount}字を{isFocus ? '選択中' : '除外中'})
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExcludeAll}
              className="px-3 py-1 text-xs rounded-lg transition-colors"
              style={{
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              {isFocus ? '全て選択' : '全て除外'}
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1 text-xs rounded-lg transition-colors"
              style={{
                border: '1px solid var(--color-border)',
                color: 'var(--color-text-muted)',
              }}
            >
              全て解除
            </button>
          </div>
        </div>
        {isFocus && (
          <p className="mt-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            選んだ漢字だけを出題します。未選択なら全漢字が対象です。除外漢字の設定が優先されます。
          </p>
        )}
        {availableCount < 5 && (
          <div
            className="mt-2 text-xs px-2 py-1 rounded"
            style={{ backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#b45309' }}
          >
            出題対象が少なすぎます。5字以上を推奨します。
          </div>
        )}
      </div>

      {/* 漢字グリッド */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: '400px' }}>
        <div className="grid grid-cols-6 gap-2">
          {kanjiList.map((kanji) => {
            const isExcluded = tempExcluded.has(kanji.char);
            const isAvailable = isFocus ? isExcluded : !isExcluded;
            return (
              <button
                key={kanji.char}
                type="button"
                aria-label={kanji.char}
                aria-pressed={isExcluded}
                onClick={() => handleToggle(kanji.char)}
                className="relative p-2 rounded-lg text-center transition-all"
                style={{
                  border: `2px solid ${isAvailable ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  backgroundColor: isAvailable ? 'white' : 'var(--color-bg-muted)',
                  opacity: isAvailable ? 1 : 0.5,
                }}
              >
                <span
                  className="text-xl font-bold"
                  style={{
                    color: isAvailable ? 'var(--color-text)' : 'var(--color-text-muted)',
                    textDecoration: !isFocus && isExcluded ? 'line-through' : 'none',
                  }}
                >
                  {kanji.char}
                </span>
                {isExcluded && (
                  <div
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: 'var(--color-text-muted)', color: 'white' }}
                  >
                    {isFocus ? '✓' : '×'}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* フッター */}
      <div
        className="flex justify-end gap-3 px-4 py-3 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 rounded-lg text-sm transition-colors"
          style={{
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
          }}
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-2 rounded-lg text-sm transition-colors"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'white',
          }}
        >
          適用
        </button>
      </div>
    </Modal>
  );
}
