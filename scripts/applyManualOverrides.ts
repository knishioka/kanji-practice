/**
 * manualOverrides.ts のマップに従って grade*.ts の sentences を一括置換。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { manualOverrides } from "./manualOverrides";

const ROOT = resolve(import.meta.dirname, "..");
const usedKeys = new Set<string>();
let totalReplaced = 0;

for (const g of [1, 2, 3, 4, 5, 6]) {
  const filePath = resolve(ROOT, `src/data/grades/grade${g}.ts`);
  let src = readFileSync(filePath, "utf-8");
  let fileReplaced = 0;
  for (const [from, to] of Object.entries(manualOverrides)) {
    // grade ファイルでは シングル/ダブルクォートどちらもありうる
    for (const quote of ["'", '"']) {
      const literal = `${quote}${from}${quote}`;
      const replaceWith = `${quote}${to}${quote}`;
      if (src.includes(literal)) {
        const before = src;
        src = src.split(literal).join(replaceWith);
        const count = (
          before.match(
            new RegExp(literal.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
          ) ?? []
        ).length;
        fileReplaced += count;
        usedKeys.add(from);
      }
    }
  }
  if (fileReplaced > 0) {
    writeFileSync(filePath, src, "utf-8");
  }
  console.log(`grade${g}.ts: ${fileReplaced} 件置換`);
  totalReplaced += fileReplaced;
}

const unused = Object.keys(manualOverrides).filter((k) => !usedKeys.has(k));
console.log(`\n合計 ${totalReplaced} 件置換`);
if (unused.length > 0) {
  console.log(`\n未使用オーバーライド ${unused.length} 件 (キーが古い可能性):`);
  unused.forEach((k) => console.log(`  ${k}`));
}
