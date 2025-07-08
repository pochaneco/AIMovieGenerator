<template>
  <Modal :show="show" @close="onClose">
    <template #header>
      <h2 class="text-xl font-bold">シーン追加・編集</h2>
    </template>
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >タイトル</label
        >
        <input
          v-model="localScene.title"
          class="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">内容</label>
        <textarea
          v-model="localScene.content"
          class="w-full px-3 py-2 border rounded"
          rows="3"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">長さ</label>
        <input
          v-model="localScene.duration"
          class="w-full px-3 py-2 border rounded"
          placeholder="例: 3分"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex gap-2 justify-end">
        <CoolButton variant="secondary" @click="onClose">キャンセル</CoolButton>
        <CoolButton variant="primary" @click="onSave">保存</CoolButton>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, watch, reactive } from "vue";
import Modal from "@/components/Modal.vue";
import CoolButton from "@/components/CoolButton.vue";

const props = defineProps({
  show: Boolean,
  scene: Object,
});
const emit = defineEmits(["close", "save"]);

const localScene = reactive({
  title: "",
  content: "",
  duration: "",
});

watch(
  () => props.scene,
  (val) => {
    if (val) {
      localScene.title = val.title || "";
      localScene.content = val.content || "";
      localScene.duration = val.duration || "";
    } else {
      localScene.title = "";
      localScene.content = "";
      localScene.duration = "";
    }
  },
  { immediate: true }
);

function onClose() {
  emit("close");
}
function onSave() {
  emit("save", { ...localScene });
}
</script>
