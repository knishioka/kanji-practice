import type { Grade, PrintMode } from '../../types';
import { KANJIVG_LICENSE } from '../../utils/kanjiVG';

interface Props {
  grade: Grade;
  currentPage: number;
  totalPages: number;
  mode?: PrintMode;
}

export function PageFooter({ grade, currentPage, totalPages, mode }: Props) {
  return (
    <div className="mt-auto pt-2 text-center text-gray-400" style={{ fontSize: '8pt' }}>
      <div>
        {grade}年生 | {currentPage}/{totalPages}
      </div>
      {mode === 'strokeOrder' && (
        <div className="mt-1 text-gray-300" style={{ fontSize: '6pt' }}>
          書き順データ: {KANJIVG_LICENSE.name} ({KANJIVG_LICENSE.license})
        </div>
      )}
    </div>
  );
}
