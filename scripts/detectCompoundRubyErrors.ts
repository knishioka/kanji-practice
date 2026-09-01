/**
 * 写経モードの例文ルビで「熟語の読みになっていない」候補を検出する。
 *
 * 使い方:
 *   npx tsx scripts/detectCompoundRubyErrors.ts
 *
 * 検出ロジックは src/utils/compoundRubyValidity.ts を共有（回帰テストと同一）。
 * example-mismatch は確定誤り、mixed-reading は要目視（湯桶読み/重箱読みは正しい）。
 */

import { detectCompoundRubyIssues } from '../src/utils/compoundRubyValidity';

const issues = detectCompoundRubyIssues();
console.log(`検出: ${issues.length} 件\n`);

for (const kind of ['example-mismatch', 'mixed-reading'] as const) {
  const rows = issues.filter((issue) => issue.kind === kind);
  console.log(`## ${kind} (${rows.length} 件)`);
  for (const issue of rows) {
    const expected = issue.expected ? ` 例語=[${issue.expected.join('/')}]` : '';
    console.log(`  [${issue.grade}年] ${issue.signature}${expected} :: ${issue.sentence}`);
  }
  console.log('');
}
