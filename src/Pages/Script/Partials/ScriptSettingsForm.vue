<template>
  <div class="mb-6 p-4 bg-gray-50 rounded-lg">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">台本設定</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          全体の長さ
        </label>
        <select
          v-model="modelValue.totalDuration"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        >
          <option value="5分">5分</option>
          <option value="10分">10分</option>
          <option value="15分">15分</option>
          <option value="20分">20分</option>
          <option value="30分">30分</option>
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
          <option :value="2">2シーン</option>
          <option :value="3">3シーン</option>
          <option :value="4">4シーン</option>
          <option :value="5">5シーン</option>
          <option :value="6">6シーン</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          1シーンの平均時間
        </label>
        <select
          v-model="modelValue.averageSceneDuration"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        >
          <option value="1分">1分</option>
          <option value="2分">2分</option>
          <option value="3分">3分</option>
          <option value="4分">4分</option>
          <option value="5分">5分</option>
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
</script>
