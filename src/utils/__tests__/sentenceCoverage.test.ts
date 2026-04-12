import { describe, expect, it } from 'vitest';
import { allKanji } from '../../data/kanji';
import { isKanjiChar } from '../furigana';
import { parseRubySentence } from '../sentenceRuby';

/**
 * 全 sentences がルビ記法で注釈済みであり、
 * 例文中のすべての漢字がふりがなグループでカバーされていることを保証する。
 * これによりフォールバック経路への依存をゼロに保つ。
 */
describe('sentence furigana coverage', () => {
  it('全例文がルビ注釈済みで、漢字すべてがカバーされている', () => {
    const failures: string[] = [];
    for (const kanji of allKanji) {
      for (const sentence of kanji.sentences) {
        const parsed = parseRubySentence(sentence);
        if (!parsed) {
          failures.push(`[grade${kanji.grade} ${kanji.char}] 注釈なし: ${sentence}`);
          continue;
        }
        const chars = Array.from(parsed.plain);
        const covered = new Set<number>();
        for (const g of parsed.groups) {
          for (let i = g.start; i < g.start + g.length; i++) covered.add(i);
        }
        for (let i = 0; i < chars.length; i++) {
          if (isKanjiChar(chars[i]) && !covered.has(i)) {
            failures.push(
              `[grade${kanji.grade} ${kanji.char}] '${chars[i]}' 未カバー: ${sentence}`,
            );
          }
        }
      }
    }
    if (failures.length > 0) {
      console.error(failures.slice(0, 30).join('\n'));
    }
    expect(failures).toEqual([]);
  });
});
