<template>
  <span :class="getStatusClass(status)" class="font-medium">
    {{ status ? $t(status) : $t(defaultStatus) }}
  </span>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps({
  status: {
    type: String,
    default: null,
  },
  defaultStatus: {
    type: String,
    default: "draft",
  },
});

function getStatusClass(status) {
  if (!status) return "text-gray-600";
  switch (status) {
    case "generating":
      return "text-blue-600";
    case "completed":
      return "text-green-600";
    case "draft":
      return "text-gray-600";
    case "failed":
      return "text-red-600";
    case "active":
      return "text-green-600";
    case "inactive":
      return "text-gray-500";
    default:
      return "text-gray-600";
  }
}
</script>
