# コンポーネント構造の分析とリファクタリング方針

## 現在の問題

### 1. 重複するパターンの発見
- **リスト表示コンポーネント**: ProjectList、ScriptList、ConfigList が似たような構造
- **フォームコンポーネント**: ProjectForm、CharacterForm、LLMConfigForm が似たパターン
- **アクションボタンの重複**: 各リストで edit/delete/duplicate の組み合わせが頻繁に出現
- **モーダル使用パターン**: 各エンティティで編集・新規作成モーダルが似た構造

### 2. 一貫性の欠如
- ボタンの配置とスタイリングが画面によって異なる
- リスト項目のレイアウトが統一されていない
- エラーハンドリングとローディング状態の表示方法がバラバラ

## 追加の発見事項（ページレベル分析）

### 3. ページレベルでの重複パターン
- **Index系ページ**: Project/Index と Script/Index で類似の構造（リスト表示 + 新規作成）
- **Edit系ページ**: Project/Edit と Script/Edit でタブ切り替えパターンが共通
- **Show系ページ**: Script/Show で詳細表示 + アクションボタンのパターン
- **New系ページ**: Project/New で新規作成フォーム + ナビゲーションのパターン

### 4. RESTfulな画面遷移パターンの不統一
- ページヘッダーの構成が統一されていない
- 戻るボタンや保存ボタンの配置がページによって異なる
- タブナビゲーションの実装方法が個別対応
- パンくずナビゲーションの使用が一部ページのみ

### 5. 設定画面の特殊性
- Settings/Index は単一の大きなフォームコンポーネント
- 他のページと異なり、LLM設定という専門的なUIが必要
- テスト機能など、他にない独自の機能を持つ

### 6. パンくずナビゲーションの不統一
- 現在は Script/Edit と Script/Show（ScriptDetail）でのみ使用
- 各ページで個別にbreadcrumbItemsを定義している
- パンくず構造のパターンが統一されていない（router-linkベース vs clickableベース）
- 他のページ（Project系など）ではパンくずが使用されていない

## リファクタリング方針

### Phase 1: 基本コンポーネントの統一化

#### 1.1 汎用リストコンポーネント (`EntityList.vue`)
```vue
<!-- 提案する統一リストコンポーネント -->
<template>
  <div>
    <!-- 空状態 -->
    <EmptyState v-if="items.length === 0" 
      :icon="emptyIcon" 
      :message="emptyMessage"
      @action="$emit('createNew')" />
    
    <!-- リスト表示 -->
    <div v-else class="space-y-4">
      <EntityCard v-for="(item, index) in items" 
        :key="getItemKey(item, index)"
        :item="item"
        :actions="cardActions"
        @action="handleAction($event, item, index)">
        
        <!-- カスタムコンテンツスロット -->
        <template #title>
          <slot name="item-title" :item="item" :index="index" />
        </template>
        <template #content>
          <slot name="item-content" :item="item" :index="index" />
        </template>
        <template #meta>
          <slot name="item-meta" :item="item" :index="index" />
        </template>
      </EntityCard>
    </div>
  </div>
</template>
```

**適用対象**: ProjectList, ScriptList, ConfigList

#### 1.2 汎用カードコンポーネント (`EntityCard.vue`)
```vue
<!-- 統一されたカード表示 -->
<template>
  <div class="border rounded-lg p-4 hover:shadow-md transition-shadow">
    <div class="flex justify-between items-start mb-2">
      <div class="flex-1">
        <slot name="title" />
        <slot name="content" />
      </div>
      <!-- アクションボタン群 -->
      <ActionButtonGroup :actions="actions" @action="$emit('action', $event)" />
    </div>
    <div class="mt-2">
      <slot name="meta" />
    </div>
  </div>
</template>
```

#### 1.3 アクションボタン群コンポーネント (`ActionButtonGroup.vue`)
```vue
<!-- 統一されたアクションボタン -->
<template>
  <div class="flex gap-2">
    <CoolButton v-for="action in actions"
      :key="action.key"
      :variant="action.variant"
      :size="action.size || 'sm'"
      :aria-label="action.label"
      @click="$emit('action', action.key)"
      class="flex items-center gap-1">
      <Icon :name="action.icon" size="sm" />
      <span class="hidden sm:inline">{{ action.label }}</span>
    </CoolButton>
  </div>
</template>
```

