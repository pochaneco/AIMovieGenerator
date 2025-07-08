<template>
  <div v-if="message" :class="messageClasses">
    <!-- アイコン -->
    <div v-if="showIcon" class="flex-shrink-0">
      <svg
        v-if="type === 'loading'"
        class="animate-spin h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <svg
        v-else-if="type === 'error'"
        class="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clip-rule="evenodd"
        />
      </svg>
      <svg
        v-else-if="type === 'success'"
        class="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clip-rule="evenodd"
        />
      </svg>
      <svg
        v-else-if="type === 'warning'"
        class="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <!-- メッセージテキスト -->
    <div class="ml-2">
      <p class="text-sm">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  message: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "info",
    validator: (value) =>
      ["loading", "error", "success", "warning", "info"].includes(value),
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
});

const messageClasses = computed(() => {
  const baseClasses = "mt-4 p-3 rounded-md flex items-start";

  const typeClasses = {
    loading: "text-sky-600 bg-sky-50 border border-sky-200",
    error: "text-red-600 bg-red-50 border border-red-200",
    success: "text-green-600 bg-green-50 border border-green-200",
    warning: "text-orange-600 bg-orange-50 border border-orange-200",
    info: "text-blue-600 bg-blue-50 border border-blue-200",
  };

  return `${baseClasses} ${typeClasses[props.type]}`;
});
</script>
