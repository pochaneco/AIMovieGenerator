<template>
  <div v-if="project" class="p-4 bg-gray-50 rounded border">
    <!-- ヘッダー部分（常に表示、クリック可能） -->
    <button
      @click="showDetails = !showDetails"
      class="flex items-center justify-between w-full text-left"
    >
      <div>
        <h3 class="font-semibold text-gray-700">
          {{ $t("projectDetails") }}
        </h3>
        <p class="text-blue-600 text-sm mt-1">
          {{ project.name || "プロジェクト名不明" }}
        </p>
      </div>
      <Icon
        name="chevron-down"
        :class="{ 'rotate-180': showDetails }"
        class="text-gray-500 transition-transform"
      />
    </button>

    <!-- 詳細内容（開閉可能） -->
    <div v-show="showDetails" class="mt-3">
      <!-- プロジェクト説明 -->
      <div class="mb-3">
        <h4 class="font-medium text-gray-700 mb-1">
          {{ $t("projectDescription") }}
        </h4>
        <p class="text-gray-600 text-sm">
          {{ project.description || "説明なし" }}
        </p>
      </div>

      <!-- キャラクター一覧 -->
      <div v-if="project.characters && project.characters.length > 0">
        <h4 class="font-medium text-gray-700 mb-2">
          {{ $t("characterList") }}
        </h4>
        <div class="space-y-2">
          <div
            v-for="character in project.characters"
            :key="character.name || character.id"
            class="bg-white p-3 rounded border"
          >
            <div class="font-medium text-gray-800">
              {{ character.name }}
            </div>
            <div class="text-sm text-gray-600">
              {{ character.description || character.role || "説明なし" }}
            </div>
            <!-- キャラクターの特徴があれば表示 -->
            <div
              v-if="character.traits && character.traits.length > 0"
              class="mt-2 flex flex-wrap gap-1"
            >
              <span
                v-for="trait in character.traits"
                :key="trait"
                class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
              >
                {{ trait }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- プロジェクト詳細がない場合のメッセージ -->
  <div v-else class="p-4 bg-yellow-50 rounded border border-yellow-200">
    <p class="text-yellow-800 text-sm">
      {{
        noProjectMessage ||
        "このスクリプトにはプロジェクト詳細情報が関連付けられていません。"
      }}
    </p>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";
import Icon from "@/components/Icon.vue";

const props = defineProps({
  project: {
    type: Object,
    default: null,
  },
  noProjectMessage: {
    type: String,
    default: "",
  },
});

const showDetails = ref(false);

// プロジェクトデータのデバッグ
watch(
  () => props.project,
  (newVal) => {
    console.log("ProjectDetails - Project data received:", newVal);
  },
  { immediate: true }
);
</script>
