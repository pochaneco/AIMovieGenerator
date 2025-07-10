<template>
  <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
    <div class="flex justify-between items-start mb-2">
      <div class="flex-1">
        <slot name="title" />
        <slot name="content" />
      </div>
      <!-- アクションボタン群 -->
      <ActionButtonGroup
        v-if="actions && actions.length > 0"
        :actions="actions"
        @action="$emit('action', $event)"
      />
    </div>
    <div class="mt-2">
      <slot name="meta" />
    </div>
  </div>
</template>

<script setup>
import ActionButtonGroup from "@/components/ActionButtonGroup.vue";

defineProps({
  actions: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["action"]);
</script>
