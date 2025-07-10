<template>
  <div class="flex gap-2">
    <CoolButton
      v-for="action in actions"
      :key="action.key"
      :variant="action.variant"
      :size="action.size || 'sm'"
      :aria-label="$t(action.label)"
      @click="$emit('action', action.key)"
      class="flex items-center gap-1"
    >
      <Icon :name="action.icon" size="sm" />
      <span class="hidden sm:inline">{{ $t(action.label) }}</span>
    </CoolButton>
  </div>
</template>

<script setup>
import CoolButton from "@/components/CoolButton.vue";
import Icon from "@/components/Icon.vue";

defineProps({
  actions: {
    type: Array,
    required: true,
    // 例: [
    //   { key: 'edit', icon: 'pencil', variant: 'primary', label: 'edit' },
    //   { key: 'delete', icon: 'trash', variant: 'danger', label: 'delete' }
    // ]
  },
});

defineEmits(["action"]);
</script>
