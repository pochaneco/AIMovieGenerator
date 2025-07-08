<template>
  <div class="mt-4 p-3 bg-blue-50 rounded text-sm">
    <div class="font-medium text-blue-800 mb-2">{{ $t("currentStatus") }}</div>
    <div class="flex items-center justify-between">
      <div class="text-blue-600">
        <span v-if="storageType === 'persistent'">
          🔒 {{ $t("storedInBrowser") }}
        </span>
        <span v-else-if="storageType === 'session'">
          ⏱️ {{ $t("storedInSession") }}
        </span>
        <span v-else> ❌ {{ $t("notStored") }} </span>
      </div>
      <!-- 削除ボタン -->
      <CoolButton
        v-if="storageType !== 'none'"
        @click="$emit('clear-storage')"
        variant="danger"
        size="xs"
      >
        {{ $t("deleteKey") }}
      </CoolButton>
    </div>
  </div>
</template>

<script setup>
import CoolButton from "@/components/CoolButton.vue";

defineProps({
  storageType: {
    type: String,
    required: true,
    validator: (value) => ["persistent", "session", "none"].includes(value),
  },
});

defineEmits(["clear-storage"]);
</script>
