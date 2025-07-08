<template>
  <nav class="text-sm breadcrumbs mb-4">
    <template v-for="(item, index) in items" :key="index">
      <router-link
        v-if="item.to && !item.current"
        :to="item.to"
        class="text-blue-500 hover:text-blue-600 cursor-pointer"
      >
        {{ item.label }}
      </router-link>
      <button
        v-else-if="item.clickable && !item.current"
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
    //   { label: "台本生成", to: "/generate" },
    //   { label: "台本詳細", to: "/script/1" },
    //   { label: "編集", current: true }
    // ] または
    // [
    //   { label: "台本生成", clickable: true, action: "back" },
    //   { label: "台本詳細", current: true }
    // ]
  },
});

defineEmits(["navigate"]);
</script>
