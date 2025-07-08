<template>
  <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-3">
    <div
      v-for="message in messages"
      :key="message.id"
      class="flex"
      :class="{
        'justify-end': message.role === 'user',
        'justify-start': message.role === 'assistant',
        'justify-center': message.role === 'system',
      }"
    >
      <div
        class="px-3 py-2 rounded-lg text-sm"
        :class="{
          'bg-sky-500 text-white max-w-xs': message.role === 'user',
          'bg-gray-200 text-gray-800 max-w-xs': message.role === 'assistant',
          'bg-yellow-100 text-yellow-800 text-xs px-2 py-1':
            message.role === 'system',
        }"
      >
        <!-- AIメッセージはMarkdownレンダリング、その他はプレーンテキスト -->
        <MarkdownRenderer
          v-if="message.role === 'assistant'"
          :content="message.content"
        />
        <div v-else class="whitespace-pre-wrap">{{ message.content }}</div>
        <div class="text-xs opacity-70 mt-1">
          {{ formatTime(message.timestamp) }}
        </div>
      </div>
    </div>

    <!-- 入力中表示 -->
    <div v-if="isTyping" class="flex justify-start">
      <div class="bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm">
        <div class="flex items-center space-x-1">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
            <div
              class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
              style="animation-delay: 0.1s"
            ></div>
            <div
              class="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
              style="animation-delay: 0.2s"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";
import MarkdownRenderer from "./MarkdownRenderer.vue";

const props = defineProps({
  messages: {
    type: Array,
    required: true,
  },
  isTyping: {
    type: Boolean,
    default: false,
  },
});

const messagesContainer = ref(null);

// メッセージ配列の変更を監視してスクロール
watch(
  () => props.messages,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  },
  { deep: true }
);

// タイピング状態の変更を監視
watch(
  () => props.isTyping,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  }
);

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("ja-JP", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 親コンポーネントがスクロールを制御できるように公開
defineExpose({
  scrollToBottom,
});
</script>

<style scoped>
@keyframes bounce {
  0%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
}

.animate-bounce {
  animation: bounce 1.4s infinite;
}
</style>
