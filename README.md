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


## オフライン利用・インストール
このアプリはPWAとして動作し、Service Workerでアプリ本体と用語データを端末にキャッシュします。

1. インターネット接続中に公開URLを開く
2. ページ下部の「オフライン利用」表示が「必要なファイルは保存済み」になったことを確認する
3. iPhoneではSafariの共有メニューから「ホーム画面に追加」を選び、可能な場合は「Webアプリとして開く」を有効にする
4. ホーム画面のアイコンから起動し、機内モードでも動作することを事前に確認する

「保存済み」はオフライン起動に必要なファイルがキャッシュに入ったことを示します。ブラウザやOSによる保存データの削除、ユーザー自身による履歴・Webサイトデータの削除、アプリの削除までは防げないため、長期間の保存を保証するものではありません。端末の自動削除からの保護設定が利用可能な場合は、アプリ起動時にその状態も表示します。
