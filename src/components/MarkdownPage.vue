<template>
  <div class="prose max-w-none px-6 rounded-xl bg-white py-6">
    <component class="markdown-component" :is="MarkdownContent" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, h } from "vue";
import { useI18n } from "vue-i18n";
import { marked } from "marked";

const props = defineProps({
  basePath: { type: String, required: true },
});

const { locale } = useI18n();
const markdown = ref("");

const mdPath = computed(() => {
  return `${props.basePath}/${locale.value}.md`;
});

async function fetchMarkdown() {
  const res = await fetch(mdPath.value);
  markdown.value = await res.text();
}

onMounted(fetchMarkdown);
watch(locale, fetchMarkdown);

const MarkdownContent = {
  setup() {
    return () =>
      markdown.value
        ? h("div", { innerHTML: marked.parse(markdown.value) })
        : h("div", "Loading...");
  },
};
</script>
<style scoped>
@reference "@/style.css";

.markdown-component :deep {
  h1 {
    @apply text-2xl font-bold mb-4;
  }

  h2 {
    @apply text-xl font-bold mt-6 mb-2;
  }

  h3 {
    @apply text-lg font-semibold mt-4 mb-1;
  }

  h4 {
    @apply text-base font-semibold mt-2 mb-1;
  }

  p {
    @apply mb-4;
  }

  ul,
  ol {
    @apply list-disc pl-6 mb-4;
  }

  li {
    @apply mb-2;
  }

  ol {
    @apply list-decimal pl-6;
  }
  li ol {
    @apply list-decimal pl-6;
  }
  li ul {
    @apply list-disc pl-6;
  }
  li ul li {
    @apply mb-1;
  }
  li ol li {
    @apply mb-1;
  }

  pre {
    @apply bg-gray-900 text-white p-4 rounded mb-4 overflow-x-auto;
  }

  blockquote {
    @apply border-l-4 border-gray-300 pl-4 italic text-gray-700 mb-4;
  }

  a {
    @apply text-blue-600 hover:underline;
  }

  img {
    @apply max-w-full h-auto mb-4;
  }

  table {
    @apply border-collapse mb-4;
  }

  th,
  td {
    @apply border px-4 py-2;
  }

  th {
    @apply bg-gray-200 font-semibold;
  }
  td {
    @apply bg-white;
  }
  tr:nth-child(even) {
    @apply bg-gray-100;
  }
  tr:nth-child(odd) {
    @apply bg-white;
  }

  hr {
    @apply border-t border-gray-300 my-6;
  }

  summary {
    @apply text-sm text-gray-600 mt-2 cursor-pointer;
  }
}
</style>