**標準アクション定義**:
```javascript
// utils/actionDefinitions.js
export const STANDARD_ACTIONS = {
  view: { key: 'view', icon: 'eye', variant: 'secondary', label: 'detail' },
  edit: { key: 'edit', icon: 'pencil', variant: 'primary', label: 'edit' },
  duplicate: { key: 'duplicate', icon: 'copy', variant: 'warning', label: 'duplicate' },
  delete: { key: 'delete', icon: 'trash', variant: 'danger', label: 'delete' }
}
```

### Phase 2: フォーム系の統一化

#### 2.1 汎用フォームコンポーネント (`EntityForm.vue`)
```vue
<!-- 統一されたフォーム -->
<template>
  <form @submit.prevent="onSubmit">
    <FormFieldGroup :fields="formFields" v-model="formData" />
    
    <ActionButtonGroup :actions="formActions" @action="handleFormAction" />
  </form>
</template>
```

#### 2.2 フォームフィールドグループ (`FormFieldGroup.vue`)
```vue
<!-- 動的フォームフィールド生成 -->
<template>
  <div class="space-y-4">
    <FormField v-for="field in fields"
      :key="field.name"
      v-bind="field"
      :model-value="modelValue[field.name]"
      @update:modelValue="updateField(field.name, $event)" />
  </div>
</template>
```

**設定例**:
```javascript
// フォーム定義例
const projectFormFields = [
  { name: 'name', type: 'text', label: 'projectName', required: true },
  { name: 'description', type: 'textarea', label: 'description', rows: 15 }
]
```

### Phase 3: モーダル系の統一化

#### 3.1 汎用エンティティモーダル (`EntityModal.vue`)
```vue
<!-- 統一されたCRUDモーダル -->
<template>
  <Modal v-model:show="show" :title="modalTitle" :size="size">
    <EntityForm :fields="formFields" 
      :form-data="formData"
      :edit-mode="editMode"
      @submit="handleSubmit"
      @cancel="handleCancel" />
  </Modal>
</template>
```

### Phase 4: ページレベルの統一化

#### 4.1 RESTfulページパターンの標準化

現在のページ構造分析:
- **Index**: リスト表示 + 新規作成 (Project/Index, Script/Index)
- **Show**: 詳細表示 + 基本操作 (Script/Show)  
- **Edit**: 詳細編集 + タブ切り替え (Project/Edit, Script/Edit)
- **New**: 新規作成フォーム (Project/New)

#### 4.2 統一ページレイアウト (`EntityPageLayout.vue`)
```vue
<!-- 統一されたページレイアウト -->
<template>
  <BaseLayout>
    <PageContainer :max-width="maxWidth">
      <!-- ヘッダー部分 -->
      <EntityPageHeader 
        :title="pageTitle" 
        :subtitle="pageSubtitle"
        :show-back="showBack"
        @back="$emit('back')">
        <template #actions>
          <slot name="header-actions" />
        </template>
      </EntityPageHeader>
      
      <!-- メインコンテンツ -->
      <slot />
      
      <!-- フッター -->
      <div v-if="showFooter" class="mt-8 pt-4 border-t">
        <slot name="footer" />
      </div>
    </PageContainer>
  </BaseLayout>
</template>
```

#### 4.3 RESTfulページテンプレート群

##### IndexPageTemplate (`IndexPageTemplate.vue`)
```vue
<!-- Index系ページの統一テンプレート -->
<template>
  <EntityPageLayout 
    :page-title="$t(titleKey)"
    :max-width="maxWidth">
    
    <!-- ヘッダーアクション -->
    <template #header-actions>
      <CoolButton v-if="showCreateButton" variant="primary" @click="$emit('create')">
        <span class="hidden sm:inline">{{ $t('add') }}</span>
        <Icon name="plus" class="sm:ml-2 inline" />
      </CoolButton>
    </template>

    <!-- 空状態またはメインコンテンツ -->
    <EmptyState v-if="items.length === 0" 
      :icon="emptyIcon"
      :title="emptyTitle"
      :message="emptyMessage"
      :button-text="emptyButtonText"
      @action="$emit('create')" />
    
    <!-- タブまたはリスト表示 -->
    <component :is="contentComponent" v-bind="contentProps" v-on="contentEvents" />
  </EntityPageLayout>
</template>
```

