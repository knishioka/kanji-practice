/**
 * 写経モードの例文ルビで「単一漢字＋送りがな」の読みが不整合な候補を検出する。
 *
 * 使い方:
 *   npx tsx scripts/detectFuriganaErrors.ts
 *
 * 検出ロジックは src/utils/furiganaValidity.ts を共有（回帰テストと同一）。
 * 出力された候補を人手で精査し、真の誤りは grade*.ts のルビを直接修正すること。
 */

import { detectFuriganaIssues } from "../src/utils/furiganaValidity";

const issues = detectFuriganaIssues();
console.log(`検出: ${issues.length} 件\n`);

for (const grade of [1, 2, 3, 4, 5, 6]) {
  const rows = issues.filter((i) => i.grade === grade);
  if (rows.length === 0) continue;
  console.log(`## ${grade}年生 (${rows.length} 件)`);
  for (const i of rows) {
    console.log(
      `  ${i.char} ルビ=${i.ruby} 送=${i.okurigana} kun=[${i.kun.join("/")}] :: ${i.sentence}`,
    );
  }
  console.log("");
}
