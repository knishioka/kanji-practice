import type { PrintMode, Question } from '../types';

export interface AnswerRow {
  questionNumber: number;
  questionPage: number;
  prompt: string;
  answer: string;
}

export function supportsAnswerSheet(mode: PrintMode): boolean {
  switch (mode) {
    case 'reading':
    case 'strokeCount':
    case 'radical':
    case 'okurigana':
    case 'homophone':
    case 'antonym':
      return true;
    case 'writing':
    case 'sentence':
    case 'strokeOrder':
    case 'readingWriting':
      return false;
    default: {
      const exhaustive: never = mode;
      return exhaustive;
    }
  }
}

function getAnswer(question: Question, mode: PrintMode): Pick<AnswerRow, 'prompt' | 'answer'> {
  const missing = { prompt: question.kanji.char, answer: '—' };
  switch (mode) {
    case 'reading':
      return { prompt: question.example?.word || question.kanji.char, answer: question.reading };
    case 'strokeCount':
      return { prompt: question.kanji.char, answer: `${question.kanji.strokeCount}画` };
    case 'radical': {
      const radical = question.radicalQuestion;
      return radical
        ? {
            prompt: radical.targetKanji,
            answer: `${radical.answerRadical}（${radical.answerRadicalName}）`,
          }
        : missing;
    }
    case 'okurigana': {
      const okurigana = question.okuriganaQuestion;
      return okurigana ? { prompt: okurigana.stem, answer: okurigana.fullWord } : missing;
    }
    case 'homophone': {
      const homophone = question.homophoneQuestion;
      return homophone
        ? {
            prompt: homophone.reading,
            answer:
              homophone.options
                .map((option, index) => `${index + 1}) ${option.kanji}`)
                .join('　') || '—',
          }
        : missing;
    }
    case 'antonym': {
      const antonym = question.antonymQuestion;
      return antonym
        ? {
            prompt: antonym.sourceKanji,
            answer: `${antonym.type === 'antonym' ? '対義語' : '類義語'}: ${antonym.answerKanji}`,
          }
        : missing;
    }
    case 'writing':
    case 'sentence':
    case 'strokeOrder':
    case 'readingWriting':
      return missing;
    default: {
      const exhaustive: never = mode;
      return exhaustive;
    }
  }
}

/** 生成済みの問題だけを参照し、問題番号と元の問題ページを維持する。 */
export function generateAnswerRows(
  questions: Question[],
  mode: PrintMode,
  questionsPerPage: number,
): AnswerRow[] {
  if (!supportsAnswerSheet(mode)) return [];

  const pageSize = Number.isFinite(questionsPerPage)
    ? Math.max(1, Math.floor(questionsPerPage))
    : 1;
  return questions.map((question, index) => ({
    questionNumber: index + 1,
    questionPage: Math.floor(index / pageSize) + 1,
    ...getAnswer(question, mode),
  }));
}
