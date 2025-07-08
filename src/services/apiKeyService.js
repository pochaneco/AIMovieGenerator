/**
 * APIキー管理サービス
 * LLM設定と連携したAPIキー管理機能を提供
 */

import {
  getLLMConfigs,
  getActiveLLMConfig,
  saveLLMConfig,
  setActiveLLMConfig,
  clearLLMData,
  getLLMDataStorageType,
} from "./dataService.js";

/**
 * アクティブなLLM設定のAPIキーを取得
 * @returns {Promise<string|null>} APIキーまたはnull
 */
export async function getActiveApiKey() {
  try {
    const activeConfig = await getActiveLLMConfig();
    return activeConfig?.apiKey || null;
  } catch (error) {
    console.error("アクティブAPIキーの取得に失敗しました:", error);
    return null;
  }
}

/**
 * 特定のLLM設定のAPIキーを取得
 * @param {string} configId - LLM設定ID
 * @returns {Promise<string|null>} APIキーまたはnull
 */
export async function getApiKeyByConfigId(configId) {
  try {
    const configs = await getLLMConfigs();
    const config = configs.find((c) => c.id === configId);
    return config?.apiKey || null;
  } catch (error) {
    console.error("APIキーの取得に失敗しました:", error);
    return null;
  }
}

/**
 * アクティブなLLM設定のAPIキーを更新
 * @param {string} apiKey - 新しいAPIキー
 * @returns {Promise<boolean>} 成功フラグ
 */
export async function updateActiveApiKey(apiKey) {
  try {
    const activeConfig = await getActiveLLMConfig();
    if (!activeConfig) {
      throw new Error("アクティブなLLM設定が見つかりません");
    }

    const updatedConfig = {
      ...activeConfig,
      apiKey: apiKey,
    };

    await saveLLMConfig(updatedConfig);
    return true;
  } catch (error) {
    console.error("アクティブAPIキーの更新に失敗しました:", error);
    return false;
  }
}

/**
 * 特定のLLM設定のAPIキーを更新
 * @param {string} configId - LLM設定ID
 * @param {string} apiKey - 新しいAPIキー
 * @returns {Promise<boolean>} 成功フラグ
 */
export async function updateApiKeyByConfigId(configId, apiKey) {
  try {
    const configs = await getLLMConfigs();
    const config = configs.find((c) => c.id === configId);

    if (!config) {
      throw new Error("指定されたLLM設定が見つかりません");
    }

    const updatedConfig = {
      ...config,
      apiKey: apiKey,
    };

    await saveLLMConfig(updatedConfig);
    return true;
  } catch (error) {
    console.error("APIキーの更新に失敗しました:", error);
    return false;
  }
}

/**
 * アクティブなLLM設定にAPIキーが設定されているかチェック
 * @returns {Promise<boolean>} APIキーが存在するかどうか
 */
export async function hasActiveApiKey() {
  try {
    const apiKey = await getActiveApiKey();
    return Boolean(apiKey && apiKey.trim().length > 0);
  } catch (error) {
    console.error("APIキー存在確認に失敗しました:", error);
    return false;
  }
}

/**
 * 特定のLLM設定にAPIキーが設定されているかチェック
 * @param {string} configId - LLM設定ID
 * @returns {Promise<boolean>} APIキーが存在するかどうか
 */
export async function hasApiKeyByConfigId(configId) {
  try {
    const apiKey = await getApiKeyByConfigId(configId);
    return Boolean(apiKey && apiKey.trim().length > 0);
  } catch (error) {
    console.error("APIキー存在確認に失敗しました:", error);
    return false;
  }
}

/**
 * アクティブなLLM設定のAPIキーをクリア
 * @returns {Promise<boolean>} 成功フラグ
 */
export async function clearActiveApiKey() {
  try {
    return await updateActiveApiKey("");
  } catch (error) {
    console.error("アクティブAPIキーのクリアに失敗しました:", error);
    return false;
  }
}

/**
 * 特定のLLM設定のAPIキーをクリア
 * @param {string} configId - LLM設定ID
 * @returns {Promise<boolean>} 成功フラグ
 */
export async function clearApiKeyByConfigId(configId) {
  try {
    return await updateApiKeyByConfigId(configId, "");
  } catch (error) {
    console.error("APIキーのクリアに失敗しました:", error);
    return false;
  }
}

/**
 * すべてのAPIキーをクリア（すべてのLLM設定をクリア）
 * @returns {Promise<boolean>} 成功フラグ
 */
export async function clearAllApiKeys() {
  try {
    await clearLLMData();
    return true;
  } catch (error) {
    console.error("すべてのAPIキーのクリアに失敗しました:", error);
    return false;
  }
}

/**
 * APIキーの保存状態を取得
 * @returns {Promise<string>} 'persistent' | 'none'
 */
export async function getApiKeyStorageType() {
  try {
    return await getLLMDataStorageType();
  } catch (error) {
    console.error("APIキー保存状態の確認に失敗しました:", error);
    return "none";
  }
}

/**
 * すべてのLLM設定からAPIキーの一覧を取得（デバッグ用）
 * @param {boolean} maskKeys - APIキーをマスクするかどうか
 * @returns {Promise<Array>} APIキー情報の配列
 */
export async function getAllApiKeysInfo(maskKeys = true) {
  try {
    const configs = await getLLMConfigs();
    const activeConfig = await getActiveLLMConfig();

    return configs.map((config) => ({
      id: config.id,
      name: config.name,
      provider: config.provider,
      hasApiKey: Boolean(config.apiKey && config.apiKey.trim().length > 0),
      apiKey:
        maskKeys && config.apiKey
          ? `${config.apiKey.substring(0, 4)}****${config.apiKey.substring(
              config.apiKey.length - 4
            )}`
          : config.apiKey,
      isActive: activeConfig?.id === config.id,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt,
    }));
  } catch (error) {
    console.error("APIキー情報の取得に失敗しました:", error);
    return [];
  }
}

/**
 * APIキーの形式を検証
 * @param {string} apiKey - 検証するAPIキー
 * @param {string} provider - プロバイダー名
 * @returns {boolean} 有効な形式かどうか
 */
export function validateApiKeyFormat(apiKey, provider) {
  if (!apiKey || typeof apiKey !== "string") {
    return false;
  }

  const trimmedKey = apiKey.trim();

  switch (provider) {
    case "openai":
      // OpenAI API key format: sk-...
      return trimmedKey.startsWith("sk-") && trimmedKey.length > 10;

    case "anthropic":
      // Anthropic API key format: sk-ant-...
      return trimmedKey.startsWith("sk-ant-") && trimmedKey.length > 15;

    case "google":
      // Google API key format: usually starts with AIza...
      return trimmedKey.length > 20;

    default:
      // Generic validation: not empty and reasonable length
      return trimmedKey.length > 5;
  }
}

/**
 * アクティブなLLM設定のAPIキー形式を検証
 * @returns {Promise<boolean>} 有効な形式かどうか
 */
export async function validateActiveApiKey() {
  try {
    const activeConfig = await getActiveLLMConfig();
    if (!activeConfig) {
      return false;
    }

    return validateApiKeyFormat(activeConfig.apiKey, activeConfig.provider);
  } catch (error) {
    console.error("アクティブAPIキーの検証に失敗しました:", error);
    return false;
  }
}
