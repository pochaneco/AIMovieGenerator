<template>
  <div>
    <!-- 空状態 -->
    <EmptyState
      v-if="items.length === 0"
      :icon="emptyIcon"
      :title="emptyTitle"
      :message="emptyMessage"
      :button-text="emptyButtonText"
      @action="$emit('createNew')"
    />

    <!-- リスト表示 -->
    <div v-else class="space-y-4">
      <EntityCard
        v-for="(item, index) in items"
        :key="getItemKey(item, index)"
        :actions="getItemActions(item, index)"
        @action="handleAction($event, item, index)"
      >
        <!-- カスタムコンテンツスロット -->
        <template #title>
          <slot name="item-title" :item="item" :index="index" />
        </template>
        <template #content>
          <slot name="item-content" :item="item" :index="index" />
        </template>
        <template #meta>
          <slot name="item-meta" :item="item" :index="index" />
        </template>
      </EntityCard>
    </div>
  </div>
</template>

<script setup>
import EmptyState from "@/components/EmptyState.vue";
import EntityCard from "@/components/EntityCard.vue";

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  actions: {
    type: Array,
    default: () => [],
  },
  emptyIcon: {
    type: String,
    default: "inbox",
  },
  emptyTitle: {
    type: String,
    default: null,
  },
  emptyMessage: {
    type: String,
    required: true,
  },
  emptyButtonText: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["createNew", "action"]);

function getItemKey(item, index) {
  return item.id || index;
}

function getItemActions(item, index) {
  if (typeof props.actions === "function") {
    return props.actions(item, index);
  }
  return props.actions;
}

function handleAction(actionKey, item, index) {
  emit("action", { action: actionKey, item, index });
}
</script>
