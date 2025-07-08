# AI Movie Generator

AI（複数LLMプロバイダー対応）を活用した動画台本生成Webアプリケーションです。プロジェクト管理、キャラクター設定、AI台本生成などの機能を提供します。

OpenAI、Anthropic、Googleの各種AIモデルに対応し、企業級の設定管理システムを搭載した本格的な動画制作支援ツールです。

## 機能

### プロジェクト管理 📂
- プロジェクトの作成、編集、削除
- プロジェクト情報（名前、説明、ジャンル）の管理
- 統一されたdataService.jsによるデータ管理

### キャラクター管理 👥
- プロジェクトごとのキャラクター一覧
- キャラクターの追加、編集、削除
- キャラクター詳細情報（名前、年齢、性格、背景）の管理
- モーダルUIによる直感的な操作

### AI台本生成 🤖
- **複数LLMプロバイダー対応**（OpenAI、Anthropic、Google）
- **LangChain統合**による統一インターフェース
- プロジェクト・キャラクター情報を基にした台本生成
- 生成中UI（進行状況表示、停止機能）
- エラーハンドリング（失敗時のフォールバック）

### 台本管理 📝
- 台本の作成、編集、削除、表示
- 台本詳細画面（Show）と編集専用画面（Edit）
- キーボードショートカット（Ctrl+S保存、Esc取消）
- 自動保存機能

### 設定管理 ⚙️
- **複数LLM設定管理**（用途別設定の保存・切り替え）
- **APIキー管理**
  - 永続化保存（ブラウザ保存）とセッション保存の選択制
  - セキュアな保存システム
  - ワンクリック削除機能
- **プロバイダー選択**（OpenAI、Anthropic、Google）
- **モデル選択**（プロバイダー連動、動的更新）
- **APIキーテスト機能**（保存前検証）

### 多言語対応 🌍
- 日本語・英語の切り替え
- Vue I18nを使用した完全国際化対応
- 全UI要素の翻訳対応