##### ShowPageTemplate (`ShowPageTemplate.vue`)
```vue
<!-- Show系ページの統一テンプレート -->
<template>
  <EntityPageLayout 
    :page-title="item?.title || defaultTitle"
    :show-back="true"
    @back="$emit('back')">
    
    <!-- ヘッダーアクション -->
    <template #header-actions>
      <CoolButton @click="$emit('edit')" variant="primary">
        <Icon name="edit" class="mr-2" />
        {{ $t('edit') }}
      </CoolButton>
    </template>

    <!-- パンくずナビゲーション -->
    <BreadcrumbSystem v-if="showBreadcrumb" 
      :items="breadcrumbItems" 
      :use-auto-generate="autoGenerateBreadcrumb"
      @navigate="$emit('navigate', $event)" />

    <!-- 詳細表示 -->
    <EntityHeader :title="item?.title" :default-title="defaultTitle">
      <template #meta-info>
        <slot name="meta-info" :item="item" />
      </template>
      <template #details>
        <slot name="details" :item="item" />
      </template>
      <slot name="content" :item="item" />
    </EntityHeader>

    <!-- フッターアクション -->
    <template #footer>
      <div class="flex gap-4 justify-center">
        <CoolButton @click="$emit('duplicate')" variant="warning">
          <Icon name="copy" size="sm" />
          {{ $t('duplicate') }}
        </CoolButton>
        <slot name="footer-actions" :item="item" />
      </div>
    </template>
  </EntityPageLayout>
</template>
```

##### EditPageTemplate (`EditPageTemplate.vue`)
```vue
<!-- Edit系ページの統一テンプレート -->
<template>
  <EntityPageLayout 
    :page-title="editTitle"
    :max-width="maxWidth"
    :show-back="true"
    @back="$emit('back')">

    <!-- タブナビゲーション（複数タブの場合） -->
    <TabNavigation v-if="tabs.length > 1" 
      v-model="activeTab" 
      :tabs="tabs" />

    <!-- タブコンテンツ -->
    <div v-for="tab in tabs" :key="tab.id" v-show="activeTab === tab.id">
      <slot :name="`tab-${tab.id}`" :tab="tab" />
    </div>

    <!-- フッターアクション -->
    <template #footer>
      <div class="flex gap-4 justify-center">
        <CoolButton @click="$emit('save')" variant="success">
          <Icon name="check" size="sm" />
          {{ $t('save') }}
        </CoolButton>
        <CoolButton @click="$emit('cancel')" variant="secondary">
          {{ $t('cancel') }}
        </CoolButton>
        <slot name="footer-actions" />
      </div>
    </template>
  </EntityPageLayout>
</template>
```

##### NewPageTemplate (`NewPageTemplate.vue`)  
```vue
<!-- New系ページの統一テンプレート -->
<template>
  <EntityPageLayout 
    :page-title="`${$t('add')} ${$t(entityNameKey)}`"
    :show-back="true"
    @back="$emit('back')">

    <!-- ヘッダーアクション -->
    <template #header-actions>
      <CoolButton variant="secondary" @click="$emit('back')">
        <Icon name="arrow-left" class="mr-2" />
        {{ $t('back') }}
      </CoolButton>
    </template>

    <!-- フォームエリア -->
    <div class="bg-white shadow-sm rounded-lg p-6">
      <slot name="form" />
    </div>
  </EntityPageLayout>
</template>
```

#### 4.4 共通ナビゲーションコンポーネント

