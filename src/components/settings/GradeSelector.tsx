import type { Grade } from '../../types';
import { grades } from './config';

interface Props {
  value: Grade;
  onChange: (grade: Grade) => void;
}

export function GradeSelector({ value, onChange }: Props) {
  return (
    <div>
      <label className="section-title">対象級</label>
      <div className="grid grid-cols-2 gap-2">
        {grades.map(({ value: gradeValue, label }) => (
          <button
            key={gradeValue}
            type="button"
            onClick={() => onChange(gradeValue)}
            className={`relative p-3 rounded-xl text-left transition-all duration-200 ${
              value === gradeValue ? 'shadow-md' : 'hover:shadow-sm'
            }`}
            style={{
              background:
                value === gradeValue
                  ? 'linear-gradient(135deg, rgba(197, 61, 67, 0.08) 0%, rgba(197, 61, 67, 0.15) 100%)'
                  : 'white',
              border: `2px solid ${value === gradeValue ? 'var(--color-primary)' : 'var(--color-border)'}`,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: value === gradeValue ? 'var(--color-primary)' : 'var(--color-border)',
                  color: value === gradeValue ? 'white' : 'var(--color-text-muted)',
                }}
              >
                {gradeValue}
              </div>
              <span
                className="text-sm font-medium"
                style={{
                  color: value === gradeValue ? 'var(--color-primary-dark)' : 'var(--color-text)',
                }}
              >
                {label}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