### UIコンポーネント 💅
- 再利用可能なコンポーネント設計
- モーダルコンポーネント（HeadlessUI使用）
- Material Design Iconsの活用
- レスポンシブデザイン（Tailwind CSS）
- ホバー効果・トランジション

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
- [Vue 3](https://vuejs.org/) - フロントエンドフレームワーク（Composition API使用）
- [Vite](https://vitejs.dev/) - ビルドツール・開発サーバー
- [Tailwind CSS](https://tailwindcss.com/) - ユーティリティファーストCSSフレームワーク
- [Vue Router](https://router.vuejs.org/) - SPAルーティング
- [Vue I18n](https://vue-i18n.intlify.dev/) - 国際化対応
- [LangChain](https://js.langchain.com/) - AI/LLM統合フレームワーク
- [HeadlessUI](https://headlessui.com/) - アクセシブルUIコンポーネント
- [Material Design Icons](https://materialdesignicons.com/) - アイコンセット

### AI/LLMプロバイダー
- [OpenAI API](https://openai.com/api/) - GPT-4, GPT-4-turbo, GPT-3.5-turbo, GPT-4o, GPT-4o-mini
- [Anthropic Claude](https://www.anthropic.com/) - Claude-3 Opus, Sonnet, Haiku, Claude-3.5 Sonnet
- [Google Generative AI](https://ai.google.dev/) - Gemini Pro, Gemini Pro Vision, Gemini-1.5 Pro, Gemini-1.5 Flash

### データ管理
- **dataService.js** - 統一データアクセス層（Promise対応）
- **LocalStorage** - ブラウザローカルストレージ永続化
- **SessionStorage** - セッション限定データ保存

## ディレクトリ構成

```
src/
├── components/          # 再利用可能コンポーネント
│   ├── CoolButton.vue   # 再利用可能なボタンコンポーネント
│   ├── MarkdownPage.vue # Markdownページ表示コンポーネント
│   └── ProjectDetails.vue # プロジェクト詳細表示コンポーネント
├── Layouts/
│   └── BaseLayout.vue   # ベースレイアウト（サイドメニュー含む）
├── Pages/               # ページコンポーネント（RESTful設計）
│   ├── Home/
│   │   └── Index.vue    # ホームページ
│   ├── Project/         # プロジェクト管理
│   │   ├── Index.vue    # プロジェクト一覧ページ
│   │   ├── Edit.vue     # プロジェクト編集ページ
│   │   └── Partials/    # プロジェクト関連の部分コンポーネント
│   │       ├── ProjectForm.vue      # プロジェクトフォーム
│   │       ├── ProjectList.vue      # プロジェクト一覧
│   │       ├── ProjectModal.vue     # プロジェクト編集モーダル
│   │       ├── CharacterForm.vue    # キャラクターフォーム
│   │       ├── CharacterList.vue    # キャラクター一覧
│   │       └── CharacterModal.vue   # キャラクター編集モーダル
│   ├── Script/          # 台本管理
│   │   ├── Index.vue    # 台本一覧・作成ページ
│   │   ├── Show.vue     # 台本詳細ページ
│   │   ├── Edit.vue     # 台本編集ページ
│   │   └── Partials/    # 台本関連の部分コンポーネント
│   │       ├── ScriptGenerateForm.vue   # 台本生成フォーム
│   │       ├── ScriptList.vue           # 台本一覧
│   │       ├── ScriptDetail.vue         # 台本詳細表示
│   │       └── ScriptContentDisplay.vue # 台本内容表示
│   └── Settings/        # 設定画面
│       ├── Index.vue    # 設定ページ
│       └── Partials/
│           └── SettingsForm.vue # 設定フォーム
├── services/            # ビジネスロジック
│   └── dataService.js   # 統一データアクセス層
├── utils/               # ユーティリティ
│   ├── apiKeyManager.js # APIキー管理
│   ├── localStorage.js  # ストレージ操作
│   └── scriptGenerator.js # AI台本生成
├── locales/             # 多言語対応ファイル
│   ├── ja.js           # 日本語翻訳
│   └── en.js           # 英語翻訳
├── i18n.js             # 国際化設定
├── router.js           # ルーティング設定
└── main.js             # アプリケーションエントリーポイント
```

### ページ構成（RESTful設計）
- **Index.vue**: 一覧・作成画面
- **Show.vue**: 詳細表示画面
- **Edit.vue**: 編集画面
- **Partials/**: ページ内部分コンポーネント

## 使用方法

### 初期設定
1. **LLM設定**
   - `/settings`でLLMプロバイダーを設定
   - OpenAI、Anthropic、GoogleのAPIキーを設定
   - 複数設定の作成・管理が可能
   - 用途別設定（仕事用、個人用、実験用など）

### プロジェクト管理
1. **プロジェクト作成**
   - `/project`でプロジェクト一覧を表示
   - 新規追加ボタンでプロジェクトを作成
   - プロジェクト情報（名前、説明、ジャンル）を入力

2. **キャラクター設定**
   - プロジェクト編集ページでキャラクターを管理
   - キャラクター詳細（名前、年齢、性格、背景）を設定
   - 追加・編集・削除が可能

### AI台本生成
1. **台本作成**
   - `/script`で台本一覧を表示
   - プロジェクトを選択して台本を作成
   
2. **AI生成**
   - 台本編集画面（`/script/:id/edit`）でAI生成を実行
   - LLM設定とモデルを選択
   - プロジェクト・キャラクター情報を基に自動生成
   - 生成中の停止・再開が可能

3. **編集・保存**
   - キーボードショートカット
     - `Ctrl+S`: 保存
     - `Esc`: キャンセル
   - 自動保存機能

### 設定管理
1. **APIキー管理**
   - 永続化保存 vs セッション保存の選択
   - APIキーのテスト機能
   - ワンクリック削除

2. **言語切り替え**
   - サイドメニューから日本語・英語を切り替え

## 設計思想

### 美しいコード
- **統一されたコーディングスタイル**
- **async/await使用**で読みやすい非同期処理
- **コンポーネント分割**で再利用性向上
- **将来の拡張性**を考慮した設計

### ユーザー体験重視
- **直感的なUI**
- **レスポンシブデザイン**
- **適切なフィードバック**（ローディング、成功・エラーメッセージ）
- **キーボードショートカット**で操作性向上

### セキュリティ配慮
- **APIキーの安全な管理**
- **ユーザー選択可能な保存方式**
- **セッション管理**

### 保守性・拡張性
- **dataService.js**による統一データアクセス
- **将来のAPI化**に対応
- **モジュラー設計**

---

> 追加のカスタマイズや機能実装は`src/`配下で行ってください。

## 開発ドキュメント

プロジェクトの開発過程や技術的詳細については、`diaries/`ディレクトリの開発日記をご参照ください：
