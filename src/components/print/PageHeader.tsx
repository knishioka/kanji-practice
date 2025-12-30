import type { PrintMode } from '../../types';

interface Props {
  title: string;
  mode: PrintMode;
  date: string;
  isFirstPage: boolean;
}

const modeDescriptions: Record<PrintMode, string> = {
  reading: '漢字の読み方を書きましょう',
  writing: '漢字を書きましょう',
  strokeCount: '漢字の画数を答えましょう',
  strokeOrder: '書き順を見て漢字を練習しましょう',
  sentence: '文を書き写しましょう',
  homophone: '同じ読みの漢字を使い分けましょう',
  radical: '漢字の部首を答えましょう',
  okurigana: '正しい送りがなを書きましょう',
  antonym: '対義語・類義語を答えましょう',
};

export function PageHeader({ title, mode, date, isFirstPage }: Props) {
  if (isFirstPage) {
    return (
      <div className="flex justify-between items-start mb-4 border-b pb-3">
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="text-sm text-gray-600 mt-1">{modeDescriptions[mode]}</p>
        </div>
        <div className="text-right text-sm">
          <div className="text-gray-500">{date}</div>
          <div className="mt-2 border-b border-gray-400 w-32">
            <span className="text-xs text-gray-400">なまえ</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center mb-3 text-sm text-gray-500">
      <span>{title}</span>
      <span>{date}</span>
    </div>
  );
}
