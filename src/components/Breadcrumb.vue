<template>
  <nav class="text-sm breadcrumbs mb-4">
    <template v-for="(item, index) in items" :key="index">
      <button
        v-if="item.clickable"
        @click="$emit('navigate', item.action)"
        class="text-blue-500 hover:text-blue-600 cursor-pointer"
      >
        {{ item.label }}
      </button>
      <span v-else class="text-gray-600">{{ item.label }}</span>
      <span v-if="index < items.length - 1" class="mx-2">/</span>
    </template>
  </nav>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    required: true,
    // 例: [
    //   { label: "台本生成", clickable: true, action: "back" },
    //   { label: "作成済み一覧", clickable: true, action: "backToList" },
    //   { label: "台本詳細", clickable: false }
    // ]
  },
});

defineEmits(["navigate"]);
</script>
