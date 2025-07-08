<template>
  <div class="bg-white rounded-lg shadow-sm border">
    <div class="p-6 border-b">
      <h2 class="text-xl font-semibold">{{ $t("scriptContent") }}</h2>
    </div>

    <div class="p-6">
      <div v-if="scriptContent && scriptContent.length > 0" class="space-y-4">
        <!-- 最初に追加ボタン（編集モードのみ） -->
        <div v-if="!readOnly" class="py-2">
          <AddButton
            :text="$t('addScene')"
            variant="primary"
            @click="$emit('add-scene', 0)"
          />
        </div>

        <div
          v-for="(scene, sceneIdx) in scriptContent"
          :key="scene.id"
          class="script-item-container"
        >
          <!-- シーンコンポーネント -->
          <SceneItem
            :scene="scene"
            :scene-index="sceneIdx"
            :available-characters="availableCharacters"
            :read-only="readOnly"
            :is-editing="editingItem === `scene-${sceneIdx}`"
            :can-move-up="sceneIdx > 0"
            :can-move-down="sceneIdx < scriptContent.length - 1"
            @start-edit="startSceneEdit(sceneIdx)"
            @save-edit="saveSceneEdit(sceneIdx, $event)"
            @cancel-edit="cancelInlineEdit"
            @delete="$emit('delete-scene', sceneIdx)"
            @move-up="$emit('move-scene', sceneIdx, sceneIdx - 1)"
            @move-down="$emit('move-scene', sceneIdx, sceneIdx + 1)"
            @add-line="$emit('add-line-to-scene', sceneIdx)"
            @delete-line="$emit('delete-line', sceneIdx, $event)"
            @move-line="handleMoveLineEvent(sceneIdx, $event)"
            @update-line="$emit('update-line', sceneIdx, $event)"
          />

          <!-- シーンの後に追加ボタン（編集モードのみ） -->
          <div v-if="!readOnly" class="py-2">
            <AddButton
              :text="$t('addScene')"
              variant="primary"
              @click="$emit('add-scene', sceneIdx + 1)"
            />
          </div>
        </div>
      </div>

      <!-- 空の状態 -->
      <div v-else class="text-center py-12 text-gray-500">
        <Icon name="document" size="2xl" class="mx-auto text-gray-400 mb-4" />
        <p class="mb-4">{{ $t("noScriptContent") }}</p>
        <p class="text-sm mb-6">{{ $t("generateScriptToSeeContent") }}</p>

        <!-- 空の状態でも追加ボタンを表示（編集モードのみ） -->
        <div v-if="!readOnly">
          <AddButton
            :text="$t('addScene')"
            variant="primary"
            @click="$emit('add-scene', 0)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import Icon from "@/components/Icon.vue";
import AddButton from "@/components/AddButton.vue";
import SceneItem from "./SceneItem.vue";

const { t } = useI18n();

const emit = defineEmits([
  "add-scene",
  "add-line-to-scene",
  "delete-scene",
  "delete-line",
  "move-scene",
  "move-line",
  "update-scene",
  "update-line",
]);

const props = defineProps({
  scriptContent: {
    type: Array,
    default: () => [],
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  availableCharacters: {
    type: Array,
    default: () => [],
  },
});

// インライン編集用の状態管理
const editingItem = ref(null);

// 外部からの編集モード開始イベントを受信
function handleStartEdit(event) {
  const { index, item } = event.detail;
  startInlineEdit(index, item);
}

onMounted(() => {
  document.addEventListener("start-edit", handleStartEdit);
});

onUnmounted(() => {
  document.removeEventListener("start-edit", handleStartEdit);
});

// シーンの編集を開始
function startSceneEdit(sceneIndex) {
  editingItem.value = `scene-${sceneIndex}`;
}

// シーンの編集を保存
function saveSceneEdit(sceneIndex, updatedScene) {
  emit("update-scene", sceneIndex, updatedScene);
  editingItem.value = null;
}

// インライン編集をキャンセル
function cancelInlineEdit() {
  editingItem.value = null;
}

// セリフ移動イベントの処理
function handleMoveLineEvent(sceneIndex, moveEvent) {
  const { fromIndex, toIndex } = moveEvent;
  emit("move-line", sceneIndex, fromIndex, toIndex);
}
</script>
