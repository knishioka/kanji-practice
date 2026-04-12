import { describe, expect, it } from 'vitest';
import { getSentencePlainText, parseRubySentence } from '../sentenceRuby';

describe('parseRubySentence', () => {
  it('注釈無しの文字列は null を返す', () => {
    expect(parseRubySentence('何の用？')).toBeNull();
  });

  it('単一注釈をパースできる', () => {
    const result = parseRubySentence('{用|よう}意する。');
    expect(result).not.toBeNull();
    expect(result?.plain).toBe('用意する。');
    expect(result?.groups).toEqual([{ start: 0, length: 1, reading: 'よう' }]);
  });

  it('複数注釈を順に抽出する', () => {
    const result = parseRubySentence('{何|なに}の{用|よう}？');
    expect(result?.plain).toBe('何の用？');
    expect(result?.groups).toEqual([
      { start: 0, length: 1, reading: 'なに' },
      { start: 2, length: 1, reading: 'よう' },
    ]);
  });

  it('連続漢字熟語を1グループとして扱う', () => {
    const result = parseRubySentence('{用意|ようい}する。');
    expect(result?.plain).toBe('用意する。');
    expect(result?.groups).toEqual([{ start: 0, length: 2, reading: 'ようい' }]);
  });

  it('送りがな付き動詞は語幹のみ括る', () => {
    const result = parseRubySentence('一日が{始|はじ}まる。');
    expect(result?.plain).toBe('一日が始まる。');
    expect(result?.groups).toEqual([{ start: 3, length: 1, reading: 'はじ' }]);
  });

  it('漢字以外をルビ対象にするとエラー', () => {
    expect(() => parseRubySentence('{あ|あ}い')).toThrow();
  });

  it('読みにカタカナを含むとエラー', () => {
    expect(() => parseRubySentence('{用|ヨウ}')).toThrow();
  });
});

describe('getSentencePlainText', () => {
  it('注釈を取り除いて返す', () => {
    expect(getSentencePlainText('{何|なに}の{用|よう}？')).toBe('何の用？');
  });
  it('注釈無しはそのまま返す', () => {
    expect(getSentencePlainText('何の用？')).toBe('何の用？');
  });
});
