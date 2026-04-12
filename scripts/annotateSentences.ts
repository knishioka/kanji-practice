/**
 * 全 grade[1-6].ts の sentences を `{漢字|よみ}` 形式に注釈化するスクリプト。
 *
 * 使い方:
 *   npx tsx scripts/annotateSentences.ts            # dry-run (差分表示のみ)
 *   npx tsx scripts/annotateSentences.ts --write    # 実ファイル更新
 *
 * 出力:
 *   scripts/annotation-review.md  -- フォールバック由来を含む例文一覧 (要人手レビュー)
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { allKanji } from "../src/data/kanji";
import { buildFuriganaGroupsWithSource } from "../src/utils/furigana";
import { parseRubySentence } from "../src/utils/sentenceRuby";

const ROOT = resolve(import.meta.dirname, "..");
const WRITE = process.argv.includes("--write");

interface AnnotatedResult {
  original: string;
  annotated: string;
  hasFallback: boolean;
  fallbackKanji: { char: string; reading: string }[];
}

function annotate(sentence: string): AnnotatedResult {
  // 既に注釈済みなら触らない
  if (parseRubySentence(sentence)) {
    return {
      original: sentence,
      annotated: sentence,
      hasFallback: false,
      fallbackKanji: [],
    };
  }

  const chars = Array.from(sentence);
  const { groups, sources } = buildFuriganaGroupsWithSource(sentence);

  // 位置順にソートしてグループを文字列に挿入
  const indexed = groups.map((g, i) => ({ ...g, source: sources[i] }));
  indexed.sort((a, b) => a.start - b.start);

  let annotated = "";
  let cursor = 0;
  const fallbackKanji: { char: string; reading: string }[] = [];

  for (const g of indexed) {
    if (g.start > cursor) annotated += chars.slice(cursor, g.start).join("");
    const span = chars.slice(g.start, g.start + g.length).join("");
    annotated += `{${span}|${g.reading}}`;
    cursor = g.start + g.length;
    if (g.source === "fallback") {
      fallbackKanji.push({ char: span, reading: g.reading });
    }
  }
  if (cursor < chars.length) annotated += chars.slice(cursor).join("");

  return {
    original: sentence,
    annotated,
    hasFallback: fallbackKanji.length > 0,
    fallbackKanji,
  };
}

interface FlaggedEntry {
  grade: number;
  kanji: string;
  original: string;
  annotated: string;
  fallbackKanji: { char: string; reading: string }[];
}

const flagged: FlaggedEntry[] = [];
const stats = {
  total: 0,
  alreadyAnnotated: 0,
  newlyAnnotated: 0,
  withFallback: 0,
};

for (const kanji of allKanji) {
  for (const s of kanji.sentences) {
    stats.total++;
    const result = annotate(s);
    if (result.original === result.annotated && parseRubySentence(s)) {
      stats.alreadyAnnotated++;
    } else {
      stats.newlyAnnotated++;
    }
    if (result.hasFallback) {
      stats.withFallback++;
      flagged.push({
        grade: kanji.grade,
        kanji: kanji.char,
        original: s,
        annotated: result.annotated,
        fallbackKanji: result.fallbackKanji,
      });
    }
  }
}

console.log(`総例文数: ${stats.total}`);
console.log(`既注釈: ${stats.alreadyAnnotated}`);
console.log(`新規注釈対象: ${stats.newlyAnnotated}`);
console.log(`フォールバック由来を含む: ${stats.withFallback} (要レビュー)`);

// レビューレポート出力
const reportLines = [
  "# 注釈レビューが必要な例文",
  "",
  `生成: ${new Date().toISOString()}`,
  `対象: ${flagged.length} 件`,
  "",
  "各エントリの「フォールバック」読みは機械推測のため誤りの可能性が高い。",
  "正しいルビに修正して `src/data/grades/grade*.ts` を直接編集すること。",
  "",
];
for (const grade of [1, 2, 3, 4, 5, 6]) {
  const entries = flagged.filter((e) => e.grade === grade);
  if (entries.length === 0) continue;
  reportLines.push(`## ${grade}年生 (${entries.length} 件)`, "");
  for (const e of entries) {
    const fb = e.fallbackKanji.map((f) => `${f.char}→${f.reading}`).join(", ");
    reportLines.push(
      `- 漢字\`${e.kanji}\` / 元: \`${e.original}\` → \`${e.annotated}\` [FB: ${fb}]`,
    );
  }
  reportLines.push("");
}
const reportPath = resolve(ROOT, "scripts/annotation-review.md");
writeFileSync(reportPath, reportLines.join("\n"), "utf-8");
console.log(`レビューレポート出力: ${reportPath}`);

// 各 grade ファイルを書き換え
function findMatchingBracket(source: string, openBracketIndex: number): number {
  let depth = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escaped = false;

  for (let i = openBracketIndex; i < source.length; i++) {
    const ch = source[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (ch === "\\") {
      escaped = true;
      continue;
    }

    if (inSingleQuote) {
      if (ch === "'") inSingleQuote = false;
      continue;
    }

    if (inDoubleQuote) {
      if (ch === '"') inDoubleQuote = false;
      continue;
    }

    if (ch === "'") {
      inSingleQuote = true;
      continue;
    }

    if (ch === '"') {
      inDoubleQuote = true;
      continue;
    }

    if (ch === "[") depth++;
    if (ch === "]") {
      depth--;
      if (depth === 0) return i;
    }
  }

  return -1;
}

function rewriteGradeFile(gradeNum: number): { changed: number } {
  const filePath = resolve(ROOT, `src/data/grades/grade${gradeNum}.ts`);
  const src = readFileSync(filePath, "utf-8");

  let changed = 0;
  let updated = "";
  let cursor = 0;

  // ] を文字列内に含むケースでも壊れないよう、配列終端を字句走査で検出する
  const sentencesStartPattern = /sentences:\s*\[/g;
  let match: RegExpExecArray | null;
  while ((match = sentencesStartPattern.exec(src)) !== null) {
    const openBracketIndex = sentencesStartPattern.lastIndex - 1;
    const closeBracketIndex = findMatchingBracket(src, openBracketIndex);
    if (closeBracketIndex === -1) {
      throw new Error(
        `sentences 配列の閉じ括弧が見つかりません: ${filePath} index=${openBracketIndex}`,
      );
    }

    updated += src.slice(cursor, match.index);
    updated += src.slice(match.index, openBracketIndex + 1);

    const body = src.slice(openBracketIndex + 1, closeBracketIndex);
    const newBody = body.replace(
      /(['"])((?:\\.|(?!\1).)*)\1/g,
      (lit: string, quote: string, raw: string) => {
        const original = raw
          .replace(/\\'/g, "'")
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, "\\");
        const result = annotate(original);
        if (result.annotated === original) return lit;
        changed++;
        const escaped = result.annotated
          .replace(/\\/g, "\\\\")
          .replace(new RegExp(quote, "g"), `\\${quote}`);
        return `${quote}${escaped}${quote}`;
      },
    );
    updated += newBody;
    updated += "]";

    cursor = closeBracketIndex + 1;
    sentencesStartPattern.lastIndex = cursor;
  }

  updated += src.slice(cursor);

  if (WRITE && changed > 0) {
    writeFileSync(filePath, updated, "utf-8");
  }
  return { changed };
}

let totalChanged = 0;
for (const g of [1, 2, 3, 4, 5, 6]) {
  const { changed } = rewriteGradeFile(g);
  console.log(
    `grade${g}.ts: ${changed} 件 ${WRITE ? "更新" : "差分検出 (dry-run)"}`,
  );
  totalChanged += changed;
}
console.log(
  `合計 ${totalChanged} 件 ${WRITE ? "更新済み" : "(--write で適用)"}`,
);
