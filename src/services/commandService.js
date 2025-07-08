/**
 * AIチャット用コマンドサービス
 * AIからプロジェクトと台本のCRUD操作を可能にする
 */

import {
  crudHelpers,
  ENTITY_TYPES,
  getEntityManager,
} from "./entityService.js";

/**
 * 利用可能なコマンドの定義
 */
export const COMMANDS = {
  // プロジェクト関連
  LIST_PROJECTS: "list_projects",
  SEARCH_PROJECTS: "search_projects",
  CREATE_PROJECT: "create_project",
  GET_PROJECT: "get_project",
  PROJECT_STATS: "project_stats",

  // 台本関連
  LIST_SCRIPTS: "list_scripts",
  SEARCH_SCRIPTS: "search_scripts",
  CREATE_SCRIPT: "create_script",
  GET_SCRIPT: "get_script",
  SCRIPT_STATS: "script_stats",

  // ヘルプ
  HELP: "help",
};

/**
 * コマンドの説明
 */
export const COMMAND_DESCRIPTIONS = {
  [COMMANDS.LIST_PROJECTS]: "全プロジェクトを表示",
  [COMMANDS.SEARCH_PROJECTS]:
    "プロジェクトを検索 (例: search_projects 'プロジェクト名')",
  [COMMANDS.CREATE_PROJECT]:
    "新しいプロジェクトを作成 (例: create_project 'プロジェクト名' '説明')",
  [COMMANDS.GET_PROJECT]: "特定のプロジェクトの詳細を取得 (例: get_project 1)",
  [COMMANDS.PROJECT_STATS]: "プロジェクトの統計情報を表示",

  [COMMANDS.LIST_SCRIPTS]: "全台本を表示",
  [COMMANDS.SEARCH_SCRIPTS]: "台本を検索 (例: search_scripts 'タイトル')",
  [COMMANDS.CREATE_SCRIPT]:
    "新しい台本を作成 (例: create_script 'タイトル' プロジェクトID '説明')",
  [COMMANDS.GET_SCRIPT]: "特定の台本の詳細を取得 (例: get_script 0)",
  [COMMANDS.SCRIPT_STATS]: "台本の統計情報を表示",

  [COMMANDS.HELP]: "利用可能なコマンドを表示",
};

/**
 * コマンドパーサー
 */
class CommandParser {
  /**
   * メッセージからコマンドを抽出
   */
  static parseCommand(message) {
    // コマンドのパターンを検出
    const commandPattern = /^\/([a-z_]+)(?:\s+(.*))?$/i;
    const match = message.trim().match(commandPattern);

    if (!match) {
      return null;
    }

    const [, command, argsString] = match;
    const args = argsString ? this.parseArguments(argsString) : [];

    return { command: command.toLowerCase(), args };
  }

  /**
   * 引数を解析
   */
  static parseArguments(argsString) {
    // クォートで囲まれた文字列と通常の引数を処理
    const args = [];
    const regex = /'([^']*)'|"([^"]*)"|(\S+)/g;
    let match;

    while ((match = regex.exec(argsString)) !== null) {
      args.push(match[1] || match[2] || match[3]);
    }

    return args;
  }

  /**
   * メッセージがコマンドかどうかを判定
   */
  static isCommand(message) {
    return message.trim().startsWith("/");
  }
}

/**
 * コマンド実行サービス
 */
export class CommandExecutor {
  /**
   * コマンドを実行
   */
  static async executeCommand(command, args) {
    try {
      switch (command) {
        case COMMANDS.LIST_PROJECTS:
          return await this.listProjects();

        case COMMANDS.SEARCH_PROJECTS:
          return await this.searchProjects(args[0]);

        case COMMANDS.CREATE_PROJECT:
          return await this.createProject(args[0], args[1]);

        case COMMANDS.GET_PROJECT:
          return await this.getProject(args[0]);

        case COMMANDS.PROJECT_STATS:
          return await this.getProjectStats();

        case COMMANDS.LIST_SCRIPTS:
          return await this.listScripts();

        case COMMANDS.SEARCH_SCRIPTS:
          return await this.searchScripts(args[0]);

        case COMMANDS.CREATE_SCRIPT:
          return await this.createScript(args[0], args[1], args[2]);

        case COMMANDS.GET_SCRIPT:
          return await this.getScript(args[0]);

        case COMMANDS.SCRIPT_STATS:
          return await this.getScriptStats();

        case COMMANDS.HELP:
          return this.getHelp();

        default:
          return `未知のコマンドです: /${command}\n\n利用可能なコマンドを確認するには「/help」と入力してください。`;
      }
    } catch (error) {
      return `コマンドの実行中にエラーが発生しました: ${error.message}`;
    }
  }

