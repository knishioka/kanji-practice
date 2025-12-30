import { getKanjiRadicalMapping } from '../data/kanjiRadicalMap';
import { findRadicalByChar, type Radical, type RadicalPosition } from '../data/radicals';
import type { Kanji } from '../types';

// 解決された部首情報
export interface ResolvedRadical {
  char: string; // 部首文字
  name: string; // 部首名
  position?: RadicalPosition; // 部首の位置
  radical?: Radical; // 部首マスターデータへの参照
}

/**
 * 漢字から部首を解決する
 * 優先順位:
 * 1. kanjiRadicalMap（新しいマッピング）
 * 2. kanji.radical（既存のレガシーデータ）
 *
 * @param kanji 漢字オブジェクト
 * @returns 解決された部首情報、または undefined
 */
export function resolveRadical(kanji: Kanji): ResolvedRadical | undefined {
  // 1. 新しいマッピングを優先
  const mapping = getKanjiRadicalMapping(kanji.char);
  if (mapping) {
    const radical = findRadicalByChar(mapping.radicalChar);
    if (radical) {
      return {
        char: radical.char,
        name: radical.name,
        position: mapping.position,
        radical,
      };
    }
  }

  // 2. レガシーデータにフォールバック
  if (kanji.radical) {
    const radical = findRadicalByChar(kanji.radical.char);
    return {
      char: kanji.radical.char,
      name: kanji.radical.name,
      position: kanji.radical.position,
      radical, // マスターデータに存在しない場合は undefined
    };
  }

  return undefined;
}

/**
 * 部首データを持つ漢字のみをフィルタリング
 *
 * @param kanjiList 漢字配列
 * @returns 部首データを持つ漢字のみの配列
 */
export function filterKanjiWithRadical(kanjiList: Kanji[]): Kanji[] {
  return kanjiList.filter((kanji) => resolveRadical(kanji) !== undefined);
}

/**
 * 漢字が部首問題に使用可能かどうかを判定
 *
 * @param kanji 漢字オブジェクト
 * @returns 部首問題に使用可能な場合 true
 */
export function canUseForRadicalQuestion(kanji: Kanji): boolean {
  return resolveRadical(kanji) !== undefined;
}

/**
 * 漢字リストから部首ごとにグループ化
 *
 * @param kanjiList 漢字配列
 * @returns 部首文字をキーとしたグループ化マップ
 */
export function groupKanjiByRadical(kanjiList: Kanji[]): Map<string, Kanji[]> {
  const groups = new Map<string, Kanji[]>();

  for (const kanji of kanjiList) {
    const resolved = resolveRadical(kanji);
    if (resolved) {
      const existing = groups.get(resolved.char) || [];
      existing.push(kanji);
      groups.set(resolved.char, existing);
    }
  }

  return groups;
}
