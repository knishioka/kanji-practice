import type { RadicalPosition } from './radicals';

// 漢字から部首へのマッピング
export interface KanjiRadicalMapping {
  radicalChar: string; // 部首文字
  position?: RadicalPosition; // 部首の位置
}

/**
 * 漢字→部首マッピングテーブル
 * 30種の主要部首に該当する漢字のみ登録
 * 該当しない漢字は登録しない（部首問題に出題されない）
 */
export const kanjiRadicalMap: Record<string, KanjiRadicalMapping> = {
  // ===== 1年生 (80字) =====
  // にんべん（亻）
  休: { radicalChar: '亻', position: 'left' },
  体: { radicalChar: '亻', position: 'left' },
  // さんずい（氵）
  // (1年生にはなし)
  // きへん（木）
  木: { radicalChar: '木', position: 'other' },
  本: { radicalChar: '木', position: 'other' },
  林: { radicalChar: '木', position: 'other' },
  森: { radicalChar: '木', position: 'other' },
  校: { radicalChar: '木', position: 'left' },
  村: { radicalChar: '木', position: 'left' },
  // くち（口）
  口: { radicalChar: '口', position: 'other' },
  // てへん（扌）
  // (1年生にはなし)
  // りっしんべん・こころ（忄・心）
  // (1年生にはなし)
  // ごんべん（言）
  // (1年生にはなし)
  // いとへん（糸）
  糸: { radicalChar: '糸', position: 'other' },
  // かねへん（金）
  金: { radicalChar: '金', position: 'other' },
  // ひへん（日）
  日: { radicalChar: '日', position: 'other' },
  早: { radicalChar: '日', position: 'other' },
  // つきへん（月）
  月: { radicalChar: '月', position: 'other' },
  // ひへん（火）
  火: { radicalChar: '火', position: 'other' },
  // つちへん（土）
  土: { radicalChar: '土', position: 'other' },
  // おんなへん（女）
  女: { radicalChar: '女', position: 'other' },
  // めへん（目）
  目: { radicalChar: '目', position: 'other' },
  見: { radicalChar: '目', position: 'other' },
  // いし（石）
  石: { radicalChar: '石', position: 'other' },
  // くるま（車）
  車: { radicalChar: '車', position: 'other' },
  // あし（足）
  足: { radicalChar: '足', position: 'other' },
  // かい（貝）
  貝: { radicalChar: '貝', position: 'other' },
  // こざとへん（阝）
  // (1年生にはなし)
  // やま（山）
  山: { radicalChar: '山', position: 'other' },
  // くさかんむり（艹）
  花: { radicalChar: '艹', position: 'top' },
  草: { radicalChar: '艹', position: 'top' },
  // たけかんむり（竹）
  竹: { radicalChar: '竹', position: 'other' },
  // あめかんむり（雨）
  雨: { radicalChar: '雨', position: 'other' },
  // うかんむり（宀）
  字: { radicalChar: '宀', position: 'top' },
  // しんにょう（辶）
  // (1年生にはなし)
  // したごころ（心）
  // (1年生にはなし)
  // いち（一）
  一: { radicalChar: '一', position: 'other' },
  二: { radicalChar: '一', position: 'other' },
  三: { radicalChar: '一', position: 'other' },
  // ひと（人）
  人: { radicalChar: '人', position: 'other' },
  大: { radicalChar: '人', position: 'top' },
  天: { radicalChar: '人', position: 'top' },
  // た（田）
  田: { radicalChar: '田', position: 'other' },
  町: { radicalChar: '田', position: 'left' },
  男: { radicalChar: '田', position: 'top' },

  // ===== 2年生 (160字) =====
  // にんべん（亻）
  作: { radicalChar: '亻', position: 'left' },
  何: { radicalChar: '亻', position: 'left' },
  会: { radicalChar: '人', position: 'top' },
  今: { radicalChar: '人', position: 'top' },
  // さんずい（氵）
  海: { radicalChar: '氵', position: 'left' },
  池: { radicalChar: '氵', position: 'left' },
  汽: { radicalChar: '氵', position: 'left' },
  活: { radicalChar: '氵', position: 'left' },
  // きへん（木）
  楽: { radicalChar: '木', position: 'bottom' },
  // くち（口）
  古: { radicalChar: '口', position: 'bottom' },
  台: { radicalChar: '口', position: 'bottom' },
  合: { radicalChar: '口', position: 'bottom' },
  回: { radicalChar: '口', position: 'enclosing' },
  国: { radicalChar: '口', position: 'enclosing' },
  園: { radicalChar: '口', position: 'enclosing' },
  図: { radicalChar: '口', position: 'enclosing' },
  // てへん（扌）
  // (2年生にはなし)
  // りっしんべん・こころ（忄・心）
  // (2年生にはなし)
  // ごんべん（言）
  言: { radicalChar: '言', position: 'other' },
  話: { radicalChar: '言', position: 'left' },
  語: { radicalChar: '言', position: 'left' },
  読: { radicalChar: '言', position: 'left' },
  記: { radicalChar: '言', position: 'left' },
  計: { radicalChar: '言', position: 'left' },
  // いとへん（糸）
  紙: { radicalChar: '糸', position: 'left' },
  組: { radicalChar: '糸', position: 'left' },
  絵: { radicalChar: '糸', position: 'left' },
  線: { radicalChar: '糸', position: 'left' },
  // かねへん（金）
  // (2年生にはなし)
  // ひへん（日）
  星: { radicalChar: '日', position: 'top' },
  明: { radicalChar: '日', position: 'left' },
  春: { radicalChar: '日', position: 'bottom' },
  昼: { radicalChar: '日', position: 'top' },
  時: { radicalChar: '日', position: 'left' },
  晴: { radicalChar: '日', position: 'left' },
  曜: { radicalChar: '日', position: 'left' },
  朝: { radicalChar: '月', position: 'left' },
  // つきへん（月）
  // (朝は月を含むが日扱い)
  // ひへん（火）
  // (2年生にはなし)
  // つちへん（土）
  地: { radicalChar: '土', position: 'left' },
  場: { radicalChar: '土', position: 'left' },
  // おんなへん（女）
  妹: { radicalChar: '女', position: 'left' },
  姉: { radicalChar: '女', position: 'left' },
  // めへん（目）
  // (2年生にはなし)
  // いし（石）
  岩: { radicalChar: '山', position: 'top' },
  // くるま（車）
  // (2年生にはなし)
  // あし（足）
  // (2年生にはなし)
  // かい（貝）
  買: { radicalChar: '貝', position: 'bottom' },
  // こざとへん（阝）
  // (2年生にはなし)
  // やま（山）
  // (岩は山扱い)
  // くさかんむり（艹）
  茶: { radicalChar: '艹', position: 'top' },
  // たけかんむり（竹）
  答: { radicalChar: '竹', position: 'top' },
  算: { radicalChar: '竹', position: 'top' },
  // あめかんむり（雨）
  雪: { radicalChar: '雨', position: 'top' },
  雲: { radicalChar: '雨', position: 'top' },
  電: { radicalChar: '雨', position: 'top' },
  // うかんむり（宀）
  家: { radicalChar: '宀', position: 'top' },
  室: { radicalChar: '宀', position: 'top' },
  // しんにょう（辶）
  道: { radicalChar: '辶', position: 'enclosing' },
  通: { radicalChar: '辶', position: 'enclosing' },
  近: { radicalChar: '辶', position: 'enclosing' },
  遠: { radicalChar: '辶', position: 'enclosing' },
  週: { radicalChar: '辶', position: 'enclosing' },
  // したごころ（心）
  思: { radicalChar: '心', position: 'bottom' },
  // いち（一）
  万: { radicalChar: '一', position: 'other' },
  // ひと（人）
  // (会、今は上記)
  // た（田）
  番: { radicalChar: '田', position: 'top' },

  // ===== 3年生 (200字) =====
  // にんべん（亻）
  住: { radicalChar: '亻', position: 'left' },
  使: { radicalChar: '亻', position: 'left' },
  係: { radicalChar: '亻', position: 'left' },
  倍: { radicalChar: '亻', position: 'left' },
  他: { radicalChar: '亻', position: 'left' },
  代: { radicalChar: '亻', position: 'left' },
  仕: { radicalChar: '亻', position: 'left' },
  // さんずい（氵）
  油: { radicalChar: '氵', position: 'left' },
  波: { radicalChar: '氵', position: 'left' },
  流: { radicalChar: '氵', position: 'left' },
  泳: { radicalChar: '氵', position: 'left' },
  港: { radicalChar: '氵', position: 'left' },
  湖: { radicalChar: '氵', position: 'left' },
  温: { radicalChar: '氵', position: 'left' },
  消: { radicalChar: '氵', position: 'left' },
  深: { radicalChar: '氵', position: 'left' },
  漢: { radicalChar: '氵', position: 'left' },
  注: { radicalChar: '氵', position: 'left' },
  洋: { radicalChar: '氵', position: 'left' },
  酒: { radicalChar: '氵', position: 'left' },
  // きへん（木）
  植: { radicalChar: '木', position: 'left' },
  根: { radicalChar: '木', position: 'left' },
  柱: { radicalChar: '木', position: 'left' },
  橋: { radicalChar: '木', position: 'left' },
  様: { radicalChar: '木', position: 'left' },
  業: { radicalChar: '木', position: 'top' },
  板: { radicalChar: '木', position: 'left' },
  相: { radicalChar: '木', position: 'left' },
  横: { radicalChar: '木', position: 'left' },
  // くち（口）
  味: { radicalChar: '口', position: 'left' },
  品: { radicalChar: '口', position: 'other' },
  員: { radicalChar: '口', position: 'top' },
  問: { radicalChar: '口', position: 'enclosing' },
  商: { radicalChar: '口', position: 'other' },
  号: { radicalChar: '口', position: 'bottom' },
  向: { radicalChar: '口', position: 'other' },
  命: { radicalChar: '口', position: 'top' },
  // てへん（扌）
  持: { radicalChar: '扌', position: 'left' },
  指: { radicalChar: '扌', position: 'left' },
  打: { radicalChar: '扌', position: 'left' },
  投: { radicalChar: '扌', position: 'left' },
  拾: { radicalChar: '扌', position: 'left' },
  // りっしんべん・こころ（忄・心）
  悲: { radicalChar: '忄', position: 'left' },
  想: { radicalChar: '心', position: 'bottom' },
  意: { radicalChar: '心', position: 'bottom' },
  感: { radicalChar: '心', position: 'bottom' },
  悪: { radicalChar: '心', position: 'bottom' },
  息: { radicalChar: '心', position: 'bottom' },
  急: { radicalChar: '心', position: 'bottom' },
  // ごんべん（言）
  詩: { radicalChar: '言', position: 'left' },
  調: { radicalChar: '言', position: 'left' },
  談: { radicalChar: '言', position: 'left' },
  // いとへん（糸）
  練: { radicalChar: '糸', position: 'left' },
  級: { radicalChar: '糸', position: 'left' },
  終: { radicalChar: '糸', position: 'left' },
  緑: { radicalChar: '糸', position: 'left' },
  // かねへん（金）
  鉄: { radicalChar: '金', position: 'left' },
  銀: { radicalChar: '金', position: 'left' },
  // ひへん（日）
  暑: { radicalChar: '日', position: 'top' },
  暗: { radicalChar: '日', position: 'left' },
  昭: { radicalChar: '日', position: 'left' },
  曲: { radicalChar: '日', position: 'other' },
  // つきへん（月）
  服: { radicalChar: '月', position: 'left' },
  期: { radicalChar: '月', position: 'right' },
  有: { radicalChar: '月', position: 'bottom' },
  // ひへん（火）
  炭: { radicalChar: '火', position: 'bottom' },
  // つちへん（土）
  坂: { radicalChar: '土', position: 'left' },
  // おんなへん（女）
  始: { radicalChar: '女', position: 'left' },
  安: { radicalChar: '宀', position: 'top' },
  // めへん（目）
  県: { radicalChar: '目', position: 'bottom' },
  // いし（石）
  研: { radicalChar: '石', position: 'left' },
  // くるま（車）
  軽: { radicalChar: '車', position: 'left' },
  転: { radicalChar: '車', position: 'left' },
  輪: { radicalChar: '車', position: 'left' },
  // あし（足）
  路: { radicalChar: '足', position: 'left' },
  // かい（貝）
  負: { radicalChar: '貝', position: 'bottom' },
  // こざとへん（阝）
  院: { radicalChar: '阝', position: 'left' },
  階: { radicalChar: '阝', position: 'left' },
  陽: { radicalChar: '阝', position: 'left' },
  都: { radicalChar: '阝', position: 'right' },
  部: { radicalChar: '阝', position: 'right' },
  // やま（山）
  島: { radicalChar: '山', position: 'top' },
  岸: { radicalChar: '山', position: 'top' },
  // くさかんむり（艹）
  葉: { radicalChar: '艹', position: 'top' },
  落: { radicalChar: '艹', position: 'top' },
  苦: { radicalChar: '艹', position: 'top' },
  薬: { radicalChar: '艹', position: 'top' },
  荷: { radicalChar: '艹', position: 'top' },
  // たけかんむり（竹）
  筆: { radicalChar: '竹', position: 'top' },
  等: { radicalChar: '竹', position: 'top' },
  箱: { radicalChar: '竹', position: 'top' },
  笛: { radicalChar: '竹', position: 'top' },
  第: { radicalChar: '竹', position: 'top' },
  // あめかんむり（雨）
  // (3年生にはなし)
  // うかんむり（宀）
  宮: { radicalChar: '宀', position: 'top' },
  客: { radicalChar: '宀', position: 'top' },
  宿: { radicalChar: '宀', position: 'top' },
  実: { radicalChar: '宀', position: 'top' },
  守: { radicalChar: '宀', position: 'top' },
  定: { radicalChar: '宀', position: 'top' },
  寒: { radicalChar: '宀', position: 'top' },
  // しんにょう（辶）
  進: { radicalChar: '辶', position: 'enclosing' },
  送: { radicalChar: '辶', position: 'enclosing' },
  返: { radicalChar: '辶', position: 'enclosing' },
  追: { radicalChar: '辶', position: 'enclosing' },
  速: { radicalChar: '辶', position: 'enclosing' },
  運: { radicalChar: '辶', position: 'enclosing' },
  遊: { radicalChar: '辶', position: 'enclosing' },
  配: { radicalChar: '酉', position: 'left' }, // 酉へんだが出題対象外
  // した（心）- 追加
  // いち（一）
  世: { radicalChar: '一', position: 'other' },
  // た（田）
  畑: { radicalChar: '田', position: 'left' },
  界: { radicalChar: '田', position: 'top' },

  // ===== 4年生 (202字) =====
  // にんべん（亻）
  働: { radicalChar: '亻', position: 'left' },
  信: { radicalChar: '亻', position: 'left' },
  倉: { radicalChar: '人', position: 'top' },
  位: { radicalChar: '亻', position: 'left' },
  低: { radicalChar: '亻', position: 'left' },
  伝: { radicalChar: '亻', position: 'left' },
  便: { radicalChar: '亻', position: 'left' },
  候: { radicalChar: '亻', position: 'left' },
  借: { radicalChar: '亻', position: 'left' },
  停: { radicalChar: '亻', position: 'left' },
  健: { radicalChar: '亻', position: 'left' },
  側: { radicalChar: '亻', position: 'left' },
  億: { radicalChar: '亻', position: 'left' },
  // さんずい（氵）
  浴: { radicalChar: '氵', position: 'left' },
  清: { radicalChar: '氵', position: 'left' },
  浅: { radicalChar: '氵', position: 'left' },
  満: { radicalChar: '氵', position: 'left' },
  治: { radicalChar: '氵', position: 'left' },
  法: { radicalChar: '氵', position: 'left' },
  潟: { radicalChar: '氵', position: 'left' },
  滋: { radicalChar: '氵', position: 'left' },
  // きへん（木）
  機: { radicalChar: '木', position: 'left' },
  材: { radicalChar: '木', position: 'left' },
  松: { radicalChar: '木', position: 'left' },
  札: { radicalChar: '木', position: 'left' },
  極: { radicalChar: '木', position: 'left' },
  標: { radicalChar: '木', position: 'left' },
  梅: { radicalChar: '木', position: 'left' },
  栄: { radicalChar: '木', position: 'top' },
  械: { radicalChar: '木', position: 'left' },
  案: { radicalChar: '木', position: 'bottom' },
  果: { radicalChar: '木', position: 'bottom' },
  // くち（口）
  唱: { radicalChar: '口', position: 'left' },
  器: { radicalChar: '口', position: 'other' },
  固: { radicalChar: '口', position: 'enclosing' },
  囲: { radicalChar: '口', position: 'enclosing' },
  // てへん（扌）
  挙: { radicalChar: '扌', position: 'bottom' },
  折: { radicalChar: '扌', position: 'left' },
  // りっしんべん・こころ（忄・心）
  必: { radicalChar: '心', position: 'other' },
  念: { radicalChar: '心', position: 'bottom' },
  愛: { radicalChar: '心', position: 'bottom' },
  // ごんべん（言）
  訓: { radicalChar: '言', position: 'left' },
  説: { radicalChar: '言', position: 'left' },
  試: { radicalChar: '言', position: 'left' },
  課: { radicalChar: '言', position: 'left' },
  議: { radicalChar: '言', position: 'left' },
  // いとへん（糸）
  約: { radicalChar: '糸', position: 'left' },
  給: { radicalChar: '糸', position: 'left' },
  結: { radicalChar: '糸', position: 'left' },
  続: { radicalChar: '糸', position: 'left' },
  紀: { radicalChar: '糸', position: 'left' },
  // かねへん（金）
  鏡: { radicalChar: '金', position: 'left' },
  録: { radicalChar: '金', position: 'left' },
  // ひへん（日）
  景: { radicalChar: '日', position: 'top' },
  旗: { radicalChar: '方', position: 'left' }, // 方へんだが出題対象外
  // つきへん（月）
  脈: { radicalChar: '月', position: 'left' },
  胃: { radicalChar: '月', position: 'bottom' },
  腸: { radicalChar: '月', position: 'left' },
  // ひへん（火）
  焼: { radicalChar: '火', position: 'left' },
  熱: { radicalChar: '灬', position: 'bottom' },
  灯: { radicalChar: '火', position: 'left' },
  照: { radicalChar: '灬', position: 'bottom' },
  熊: { radicalChar: '灬', position: 'bottom' },
  // つちへん（土）
  城: { radicalChar: '土', position: 'left' },
  塩: { radicalChar: '土', position: 'left' },
  型: { radicalChar: '土', position: 'bottom' },
  // おんなへん（女）
  好: { radicalChar: '女', position: 'left' },
  // めへん（目）
  // (4年生にはなし)
  // いし（石）
  // (4年生にはなし - 砂は6年生)
  // くるま（車）
  軍: { radicalChar: '車', position: 'top' },
  // あし（足）
  // (4年生にはなし)
  // かい（貝）
  費: { radicalChar: '貝', position: 'bottom' },
  貨: { radicalChar: '貝', position: 'bottom' },
  賞: { radicalChar: '貝', position: 'bottom' },
  // こざとへん（阝）
  隊: { radicalChar: '阝', position: 'left' },
  陸: { radicalChar: '阝', position: 'left' },
  郡: { radicalChar: '阝', position: 'right' },
  // やま（山）
  崎: { radicalChar: '山', position: 'left' },
  // くさかんむり（艹）
  芽: { radicalChar: '艹', position: 'top' },
  英: { radicalChar: '艹', position: 'top' },
  菜: { radicalChar: '艹', position: 'top' },
  // たけかんむり（竹）
  管: { radicalChar: '竹', position: 'top' },
  節: { radicalChar: '竹', position: 'top' },
  笑: { radicalChar: '竹', position: 'top' },
  // あめかんむり（雨）
  // (4年生にはなし)
  // うかんむり（宀）
  察: { radicalChar: '宀', position: 'top' },
  害: { radicalChar: '宀', position: 'top' },
  富: { radicalChar: '宀', position: 'top' },
  官: { radicalChar: '宀', position: 'top' },
  完: { radicalChar: '宀', position: 'top' },
  宴: { radicalChar: '宀', position: 'top' },
  // しんにょう（辶）
  達: { radicalChar: '辶', position: 'enclosing' },
  連: { radicalChar: '辶', position: 'enclosing' },
  辺: { radicalChar: '辶', position: 'enclosing' },
  選: { radicalChar: '辶', position: 'enclosing' },
  // いち（一）
  不: { radicalChar: '一', position: 'other' },
  // た（田）
  // (4年生にはなし)

  // ===== 5年生 (193字) =====
  // にんべん（亻）
  仏: { radicalChar: '亻', position: 'left' },
  件: { radicalChar: '亻', position: 'left' },
  似: { radicalChar: '亻', position: 'left' },
  保: { radicalChar: '亻', position: 'left' },
  個: { radicalChar: '亻', position: 'left' },
  修: { radicalChar: '亻', position: 'left' },
  俵: { radicalChar: '亻', position: 'left' },
  備: { radicalChar: '亻', position: 'left' },
  像: { radicalChar: '亻', position: 'left' },
  価: { radicalChar: '亻', position: 'left' },
  // さんずい（氵）
  液: { radicalChar: '氵', position: 'left' },
  河: { radicalChar: '氵', position: 'left' },
  混: { radicalChar: '氵', position: 'left' },
  減: { radicalChar: '氵', position: 'left' },
  測: { radicalChar: '氵', position: 'left' },
  演: { radicalChar: '氵', position: 'left' },
  潔: { radicalChar: '氵', position: 'left' },
  // きへん（木）
  格: { radicalChar: '木', position: 'left' },
  検: { radicalChar: '木', position: 'left' },
  構: { radicalChar: '木', position: 'left' },
  桜: { radicalChar: '木', position: 'left' },
  枝: { radicalChar: '木', position: 'left' },
  条: { radicalChar: '木', position: 'bottom' },
  // くち（口）
  句: { radicalChar: '口', position: 'bottom' },
  // てへん（扌）
  技: { radicalChar: '扌', position: 'left' },
  招: { radicalChar: '扌', position: 'left' },
  採: { radicalChar: '扌', position: 'left' },
  授: { radicalChar: '扌', position: 'left' },
  接: { radicalChar: '扌', position: 'left' },
  損: { radicalChar: '扌', position: 'left' },
  捜: { radicalChar: '扌', position: 'left' },
  // りっしんべん・こころ（忄・心）
  快: { radicalChar: '忄', position: 'left' },
  性: { radicalChar: '忄', position: 'left' },
  情: { radicalChar: '忄', position: 'left' },
  態: { radicalChar: '心', position: 'bottom' },
  慣: { radicalChar: '忄', position: 'left' },
  // ごんべん（言）
  許: { radicalChar: '言', position: 'left' },
  証: { radicalChar: '言', position: 'left' },
  評: { radicalChar: '言', position: 'left' },
  護: { radicalChar: '言', position: 'left' },
  設: { radicalChar: '言', position: 'left' },
  謝: { radicalChar: '言', position: 'left' },
  識: { radicalChar: '言', position: 'left' },
  // いとへん（糸）
  織: { radicalChar: '糸', position: 'left' },
  絹: { radicalChar: '糸', position: 'left' },
  綿: { radicalChar: '糸', position: 'left' },
  編: { radicalChar: '糸', position: 'left' },
  統: { radicalChar: '糸', position: 'left' },
  経: { radicalChar: '糸', position: 'left' },
  // かねへん（金）
  銅: { radicalChar: '金', position: 'left' },
  銭: { radicalChar: '金', position: 'left' },
  鋼: { radicalChar: '金', position: 'left' },
  // ひへん（日）
  旧: { radicalChar: '日', position: 'other' },
  暴: { radicalChar: '日', position: 'top' },
  // つきへん（月）
  肥: { radicalChar: '月', position: 'left' },
  // ひへん（火）
  燃: { radicalChar: '火', position: 'left' },
  // つちへん（土）
  基: { radicalChar: '土', position: 'bottom' },
  境: { radicalChar: '土', position: 'left' },
  増: { radicalChar: '土', position: 'left' },
  均: { radicalChar: '土', position: 'left' },
  報: { radicalChar: '土', position: 'left' },
  堂: { radicalChar: '土', position: 'bottom' },
  墓: { radicalChar: '土', position: 'bottom' },
  // おんなへん（女）
  婦: { radicalChar: '女', position: 'left' },
  // めへん（目）
  眼: { radicalChar: '目', position: 'left' },
  // いし（石）
  破: { radicalChar: '石', position: 'left' },
  確: { radicalChar: '石', position: 'left' },
  // くるま（車）
  輸: { radicalChar: '車', position: 'left' },
  // あし（足）
  // (5年生にはなし)
  // かい（貝）
  資: { radicalChar: '貝', position: 'bottom' },
  貿: { radicalChar: '貝', position: 'bottom' },
  財: { radicalChar: '貝', position: 'left' },
  貧: { radicalChar: '貝', position: 'bottom' },
  質: { radicalChar: '貝', position: 'bottom' },
  // こざとへん（阝）
  防: { radicalChar: '阝', position: 'left' },
  険: { radicalChar: '阝', position: 'left' },
  際: { radicalChar: '阝', position: 'left' },
  限: { radicalChar: '阝', position: 'left' },
  // やま（山）
  // (5年生にはなし)
  // くさかんむり（艹）
  著: { radicalChar: '艹', position: 'top' },
  蚕: { radicalChar: '艹', position: 'top' },
  // たけかんむり（竹）
  築: { radicalChar: '竹', position: 'top' },
  // あめかんむり（雨）
  // (5年生にはなし)
  // うかんむり（宀）
  容: { radicalChar: '宀', position: 'top' },
  // しんにょう（辶）
  造: { radicalChar: '辶', position: 'enclosing' },
  過: { radicalChar: '辶', position: 'enclosing' },
  適: { radicalChar: '辶', position: 'enclosing' },
  述: { radicalChar: '辶', position: 'enclosing' },
  迷: { radicalChar: '辶', position: 'enclosing' },
  退: { radicalChar: '辶', position: 'enclosing' },
  逆: { radicalChar: '辶', position: 'enclosing' },
  // いち（一）
  再: { radicalChar: '一', position: 'other' },
  // た（田）
  略: { radicalChar: '田', position: 'left' },
  留: { radicalChar: '田', position: 'top' },

  // ===== 6年生 (191字) =====
  // にんべん（亻）
  俳: { radicalChar: '亻', position: 'left' },
  仁: { radicalChar: '亻', position: 'left' },
  優: { radicalChar: '亻', position: 'left' },
  傷: { radicalChar: '亻', position: 'left' },
  値: { radicalChar: '亻', position: 'left' },
  供: { radicalChar: '亻', position: 'left' },
  // さんずい（氵）
  沿: { radicalChar: '氵', position: 'left' },
  派: { radicalChar: '氵', position: 'left' },
  済: { radicalChar: '氵', position: 'left' },
  潮: { radicalChar: '氵', position: 'left' },
  源: { radicalChar: '氵', position: 'left' },
  激: { radicalChar: '氵', position: 'left' },
  洗: { radicalChar: '氵', position: 'left' },
  // きへん（木）
  棒: { radicalChar: '木', position: 'left' },
  枚: { radicalChar: '木', position: 'left' },
  模: { radicalChar: '木', position: 'left' },
  権: { radicalChar: '木', position: 'left' },
  樹: { radicalChar: '木', position: 'left' },
  // くち（口）
  吸: { radicalChar: '口', position: 'left' },
  呼: { radicalChar: '口', position: 'left' },
  否: { radicalChar: '口', position: 'bottom' },
  // てへん（扌）
  推: { radicalChar: '扌', position: 'left' },
  担: { radicalChar: '扌', position: 'left' },
  拡: { radicalChar: '扌', position: 'left' },
  探: { radicalChar: '扌', position: 'left' },
  拝: { radicalChar: '扌', position: 'left' },
  操: { radicalChar: '扌', position: 'left' },
  批: { radicalChar: '扌', position: 'left' },
  揮: { radicalChar: '扌', position: 'left' },
  // りっしんべん・こころ（忄・心）
  恩: { radicalChar: '心', position: 'bottom' },
  憲: { radicalChar: '心', position: 'bottom' },
  // ごんべん（言）
  誠: { radicalChar: '言', position: 'left' },
  訪: { radicalChar: '言', position: 'left' },
  誌: { radicalChar: '言', position: 'left' },
  訳: { radicalChar: '言', position: 'left' },
  認: { radicalChar: '言', position: 'left' },
  警: { radicalChar: '言', position: 'bottom' },
  詞: { radicalChar: '言', position: 'left' },
  論: { radicalChar: '言', position: 'left' },
  諸: { radicalChar: '言', position: 'left' },
  // いとへん（糸）
  納: { radicalChar: '糸', position: 'left' },
  純: { radicalChar: '糸', position: 'left' },
  縦: { radicalChar: '糸', position: 'left' },
  縮: { radicalChar: '糸', position: 'left' },
  絶: { radicalChar: '糸', position: 'left' },
  紅: { radicalChar: '糸', position: 'left' },
  // かねへん（金）
  針: { radicalChar: '金', position: 'left' },
  鋭: { radicalChar: '金', position: 'left' },
  // ひへん（日）
  暖: { radicalChar: '日', position: 'left' },
  映: { radicalChar: '日', position: 'left' },
  晩: { radicalChar: '日', position: 'left' },
  // つきへん（月）
  臓: { radicalChar: '月', position: 'left' },
  背: { radicalChar: '月', position: 'bottom' },
  腹: { radicalChar: '月', position: 'left' },
  肺: { radicalChar: '月', position: 'left' },
  // ひへん（火）
  // (6年生にはなし)
  // つちへん（土）
  域: { radicalChar: '土', position: 'left' },
  墾: { radicalChar: '土', position: 'bottom' },
  壱: { radicalChar: '士', position: 'top' }, // 士だが出題対象外
  // おんなへん（女）
  姿: { radicalChar: '女', position: 'bottom' },
  奮: { radicalChar: '大', position: 'other' }, // 大だが出題対象外
  // めへん（目）
  看: { radicalChar: '目', position: 'bottom' },
  // いし（石）
  磁: { radicalChar: '石', position: 'left' },
  砂: { radicalChar: '石', position: 'left' },
  // くるま（車）
  // (6年生にはなし)
  // あし（足）
  蹴: { radicalChar: '足', position: 'left' },
  踏: { radicalChar: '足', position: 'left' },
  // かい（貝）
  貴: { radicalChar: '貝', position: 'bottom' },
  // こざとへん（阝）
  降: { radicalChar: '阝', position: 'left' },
  障: { radicalChar: '阝', position: 'left' },
  郷: { radicalChar: '阝', position: 'right' },
  // やま（山）
  // (6年生にはなし)
  // くさかんむり（艹）
  蔵: { radicalChar: '艹', position: 'top' },
  若: { radicalChar: '艹', position: 'top' },
  // たけかんむり（竹）
  簡: { radicalChar: '竹', position: 'top' },
  // あめかんむり（雨）
  // (6年生にはなし)
  // うかんむり（宀）
  宗: { radicalChar: '宀', position: 'top' },
  宝: { radicalChar: '宀', position: 'top' },
  宣: { radicalChar: '宀', position: 'top' },
  密: { radicalChar: '宀', position: 'top' },
  // しんにょう（辶）
  遺: { radicalChar: '辶', position: 'enclosing' },
  遣: { radicalChar: '辶', position: 'enclosing' },
  // いち（一）
  // (6年生にはなし)
  // た（田）
  // (6年生にはなし)

  // ===== 追加部首のマッピング =====

  // ちから（力）
  力: { radicalChar: '力', position: 'other' },
  助: { radicalChar: '力', position: 'right' },
  動: { radicalChar: '力', position: 'right' },
  勉: { radicalChar: '力', position: 'right' },
  努: { radicalChar: '力', position: 'right' },
  勇: { radicalChar: '力', position: 'bottom' },
  勤: { radicalChar: '力', position: 'right' },
  効: { radicalChar: '力', position: 'right' },
  功: { radicalChar: '力', position: 'right' },
  加: { radicalChar: '力', position: 'right' },
  務: { radicalChar: '力', position: 'right' },
  劇: { radicalChar: '力', position: 'right' },

  // りっとう（刂）
  切: { radicalChar: '刂', position: 'right' },
  分: { radicalChar: '刂', position: 'other' },
  列: { radicalChar: '刂', position: 'right' },
  判: { radicalChar: '刂', position: 'right' },
  刻: { radicalChar: '刂', position: 'right' },
  別: { radicalChar: '刂', position: 'right' },
  割: { radicalChar: '刂', position: 'right' },
  刊: { radicalChar: '刂', position: 'right' },
  創: { radicalChar: '刂', position: 'right' },
  券: { radicalChar: '刂', position: 'bottom' },

  // おおがい（頁）
  頭: { radicalChar: '頁', position: 'right' },
  顔: { radicalChar: '頁', position: 'right' },
  類: { radicalChar: '頁', position: 'right' },
  額: { radicalChar: '頁', position: 'right' },
  題: { radicalChar: '頁', position: 'right' },
  順: { radicalChar: '頁', position: 'right' },
  預: { radicalChar: '頁', position: 'right' },
  領: { radicalChar: '頁', position: 'right' },

  // うま（馬）
  馬: { radicalChar: '馬', position: 'other' },
  駅: { radicalChar: '馬', position: 'left' },
  験: { radicalChar: '馬', position: 'left' },
  駐: { radicalChar: '馬', position: 'left' },

  // とり（鳥）
  鳥: { radicalChar: '鳥', position: 'other' },
  鳴: { radicalChar: '鳥', position: 'right' },

  // うお（魚）
  魚: { radicalChar: '魚', position: 'other' },

  // しょくへん（食）
  食: { radicalChar: '食', position: 'other' },
  飲: { radicalChar: '食', position: 'left' },
  飯: { radicalChar: '食', position: 'left' },
  館: { radicalChar: '食', position: 'left' },
  養: { radicalChar: '食', position: 'top' },
  飼: { radicalChar: '食', position: 'left' },
  飾: { radicalChar: '食', position: 'left' },

  // けものへん（犭）
  犬: { radicalChar: '犭', position: 'other' },
  犯: { radicalChar: '犭', position: 'left' },
  狭: { radicalChar: '犭', position: 'left' },
  独: { radicalChar: '犭', position: 'left' },
  猫: { radicalChar: '犭', position: 'left' },

  // うし（牛）
  牛: { radicalChar: '牛', position: 'other' },
  特: { radicalChar: '牛', position: 'left' },
  物: { radicalChar: '牛', position: 'left' },
  牧: { radicalChar: '牛', position: 'left' },

  // しめすへん（礻）
  社: { radicalChar: '礻', position: 'left' },
  神: { radicalChar: '礻', position: 'left' },
  祭: { radicalChar: '礻', position: 'top' },
  福: { radicalChar: '礻', position: 'left' },
  祝: { radicalChar: '礻', position: 'left' },
  祖: { radicalChar: '礻', position: 'left' },
  禁: { radicalChar: '礻', position: 'bottom' },

  // ころもへん（衤）
  衣: { radicalChar: '衤', position: 'other' },
  初: { radicalChar: '衤', position: 'left' },
  複: { radicalChar: '衤', position: 'left' },
  裏: { radicalChar: '衤', position: 'enclosing' },
  袋: { radicalChar: '衤', position: 'bottom' },
  補: { radicalChar: '衤', position: 'left' },
  製: { radicalChar: '衤', position: 'bottom' },
  装: { radicalChar: '衤', position: 'bottom' },

  // もんがまえ（門）
  門: { radicalChar: '門', position: 'other' },
  開: { radicalChar: '門', position: 'enclosing' },
  閉: { radicalChar: '門', position: 'enclosing' },
  間: { radicalChar: '門', position: 'enclosing' },
  関: { radicalChar: '門', position: 'enclosing' },
  聞: { radicalChar: '門', position: 'enclosing' },
  閣: { radicalChar: '門', position: 'enclosing' },

  // まだれ（广）
  広: { radicalChar: '广', position: 'enclosing' },
  店: { radicalChar: '广', position: 'enclosing' },
  度: { radicalChar: '广', position: 'enclosing' },
  庫: { radicalChar: '广', position: 'enclosing' },
  座: { radicalChar: '广', position: 'enclosing' },
  庭: { radicalChar: '广', position: 'enclosing' },
  府: { radicalChar: '广', position: 'enclosing' },
  床: { radicalChar: '广', position: 'enclosing' },
  康: { radicalChar: '广', position: 'enclosing' },
  序: { radicalChar: '广', position: 'enclosing' },
  廊: { radicalChar: '广', position: 'enclosing' },

  // やまいだれ（疒）
  病: { radicalChar: '疒', position: 'enclosing' },
  痛: { radicalChar: '疒', position: 'enclosing' },

  // こめへん（米）
  米: { radicalChar: '米', position: 'other' },
  料: { radicalChar: '米', position: 'left' },
  粉: { radicalChar: '米', position: 'left' },
  精: { radicalChar: '米', position: 'left' },
  糖: { radicalChar: '米', position: 'left' },

  // むしへん（虫）
  虫: { radicalChar: '虫', position: 'other' },

  // みみへん（耳）
  耳: { radicalChar: '耳', position: 'other' },
  職: { radicalChar: '耳', position: 'left' },

  // のぎへん（禾）
  秋: { radicalChar: '禾', position: 'left' },
  科: { radicalChar: '禾', position: 'left' },
  種: { radicalChar: '禾', position: 'left' },
  積: { radicalChar: '禾', position: 'left' },
  秀: { radicalChar: '禾', position: 'top' },
  程: { radicalChar: '禾', position: 'left' },
  秒: { radicalChar: '禾', position: 'left' },
  私: { radicalChar: '禾', position: 'left' },
  税: { radicalChar: '禾', position: 'left' },
  移: { radicalChar: '禾', position: 'left' },
  稲: { radicalChar: '禾', position: 'left' },
  穀: { radicalChar: '禾', position: 'left' },
  穂: { radicalChar: '禾', position: 'left' },

  // あなかんむり（穴）
  穴: { radicalChar: '穴', position: 'other' },
  空: { radicalChar: '穴', position: 'top' },
  究: { radicalChar: '穴', position: 'top' },
  窓: { radicalChar: '穴', position: 'top' },

  // ひつじ（羊）
  羊: { radicalChar: '羊', position: 'other' },
  美: { radicalChar: '羊', position: 'top' },
  義: { radicalChar: '羊', position: 'top' },
  群: { radicalChar: '羊', position: 'left' },

  // しろ（白）
  白: { radicalChar: '白', position: 'other' },
  百: { radicalChar: '白', position: 'other' },
  的: { radicalChar: '白', position: 'left' },
  皆: { radicalChar: '白', position: 'top' },
};

/**
 * 漢字から部首マッピングを取得
 */
export function getKanjiRadicalMapping(char: string): KanjiRadicalMapping | undefined {
  return kanjiRadicalMap[char];
}

/**
 * 特定の部首を持つ漢字一覧を取得
 */
export function getKanjiByRadical(radicalChar: string): string[] {
  return Object.entries(kanjiRadicalMap)
    .filter(([_, mapping]) => mapping.radicalChar === radicalChar)
    .map(([kanji]) => kanji);
}
