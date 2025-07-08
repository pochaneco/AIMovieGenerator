<template>
  <PageContainer max-width="none" padding="6" class="prose">
    <MarkdownRenderer :content="markdown" />
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import PageContainer from "./PageContainer.vue";
import MarkdownRenderer from "./MarkdownRenderer.vue";

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
</script>
