<template>
  <div class="line-container">
    <div class="p-3 rounded-lg border bg-green-50 border-green-200">
      <div class="flex items-start gap-2">
        <div class="flex-1">
          <!-- セリフ編集モード -->
          <div
            v-if="isEditing && !readOnly"
            class="space-y-3"
            :data-edit-index="`line-${sceneIndex}-${lineIndex}`"
          >
            <select
              v-model="editForm.character"
              class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded border focus:outline-none focus:border-green-500"
            >
              <option
                v-for="character in availableCharacters"
                :key="character.name"
                :value="character.name"
              >
                {{ character.name }}
              </option>
            </select>
            <textarea
              v-model="editForm.content"
              @keyup.ctrl.enter="saveEdit"
              @keyup.escape="cancelEdit"
              rows="2"
              class="w-full text-gray-800 bg-transparent border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-green-500"
              placeholder="セリフ内容"
            ></textarea>
            <input
              v-model="editForm.emotion"
              @keyup.enter="saveEdit"
              @keyup.escape="cancelEdit"
              class="w-32 text-sm text-gray-600 bg-transparent border-b border-gray-300 focus:outline-none focus:border-green-500"
              placeholder="感情"
            />
            <div class="flex gap-2 mt-2">
              <button
                @click="saveEdit"
                class="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
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
          <!-- セリフ表示モード -->
          <div
            v-else
            @dblclick="startEdit"
            :class="{ 'cursor-pointer hover:bg-green-100': !readOnly }"
            class="flex items-start gap-3 rounded p-1"
            :title="readOnly ? '' : 'ダブルクリックで編集'"
          >
            <span
              class="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded"
            >
              {{ line.character }}
            </span>
            <div class="flex-1">
              <p class="text-gray-800">{{ line.content }}</p>
              <p
                v-if="line.emotion && line.emotion !== '普通'"
                class="text-sm text-gray-500 mt-1"
              >
                感情: {{ line.emotion }}
              </p>
            </div>
          </div>
        </div>
        <!-- セリフ操作ボタン -->
        <div v-if="!readOnly" class="flex flex-col gap-1 items-end">
          <button
            @click="$emit('delete')"
            class="text-pink-500 hover:underline text-xs"
          >
            削除
          </button>
          <button
            @click="$emit('move-up')"
            :disabled="!canMoveUp"
            class="text-gray-500 hover:text-green-600 text-xs disabled:opacity-30"
          >
            ↑
          </button>
          <button
            @click="$emit('move-down')"
            :disabled="!canMoveDown"
            class="text-gray-500 hover:text-green-600 text-xs disabled:opacity-30"
          >
            ↓
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from "vue";

const props = defineProps({
  line: {
    type: Object,
    required: true,
  },
  lineIndex: {
    type: Number,
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
]);

const editForm = ref({});

function startEdit() {
  if (props.readOnly) return;
  editForm.value = { ...props.line };
  emit("start-edit", `line-${props.sceneIndex}-${props.lineIndex}`);

  nextTick(() => {
    const inputElements = document.querySelectorAll(
      `[data-edit-index="line-${props.sceneIndex}-${props.lineIndex}"] input, [data-edit-index="line-${props.sceneIndex}-${props.lineIndex}"] textarea`
    );
    if (inputElements.length > 0) {
      inputElements[0].focus();
    }
  });
}

function saveEdit() {
  emit("save-edit", props.lineIndex, editForm.value);
  editForm.value = {};
}

function cancelEdit() {
  emit("cancel-edit");
  editForm.value = {};
}
</script>
