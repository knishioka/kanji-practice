import type { Settings } from '../../types';
import {
  getMatchingLearningPresetId,
  grades,
  type LearningPresetId,
  learningPresets,
  modes,
} from './config';

interface Props {
  settings: Settings;
  onSelect: (presetId: LearningPresetId) => void;
}

export function LearningPresetSelector({ settings, onSelect }: Props) {
  const activePresetId = getMatchingLearningPresetId(settings);

  return (
    <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--color-bg-warm)' }}>
      <div>
        <label className="section-title">学習プリセット</label>
        <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
          学習の開始点をまとめて反映します。あとから個別設定で微調整できます。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {learningPresets.map(({ id, label, description, settings: presetSettings }) => {
          const isActive = activePresetId === id;
          const gradeLabel =
            grades.find(({ value }) => value === presetSettings.grade)?.label ??
            `${presetSettings.grade}年生`;
          const modeLabel =
            modes.find(({ value }) => value === presetSettings.mode)?.label ?? presetSettings.mode;

          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-pressed={isActive}
              className={`p-3 rounded-xl text-left transition-all duration-200 ${
                isActive ? 'shadow-sm' : 'hover:shadow-sm'
              }`}
              style={{
                background: isActive
                  ? 'linear-gradient(135deg, rgba(197, 61, 67, 0.08) 0%, rgba(197, 61, 67, 0.15) 100%)'
                  : 'white',
                border: `2px solid ${isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div
                    className="font-medium text-sm"
                    style={{
                      color: isActive ? 'var(--color-primary-dark)' : 'var(--color-text)',
                    }}
                  >
                    {label}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {description}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    <span
                      className="px-2 py-1 rounded-full"
                      style={{
                        background: 'var(--color-border-light)',
                        color: 'var(--color-text)',
                      }}
                    >
                      {gradeLabel}
                    </span>
                    <span
                      className="px-2 py-1 rounded-full"
                      style={{
                        background: 'var(--color-border-light)',
                        color: 'var(--color-text)',
                      }}
                    >
                      {modeLabel}
                    </span>
                    <span
                      className="px-2 py-1 rounded-full"
                      style={{
                        background: 'var(--color-border-light)',
                        color: 'var(--color-text)',
                      }}
                    >
                      {presetSettings.pageCount}枚
                    </span>
                  </div>
                </div>

                <span
                  className="shrink-0 px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: isActive ? 'var(--color-primary)' : 'var(--color-border-light)',
                    color: isActive ? 'white' : 'var(--color-text-muted)',
                  }}
                >
                  {isActive ? '適用中' : '適用'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
