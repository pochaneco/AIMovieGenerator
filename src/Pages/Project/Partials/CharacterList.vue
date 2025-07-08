<template>
  <div>
    <h3 class="text-lg font-bold mb-2">{{ $t("characterList") }}</h3>
    <ul class="mt-2 divide-y divide-gray-200">
      <li
        v-for="(char, cidx) in characters"
        :key="cidx"
        class="mb-1 pb-2 flex items-center justify-between mt-2"
      >
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-semibold">{{ char.name }}</span>
            <span class="text-gray-500 truncate max-w-xs">{{ char.role }}</span>
          </div>
        </div>
        <div class="flex gap-2">
          <CoolButton
            color="primary"
            @click="$emit('edit', cidx)"
            :aria-label="'編集'"
          >
            <Icon name="pencil" />
          </CoolButton>
          <CoolButton
            color="danger"
            @click="$emit('delete', cidx)"
            :aria-label="'削除'"
          >
            <Icon name="trash" />
          </CoolButton>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import CoolButton from "@/components/CoolButton.vue";
import Icon from "@/components/Icon.vue";

const props = defineProps({
  characters: Array,
});
const emit = defineEmits(["edit", "delete"]);
</script>
