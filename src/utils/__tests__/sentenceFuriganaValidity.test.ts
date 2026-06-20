import { describe, expect, it } from 'vitest';
import { allKanji } from '../../data/kanji';
import { detectFuriganaIssues } from '../furiganaValidity';

/**
 * 写経モードの例文ルビで「単一漢字＋送りがな」の読みが不整合になっていないことを保証する。
 *
 * 過去、自動注釈ヒューリスティックが複数読みの漢字で誤った読みを焼き込んでいた
 * （例: 通う→とおう、駅に着く→き、目が覚める→おぼ）。本テストはその再発を防ぐ。
 *
 * detectFuriganaIssues() は活用整合を機械判定するが、連濁・当て字・連用形名詞など
 * データの読みからは導けない正例が残る。それらはレビュー済みとして ALLOWLIST に列挙する。
 * 新たに候補が出た場合は「正しい読みか」を確認し、誤りなら grade*.ts を修正、
 * 正しい特殊読みなら ALLOWLIST に追記すること。
 */

// レビュー済みの正例（signature = `漢字:ルビ:送りがな先頭`）。
const ALLOWLIST = new Set<string>([
  // 訓の語幹＋助詞（名詞・連用形名詞）
  '出:で:が', // 思い出がある
  '出:で:を', // 申し出を断る
  '話:はな:を', // 話を聞く / 話を伝える
  '話:はな:が', // 話が進む
  '話:はな:の', // 話の筋
  '見:み:を', // 味見をする
  '見:み:に', // 見に行く
  '見:み:つ', // 見つからない（見つかる）
  '置:おき:に', // 物置にしまう
  '長:なが:さ', // 長さを測る（接尾辞さ）
  '腹:なか:が', // お腹が空いた
  // 連濁
  '紙:がみ:を', // 折り紙を折る
  '引:び:き', // 福引き
  '言:ごと:を', // 独り言を言う
  // 当て字・特殊読み
  '晴:ば:ら', // 素晴らしい
  '停:と:め', // 停める（表外訓 とめる）
  '来:き:て', // 是非来て（カ変）
  '晩:ばん:ご', // 晩ご飯
  '気:き:よ', // 根気よく（「よく」は別語の良く）
  // 複合動詞・派生（訓に語形が無い）
  '広:ひろ:が', // 広がる
  '近:ちか:づ', // 近づかない（近づく）
  '重:おも:ん', // 重んじる
]);

describe('sentence furigana validity', () => {
  it('送りがなと整合しないルビが（ALLOWLIST を除いて）存在しない', () => {
    const issues = detectFuriganaIssues();
    const unexpected = issues.filter((i) => !ALLOWLIST.has(i.signature));
    if (unexpected.length > 0) {
      console.error(
        unexpected
          .map(
            (i) =>
              `[grade${i.grade} ${i.char}] ルビ=${i.ruby} 送=${i.okurigana} signature=${i.signature}\n` +
              `  正しい読みなら grade*.ts を修正、正しい特殊読みなら ALLOWLIST に追記: ${i.sentence}`,
          )
          .join('\n'),
      );
    }
    expect(unexpected).toEqual([]);
  });

  // detectFuriganaIssues() は「ルビが訓読みそのもの」のケースを誤りと判定できない
  // （上る=うえ、独り=ひとり 等）。代表的な誤注釈パターンの非存在を直接保証する。
  it('既知の誤注釈パターンが例文中に存在しない', () => {
    const BAD_PATTERNS = [
      '{通|とお}う', // 通う=かよう
      '{着|き}く', // 着く=つく（着る={着|き}る は別）
      '{覚|おぼ}める', // 覚める=さめる
      '{生|い}える', // 生える=はえる
      '{喜|き}び', // 喜び=よろこび
      '{行|い}われる', // 行われる=おこなわれる
      '{細|ほそ}かく', // 細かく=こまかく
      '{上|うえ}る', // 上る=のぼる
      '{独|ひとり}り', // 独り=ひと＋り
      '{熱|あつ}が', // 熱が=ねつが
    ];
    const hits: string[] = [];
    for (const kanji of allKanji) {
      for (const sentence of kanji.sentences) {
        for (const bad of BAD_PATTERNS) {
          if (sentence.includes(bad)) {
            hits.push(`[grade${kanji.grade} ${kanji.char}] '${bad}': ${sentence}`);
          }
        }
      }
    }
    expect(hits).toEqual([]);
  });
});
