<template>
  <teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      @click.self="closeModal"
    >
      <div
        :class="[
          'bg-white rounded-lg shadow-xl mx-4 max-h-[90vh] overflow-y-auto',
          sizeClasses,
        ]"
      >
        <div class="p-6">
          <!-- ヘッダー -->
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold">{{ title }}</h3>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
              :aria-label="$t('close')"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <!-- コンテンツ -->
          <div class="modal-content">
            <slot></slot>
          </div>

          <!-- フッター -->
          <div v-if="$slots.footer" class="mt-6 pt-4 border-t border-gray-200">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, watch } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg", "xl", "2xl"].includes(value),
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["close", "update:show"]);

// サイズに応じたクラス
const sizeClasses = computed(() => {
  const sizes = {
    sm: "max-w-sm w-full",
    md: "max-w-md w-full",
    lg: "max-w-lg w-full",
    xl: "max-w-xl w-full",
    "2xl": "max-w-2xl w-full",
  };
  return sizes[props.size] || sizes.md;
});

// モーダルを閉じる
function closeModal() {
  if (props.closeOnBackdrop) {
    emit("close");
    emit("update:show", false);
  }
}

// ESCキーでモーダルを閉じる
function handleKeydown(event) {
  if (event.key === "Escape" && props.show) {
    closeModal();
  }
}

// モーダルが表示されたときにESCキーのリスナーを追加
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      document.addEventListener("keydown", handleKeydown);
      // ボディのスクロールを無効化
      document.body.style.overflow = "hidden";
    } else {
      document.removeEventListener("keydown", handleKeydown);
      // ボディのスクロールを復元
      document.body.style.overflow = "";
    }
  }
);

// コンポーネントがアンマウントされたときにリスナーを削除
import { onUnmounted } from "vue";
onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
});
</script>

<style scoped>
/* アニメーション効果 */
.modal-content {
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