  /**
   * プロジェクト一覧
   */
  static async listProjects() {
    const projects = await crudHelpers.getAllProjects();

    if (projects.length === 0) {
      return "プロジェクトがありません。新しいプロジェクトを作成するには「/create_project 'プロジェクト名' '説明'」と入力してください。";
    }

    let result = `📁 プロジェクト一覧 (${projects.length}件)\n\n`;
    projects.forEach((project, index) => {
      result += `${index + 1}. **${project.name}** (ID: ${project.id})\n`;
      result += `   説明: ${project.description || "説明なし"}\n`;
      result += `   作成日: ${new Date(project.createdAt).toLocaleDateString(
        "ja-JP"
      )}\n\n`;
    });

    return result;
  }

  /**
   * プロジェクト検索
   */
  static async searchProjects(query) {
    if (!query) {
      return "検索キーワードを指定してください。例: /search_projects 'プロジェクト名'";
    }

    const results = await crudHelpers.searchProjects(query);

    if (results.length === 0) {
      return `「${query}」に一致するプロジェクトが見つかりませんでした。`;
    }

    let result = `🔍 検索結果: "${query}" (${results.length}件)\n\n`;
    results.forEach((project) => {
      result += `**${project.name}** (ID: ${project.id})\n`;
      result += `説明: ${project.description || "説明なし"}\n\n`;
    });

    return result;
  }

  /**
   * プロジェクト作成
   */
  static async createProject(name, description = "") {
    if (!name) {
      return "プロジェクト名を指定してください。例: /create_project '新しいプロジェクト' '説明'";
    }

    const project = await crudHelpers.createNewProject(name, description);
    return `✅ プロジェクト「${project.name}」を作成しました！\nID: ${
      project.id
    }\n説明: ${project.description || "説明なし"}`;
  }

  /**
   * プロジェクト詳細取得
   */
  static async getProject(id) {
    if (!id) {
      return "プロジェクトIDを指定してください。例: /get_project 1";
    }

    const projectManager = getEntityManager(ENTITY_TYPES.PROJECT);
    const project = await projectManager.getOne(parseInt(id));

    if (!project) {
      return `ID ${id} のプロジェクトが見つかりませんでした。`;
    }

    let result = `📁 プロジェクト詳細\n\n`;
    result += `**名前**: ${project.name}\n`;
    result += `**ID**: ${project.id}\n`;
    result += `**説明**: ${project.description || "説明なし"}\n`;
    result += `**作成日**: ${new Date(project.createdAt).toLocaleDateString(
      "ja-JP"
    )}\n`;
    result += `**更新日**: ${new Date(project.updatedAt).toLocaleDateString(
      "ja-JP"
    )}\n`;

    if (project.characters && project.characters.length > 0) {
      result += `**キャラクター**: ${project.characters.length}人\n`;
      project.characters.forEach((char, index) => {
        result += `  ${index + 1}. ${char.name} (${char.role})\n`;
      });
    }

    return result;
  }

  /**
   * プロジェクト統計情報
   */
  static async getProjectStats() {
    const stats = await crudHelpers.getProjectStats();

    let result = `📊 プロジェクト統計\n\n`;
    result += `**総数**: ${stats.total}件\n\n`;

    if (stats.recent.length > 0) {
      result += `**最近のプロジェクト**:\n`;
      stats.recent.forEach((project, index) => {
        result += `${index + 1}. ${project.name}\n`;
      });
    }

    return result;
  }

  /**
   * 台本一覧
   */
  static async listScripts() {
    const scripts = await crudHelpers.getAllScripts();

    if (scripts.length === 0) {
      return "台本がありません。新しい台本を作成するには「/create_script 'タイトル' プロジェクトID '説明'」と入力してください。";
    }

    let result = `📜 台本一覧 (${scripts.length}件)\n\n`;
    scripts.forEach((script, index) => {
      result += `${index}. **${script.title}** (ID: ${script.id})\n`;
      result += `   ステータス: ${script.status}\n`;
      result += `   作成日: ${new Date(script.createdAt).toLocaleDateString(
        "ja-JP"
      )}\n\n`;
    });

    return result;
  }

  /**
   * 台本検索
   */
  static async searchScripts(query) {
    if (!query) {
      return "検索キーワードを指定してください。例: /search_scripts 'タイトル'";
    }

    const results = await crudHelpers.searchScripts(query);

    if (results.length === 0) {
      return `「${query}」に一致する台本が見つかりませんでした。`;
    }

    let result = `🔍 検索結果: "${query}" (${results.length}件)\n\n`;
    results.forEach((script) => {
      result += `**${script.title}** (インデックス: ${script.id})\n`;
      result += `ステータス: ${script.status}\n\n`;
    });

    return result;
  }