##### TabNavigation (`TabNavigation.vue`)
```vue
<!-- 統一されたタブナビゲーション -->
<template>
  <div class="border-b border-gray-200 mb-6">
    <nav class="-mb-px flex space-x-8">
      <button v-for="tab in tabs" 
        :key="tab.id"
        @click="$emit('update:modelValue', tab.id)"
        :class="tabClasses(tab.id)">
        {{ $t(tab.labelKey) }}
      </button>
    </nav>
  </div>
</template>
```

##### EntityPageHeader (`EntityPageHeader.vue`)
```vue
<!-- 統一されたページヘッダー -->
<template>
  <div class="flex items-center justify-between mb-6">
    <div class="flex items-center gap-3">
      <CoolButton v-if="showBack" 
        variant="ghost" 
        @click="$emit('back')"
        class="mr-2">
        <Icon name="arrow-left" />
      </CoolButton>
      <div>
        <h1 class="text-2xl font-bold">{{ title }}</h1>
        <p v-if="subtitle" class="text-gray-600 text-sm mt-1">{{ subtitle }}</p>
      </div>
    </div>
    <div class="flex gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
```

#### 1.4 統一パンくずナビゲーションシステム (`BreadcrumbSystem.vue`)

```vue
<!-- 統一されたパンくずナビゲーション -->
<template>
  <Breadcrumb :items="breadcrumbItems" @navigate="handleNavigate" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { generateBreadcrumbs } from '@/utils/breadcrumbHelper.js'

const props = defineProps({
  items: Array, // カスタムアイテム
  useAutoGenerate: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['navigate'])
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const breadcrumbItems = computed(() => {
  if (props.items) {
    return props.items
  }
  
  if (props.useAutoGenerate) {
    return generateBreadcrumbs(route, t)
  }
  
  return []
})

function handleNavigate(action) {
  if (action === 'back') {
    router.back()
  } else if (action === 'backToList') {
    // ルートに基づいてリストページに戻る
    const listPath = getListPath(route.path)
    router.push(listPath)
  } else {
    emit('navigate', action)
  }
}

function getListPath(currentPath) {
  if (currentPath.includes('/script/')) {
    return '/generate?tab=list'
  } else if (currentPath.includes('/project/')) {
    return '/project'
  }
  return '/'
}
</script>
```

**パンくず生成ヘルパー**:
```javascript
// utils/breadcrumbHelper.js
export function generateBreadcrumbs(route, t) {
  const pathSegments = route.path.split('/').filter(Boolean)
  const breadcrumbs = []
  
  // ルートパスに基づいてパンくずを生成
  switch (pathSegments[0]) {
    case 'project':
      breadcrumbs.push({ label: t('projectSettings'), to: '/project' })
      if (pathSegments[1] === 'new') {
        breadcrumbs.push({ label: t('add'), current: true })
      } else if (pathSegments[1] && pathSegments[2] === 'edit') {
        breadcrumbs.push({ label: t('edit'), current: true })
      }
      break
      
    case 'script':
      breadcrumbs.push({ label: t('scriptGeneration'), to: '/generate' })
      if (pathSegments[1]) {
        breadcrumbs.push({ 
          label: t('scriptDetail'), 
          to: `/script/${pathSegments[1]}`
        })
        if (pathSegments[2] === 'edit') {
          breadcrumbs.push({ label: t('edit'), current: true })
        }
      }
      break
      
    case 'generate':
      breadcrumbs.push({ label: t('scriptGeneration'), current: true })
      break
      
    case 'settings':
      breadcrumbs.push({ label: t('settings'), current: true })
      break
  }
  
  return breadcrumbs
}

// 標準パンくずパターン定義
export const BREADCRUMB_PATTERNS = {
  PROJECT_INDEX: () => [
    { label: 'projectSettings', current: true }
  ],
  PROJECT_NEW: () => [
    { label: 'projectSettings', to: '/project' },
    { label: 'add', current: true }
  ],
  PROJECT_EDIT: (projectName) => [
    { label: 'projectSettings', to: '/project' },
    { label: projectName || 'edit', current: true }
  ],
  SCRIPT_INDEX: () => [
    { label: 'scriptGeneration', current: true }
  ],
  SCRIPT_SHOW: (scriptTitle) => [
    { label: 'scriptGeneration', to: '/generate' },
    { label: 'createdList', to: '/generate?tab=list' },
    { label: scriptTitle || 'scriptDetail', current: true }
  ],
  SCRIPT_EDIT: (scriptTitle) => [
    { label: 'scriptGeneration', to: '/generate' },
    { label: scriptTitle || 'scriptDetail', to: `/script/${scriptTitle}` },
    { label: 'edit', current: true }
  ]
}
```
## 実装スケジュール

