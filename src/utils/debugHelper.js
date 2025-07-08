/**
 * デバッグヘルパー関数
 * IndexedDBの内容確認やデータ移行の状況をデバッグするためのユーティリティ
 */

import { db } from "@/services/databaseService.js";
import { decrypt } from "@/services/cryptoService.js";

/**
 * IndexedDBの全テーブルの内容を確認
 */
export async function debugIndexedDB() {
  console.group("🔍 IndexedDB Debug Info");

  try {
    // 各テーブルの内容を確認
    const scripts = await db.scripts.toArray();
    const projects = await db.projects.toArray();
    const settings = await db.settings.toArray();
    const llmConfigs = await db.llmConfigs.toArray();
    const secureData = await db.secureData.toArray();

    console.log("📜 Scripts:", scripts);
    console.log("📁 Projects:", projects);
    console.log("⚙️ Settings:", settings);
    console.log("🤖 LLM Configs:", llmConfigs);
    console.log("🔐 Secure Data (encrypted):", secureData);

    // 暗号化されたデータを復号化して確認（開発用）
    if (secureData.length > 0) {
      console.group("🔓 Decrypted Secure Data");
      for (const item of secureData) {
        try {
          const decrypted = await decrypt(item.encryptedValue);
          console.log(`${item.key}:`, decrypted);
        } catch (error) {
          console.error(`Failed to decrypt ${item.key}:`, error);
        }
      }
      console.groupEnd();
    }
  } catch (error) {
    console.error("Failed to debug IndexedDB:", error);
  }

  console.groupEnd();
}

/**
 * LocalStorageの内容を確認
 */
export function debugLocalStorage() {
  console.group("💾 LocalStorage Debug Info");

  const keys = Object.keys(localStorage);
  const aiMovieKeys = keys.filter(
    (key) =>
      key.startsWith("aiMovieGenerator") ||
      key.startsWith("llmConfig") ||
      key.startsWith("apiKey")
  );

  if (aiMovieKeys.length > 0) {
    console.log("Found AI Movie Generator data in LocalStorage:");
    aiMovieKeys.forEach((key) => {
      console.log(`${key}:`, localStorage.getItem(key));
    });
  } else {
    console.log("No AI Movie Generator data found in LocalStorage");
  }

  console.groupEnd();
}

/**
 * データ移行状況を確認
 */
export async function debugMigrationStatus() {
  console.group("🚀 Migration Status Debug");

  // LocalStorageチェック
  debugLocalStorage();

  // IndexedDBチェック
  await debugIndexedDB();

  console.groupEnd();
}

/**
 * ブラウザコンソールでデバッグ機能を利用可能にする
 */
export function enableDebugConsole() {
  // グローバルスコープに関数を追加
  window.debugAIMovie = {
    indexedDB: debugIndexedDB,
    localStorage: debugLocalStorage,
    migration: debugMigrationStatus,
  };

  console.log("🛠️ Debug tools enabled! Use window.debugAIMovie.*");
  console.log("Available methods:");
  console.log("- window.debugAIMovie.indexedDB()");
  console.log("- window.debugAIMovie.localStorage()");
  console.log("- window.debugAIMovie.migration()");
}
