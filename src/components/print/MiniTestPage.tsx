import { MINI_TEST_TOTAL_POINTS } from '../../constants/miniTest';
import { MINI_TEST_LAYOUT } from '../../constants/print';
import type { Settings } from '../../types';
import type { AnswerRow } from '../../utils/answerSheet';
import { PageFooter } from './PageFooter';
import { PageHeader } from './PageHeader';

interface Props {
  rows: AnswerRow[];
  settings: Settings;
  date: string;
  showAnswers?: boolean;
}

const sections = [
  { key: 'reading', label: '読み', instruction: 'ことばの よみを かきましょう。' },
  { key: 'writing', label: '書き', instruction: '□に はいる かんじを かきましょう。' },
] as const;

export function MiniTestPage({ rows, settings, date, showAnswers = false }: Props) {
  return (
    <div
      className="a4-page mx-auto shadow-lg print:shadow-none page-break flex flex-col"
      data-testid={showAnswers ? 'answer-sheet' : 'mini-test'}
    >
      <PageHeader
        title={showAnswers ? `解答 — ${settings.title}` : settings.title}
        mode="miniTest"
        date={date}
        isFirstPage
        showNameField={!showAnswers && settings.showNameField}
        showDateField={!showAnswers && settings.showDateField}
        nameLabel={settings.nameLabel}
        dateLabel={settings.dateLabel}
      />
      <div className="mb-2 flex items-baseline gap-6 text-sm">
        <p className="font-bold">
          合計{' '}
          {!showAnswers && <span className="inline-block w-14 border-b border-current" />}
          {!showAnswers && ' /'}
          {MINI_TEST_TOTAL_POINTS}点
        </p>
        <p>合格ライン 70点（練習の目安）</p>
      </div>
      <div className="flex gap-6">
        {sections.map((section) => {
          const sectionRows = rows.filter((row) => row.miniTest?.section === section.key);
          if (!sectionRows.length) return null;
          return (
            <section key={section.key} data-section={section.key} className="min-w-0 flex-1">
              <h2 className="border-b font-bold">{section.label}</h2>
              {!showAnswers && <p className="mb-1 text-xs">{section.instruction}</p>}
              <ol>
                {sectionRows.map((row) => (
                  <li
                    key={row.questionNumber}
                    value={row.questionNumber}
                    data-question-number={row.questionNumber}
                    className="flex items-center gap-1.5 text-sm"
                    style={{ minHeight: `${MINI_TEST_LAYOUT.ROW_HEIGHT_MM}mm` }}
                  >
                    <span className="w-5 shrink-0 text-right text-xs">{row.questionNumber}.</span>
                    <span className="font-textbook">
                      {row.miniTest?.promptReading ? (
                        <ruby>
                          {row.prompt}
                          <rp>(</rp>
                          <rt>{row.miniTest.promptReading}</rt>
                          <rp>)</rp>
                        </ruby>
                      ) : (
                        row.prompt
                      )}
                    </span>
                    {showAnswers ? (
                      <strong className="ml-auto font-textbook">{row.answer}</strong>
                    ) : (
                      <span className="h-6 flex-1 border-b border-gray-500" />
                    )}
                    <span className="shrink-0 text-xs text-gray-600">{row.miniTest?.points}点</span>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
      <PageFooter grade={settings.grade} currentPage={1} totalPages={1} mode="miniTest" />
    </div>
  );
}