### Week 1: 基本コンポーネント
1. `ActionButtonGroup.vue` の作成と既存箇所への適用
2. `EntityCard.vue` の作成
3. `EmptyState.vue` の作成
4. `EntityPageHeader.vue` と `TabNavigation.vue` の作成
5. `BreadcrumbSystem.vue` と breadcrumbHelper.js の作成

### Week 2: リスト統一化
1. `EntityList.vue` の作成
2. ProjectList, ScriptList, ConfigList のリファクタリング
3. 動作確認とテスト

### Week 3: フォーム統一化
1. `FormFieldGroup.vue` の拡張
2. `EntityForm.vue` の作成
3. 既存フォームのリファクタリング

### Week 4: ページテンプレート統一化
1. `IndexPageTemplate.vue`, `ShowPageTemplate.vue` の作成
2. `EditPageTemplate.vue`, `NewPageTemplate.vue` の作成
3. 既存ページのリファクタリング

### Week 5: モーダル・総合テスト
1. `EntityModal.vue` の作成
2. 全体的な統合とテスト
3. パフォーマンス最適化

## 適用マトリクス

### ページ適用パターン
| ページタイプ | 使用テンプレート | 主要コンポーネント |
|-------------|-----------------|------------------|
| Project/Index | IndexPageTemplate | EntityList + ProjectCard |
| Project/Show | ShowPageTemplate | EntityHeader + ProjectDetails |
| Project/Edit | EditPageTemplate | TabNavigation + EntityForm |
| Project/New | NewPageTemplate | EntityForm |
| Script/Index | IndexPageTemplate | Tabs + EntityList |
| Script/Show | ShowPageTemplate | EntityHeader + ScriptContent |
| Script/Edit | EditPageTemplate | ScriptEditor + LLMConfig |
| Settings/Index | IndexPageTemplate | ConfigList + LLMConfigForm |

### パンくず適用パターン
| ページタイプ | パンくず表示 | パターン |
|-------------|-------------|----------|
| Home/Index | なし | - |
| Project/Index | あり | PROJECT_INDEX |
| Project/New | あり | PROJECT_NEW |
| Project/Edit | あり | PROJECT_EDIT |
| Script/Index | あり | SCRIPT_INDEX |
| Script/Show | あり | SCRIPT_SHOW |
| Script/Edit | あり | SCRIPT_EDIT |
| Settings/Index | あり | 自動生成 |

### 共通パターンの抽出結果
1. **タブ切り替えパターン**: Script/Index, Project/Edit で使用
2. **リスト + アクションパターン**: すべてのIndex系ページ
3. **詳細表示 + 編集パターン**: すべてのShow系ページ  
4. **フォーム + 保存パターン**: すべてのNew/Edit系ページ

## 期待される効果

### 開発効率向上
- 新機能追加時のコード量削減（推定60%削減）
- 既存機能の改修時間短縮
- バグ修正の影響範囲明確化

### 保守性向上
- コンポーネントの責務明確化
- デザインシステムの統一
- テストカバレッジの向上

### ユーザー体験向上
- UI の一貫性確保
- 操作パターンの統一
- パフォーマンス最適化

## 移行戦略

### 段階的移行
1. 新機能から新コンポーネントを使用
2. 既存機能を順次リファクタリング
3. 旧コンポーネントの段階的廃止

### 互換性確保
- 既存APIとの互換性維持
- プロダクションへの影響最小化
- ロールバック可能な設計

### 品質保証
- 各Phase後の動作確認
- ユニットテスト追加
- E2Eテストの更新