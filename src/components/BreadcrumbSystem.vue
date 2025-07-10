<template>
  <Breadcrumb
    v-if="breadcrumbItems.length > 0"
    :items="breadcrumbItems"
    @navigate="handleNavigate"
  />
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Breadcrumb from "@/components/Breadcrumb.vue";
import { generateBreadcrumbs } from "@/utils/breadcrumbHelper.js";

const props = defineProps({
  items: {
    type: Array,
    default: null,
  },
  useAutoGenerate: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["navigate"]);
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const breadcrumbItems = computed(() => {
  if (props.items) {
    return props.items;
  }

  if (props.useAutoGenerate) {
    return generateBreadcrumbs(route, t);
  }

  return [];
});

function handleNavigate(action) {
  if (action === "back") {
    router.back();
  } else if (action === "backToList") {
    // ルートに基づいてリストページに戻る
    const listPath = getListPath(route.path);
    router.push(listPath);
  } else if (action === "backToDetail") {
    // 詳細ページに戻る
    const scriptId = route.params.id;
    if (scriptId) {
      router.push(`/script/${scriptId}`);
    }
  } else {
    emit("navigate", action);
  }
}

function getListPath(currentPath) {
  if (currentPath.includes("/script/")) {
    return "/generate?tab=list";
  } else if (currentPath.includes("/project/")) {
    return "/project";
  }
  return "/";
}
</script>
