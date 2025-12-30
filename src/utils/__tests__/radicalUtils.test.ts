import { describe, expect, it } from 'vitest';
import type { Kanji } from '../../types';
import {
  canUseForRadicalQuestion,
  filterKanjiWithRadical,
  groupKanjiByRadical,
  resolveRadical,
} from '../radicalUtils';

// テスト用の漢字データ
const createKanji = (char: string, radical?: { char: string; name: string }): Kanji => ({
  char,
  grade: 1,
  readings: { on: ['テスト'], kun: ['てすと'] },
  strokeCount: 1,
  examples: [],
  sentences: [],
  radical,
});

describe('radicalUtils', () => {
  describe('resolveRadical', () => {
    it('kanjiRadicalMapに登録されている漢字の部首を解決できる', () => {
      // kanjiRadicalMapに '海' が登録されている
      const kanji = createKanji('海');
      const result = resolveRadical(kanji);

      expect(result).toBeDefined();
      expect(result?.char).toBe('氵');
      expect(result?.name).toBe('さんずい');
    });

    it('レガシーデータ（kanji.radical）からフォールバック解決できる', () => {
      // マップに存在しない漢字でレガシーデータあり
      const kanji = createKanji('未知', { char: '木', name: 'きへん' });
      const result = resolveRadical(kanji);

      expect(result).toBeDefined();
      expect(result?.char).toBe('木');
      expect(result?.name).toBe('きへん');
    });

    it('部首データがない漢字はundefinedを返す', () => {
      const kanji = createKanji('未知');
      const result = resolveRadical(kanji);

      expect(result).toBeUndefined();
    });

    it('kanjiRadicalMapが優先される', () => {
      // マップに登録されている漢字にレガシーデータも持たせる
      const kanji = createKanji('海', { char: '水', name: 'みず' });
      const result = resolveRadical(kanji);

      // kanjiRadicalMapの値が優先される
      expect(result?.char).toBe('氵');
      expect(result?.name).toBe('さんずい');
    });

    it('1年生の漢字（木）の部首を解決できる', () => {
      const kanji = createKanji('木');
      const result = resolveRadical(kanji);

      expect(result).toBeDefined();
      expect(result?.char).toBe('木');
      expect(result?.name).toBe('きへん');
    });

    it('3年生の漢字（温）の部首を解決できる', () => {
      const kanji = createKanji('温');
      const result = resolveRadical(kanji);

      expect(result).toBeDefined();
      expect(result?.char).toBe('氵');
      expect(result?.name).toBe('さんずい');
    });

    it('6年生の漢字（潮）の部首を解決できる', () => {
      const kanji = createKanji('潮');
      const result = resolveRadical(kanji);

      expect(result).toBeDefined();
      expect(result?.char).toBe('氵');
      expect(result?.name).toBe('さんずい');
    });
  });

  describe('filterKanjiWithRadical', () => {
    it('部首データを持つ漢字のみをフィルタリングする', () => {
      const kanjiList = [
        createKanji('海'), // マップにあり
        createKanji('未知1'), // マップになし、レガシーなし
        createKanji('花'), // マップにあり
        createKanji('未知2'), // マップになし、レガシーなし
      ];

      const result = filterKanjiWithRadical(kanjiList);

      expect(result).toHaveLength(2);
      expect(result.map((k) => k.char)).toEqual(['海', '花']);
    });

    it('空配列を渡すと空配列を返す', () => {
      const result = filterKanjiWithRadical([]);
      expect(result).toHaveLength(0);
    });

    it('レガシーデータのみの漢字もフィルタ通過する', () => {
      const kanjiList = [
        createKanji('レガシー', { char: '口', name: 'くち' }),
        createKanji('データなし'),
      ];

      const result = filterKanjiWithRadical(kanjiList);

      expect(result).toHaveLength(1);
      expect(result[0].char).toBe('レガシー');
    });
  });

  describe('canUseForRadicalQuestion', () => {
    it('部首データがある漢字はtrueを返す', () => {
      const kanji = createKanji('海');
      expect(canUseForRadicalQuestion(kanji)).toBe(true);
    });

    it('部首データがない漢字はfalseを返す', () => {
      const kanji = createKanji('未知');
      expect(canUseForRadicalQuestion(kanji)).toBe(false);
    });
  });

  describe('groupKanjiByRadical', () => {
    it('漢字を部首ごとにグループ化する', () => {
      const kanjiList = [
        createKanji('海'), // さんずい
        createKanji('池'), // さんずい
        createKanji('花'), // くさかんむり
        createKanji('草'), // くさかんむり
        createKanji('木'), // きへん
      ];

      const result = groupKanjiByRadical(kanjiList);

      expect(result.get('氵')?.map((k) => k.char)).toEqual(['海', '池']);
      expect(result.get('艹')?.map((k) => k.char)).toEqual(['花', '草']);
      expect(result.get('木')?.map((k) => k.char)).toEqual(['木']);
    });

    it('部首データがない漢字はグループ化されない', () => {
      const kanjiList = [createKanji('海'), createKanji('未知'), createKanji('花')];

      const result = groupKanjiByRadical(kanjiList);

      expect(result.size).toBe(2);
      expect(result.has('氵')).toBe(true);
      expect(result.has('艹')).toBe(true);
    });
  });
});
