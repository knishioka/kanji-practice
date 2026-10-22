import { ANSWER_SHEET_LAYOUT } from '../../constants/print';
import type { Settings } from '../../types';
import type { AnswerRow } from '../../utils/answerSheet';
import { PageFooter } from './PageFooter';

interface Props {
  rows: AnswerRow[];
  settings: Settings;
  currentPage: number;
  totalPages: number;
}

export function AnswerSheet({ rows, settings, currentPage, totalPages }: Props) {
  return (
    <div
      className="a4-page mx-auto shadow-lg print:shadow-none page-break flex flex-col"
      data-testid="answer-sheet"
    >
      <div
        className="border-b"
        style={{
          marginBottom: `${ANSWER_SHEET_LAYOUT.HEADER_MARGIN_BOTTOM_MM}mm`,
          paddingBottom: `${ANSWER_SHEET_LAYOUT.HEADER_PADDING_BOTTOM_MM}mm`,
          borderBottomWidth: `${ANSWER_SHEET_LAYOUT.HEADER_BORDER_WIDTH_PX}px`,
        }}
      >
        <h2
          className="font-bold break-words"
          style={{
            fontSize: `${ANSWER_SHEET_LAYOUT.TITLE_FONT_SIZE_MM}mm`,
            lineHeight: `${ANSWER_SHEET_LAYOUT.TITLE_LINE_HEIGHT_MM}mm`,
          }}
        >
          解答 — {settings.title}
        </h2>
        <p
          style={{
            fontSize: `${ANSWER_SHEET_LAYOUT.DESCRIPTION_FONT_SIZE_MM}mm`,
            lineHeight: `${ANSWER_SHEET_LAYOUT.DESCRIPTION_LINE_HEIGHT_MM}mm`,
            marginTop: `${ANSWER_SHEET_LAYOUT.DESCRIPTION_MARGIN_TOP_MM}mm`,
          }}
        >
          問題ページと問題番号を見て、答えを確認してください。
        </p>
      </div>
      <div className="flex-grow">
        <table
          className="w-full table-fixed border-collapse text-sm"
          style={{ color: '#111111', borderColor: '#999999' }}
        >
          <colgroup>
            <col style={{ width: '12%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '30%' }} />
            <col style={{ width: '48%' }} />
          </colgroup>
          <thead>
            <tr style={{ height: `${ANSWER_SHEET_LAYOUT.TABLE_HEADER_HEIGHT_MM}mm` }}>
              {['問題ページ', '番号', '問題', '正解'].map((label) => (
                <th key={label} scope="col" className="border p-1 text-left">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.questionNumber}
                className="avoid-break"
                data-question-number={row.questionNumber}
                style={{ height: `${ANSWER_SHEET_LAYOUT.ROW_HEIGHT_MM}mm` }}
              >
                <td className="border p-2">{row.questionPage}</td>
                <th scope="row" className="border p-2 text-left font-normal">
                  {row.questionNumber}
                </th>
                <td className="border p-2 break-words">{row.prompt}</td>
                <td className="border p-2 break-words font-textbook">{row.answer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PageFooter grade={settings.grade} currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
