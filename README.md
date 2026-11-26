# MDN Glossary Cards

MDN Web Docs Glossary を使ってWeb開発用語を学習する静的フラッシュカードアプリです。

## 機能
- 「説明から」「用語から」の2方向で出題
- カードをタップして裏面を表示
- 「覚えた」は習得済みに移動
- 「まだ覚えていない」は未習得のまま再出題対象に残す
- 未習得カードからランダムに出題
- 習得数と用語一覧を表示

## データ収録状況
現時点の `data/glossary.js` は初期サンプル30項目です。MDN英語版Glossaryの全項目を収録した完成版ではありません。全項目の日本語訳・要約と出典URLを確認しながら追加する必要があります。アプリの学習機能は先行して実装しています。

出典: https://developer.mozilla.org/en-US/docs/Glossary

## GitHub Pages
1. Repository の Settings → Pages
2. Build and deployment を「Deploy from a branch」にする
3. Branch: `main`、Folder: `/(root)` を選択して Save

公開URL: https://tanaka-0224.github.io/mdn-glossary-quiz/

## License
- アプリのコード: MIT (`LICENSE-CODE`)
- MDN由来の内容: `THIRD_PARTY_LICENSES.md` を参照
