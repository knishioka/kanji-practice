import type { PrintMode } from '../../types';
import { modes } from './config';

interface Props {
  value: PrintMode;
  onChange: (mode: PrintMode) => void;
}

// プリント種類ごとのアイコン
const modeIcons: Record<string, string> = {
  reading: '読',
  writing: '書',
  strokeCount: '画',
  strokeOrder: '順',
  sentence: '文',
  homophone: '音',
  radical: '部',
  okurigana: '送',
  antonym: '対',
};

export function ModeSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="section-title">プリント種類</label>
      <div className="grid grid-cols-1 gap-2">
        {modes.map(({ value: modeValue, label, desc }) => (
          <button
            key={modeValue}
            type="button"
            onClick={() => onChange(modeValue)}
            className={`relative p-3 rounded-xl text-left transition-all duration-200 ${
              value === modeValue ? 'shadow-sm' : 'hover:shadow-sm'
            }`}
            style={{
              background:
                value === modeValue
                  ? 'linear-gradient(135deg, rgba(197, 61, 67, 0.08) 0%, rgba(197, 61, 67, 0.15) 100%)'
                  : 'white',
              border: `2px solid ${value === modeValue ? 'var(--color-primary)' : 'var(--color-border)'}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                style={{
                  background:
                    value === modeValue
                      ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)'
                      : 'var(--color-border-light)',
                  color: value === modeValue ? 'white' : 'var(--color-text-muted)',
                }}
              >
                {modeIcons[modeValue] || '字'}
              </div>
              <div className="min-w-0">
                <div
                  className="font-medium text-sm"
                  style={{
                    color: value === modeValue ? 'var(--color-primary-dark)' : 'var(--color-text)',
                  }}
                >
                  {label}
                </div>
                <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                  {desc}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
