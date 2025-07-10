<template>
  <div class="mb-6 p-4 bg-gray-50 rounded-lg">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">台本設定</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          全体の長さ
        </label>
        <select
          v-model.number="modelValue.totalDuration"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        >
          <option
            v-for="option in totalDurationOptions"
            :key="option"
            :value="option"
          >
            {{ option }} 分
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          シーン数
        </label>
        <select
          v-model="modelValue.sceneCount"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        >
          <option
            v-for="option in sceneCountOptions"
            :key="option"
            :value="option"
          >
            {{ option }} シーン
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          1シーンの平均時間
        </label>
        <select
          v-model.number="modelValue.averageSceneDuration"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        >
          <option
            v-for="option in averageSceneDurationOptions"
            :key="option"
            :value="option"
          >
            {{ option }} 分
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["update:modelValue"]);

// 定数として選択肢を定義
const totalDurationOptions = [1, 2, 3, 5, 10, 15, 20, 30, 45, 60];
const sceneCountOptions = [1, 2, 3, 5, 10];
const averageSceneDurationOptions = [1, 2, 3, 4, 5];
</script>
