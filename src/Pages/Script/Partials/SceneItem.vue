<template>
  <div class="scene-container">
    <div class="p-4 rounded-lg border bg-blue-50 border-blue-200">
      <div class="flex items-start gap-2">
        <div class="flex-1">
          <!-- シーン編集モード -->
          <div
            v-if="isEditing && !readOnly"
            class="space-y-3"
            :data-edit-index="`scene-${sceneIndex}`"
          >
            <input
              v-model="editForm.title"
              @keyup.enter="saveEdit"
              @keyup.escape="cancelEdit"
              class="w-full text-lg font-bold text-blue-800 bg-transparent border-b-2 border-blue-300 focus:outline-none focus:border-blue-500"
              placeholder="シーンタイトル"
            />
            <textarea
              v-model="editForm.content"
              @keyup.ctrl.enter="saveEdit"
              @keyup.escape="cancelEdit"
              rows="3"
              class="w-full text-gray-700 bg-transparent border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
              placeholder="シーンの説明"
            ></textarea>
            <input
              v-model="editForm.duration"
              @keyup.enter="saveEdit"
              @keyup.escape="cancelEdit"
              class="w-32 text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
              placeholder="時間 (分)"
            />

            <div class="flex gap-2 mt-2">
              <button
                @click="saveEdit"
                class="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
              >
                保存
              </button>
              <button
                @click="cancelEdit"
                class="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
              >
                キャンセル
              </button>
            </div>
          </div>
          <!-- シーン表示モード -->
          <div
            v-else
            @click="startEdit"
            :class="{ 'cursor-pointer hover:bg-blue-100': !readOnly }"
            class="rounded p-1"
            :title="readOnly ? '' : 'クリックで編集'"
          >
            <h3 class="font-bold text-lg text-blue-800 mb-2">
              {{ scene.title }}
            </h3>
            <p class="text-gray-700">{{ scene.content }}</p>
            <p v-if="scene.duration" class="text-sm text-gray-500 mt-1">
              時間: {{ scene.duration }} 分
            </p>
          </div>
        </div>
        <!-- シーン操作ボタン -->
        <div v-if="!readOnly" class="flex flex-col gap-1 items-end">
          <button
            @click="handleDelete"
            class="px-2 py-1 text-pink-500 hover:text-pink-700 hover:bg-pink-50 rounded text-xs cursor-pointer"
            title="シーンを削除"
          >
            削除
          </button>
          <button
            @click="$emit('move-up')"
            :disabled="!canMoveUp"
            class="px-2 py-1 text-gray-500 hover:text-sky-600 hover:bg-gray-50 rounded text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="シーンを上に移動"
          >
            ↑
          </button>
          <button
            @click="$emit('move-down')"
            :disabled="!canMoveDown"
            class="px-2 py-1 text-gray-500 hover:text-sky-600 hover:bg-gray-50 rounded text-xs cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            title="シーンを下に移動"
          >
            ↓
          </button>
        </div>
      </div>
    </div>

    <!-- シーン内のセリフ一覧 -->
    <div
      v-if="scene.lines && scene.lines.length > 0"
      class="ml-6 mt-2 space-y-2"
    >
      <LineItem
        v-for="(line, lineIdx) in scene.lines"
        :key="line.id"
        :line="line"
        :line-index="lineIdx"
        :scene-index="sceneIndex"
        :available-characters="availableCharacters"
        :read-only="readOnly"
        :is-editing="editingLineId === `line-${sceneIndex}-${lineIdx}`"
        @start-edit="handleLineEdit"
        @save-edit="handleLineSave"
        @cancel-edit="handleLineCancel"
        @delete="$emit('delete-line', lineIdx)"
        @move-up="handleLineMoveUp(lineIdx)"
        @move-down="handleLineMoveDown(lineIdx)"
        :can-move-up="lineIdx > 0"
        :can-move-down="lineIdx < scene.lines.length - 1"
      />
    </div>

    <!-- シーン内にセリフ追加ボタン -->
    <div v-if="!readOnly" class="ml-6 mt-2">
      <AddButton
        :text="$t('addDialogue')"
        variant="success"
        @click="$emit('add-line')"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import AddButton from "@/components/AddButton.vue";
import LineItem from "./LineItem.vue";

const { t } = useI18n();

const props = defineProps({
  scene: {
    type: Object,
    required: true,
  },
  sceneIndex: {
    type: Number,
    required: true,
  },
  availableCharacters: {
    type: Array,
    default: () => [],
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  canMoveUp: {
    type: Boolean,
    default: false,
  },
  canMoveDown: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "start-edit",
  "save-edit",
  "cancel-edit",
  "delete",
  "move-up",
  "move-down",
  "add-line",
  "delete-line",
  "move-line",
  "update-line",
]);

const editForm = ref({});
const editingLineId = ref(null);

function startEdit() {
  if (props.readOnly) return;
  editForm.value = { ...props.scene };
  emit("start-edit");

  nextTick(() => {
    const inputElements = document.querySelectorAll(
      `[data-edit-index="scene-${props.sceneIndex}"] input, [data-edit-index="scene-${props.sceneIndex}"] textarea`
    );
    if (inputElements.length > 0) {
      inputElements[0].focus();
    }
  });
}

function saveEdit() {
  emit("save-edit", editForm.value);
  editForm.value = {};
}

function cancelEdit() {
  emit("cancel-edit");
  editForm.value = {};
}

function handleLineEdit(lineId) {
  editingLineId.value = lineId;
}

function handleLineSave(lineIndex, updatedLine) {
  emit("update-line", lineIndex, updatedLine);
  editingLineId.value = null;
}

function handleLineCancel() {
  editingLineId.value = null;
}

function handleDelete() {
  emit("delete");
}

function handleLineMoveUp(lineIndex) {
  emit("move-line", { fromIndex: lineIndex, toIndex: lineIndex - 1 });
}

function handleLineMoveDown(lineIndex) {
  emit("move-line", { fromIndex: lineIndex, toIndex: lineIndex + 1 });
}
</script>
