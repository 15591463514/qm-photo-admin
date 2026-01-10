<!-- 标签管理页面 -->
<template>
  <div class="tag-page art-full-height">
    <!-- 搜索栏 -->
    <TagSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="handleReset"
    />

    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <!-- 表格头部 -->
      <ArtTableHeader
        :showZebra="false"
        :loading="loading"
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        @refresh="handleRefresh"
      >
        <template #left>
          <ElButton v-auth="'tag:add'" @click="handleAdd" v-ripple> 新增标签 </ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
          <ElButton
            v-if="selectedRows.length > 0"
            v-auth="'tag:delete'"
            type="danger"
            plain
            v-ripple
            :disabled="loading"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedRows.length }})
          </ElButton>
        </template>
      </ArtTableHeader>

      <!-- 树形表格 -->
      <ArtTable
        table-layout="auto"
        ref="tableRef"
        row-key="id"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :stripe="false"
        :tree-props="{ children: 'children' }"
        :default-expand-all="isExpanded"
        @row-click="handleRowClick"
        @selection-change="handleSelectionChange"
      />

      <!-- 标签弹窗 -->
      <TagDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :edit-data="editData"
        :preset-group-code="presetGroupCode"
        :preset-group-name="presetGroupName"
        @submit="handleSubmit"
      />

      <!-- 标签组弹窗 -->
      <TagGroupDialog
        v-model:visible="groupDialogVisible"
        :type="groupDialogType"
        :edit-data="editGroupData"
        @submit="handleGroupSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { h, ref, computed, onMounted } from 'vue'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { useTagStore } from '@/store/modules/tag'
  import TagSearch from './modules/tag-search.vue'
  import TagDialog from './modules/tag-dialog.vue'
  import TagGroupDialog from './modules/tag-group-dialog.vue'
  import { createSmartDebounce } from '@/utils/table/tableUtils'
  import { fetchCreateTag, fetchUpdateTag, fetchDeleteTag, fetchBatchDeleteTag } from '@/api/tag'
  import { DialogType } from '@/types'
  import { STATUS_CONFIG } from '@/constants/enums'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'Tag' })

  type TagTreeItem = Api.Tag.TagTreeItem
  type TagData = Api.Tag.TagData

  // 联合类型，用于表格行数据
  type TagRow = TagTreeItem | TagData

  const { hasAuth } = useAuth()

  // Store
  const tagStore = useTagStore()

  // 状态管理
  const loading = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()
  const showSearchBar = ref(false)
  const selectedRows = ref<TagData[]>([])
  // 标志位，用于防止在联动勾选时触发循环
  const isSyncingSelection = ref(false)
  // 保存上一次选中的标签组，用于判断哪些标签组被取消选中
  const previousSelectedGroups = ref<string[]>([])

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogType = ref<DialogType>('add')
  const editData = ref<TagData | null>(null)
  const presetGroupCode = ref<string | undefined>(undefined)
  const presetGroupName = ref<string | undefined>(undefined)

  // 标签组弹窗相关
  const groupDialogVisible = ref(false)
  const groupDialogType = ref<DialogType>('edit')
  const editGroupData = ref<TagTreeItem | null>(null)

  // 表格数据 - 从 store 读取，并根据搜索条件过滤
  const tableData = computed(() => {
    const data = tagStore.treeData
    const filters = searchForm.value

    // 如果没有搜索条件，直接返回所有数据
    if (
      !filters.groupCode &&
      !filters.groupName &&
      filters.groupStatus === undefined &&
      !filters.label &&
      !filters.value &&
      filters.status === undefined
    ) {
      return data.map((item) => ({
        ...item,
        id: `group_${item.groupCode}`
      }))
    }

    // 根据搜索条件过滤
    return data
      .map((item) => {
        // 过滤组节点
        if (filters.groupCode && !item.groupCode.includes(filters.groupCode)) {
          return null
        }
        if (filters.groupName && !item.groupName.includes(filters.groupName)) {
          return null
        }
        if (filters.groupStatus !== undefined && item.groupStatus !== filters.groupStatus) {
          return null
        }

        // 过滤子节点（创建新对象，不修改原数据）
        let filteredChildren = item.children
        if (filters.label || filters.value || filters.status !== undefined) {
          filteredChildren = item.children.filter((child) => {
            if (filters.label && !child.label.includes(filters.label)) {
              return false
            }
            if (filters.value && !child.value.includes(filters.value)) {
              return false
            }
            if (filters.status !== undefined && child.status !== filters.status) {
              return false
            }
            return true
          })
        }

        // 如果过滤后没有子节点，不显示该组节点
        if (filteredChildren.length === 0) {
          return null
        }

        // 返回新对象，包含过滤后的子节点
        return {
          ...item,
          children: filteredChildren,
          id: `group_${item.groupCode}`
        }
      })
      .filter((item): item is TagTreeItem & { id: string } => item !== null)
  })

  // 搜索表单
  const searchForm = ref<Api.Tag.TagTreeSearchParams>({
    groupCode: undefined,
    groupName: undefined,
    groupStatus: undefined,
    label: undefined,
    value: undefined,
    status: undefined
  })

  /**
   * 获取标签状态配置
   */
  const getTagStatusConfig = (status: number) => {
    return (
      STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  /**
   * 判断是否为组节点
   */
  const isGroupNode = (row: TagRow): row is TagTreeItem => {
    return 'isGroup' in row && row.isGroup === true
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      type: 'selection',
      width: 55,
      selectable: () => true
    },
    {
      prop: 'groupName',
      label: '标签组名称',
      minWidth: 150,
      formatter: (row: TagRow) => {
        if (isGroupNode(row)) {
          return h('span', { class: 'font-medium' }, row.groupName)
        }
        return (row as TagData).groupName
      }
    },
    {
      prop: 'groupCode',
      label: '标签组代码',
      minWidth: 150,
      formatter: (row: TagRow) => {
        if (isGroupNode(row)) {
          return h('span', { class: 'font-medium' }, row.groupCode)
        }
        return (row as TagData).groupCode
      }
    },
    {
      prop: 'label',
      label: '标签名',
      minWidth: 120,
      formatter: (row: TagRow) => {
        if (isGroupNode(row)) {
          return h('span', { class: 'text-g-500' }, `共 ${row.tagCount || 0} 项`)
        }
        return (row as TagData).label
      }
    },
    {
      prop: 'value',
      label: '标签值',
      minWidth: 120,
      formatter: (row: TagRow) => {
        if (isGroupNode(row)) return ''
        return (row as TagData).value
      }
    },
    {
      prop: 'sort',
      label: '排序',
      width: 80,
      formatter: (row: TagRow) => {
        if (isGroupNode(row)) return ''
        return (row as TagData).sort
      }
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      formatter: (row: TagRow) => {
        if (isGroupNode(row)) {
          // 组节点显示组状态
          const groupStatus = (row as TagTreeItem).groupStatus
          const config = getTagStatusConfig(groupStatus)
          return h(ElTag, { type: config.type }, () => config.text)
        }
        // 数据节点显示数据状态
        const status = (row as TagData).status
        const config = getTagStatusConfig(status)
        return h(ElTag, { type: config.type }, () => config.text)
      }
    },
    {
      prop: 'operation',
      label: '操作',
      width: 160,
      fixed: 'right',
      formatter: (row: TagRow) => {
        // 如果是组节点，显示新增和编辑按钮
        if (isGroupNode(row)) {
          const groupNode = row as TagTreeItem
          return h('div', { class: 'tag-operation-buttons' }, [
            h(ArtButtonTable, {
              type: 'add',
              show: hasAuth('tag:add'),
              onClick: () => handleAddTagForGroup(groupNode)
            }),
            h(ArtButtonTable, {
              type: 'edit',
              show: hasAuth('tag:group:edit'),
              onClick: () => handleEditGroup(groupNode)
            })
          ])
        }

        // 子节点（标签数据）显示操作按钮
        const tagData = row as TagData
        return h('div', { class: 'tag-operation-buttons' }, [
          h(ArtButtonTable, {
            type: 'edit',
            show: hasAuth('tag:edit'),
            onClick: () => handleEdit(tagData)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            show: hasAuth('tag:delete'),
            onClick: () => handleDelete(tagData)
          })
        ])
      }
    }
  ])

  /**
   * 刷新标签数据
   * 调用 store 的刷新方法，从服务器获取最新数据
   */
  const refreshTagData = async () => {
    loading.value = true
    try {
      await tagStore.refreshTagData()
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '刷新标签数据失败')
    } finally {
      loading.value = false
    }
  }

  // 防抖版本的刷新函数
  const debouncedRefreshTagData = createSmartDebounce(refreshTagData, 300)

  /**
   * 切换展开/收起
   */
  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    // 切换所有行的展开状态
    tableData.value.forEach((row) => {
      if (row.isGroup && tableRef.value?.elTableRef) {
        tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
      }
    })
  }

  /**
   * 处理行点击事件
   * 如果点击的是组节点（父级行），则切换展开/折叠状态
   * 但如果点击的是操作按钮，则不触发展开/折叠
   */
  const handleRowClick = (row: TagRow, column: any) => {
    // 如果点击的是操作列、操作按钮或其父元素，则不触发展开/折叠
    if (column?.property === 'operation') {
      return
    }

    // 判断是否为组节点（父级行）
    if (isGroupNode(row) && tableRef.value?.elTableRef) {
      // 切换该行的展开/折叠状态
      tableRef.value.elTableRef.toggleRowExpansion(row)
    }
  }

  /**
   * 处理搜索
   * 搜索时在前端过滤 store 中的数据
   */
  const handleSearch = () => {
    // 搜索时不需要重新请求，computed 会自动过滤
    // 如果需要从服务器搜索，可以调用 refreshTagData()
  }

  /**
   * 处理重置
   */
  const handleReset = () => {
    searchForm.value = {
      groupCode: undefined,
      groupName: undefined,
      groupStatus: undefined,
      label: undefined,
      value: undefined,
      status: undefined
    }
    // 重置后不需要重新请求，computed 会自动显示所有数据
  }

  /**
   * 处理刷新
   * 从服务器刷新标签数据（带防抖）
   */
  const handleRefresh = () => {
    debouncedRefreshTagData()
  }

  /**
   * 处理新增
   */
  const handleAdd = () => {
    dialogType.value = 'add'
    editData.value = null
    presetGroupCode.value = undefined
    presetGroupName.value = undefined
    dialogVisible.value = true
  }

  /**
   * 处理为指定组新增标签数据
   */
  const handleAddTagForGroup = (groupNode: TagTreeItem) => {
    dialogType.value = 'add'
    editData.value = null
    presetGroupCode.value = groupNode.groupCode
    presetGroupName.value = groupNode.groupName
    dialogVisible.value = true
  }

  /**
   * 处理编辑
   */
  const handleEdit = (row: TagData) => {
    dialogType.value = 'edit'
    editData.value = { ...row }
    dialogVisible.value = true
  }

  /**
   * 处理删除
   */
  const handleDelete = async (row: TagData) => {
    try {
      await ElMessageBox.confirm(`确定要删除标签 "${row.label}" 吗？`, '提示', {
        type: 'warning'
      })
      await fetchDeleteTag(row.id)
      ElMessage.success('删除成功')
      // 从选中列表中移除
      selectedRows.value = selectedRows.value.filter((item) => item.id !== row.id)
      // 刷新 store 中的数据（带防抖）
      await debouncedRefreshTagData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(error instanceof Error ? error.message : '删除失败')
      }
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: TagRow[]) => {
    // 如果正在同步选择状态，直接返回，避免循环触发
    if (isSyncingSelection.value) {
      // 更新选中列表：只保留标签项（过滤掉标签组）
      selectedRows.value = selection.filter((row) => !isGroupNode(row)) as TagData[]
      // 更新上一次选中的标签组
      const currentSelectedGroups = selection
        .filter((row) => isGroupNode(row))
        .map((row) => (row as TagTreeItem).groupCode)
      previousSelectedGroups.value = currentSelectedGroups
      return
    }

    // 获取当前选中的标签组
    const selectedGroups = selection.filter((row) => isGroupNode(row)) as TagTreeItem[]
    const currentSelectedGroupCodes = selectedGroups.map((g) => g.groupCode)

    // 获取当前选中的标签项
    const selectedTags = selection.filter((row) => !isGroupNode(row)) as TagData[]

    // 获取所有标签组（从tableData中获取，因为需要完整的children信息）
    const allGroups = tableData.value.filter((row) => isGroupNode(row)) as TagTreeItem[]

    // 设置同步标志，防止循环触发
    isSyncingSelection.value = true

    try {
      // 找出新选中的标签组（在当前选中但不在上一次选中的）
      const newlySelectedGroupCodes = currentSelectedGroupCodes.filter(
        (code: string) => !previousSelectedGroups.value.includes(code)
      )

      // 处理标签组勾选联动：如果选中了标签组，自动选中该组下的所有标签
      if (newlySelectedGroupCodes.length > 0 && tableRef.value?.elTableRef) {
        newlySelectedGroupCodes.forEach((groupCode) => {
          const group = allGroups.find((g) => g.groupCode === groupCode)
          if (group) {
            // 找到该组下的所有标签
            const groupTags = group.children || []
            groupTags.forEach((tag) => {
              // 如果该标签还没有被选中，则选中它
              const isAlreadySelected = selectedTags.some((t) => t.id === tag.id)
              if (!isAlreadySelected) {
                tableRef.value.elTableRef.toggleRowSelection(tag, true)
              }
            })
          }
        })
      }

      // 找出新取消选中的标签组（在上一次选中但不在当前选中的）
      const newlyUnselectedGroupCodes = previousSelectedGroups.value.filter(
        (code: string) => !currentSelectedGroupCodes.includes(code)
      )

      // 处理标签组取消勾选联动：如果取消选中了标签组，自动取消选中该组下的所有标签
      if (newlyUnselectedGroupCodes.length > 0 && tableRef.value?.elTableRef) {
        newlyUnselectedGroupCodes.forEach((groupCode: string) => {
          const group = allGroups.find((g) => g.groupCode === groupCode)
          if (group) {
            // 找到该组下的所有标签
            const groupTags = group.children || []
            groupTags.forEach((tag) => {
              // 如果该标签被选中了，则取消选中
              const isSelected = selectedTags.some((t) => t.id === tag.id)
              if (isSelected) {
                tableRef.value.elTableRef.toggleRowSelection(tag, false)
              }
            })
          }
        })
      }

      // 更新选中列表：只保留标签项（过滤掉标签组）
      // 需要重新获取最新的selection，因为可能已经触发了联动
      const latestSelection = (tableRef.value?.elTableRef?.getSelectionRows() || []) as TagRow[]
      selectedRows.value = latestSelection.filter((row: TagRow) => !isGroupNode(row)) as TagData[]

      // 更新上一次选中的标签组
      previousSelectedGroups.value = currentSelectedGroupCodes
    } finally {
      // 重置同步标志
      isSyncingSelection.value = false
    }
  }

  /**
   * 处理批量删除
   */
  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的标签')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个标签吗？`,
        '批量删除',
        {
          type: 'warning'
        }
      )

      const ids = selectedRows.value.map((row) => row.id)
      const result = await fetchBatchDeleteTag(ids)
      ElMessage.success(`成功删除 ${result.count} 个标签`)
      selectedRows.value = []
      // 刷新 store 中的数据（带防抖）
      await debouncedRefreshTagData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(error instanceof Error ? error.message : '批量删除失败')
      }
    }
  }

  /**
   * 处理弹窗提交
   */
  const handleSubmit = async (formData: Api.Tag.BatchCreateTagParams | Api.Tag.UpdateTagParams) => {
    try {
      if (dialogType.value === 'add') {
        await fetchCreateTag(formData as Api.Tag.BatchCreateTagParams)
        ElMessage.success('新增成功')
      } else {
        if (!editData.value) return
        await fetchUpdateTag(editData.value.id, formData as Api.Tag.UpdateTagParams)
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      // 刷新 store 中的数据（带防抖）
      await debouncedRefreshTagData()
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '操作失败')
    }
  }

  /**
   * 处理编辑标签组
   */
  const handleEditGroup = (row: TagTreeItem) => {
    groupDialogType.value = 'edit'
    editGroupData.value = { ...row }
    groupDialogVisible.value = true
  }

  /**
   * 处理标签组弹窗提交
   */
  const handleGroupSubmit = async () => {
    // 刷新 store 中的数据（带防抖）
    await debouncedRefreshTagData()
  }

  onMounted(() => {
    // 如果 store 中没有数据，则刷新；否则直接使用 store 中的数据（带防抖）
    if (tagStore.treeData.length === 0) {
      debouncedRefreshTagData()
    }
  })
</script>
