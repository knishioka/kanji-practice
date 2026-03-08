import { describe, expect, it } from 'vitest';
import { buildFuriganaGroups } from '../../components/print/SentenceQuestion';
import { allKanji } from '../../data/kanji';

// テストヘルパー: ふりがなグループを「漢字(読み)」形式の文字列に変換
function formatGroups(sentence: string) {
  const chars = Array.from(sentence);
  const groups = buildFuriganaGroups(sentence);
  return groups.map((g) => {
    const span = chars.slice(g.start, g.start + g.length).join('');
    return `${span}(${g.reading})`;
  });
}

function isKanjiChar(char: string): boolean {
  const code = char.codePointAt(0) ?? 0;
  return (code >= 0x4e00 && code <= 0x9fff) || (code >= 0x3400 && code <= 0x4dbf);
}

describe('buildFuriganaGroups', () => {
  describe('熟語（連続漢字）', () => {
    it('2字熟語のふりがなが正しい', () => {
      expect(formatGroups('合計を出す。')).toContain('合計(ごうけい)');
      expect(formatGroups('友達が多い。')).toContain('友達(ともだち)');
      expect(formatGroups('時計を見る。')).toContain('時計(とけい)');
      expect(formatGroups('会社で働く。')).toContain('会社(かいしゃ)');
      expect(formatGroups('交通ルールを守る。')).toContain('交通(こうつう)');
    });

    it('2字熟語が文字ごとに分割されない', () => {
      const groups = buildFuriganaGroups('時計を見る。');
      const tokeGroup = groups.find(
        (g) =>
          Array.from('時計を見る。')
            .slice(g.start, g.start + g.length)
            .join('') === '時計',
      );
      expect(tokeGroup).toBeDefined();
      expect(tokeGroup?.length).toBe(2);
    });
  });

  describe('送りがな付き動詞', () => {
    it('送りがなが除去されて漢字部分の読みのみ返る', () => {
      expect(formatGroups('合計を出す。')).toContain('出(だ)');
      expect(formatGroups('数を数える。')).toContain('数(かぞ)');
    });

    it('同じ漢字でも文脈で異なる読みが返る', () => {
      const groups = formatGroups('数を数える。');
      expect(groups).toContain('数(かず)');
      expect(groups).toContain('数(かぞ)');
    });
  });

  describe('ひらがな接頭辞（お寺等）', () => {
    it('お寺 → 寺に「てら」のみ表示', () => {
      const groups = formatGroups('お寺に行く。');
      expect(groups).toContain('寺(てら)');
      expect(groups).not.toContain('お寺(おてら)');
    });
  });

  describe('非連続漢字（女の子、買い物等）', () => {
    it('間のひらがなで読みが正しく分割される', () => {
      expect(formatGroups('女の子が遊ぶ。')).toContain('女(おんな)');
      expect(formatGroups('女の子が遊ぶ。')).toContain('子(こ)');
    });

    it('買い物の読みが正しく分割される', () => {
      expect(formatGroups('買い物に行く。')).toContain('買(か)');
      expect(formatGroups('買い物に行く。')).toContain('物(もの)');
    });

    it('思い出の読みが正しく分割される', () => {
      expect(formatGroups('思い出がある。')).toContain('思(おも)');
      expect(formatGroups('思い出がある。')).toContain('出(で)');
    });

    it('切り株の読みが正しく分割される', () => {
      expect(formatGroups('切り株に座る。')).toContain('切(き)');
      expect(formatGroups('切り株に座る。')).toContain('株(かぶ)');
    });

    it('世の中の読みが正しく分割される', () => {
      expect(formatGroups('世の中は広い。')).toContain('世(よ)');
      expect(formatGroups('世の中は広い。')).toContain('中(なか)');
    });
  });

  describe('品質チェック（再発防止）', () => {
    it('全例文でふりがなにカタカナが含まれない', () => {
      const katakanaIssues: string[] = [];
      for (const kanji of allKanji) {
        for (const sentence of kanji.sentences) {
          const groups = buildFuriganaGroups(sentence);
          for (const g of groups) {
            if (/[\u30A0-\u30FF]/.test(g.reading)) {
              katakanaIssues.push(
                `${sentence}: 「${Array.from(sentence)
                  .slice(g.start, g.start + g.length)
                  .join('')}」→「${g.reading}」`,
              );
            }
          }
        }
      }
      expect(katakanaIssues).toEqual([]);
    });

    it('全例文でふりがなスパンに非漢字が含まれない', () => {
      const nonKanjiIssues: string[] = [];
      for (const kanji of allKanji) {
        for (const sentence of kanji.sentences) {
          const chars = Array.from(sentence);
          const groups = buildFuriganaGroups(sentence);
          for (const g of groups) {
            const span = chars.slice(g.start, g.start + g.length);
            if (span.some((c) => !isKanjiChar(c))) {
              nonKanjiIssues.push(`${sentence}: 「${span.join('')}」→「${g.reading}」`);
            }
          }
        }
      }
      expect(nonKanjiIssues).toEqual([]);
    });

    it('全例文でふりがなの読みが空でない', () => {
      const emptyIssues: string[] = [];
      for (const kanji of allKanji) {
        for (const sentence of kanji.sentences) {
          const chars = Array.from(sentence);
          const groups = buildFuriganaGroups(sentence);
          for (const g of groups) {
            if (!g.reading) {
              emptyIssues.push(
                `${sentence}: 「${chars.slice(g.start, g.start + g.length).join('')}」に空の読み`,
              );
            }
          }
        }
      }
      expect(emptyIssues).toEqual([]);
    });
  });
});
