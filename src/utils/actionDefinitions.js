// 標準アクション定義
export const STANDARD_ACTIONS = {
  view: { key: "view", icon: "eye", variant: "secondary", label: "detail" },
  edit: { key: "edit", icon: "pencil", variant: "primary", label: "edit" },
  duplicate: {
    key: "duplicate",
    icon: "copy",
    variant: "warning",
    label: "duplicate",
  },
  delete: { key: "delete", icon: "trash", variant: "danger", label: "delete" },
};

// 各エンティティタイプ用のアクション組み合わせ
export const ENTITY_ACTIONS = {
  project: [STANDARD_ACTIONS.edit, STANDARD_ACTIONS.delete],
  script: [
    STANDARD_ACTIONS.view,
    STANDARD_ACTIONS.duplicate,
    STANDARD_ACTIONS.delete,
  ],
  config: [STANDARD_ACTIONS.edit, STANDARD_ACTIONS.delete],
};

// アクションラベルの翻訳キー取得
export function getActionLabel(actionKey) {
  const action = Object.values(STANDARD_ACTIONS).find(
    (a) => a.key === actionKey
  );
  return action ? action.label : actionKey;
}
