import { useStore } from '../../store/useStore';
import { modes } from './config';

const VISIBLE_HISTORY_COUNT = 5;

export function PracticeHistory() {
  const { practiceHistory, restorePracticeHistory, clearPracticeHistory } = useStore();

  if (practiceHistory.length === 0) return null;

  const handleClear = () => {
    if (window.confirm('練習履歴をすべて削除しますか？')) {
      clearPracticeHistory();
    }
  };

  return (
    <section className="no-print space-y-3" aria-labelledby="practice-history-heading">
      <div className="flex items-center justify-between gap-2">
        <h3 id="practice-history-heading" className="font-semibold">
          最近の練習
        </h3>
        <button
          type="button"
          onClick={handleClear}
          className="text-xs underline"
          style={{ color: 'var(--color-text-muted)' }}
        >
          履歴をすべて削除
        </button>
      </div>
      <ul className="space-y-2">
        {practiceHistory.slice(0, VISIBLE_HISTORY_COUNT).map((entry) => {
          const modeLabel = modes.find((mode) => mode.value === entry.mode)?.label ?? entry.mode;
          return (
            <li
              key={entry.id}
              className="rounded-lg border p-3 space-y-2"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <div className="text-sm font-medium">
                {entry.grade}年生・{modeLabel}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {new Date(entry.executedAt).toLocaleString()} ・ {entry.pageCount}ページ ・{' '}
                {entry.questionCount}問
              </div>
              <button
                type="button"
                onClick={() => restorePracticeHistory(entry)}
                className="w-full rounded-lg border px-3 py-1.5 text-sm font-semibold"
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              >
                同じ設定で作る
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
