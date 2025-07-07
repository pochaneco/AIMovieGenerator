# AIMovieGenerator

AIを活用した動画生成を支援するWebアプリケーションです。プロジェクト管理、キャラクター設定、動画生成などの機能を提供します。

## 機能

### プロジェクト管理
- プロジェクトの作成、編集、削除
- プロジェクト情報（名前、説明）の管理
- LocalStorageを使用したデータ永続化

### キャラクター管理
- プロジェクトごとのキャラクター一覧
- キャラクターの追加、編集、削除
- キャラクター情報（名前、役割）の管理
- モーダルUIによる直感的な操作

### 多言語対応
- 日本語・英語の切り替え
- Vue I18nを使用した国際化対応

### 設定管理
- OpenAI APIキーの設定・保存
- LocalStorageによる設定の永続化

### UIコンポーネント
- 再利用可能なボタンコンポーネント
- モーダルコンポーネント（HeadlessUI使用）
- Material Design Iconsの活用
- レスポンシブデザイン

## セットアップ

1. 依存パッケージのインストール
   ```sh
   npm install
   ```
2. 開発サーバーの起動
   ```sh
   npm run dev
   ```

## 主な技術
- [Vue 3](https://vuejs.org/) - フロントエンドフレームワーク
- [Vite](https://vitejs.dev/) - ビルドツール
- [Tailwind CSS](https://tailwindcss.com/) - CSSフレームワーク
- [Vue Router](https://router.vuejs.org/) - ルーティング
- [Vue I18n](https://vue-i18n.intlify.dev/) - 国際化
- [HeadlessUI](https://headlessui.com/) - UIコンポーネント
- [Material Design Icons](https://materialdesignicons.com/) - アイコン

## ディレクトリ構成

```
src/
├── components/          # 共通コンポーネント
│   ├── CoolButton.vue   # 再利用可能なボタンコンポーネント
│   └── MarkdownPage.vue # Markdownページ表示コンポーネント
├── Layouts/
│   └── BaseLayout.vue   # ベースレイアウト（サイドメニュー含む）
├── Pages/
│   ├── Home/
│   │   └── Index.vue    # ホームページ
│   ├── Project/
│   │   ├── Index.vue    # プロジェクト一覧ページ
│   │   ├── Edit.vue     # プロジェクト編集ページ
│   │   └── Partials/    # プロジェクト関連の部分コンポーネント
│   │       ├── ProjectForm.vue      # プロジェクトフォーム
│   │       ├── ProjectList.vue      # プロジェクト一覧
│   │       ├── ProjectModal.vue     # プロジェクト編集モーダル
│   │       ├── CharacterForm.vue    # キャラクターフォーム
│   │       ├── CharacterList.vue    # キャラクター一覧
│   │       └── CharacterModal.vue   # キャラクター編集モーダル
│   ├── Script/
│   │   ├── Index.vue    # 台本一覧・生成ページ
│   │   ├── Show.vue     # 台本詳細ページ
│   │   └── Partials/    # 台本関連の部分コンポーネント
│   │       ├── ScriptGenerateForm.vue # 台本生成フォーム
│   │       ├── ScriptList.vue         # 台本一覧
│   │       └── ScriptDetail.vue       # 台本詳細表示
│   └── Settings/
│       ├── Index.vue    # 設定ページ
│       └── Partials/
│           └── SettingsForm.vue # 設定フォーム
├── locales/             # 多言語対応ファイル
│   ├── ja.js           # 日本語翻訳
│   └── en.js           # 英語翻訳
├── i18n.js             # 国際化設定
├── router.js           # ルーティング設定
└── main.js             # アプリケーションエントリーポイント
```

## 使用方法

1. **プロジェクト管理**
   - `/project`でプロジェクト一覧を表示
   - 新規追加ボタンでプロジェクトを作成
   - 編集ボタンでプロジェクト詳細を編集

2. **キャラクター管理**
   - プロジェクト編集ページでキャラクターを管理
   - 追加ボタンでキャラクターを作成
   - 編集・削除ボタンで既存キャラクターを操作

3. **設定**
   - `/settings`でOpenAI APIキーを設定
   - サイドメニューから言語を切り替え

---

> 追加のカスタマイズや機能実装は`src/`配下で行ってください。

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
