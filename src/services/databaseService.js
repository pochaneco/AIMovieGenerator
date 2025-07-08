/**
 * IndexedDBデータベースサービス
 * Dexie.jsを使用してデータを管理
 */

import Dexie from "dexie";

/**
 * AIMovieGeneratorデータベース
 */
class AIMovieGeneratorDB extends Dexie {
  constructor() {
    super("AIMovieGeneratorDB");

    // データベーススキーマを定義
    // v1: 初期版（isActiveインデックス付き）
    this.version(1).stores({
      scripts: "++id, title, projectId, status, createdAt, updatedAt",
      projects: "++id, name, description, createdAt, updatedAt",
      settings: "&key, value, updatedAt",
      llmConfigs:
        "&id, name, provider, defaultModel, isActive, createdAt, updatedAt",
      secureData: "&key, encryptedValue, updatedAt",
    });

    // v2: isActiveインデックスを削除（boolean検索の問題を解決）
    this.version(2).stores({
      scripts: "++id, title, projectId, status, createdAt, updatedAt",
      projects: "++id, name, description, createdAt, updatedAt",
      settings: "&key, value, updatedAt",
      llmConfigs: "&id, name, provider, defaultModel, createdAt, updatedAt",
      secureData: "&key, encryptedValue, updatedAt",
    });

    // テーブルの型定義（TypeScript用）
    this.scripts = this.table("scripts");
    this.projects = this.table("projects");
    this.settings = this.table("settings");
    this.llmConfigs = this.table("llmConfigs");
    this.secureData = this.table("secureData");
  }
}

// データベースインスタンスを作成
export const db = new AIMovieGeneratorDB();

/**
 * データベース初期化
 */
export async function initializeDatabase() {
  try {
    await db.open();
    console.log("IndexedDBデータベースが初期化されました");
  } catch (error) {
    console.error("データベースの初期化に失敗しました:", error);
    throw new Error("データベースの初期化に失敗しました");
  }
}

/**
 * データベースをクリア（開発用）
 */
export async function clearDatabase() {
  try {
    await db.delete();
    console.log("データベースがクリアされました");

    // 再初期化
    await initializeDatabase();
  } catch (error) {
    console.error("データベースのクリアに失敗しました:", error);
    throw new Error("データベースのクリアに失敗しました");
  }
}

/**
 * データベースの健全性チェック
 */
export async function healthCheck() {
  try {
    const [scriptsCount, projectsCount, settingsCount, llmConfigsCount] =
      await Promise.all([
        db.scripts.count(),
        db.projects.count(),
        db.settings.count(),
        db.llmConfigs.count(),
      ]);

    return {
      status: "healthy",
      data: {
        scriptsCount,
        projectsCount,
        settingsCount,
        llmConfigsCount,
        dbName: db.name,
        version: db.verno,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: "error",
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
}
