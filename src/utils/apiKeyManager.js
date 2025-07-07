/**
 * APIキー管理ユーティリティ
 * セッションストレージと永続化ストレージの両方に対応
 */

import { getSetting, saveSetting } from "@/services/dataService.js";

const SESSION_KEY = "openai_api_key_session";

/**
 * APIキーを取得（セッション優先、次に永続化）
 * @returns {Promise<string>} APIキー
 */
export async function getApiKey() {
  try {
    // まずセッションストレージをチェック
    const sessionKey = sessionStorage.getItem(SESSION_KEY);
    if (sessionKey) {
      return sessionKey;
    }

    // 次に永続化ストレージをチェック
    const persistentKey = await getSetting("openai_api_key", "");
    return persistentKey;
  } catch (error) {
    console.error("APIキーの取得に失敗しました:", error);
    return "";
  }
}

/**
 * APIキーが設定されているかチェック
 * @returns {Promise<boolean>} APIキーが存在するかどうか
 */
export async function hasApiKey() {
  const apiKey = await getApiKey();
  return Boolean(apiKey && apiKey.trim().length > 0);
}

/**
 * APIキーの保存状態を取得
 * @returns {string} "session" | "persistent" | "none"
 */
export function getApiKeyStorageType() {
  const hasSessionStorage = sessionStorage.getItem(SESSION_KEY);
  const hasPersistentStorage = localStorage.getItem("openai_api_key");

  if (hasSessionStorage) return "session";
  if (hasPersistentStorage) return "persistent";
  return "none";
}

/**
 * APIキーをクリア（セッション・永続化両方）
 */
export async function clearApiKey() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    await saveSetting("openai_api_key", "");
  } catch (error) {
    console.error("APIキーのクリアに失敗しました:", error);
  }
}
