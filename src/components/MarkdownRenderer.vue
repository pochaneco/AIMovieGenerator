<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<script setup>
import { computed } from "vue";
import { marked } from "marked";

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  options: {
    type: Object,
    default: () => ({
      breaks: true, // 改行を<br>に変換
      gfm: true, // GitHub Flavored Markdown
    }),
  },
});

// Markdownレンダリング
const renderedContent = computed(() => {
  try {
    // markedの設定
    marked.setOptions(props.options);

    return marked(props.content);
  } catch (error) {
    console.error("Markdownのレンダリングに失敗しました:", error);
    return props.content; // エラー時は元のテキストをそのまま表示
  }
});
</script>

<style>
/* Markdownコンテンツのスタイリング */
.markdown-content {
  line-height: 1.6;
}

/* ヘッダー */
.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  font-weight: bold;
  margin: 0.8em 0 0.4em 0;
}

.markdown-content h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.markdown-content h2 {
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}

.markdown-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 1rem;
  margin-bottom: 0.25rem;
}

.markdown-content h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.5rem;
  margin-bottom: 0.25rem;
}

/* パラグラフ */
.markdown-content p {
  margin-bottom: 1rem;
}

/* リスト */
.markdown-content ul {
  list-style-type: disc;
  list-style-position: outside;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.markdown-content ol {
  list-style-type: decimal;
  list-style-position: outside;
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.markdown-content li {
  margin-bottom: 0.5rem;
  display: list-item;
}

.markdown-content li ul {
  list-style-type: circle;
  list-style-position: outside;
  padding-left: 1.5rem;
  margin-top: 0.25rem;
}

.markdown-content li ol {
  list-style-type: decimal;
  list-style-position: outside;
  padding-left: 1.5rem;
  margin-top: 0.25rem;
}

.markdown-content li ul li,
.markdown-content li ol li {
  margin-bottom: 0.25rem;
  display: list-item;
}

/* コード */
.markdown-content code {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.1em 0.3em;
  border-radius: 3px;
  font-family: "Courier New", Courier, monospace;
  font-size: 0.9em;
}

.markdown-content pre {
  background-color: #1f2937;
  color: white;
  padding: 1rem;
  border-radius: 0.25rem;
  margin-bottom: 1rem;
  overflow-x: auto;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

/* クォート */
.markdown-content blockquote {
  border-left: 4px solid #d1d5db;
  padding-left: 1rem;
  font-style: italic;
  color: #374151;
  margin-bottom: 1rem;
}

/* 強調 */
.markdown-content strong,
.markdown-content b {
  font-weight: bold;
}

.markdown-content em,
.markdown-content i {
  font-style: italic;
}

/* リンク */
.markdown-content a {
  color: #2563eb;
  text-decoration: underline;
}

.markdown-content a:hover {
  color: #1d4ed8;
}

/* 画像 */
.markdown-content img {
  max-width: 100%;
  height: auto;
  margin-bottom: 1rem;
}

/* テーブル */
.markdown-content table {
  border-collapse: collapse;
  margin-bottom: 1rem;
  width: 100%;
}

.markdown-content th,
.markdown-content td {
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
}

.markdown-content th {
  background-color: #f3f4f6;
  font-weight: 600;
}

.markdown-content td {
  background-color: white;
}

.markdown-content tr:nth-child(even) {
  background-color: #f9fafb;
}

.markdown-content tr:nth-child(odd) {
  background-color: white;
}

/* 水平線 */
.markdown-content hr {
  border-top: 1px solid #d1d5db;
  margin: 1.5rem 0;
  border-bottom: 0;
  border-left: 0;
  border-right: 0;
}

/* その他 */
.markdown-content summary {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
  cursor: pointer;
}
</style>
