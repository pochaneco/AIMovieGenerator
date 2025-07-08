<template>
  <PageContainer padding="4">
    <h2 class="text-xl font-bold mb-6">{{ $t("settingsTitle") }}</h2>

    <!-- 保存されたLLM設定一覧 -->
    <ConfigList
      :configs="llmConfigs"
      :active-config-id="activeLLMConfigId"
      :provider-info="PROVIDER_INFO"
      @add-config="showAddForm = true"
      @set-active="setActiveConfig"
      @edit-config="editConfig"
      @delete-config="deleteConfig"
    />

    <!-- 設定追加/編集フォーム -->
    <LLMConfigForm
      v-if="showAddForm || editingConfig"
      :form-data="formData"
      :is-editing="!!editingConfig"
      :available-providers="availableProviders"
      :available-models="availableModels"
      :testing="testing"
      :test-result="testResult"
      @test-config="testCurrentConfig"
      @submit="saveConfig"
      @cancel="cancelForm"
    />

    <!-- 保存成功メッセージ -->
    <StatusMessage
      v-if="saved"
      type="success"
      :message="$t('saved')"
      class="mt-4"
    />

    <!-- 現在の保存状態表示 -->
    <StorageStatus
      :storage-type="currentStorageType"
      @clear-storage="clearApiKey"
    />
  </PageContainer>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import PageContainer from "@/components/PageContainer.vue";
import ConfigList from "./ConfigList.vue";
import LLMConfigForm from "./LLMConfigForm.vue";
import StatusMessage from "@/components/StatusMessage.vue";
import StorageStatus from "./StorageStatus.vue";
import {
  getAvailableProviders,
  getAvailableModels,
  testLLMConfig,
  generateConfigName,
  PROVIDER_INFO,
} from "@/utils/llmService.js";
import {
  getLLMConfigs,
  saveLLMConfig,
  deleteLLMConfig,
  getActiveLLMConfig,
  setActiveLLMConfig,
} from "@/services/dataService.js";
import {
  getApiKeyStorageType,
  clearAllApiKeys,
} from "@/services/apiKeyService.js";

const llmConfigs = ref([]);
const activeLLMConfigId = ref(null);
const showAddForm = ref(false);
const editingConfig = ref(null);
const saved = ref(false);
const testing = ref(false);
const testResult = ref(null);
const currentStorageType = ref("none");

// フォームデータ
const formData = ref({
  name: "",
  provider: "",
  apiKey: "",
  defaultModel: "",
});

// 利用可能なプロバイダーとモデル
const availableProviders = ref(getAvailableProviders());
const availableModels = computed(() =>
  getAvailableModels(formData.value.provider)
);

// プロバイダー変更時にデフォルトモデルを設定
watch(
  () => formData.value.provider,
  async (newProvider) => {
    if (newProvider && PROVIDER_INFO[newProvider]) {
      formData.value.defaultModel = PROVIDER_INFO[newProvider].defaultModel;

      // 設定名が空の場合は自動生成
      if (!formData.value.name) {
        formData.value.name = await generateConfigName(newProvider);
      }
    }
    testResult.value = null;
  }
);

onMounted(async () => {
  await loadConfigs();
  await updateStorageType();
});

async function loadConfigs() {
  try {
    llmConfigs.value = await getLLMConfigs();
    const activeConfig = await getActiveLLMConfig();
    activeLLMConfigId.value = activeConfig?.id || null;
  } catch (error) {
    console.error("設定の読み込みに失敗しました:", error);
  }
}

async function updateStorageType() {
  try {
    currentStorageType.value = await getApiKeyStorageType();
  } catch (error) {
    console.error("ストレージ状態の読み込みに失敗しました:", error);
    currentStorageType.value = "none";
  }
}

async function saveConfig() {
  try {
    const configToSave = {
      ...formData.value,
      id: editingConfig.value?.id,
    };

    const savedConfig = await saveLLMConfig(configToSave);

    // アクティブ設定がない場合は最初の設定をアクティブにする
    if (!activeLLMConfigId.value) {
      await setActiveLLMConfig(savedConfig.id);
      activeLLMConfigId.value = savedConfig.id;
    }

    await loadConfigs();
    await updateStorageType();
    cancelForm();
    showSavedMessage();
  } catch (error) {
    console.error("設定の保存に失敗しました:", error);
    alert("設定の保存に失敗しました");
  }
}

async function editConfig(config) {
  editingConfig.value = config;
  formData.value = {
    name: config.name,
    provider: config.provider,
    apiKey: config.apiKey,
    defaultModel: config.defaultModel,
  };
  showAddForm.value = false;
  testResult.value = null;
}

async function deleteConfig(configId) {
  const confirmed = confirm("この設定を削除しますか？");
  if (!confirmed) return;

  try {
    await deleteLLMConfig(configId);

    // アクティブ設定を削除した場合
    if (activeLLMConfigId.value === configId) {
      const remainingConfigs = await getLLMConfigs();
      if (remainingConfigs.length > 0) {
        await setActiveLLMConfig(remainingConfigs[0].id);
        activeLLMConfigId.value = remainingConfigs[0].id;
      } else {
        activeLLMConfigId.value = null;
      }
    }

    await loadConfigs();
    await updateStorageType();
    showSavedMessage();
  } catch (error) {
    console.error("設定の削除に失敗しました:", error);
    alert("設定の削除に失敗しました");
  }
}

async function setActiveConfig(configId) {
  try {
    await setActiveLLMConfig(configId);
    activeLLMConfigId.value = configId;
    await updateStorageType();
    showSavedMessage();
  } catch (error) {
    console.error("アクティブ設定の変更に失敗しました:", error);
    alert("アクティブ設定の変更に失敗しました");
  }
}

async function clearApiKey() {
  const confirmed = confirm("すべてのLLM設定を削除しますか？");
  if (!confirmed) return;

  try {
    await clearAllApiKeys();
    await loadConfigs();
    await updateStorageType();
    showSavedMessage();
  } catch (error) {
    console.error("設定のクリアに失敗しました:", error);
    alert("設定のクリアに失敗しました");
  }
}

async function testCurrentConfig() {
  if (
    !formData.value.apiKey ||
    !formData.value.provider ||
    !formData.value.defaultModel
  )
    return;

  testing.value = true;
  testResult.value = null;

  try {
    const result = await testLLMConfig(formData.value);
    testResult.value = result;
  } catch (error) {
    testResult.value = { success: false, error: error.message };
  } finally {
    testing.value = false;
  }
}

function cancelForm() {
  showAddForm.value = false;
  editingConfig.value = null;
  formData.value = {
    name: "",
    provider: "",
    apiKey: "",
    defaultModel: "",
  };
  testResult.value = null;
}

function showSavedMessage() {
  saved.value = true;
  setTimeout(() => (saved.value = false), 1500);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
</script>
