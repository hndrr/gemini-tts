# Gemini TTS アプリケーション

## 概要

このプロジェクトは、Gemini API を利用したテキスト読み上げ (TTS) アプリケーションです。ユーザーがテキストを入力し、それを音声として再生することができます。

## 機能

- テキスト入力と音声合成
- 音声再生

## インストール

### 前提条件

- Node.js (v18以上を推奨)
- npm

### セットアップ

1. リポジトリをクローンします。

   ```bash
   git clone https://github.com/hndrr/gemini-tts.git
   cd gemini-tts
   ```

2. 依存関係をインストールします。

   ```bash
   npm install
   ```

3. 環境変数を設定します。
   `.env` ファイルを作成し、Gemini API キーを設定します。

   ```bash
   VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   ```

## 使用方法

アプリケーションを開発モードで起動します。

```bash
npm run dev
```

ブラウザで `http://localhost:5173` (または指定されたポート) にアクセスしてください。

## 開発

### スクリプト

- `npm run dev`: 開発サーバーを起動します。
- `npm run build`: 本番用にアプリケーションをビルドします。
- `npm run lint`: コードのリンティングを実行します。
- `npm run preview`: ビルドされたアプリケーションをプレビューします。
