# 漢字データ検証コマンド

指定された学年（または全学年）の漢字データを検証します。

## 検証項目

1. **必須フィールド**
   - char: 漢字1文字
   - grade: 学年（1-6）
   - readings: 音読み・訓読み（少なくとも1つ）
   - strokeCount: 画数（1-30の整数）
   - examples: 例語（最低1つ、word/reading必須）
   - sentences: 例文（最低1つ）

2. **データ整合性**
   - 重複漢字がないか
   - 例語に対象漢字が含まれているか
   - 画数が妥当な範囲か
   - 学年配当が正しいか

3. **オプションフィールド**
   - okuriganaExamples: 送りがな（stem/okurigana/word/reading）
   - antonyms: 対義語（同学年内に存在するか）
   - synonyms: 類義語（同学年内に存在するか）
   - radical: 部首情報

## 使用方法

```
/validate-kanji [学年]
/validate-kanji --all
/validate-kanji --fix  # 自動修正可能な問題を修正
```

## 実行手順

1. 指定学年のデータファイルを読み込む
2. 各検証項目をチェック
3. 問題があれば詳細を報告
4. `npm run test:unit -- --grep "データ検証"` でテスト実行

$ARGUMENTS が空の場合は全学年を検証してください。
