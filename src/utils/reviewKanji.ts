import type { Grade, PracticeHistoryEntry, PrintMode, ReviewRatio } from '../types';
import { MAX_PRACTICE_HISTORY } from './practiceHistory';

export function supportsReview(mode: PrintMode): boolean {
  switch (mode) {
    case 'reading':
    case 'writing':
    case 'sentence':
    case 'strokeCount':
    case 'strokeOrder':
    case 'readingWriting':
      return true;
    case 'homophone':
    case 'radical':
    case 'okurigana':
    case 'antonym':
      return false;
    default: {
      const exhaustive: never = mode;
      return exhaustive;
    }
  }
}

/** 復習枠に入れる漢字を、出題可能な同学年の履歴から重複なく選ぶ。 */
export function selectReviewKanji(
  grade: Grade,
  count: number,
  ratio: ReviewRatio,
  history: readonly PracticeHistoryEntry[],
  eligibleChars: readonly string[],
  rng: () => number = Math.random,
): string[] {
  const eligible = new Set(eligibleChars);
  const candidates = [
    ...new Set(
      history
        .slice(0, MAX_PRACTICE_HISTORY)
        .filter((entry) => entry.grade === grade)
        .flatMap((entry) => entry.kanjiChars)
        .filter((char) => eligible.has(char)),
    ),
  ];
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, Math.max(0, Math.round((count * ratio) / 100)));
}