  /**
   * 台本作成
   */
  static async createScript(title, projectId, description = "") {
    if (!title) {
      return "台本タイトルを指定してください。例: /create_script '新しい台本' 1 '説明'";
    }

    const script = await crudHelpers.createNewScript(
      title,
      projectId ? parseInt(projectId) : null,
      description
    );
    return `✅ 台本「${script.script.title}」を作成しました！\nインデックス: ${script.index}\nステータス: ${script.script.status}`;
  }

  /**
   * 台本詳細取得
   */
  static async getScript(index) {
    if (index === undefined) {
      return "台本のインデックスを指定してください。例: /get_script 0";
    }

    const scriptManager = getEntityManager(ENTITY_TYPES.SCRIPT);
    const script = await scriptManager.getOne(parseInt(index));

    if (!script) {
      return `インデックス ${index} の台本が見つかりませんでした。`;
    }

    let result = `📜 台本詳細\n\n`;
    result += `**タイトル**: ${script.title}\n`;
    result += `**ステータス**: ${script.status}\n`;
    result += `**作成日**: ${new Date(script.createdAt).toLocaleDateString(
      "ja-JP"
    )}\n`;
    result += `**更新日**: ${new Date(script.updatedAt).toLocaleDateString(
      "ja-JP"
    )}\n`;

    if (script.content) {
      const preview = script.content.substring(0, 200);
      result += `**内容プレビュー**: ${preview}${
        script.content.length > 200 ? "..." : ""
      }\n`;
    }

    return result;
  }

  /**
   * 台本統計情報
   */
  static async getScriptStats() {
    const stats = await crudHelpers.getScriptStats();

    let result = `📊 台本統計\n\n`;
    result += `**総数**: ${stats.total}件\n\n`;

    if (stats.statusCounts) {
      result += `**ステータス別**:\n`;
      Object.entries(stats.statusCounts).forEach(([status, count]) => {
        result += `- ${status}: ${count}件\n`;
      });
      result += "\n";
    }

    if (stats.recent.length > 0) {
      result += `**最近の台本**:\n`;
      stats.recent.forEach((script, index) => {
        result += `${index + 1}. ${script.title} (${script.status})\n`;
      });
    }

    return result;
  }

  /**
   * ヘルプ表示
   */
  static getHelp() {
    let result = `🤖 AIチャット コマンドヘルプ\n\n`;
    result += `コマンドは「/」で始まります。以下のコマンドが利用できます:\n\n`;

    result += `**プロジェクト操作**:\n`;
    result += `- /list_projects - 全プロジェクトを表示\n`;
    result += `- /search_projects 'キーワード' - プロジェクトを検索\n`;
    result += `- /create_project '名前' '説明' - 新しいプロジェクトを作成\n`;
    result += `- /get_project ID - プロジェクトの詳細を表示\n`;
    result += `- /project_stats - プロジェクトの統計情報\n\n`;

    result += `**台本操作**:\n`;
    result += `- /list_scripts - 全台本を表示\n`;
    result += `- /search_scripts 'キーワード' - 台本を検索\n`;
    result += `- /create_script 'タイトル' プロジェクトID '説明' - 新しい台本を作成\n`;
    result += `- /get_script インデックス - 台本の詳細を表示\n`;
    result += `- /script_stats - 台本の統計情報\n\n`;

    result += `**その他**:\n`;
    result += `- /help - このヘルプを表示\n\n`;

    result += `**使用例**:\n`;
    result += `- /create_project 'マイプロジェクト' 'テスト用プロジェクト'\n`;
    result += `- /search_scripts '物語'\n`;
    result += `- /get_project 1\n`;

    return result;
  }
}

/**
 * メッセージ処理のメイン関数
 */
export async function processMessage(message) {
  if (!CommandParser.isCommand(message)) {
    return null; // 通常のチャットメッセージ
  }

  const parsed = CommandParser.parseCommand(message);
  if (!parsed) {
    return "コマンドの形式が正しくありません。ヘルプを見るには「/help」と入力してください。";
  }

  return await CommandExecutor.executeCommand(parsed.command, parsed.args);
}

/**
 * コマンド実行のエクスポート関数
 */
export async function executeCommand(message) {
  return await processMessage(message);
}

/**
 * コマンドかどうかの判定関数
 */
export function isCommand(message) {
  return CommandParser.isCommand(message);
}

/**
 * コマンド候補の取得（オートコンプリート用）
 */
export function getCommandSuggestions(partial = "") {
  const commands = Object.values(COMMANDS);
  return commands
    .filter((cmd) => cmd.startsWith(partial.toLowerCase()))
    .map((cmd) => ({
      command: `/${cmd}`,
      description: COMMAND_DESCRIPTIONS[cmd],
    }));
}
