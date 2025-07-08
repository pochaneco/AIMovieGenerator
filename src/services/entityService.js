/**
 * 抽象化されたCRUDサービス
 * プロジェクトと台本の共通操作を提供
 */

import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProject,
  getScripts,
  createScript,
  updateScript,
  deleteScript,
  getScript,
} from "./dataService.js";

/**
 * エンティティタイプの定義
 */
export const ENTITY_TYPES = {
  PROJECT: "project",
  SCRIPT: "script",
};

/**
 * エンティティ操作の抽象化クラス
 */
class EntityManager {
  constructor(entityType) {
    this.entityType = entityType;
    this.operations = this.getOperations(entityType);
  }

  /**
   * エンティティタイプに応じた操作を取得
   */
  getOperations(entityType) {
    const operations = {
      [ENTITY_TYPES.PROJECT]: {
        getAll: getProjects,
        getOne: getProject,
        create: createProject,
        update: updateProject,
        delete: deleteProject,
        name: "プロジェクト",
        nameEn: "project",
      },
      [ENTITY_TYPES.SCRIPT]: {
        getAll: getScripts,
        getOne: getScript,
        create: createScript,
        update: updateScript,
        delete: deleteScript,
        name: "台本",
        nameEn: "script",
      },
    };

    return operations[entityType];
  }

  /**
   * 全データを取得
   */
  async getAll() {
    try {
      return await this.operations.getAll();
    } catch (error) {
      throw new Error(
        `${this.operations.name}一覧の取得に失敗しました: ${error.message}`
      );
    }
  }

  /**
   * 特定のデータを取得
   */
  async getOne(id) {
    try {
      return await this.operations.getOne(id);
    } catch (error) {
      throw new Error(
        `${this.operations.name}の取得に失敗しました: ${error.message}`
      );
    }
  }

  /**
   * データを作成
   */
  async create(data) {
    try {
      return await this.operations.create(data);
    } catch (error) {
      throw new Error(
        `${this.operations.name}の作成に失敗しました: ${error.message}`
      );
    }
  }

  /**
   * データを更新
   */
  async update(id, data) {
    try {
      return await this.operations.update(id, data);
    } catch (error) {
      throw new Error(
        `${this.operations.name}の更新に失敗しました: ${error.message}`
      );
    }
  }

  /**
   * データを削除
   */
  async delete(id) {
    try {
      return await this.operations.delete(id);
    } catch (error) {
      throw new Error(
        `${this.operations.name}の削除に失敗しました: ${error.message}`
      );
    }
  }

  /**
   * データの検索
   */
  async search(query) {
    try {
      const allData = await this.getAll();
      const searchTerm = query.toLowerCase();

      return allData.filter((item) => {
        const searchableFields = this.getSearchableFields(item);
        return searchableFields.some(
          (field) => field && field.toLowerCase().includes(searchTerm)
        );
      });
    } catch (error) {
      throw new Error(
        `${this.operations.name}の検索に失敗しました: ${error.message}`
      );
    }
  }

  /**
   * 検索対象のフィールドを取得
   */
  getSearchableFields(item) {
    if (this.entityType === ENTITY_TYPES.PROJECT) {
      return [item.name, item.description];
    } else if (this.entityType === ENTITY_TYPES.SCRIPT) {
      return [item.title, item.content, item.description];
    }
    return [];
  }

  /**
   * データの統計情報を取得
   */
  async getStats() {
    try {
      const allData = await this.getAll();
      const total = allData.length;

      let statusCounts = {};
      if (this.entityType === ENTITY_TYPES.SCRIPT) {
        statusCounts = allData.reduce((acc, item) => {
          acc[item.status] = (acc[item.status] || 0) + 1;
          return acc;
        }, {});
      }

      const recentData = allData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      return {
        total,
        recent: recentData,
        statusCounts:
          this.entityType === ENTITY_TYPES.SCRIPT ? statusCounts : undefined,
        entityType: this.entityType,
        entityName: this.operations.name,
      };
    } catch (error) {
      throw new Error(
        `${this.operations.name}の統計情報取得に失敗しました: ${error.message}`
      );
    }
  }
}

/**
 * プロジェクトマネージャー
 */
export const projectManager = new EntityManager(ENTITY_TYPES.PROJECT);

/**
 * 台本マネージャー
 */
export const scriptManager = new EntityManager(ENTITY_TYPES.SCRIPT);

/**
 * エンティティマネージャーを取得
 */
export function getEntityManager(entityType) {
  switch (entityType) {
    case ENTITY_TYPES.PROJECT:
      return projectManager;
    case ENTITY_TYPES.SCRIPT:
      return scriptManager;
    default:
      throw new Error(`未知のエンティティタイプ: ${entityType}`);
  }
}

/**
 * 簡易的なCRUD操作のヘルパー関数
 */
export const crudHelpers = {
  /**
   * 全プロジェクト取得
   */
  async getAllProjects() {
    return await projectManager.getAll();
  },

  /**
   * 全台本取得
   */
  async getAllScripts() {
    return await scriptManager.getAll();
  },

  /**
   * プロジェクト検索
   */
  async searchProjects(query) {
    return await projectManager.search(query);
  },

  /**
   * 台本検索
   */
  async searchScripts(query) {
    return await scriptManager.search(query);
  },

  /**
   * 統計情報取得
   */
  async getProjectStats() {
    return await projectManager.getStats();
  },

  /**
   * 台本統計情報取得
   */
  async getScriptStats() {
    return await scriptManager.getStats();
  },

  /**
   * 新しいプロジェクト作成
   */
  async createNewProject(name, description = "") {
    return await projectManager.create({
      name,
      description,
      characters: [],
    });
  },

  /**
   * 新しい台本作成
   */
  async createNewScript(title, projectId = null, description = "") {
    return await scriptManager.create({
      title,
      projectId,
      description,
      content: "",
      status: "draft",
    });
  },
};
