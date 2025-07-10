// パンくず生成ヘルパー
export function generateBreadcrumbs(route, t) {
  const pathSegments = route.path.split("/").filter(Boolean);
  const breadcrumbs = [];

  // ルートパスに基づいてパンくずを生成
  switch (pathSegments[0]) {
    case "project":
      breadcrumbs.push({ label: t("projectSettings"), to: "/project" });
      if (pathSegments[1] === "new") {
        breadcrumbs.push({ label: t("add"), current: true });
      } else if (pathSegments[1] && pathSegments[2] === "edit") {
        breadcrumbs.push({ label: t("edit"), current: true });
      }
      break;

    case "script":
      breadcrumbs.push({ label: t("scriptGeneration"), to: "/generate" });
      if (pathSegments[1]) {
        breadcrumbs.push({
          label: t("scriptDetail"),
          to: `/script/${pathSegments[1]}`,
        });
        if (pathSegments[2] === "edit") {
          breadcrumbs.push({ label: t("edit"), current: true });
        }
      }
      break;

    case "generate":
      breadcrumbs.push({ label: t("scriptGeneration"), current: true });
      break;

    case "settings":
      breadcrumbs.push({ label: t("settings"), current: true });
      break;

    default:
      if (pathSegments.length === 0) {
        breadcrumbs.push({ label: t("home"), current: true });
      }
      break;
  }

  return breadcrumbs;
}

// 標準パンくずパターン定義
export const BREADCRUMB_PATTERNS = {
  PROJECT_INDEX: (t) => [{ label: t("projectSettings"), current: true }],
  PROJECT_NEW: (t) => [
    { label: t("projectSettings"), to: "/project" },
    { label: t("add"), current: true },
  ],
  PROJECT_EDIT: (t, projectName) => [
    { label: t("projectSettings"), to: "/project" },
    { label: projectName || t("edit"), current: true },
  ],
  SCRIPT_INDEX: (t) => [{ label: t("scriptGeneration"), current: true }],
  SCRIPT_SHOW: (t, scriptTitle) => [
    { label: t("scriptGeneration"), to: "/generate" },
    { label: t("createdList"), to: "/generate?tab=list" },
    { label: scriptTitle || t("scriptDetail"), current: true },
  ],
  SCRIPT_EDIT: (t, scriptTitle) => [
    { label: t("scriptGeneration"), to: "/generate" },
    {
      label: scriptTitle || t("scriptDetail"),
      clickable: true,
      action: "backToDetail",
    },
    { label: t("edit"), current: true },
  ],
};
