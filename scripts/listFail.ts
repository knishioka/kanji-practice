import { allKanji } from '../src/data/kanji';
import { isKanjiChar } from '../src/utils/furigana';
import { parseRubySentence } from '../src/utils/sentenceRuby';

const failures = new Map<string, Set<string>>();
for (const k of allKanji) {
  for (const s of k.sentences) {
    const p = parseRubySentence(s);
    if (!p) continue;
    const chars = Array.from(p.plain);
    const covered = new Set<number>();
    for (const g of p.groups) for (let i = g.start; i < g.start + g.length; i++) covered.add(i);
    const uncovered: string[] = [];
    for (let i = 0; i < chars.length; i++) {
      if (isKanjiChar(chars[i]) && !covered.has(i)) uncovered.push(chars[i]);
    }
    if (uncovered.length) {
      if (!failures.has(s)) failures.set(s, new Set());
      uncovered.forEach((c) => failures.get(s)!.add(c));
    }
  }
}
console.log(`Distinct failing sentences: ${failures.size}`);
for (const [s, chars] of failures) console.log(`${[...chars].join(',')}\t${s}`);
