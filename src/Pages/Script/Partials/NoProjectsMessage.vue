<template>
  <div class="text-center py-12">
    <!-- アイコンエリア -->
    <div class="mb-6">
      <div
        class="mx-auto w-24 h-24 bg-sky-100 rounded-full flex items-center justify-center"
      >
        <svg
          class="w-12 h-12 text-sky-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          ></path>
        </svg>
      </div>
    </div>

    <!-- メッセージエリア -->
    <div class="mb-8">
      <h3 class="text-xl font-semibold text-gray-800 mb-3">
        {{ $t("noProjectsTitle") }}
      </h3>
      <p class="text-gray-600 max-w-md mx-auto leading-relaxed">
        {{ $t("noProjectsMessage") }}
      </p>
    </div>

    <!-- アクションボタン -->
    <div class="space-y-3">
      <CoolButton
        @click="$emit('create-project')"
        variant="primary"
        size="lg"
        class="inline-flex items-center"
      >
        <svg
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
        {{ $t("createFirstProject") }}
      </CoolButton>

      <div class="text-sm text-gray-500">
        {{ $t("projectRequiredForScript") }}
      </div>
    </div>
  </div>
</template>

<script setup>
import CoolButton from "@/components/CoolButton.vue";

defineEmits(["create-project"]);
</script>
