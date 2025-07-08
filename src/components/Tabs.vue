<template>
  <div>
    <!-- タブナビゲーション -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="selectTab(tab.id)"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
            activeTab === tab.id
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]"
        >
          {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- タブコンテンツ -->
    <div>
      <slot :activeTab="activeTab" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    validator: (tabs) => {
      return tabs.every(
        (tab) => typeof tab === "object" && tab.id && tab.label
      );
    },
  },
  defaultTab: {
    type: String,
    default: null,
  },
  modelValue: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "tabChange"]);

// アクティブタブの管理
const activeTab = ref(
  props.modelValue ||
    props.defaultTab ||
    (props.tabs.length > 0 ? props.tabs[0].id : null)
);

// タブ選択
function selectTab(tabId) {
  activeTab.value = tabId;
  emit("update:modelValue", tabId);
  emit("tabChange", tabId);
}

// v-modelとの同期
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && newValue !== activeTab.value) {
      activeTab.value = newValue;
    }
  }
);

// 初期値の設定
if (props.modelValue) {
  activeTab.value = props.modelValue;
}
</script>

<style scoped>
/* タブのホバー効果とフォーカス状態は既にTailwindクラスで処理済み */
</style>
