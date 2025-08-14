<table>
	<thead>
    	<tr>
      		<th style="text-align:center"><a href="README.md">English</a></th>
      		<th style="text-align:center">日本語</th>
    	</tr>
  	</thead>
</table>

## name

スクレイプ・競馬

## Overview

[netkeiba](https://www.netkeiba.com/) からデータをスクレイピングするツールです。
最初のリリースとして、全種牡馬の産駒成績を取得します。

## Requirement

Windows10 ~

## Setting

### From souce

1. リリースから ZIP ファイルをダウンロードするか、リポジトリを pull します。
2. コマンドプロンプトを開き、解凍したフォルダか git フォルダ内に移動します。
   ```
   cd C:\home
   ```
3. 以下のコマンドを実行します。
   ```
   npm install
   npm start
   ```

### From exe

1. リリースから EXE ファイルをダウンロードします。
2. ダウンロードした EXE ファイルを実行し、インストールします。

## Usage

1. 「産駒成績取得」を押します。
2. しばらくすると収集が始まり、終わるとデスクトップに CSV が保存されます。

## Features

- 「設定」ボタンを押して設定ページに移動し、「日本語」のチェックを外すことで英語になります。

## Author

N3-Uchimura

## Licence

[MIT](https://mit-license.org/)
