<!-- 字典管理页面 -->
<template>
  <div class="dict-page art-full-height">
    <!-- 搜索栏 -->
    <DictSearch
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
          <ElButton v-auth="'dict:add'" @click="handleAdd" v-ripple> 新增字典 </ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
        </template>
      </ArtTableHeader>

      <!-- 树形表格 -->
      <ArtTable
        ref="tableRef"
        row-key="id"
        :loading="loading"
        :columns="columns"
        :data="tableData"
        :stripe="false"
        :tree-props="{ children: 'children' }"
        :default-expand-all="isExpanded"
        @row-click="handleRowClick"
      />

      <!-- 字典弹窗 -->
      <DictDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :edit-data="editData"
        :preset-type-code="presetTypeCode"
        :preset-type-name="presetTypeName"
        @submit="handleSubmit"
      />

      <!-- 字典类型弹窗 -->
      <DictTypeDialog
        v-model:visible="typeDialogVisible"
        :type="typeDialogType"
        :edit-data="editTypeData"
        @submit="handleTypeSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { h, ref, computed, onMounted } from 'vue'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import { useDictStore } from '@/store/modules/dict'
  import DictSearch from './modules/dict-search.vue'
  import DictDialog from './modules/dict-dialog.vue'
  import DictTypeDialog from './modules/dict-type-dialog.vue'
  import { createSmartDebounce } from '@/utils/table/tableUtils'
  import {
    fetchCreateDict,
    fetchUpdateDict,
    fetchDeleteDict,
    fetchDeleteDictType
  } from '@/api/dict'
  import { DialogType } from '@/types'
  import { ENABLE_STATUS_CONFIG } from '@/constants/enums'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'Dict' })

  type DictTreeItem = Api.SystemManage.DictTreeItem
  type DictData = Api.SystemManage.DictData

  // 联合类型，用于表格行数据
  type DictRow = DictTreeItem | DictData

  const { hasAuth } = useAuth()

  // Store
  const dictStore = useDictStore()

  // 状态管理
  const loading = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()
  const showSearchBar = ref(false)

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogType = ref<DialogType>('add')
  const editData = ref<DictData | null>(null)
  const presetTypeCode = ref<string | undefined>(undefined)
  const presetTypeName = ref<string | undefined>(undefined)

  // 字典类型弹窗相关
  const typeDialogVisible = ref(false)
  const typeDialogType = ref<DialogType>('edit')
  const editTypeData = ref<DictTreeItem | null>(null)

  // 表格数据 - 从 store 读取，并根据搜索条件过滤
  const tableData = computed(() => {
    const data = dictStore.treeData
    const filters = searchForm.value

    // 如果没有搜索条件，直接返回所有数据
    if (
      !filters.typeCode &&
      !filters.typeName &&
      !filters.typeStatus &&
      !filters.dataLabel &&
      !filters.dataValue &&
      !filters.status
    ) {
      return data.map((item) => ({
        ...item,
        id: `type_${item.typeCode}`
      }))
    }

    // 根据搜索条件过滤
    return data
      .map((item) => {
        // 过滤类型节点
        if (filters.typeCode && !item.typeCode.includes(filters.typeCode)) {
          return null
        }
        if (filters.typeName && !item.typeName.includes(filters.typeName)) {
          return null
        }
        if (filters.typeStatus && item.typeStatus !== filters.typeStatus) {
          return null
        }

        // 过滤子节点（创建新对象，不修改原数据）
        let filteredChildren = item.children
        if (filters.dataLabel || filters.dataValue || filters.status) {
          filteredChildren = item.children.filter((child) => {
            if (filters.dataLabel && !child.dataLabel.includes(filters.dataLabel)) {
              return false
            }
            if (filters.dataValue && !child.dataValue.includes(filters.dataValue)) {
              return false
            }
            if (filters.status && child.status !== filters.status) {
              return false
            }
            return true
          })
        }

        // 如果过滤后没有子节点，不显示该类型节点
        if (filteredChildren.length === 0) {
          return null
        }

        // 返回新对象，包含过滤后的子节点
        return {
          ...item,
          children: filteredChildren,
          id: `type_${item.typeCode}`
        }
      })
      .filter((item): item is DictTreeItem & { id: string } => item !== null)
  })

  // 搜索表单
  const searchForm = ref<Api.SystemManage.DictTreeSearchParams>({
    typeCode: undefined,
    typeName: undefined,
    typeStatus: undefined,
    dataLabel: undefined,
    dataValue: undefined,
    status: undefined
  })

  /**
   * 获取字典状态配置
   */
  const getDictStatusConfig = (status: string) => {
    return (
      ENABLE_STATUS_CONFIG[status as keyof typeof ENABLE_STATUS_CONFIG] || {
        type: 'info' as const,
        text: '未知'
      }
    )
  }

  /**
   * 判断是否为类型节点
   */
  const isTypeNode = (row: DictRow): row is DictTreeItem => {
    return 'isType' in row && row.isType === true
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'typeName',
      label: '字典类型名称',
      minWidth: 150,
      formatter: (row: DictRow) => {
        if (isTypeNode(row)) {
          return h('span', { class: 'font-medium' }, row.typeName)
        }
        return (row as DictData).typeName
      }
    },
    {
      prop: 'typeCode',
      label: '字典类型编码',
      minWidth: 150,
      formatter: (row: DictRow) => {
        if (isTypeNode(row)) {
          return h('span', { class: 'font-medium' }, row.typeCode)
        }
        return (row as DictData).typeCode
      }
    },
    {
      prop: 'dataLabel',
      label: '字典标签',
      minWidth: 120,
      formatter: (row: DictRow) => {
        if (isTypeNode(row)) {
          return h('span', { class: 'text-g-500' }, `共 ${row.dataCount || 0} 项`)
        }
        return (row as DictData).dataLabel
      }
    },
    {
      prop: 'dataValue',
      label: '字典值',
      minWidth: 120,
      formatter: (row: DictRow) => {
        if (isTypeNode(row)) return ''
        return (row as DictData).dataValue
      }
    },
    {
      prop: 'sortOrder',
      label: '排序',
      width: 80,
      formatter: (row: DictRow) => {
        if (isTypeNode(row)) return ''
        return (row as DictData).sortOrder
      }
    },
    {
      prop: 'status',
      label: '状态',
      width: 100,
      formatter: (row: DictRow) => {
        if (isTypeNode(row)) {
          // 类型节点显示类型状态
          const typeStatus = (row as DictTreeItem).typeStatus
          const config = getDictStatusConfig(typeStatus)
          return h(ElTag, { type: config.type }, () => config.text)
        }
        // 数据节点显示数据状态
        const status = (row as DictData).status
        const config = getDictStatusConfig(status)
        return h(ElTag, { type: config.type }, () => config.text)
      }
    },
    {
      prop: 'isDefault',
      label: '默认值',
      width: 100,
      formatter: (row: DictRow) => {
        if (isTypeNode(row)) return ''
        const isDefault = (row as DictData).isDefault
        return isDefault
          ? h(ElTag, { type: 'success' }, () => '是')
          : h(ElTag, { type: 'info' }, () => '否')
      }
    },
    {
      prop: 'operation',
      label: '操作',
      width: 160,
      fixed: 'right',
      formatter: (row: DictRow) => {
        // 如果是类型节点，显示新增、编辑和删除按钮
        if (isTypeNode(row)) {
          const typeNode = row as DictTreeItem
          return h('div', { class: 'dict-operation-buttons' }, [
            h(ArtButtonTable, {
              type: 'add',
              show: hasAuth('dict:add'),
              onClick: () => handleAddDictForType(typeNode)
            }),
            h(ArtButtonTable, {
              type: 'edit',
              show: hasAuth('dict:edit'),
              onClick: () => handleEditType(typeNode)
            }),
            h(ArtButtonTable, {
              type: 'delete',
              show: hasAuth('dict:delete'),
              onClick: () => handleDeleteType(typeNode)
            })
          ])
        }

        // 子节点（字典数据）显示操作按钮
        const dictData = row as DictData
        return h('div', { class: 'dict-operation-buttons' }, [
          h(ArtButtonTable, {
            type: 'edit',
            show: hasAuth('dict:edit'),
            onClick: () => handleEdit(dictData)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            show: hasAuth('dict:delete'),
            onClick: () => handleDelete(dictData)
          })
        ])
      }
    }
  ])

  /**
   * 刷新字典数据
   * 调用 store 的刷新方法，从服务器获取最新数据
   */
  const refreshDictData = async () => {
    loading.value = true
    try {
      await dictStore.refreshDictData()
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '刷新字典数据失败')
    } finally {
      loading.value = false
    }
  }

  // 防抖版本的刷新函数
  const debouncedRefreshDictData = createSmartDebounce(refreshDictData, 300)

  /**
   * 切换展开/收起
   */
  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value
    // 切换所有行的展开状态
    tableData.value.forEach((row) => {
      if (row.isType && tableRef.value?.elTableRef) {
        tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
      }
    })
  }

  /**
   * 处理行点击事件
   * 如果点击的是类型节点（父级行），则切换展开/折叠状态
   * 但如果点击的是操作按钮，则不触发展开/折叠
   */
  const handleRowClick = (row: DictRow, column: any) => {
    // 如果点击的是操作列、操作按钮或其父元素，则不触发展开/折叠
    if (column?.property === 'operation') {
      return
    }

    // 判断是否为类型节点（父级行）
    if (isTypeNode(row) && tableRef.value?.elTableRef) {
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
    // 如果需要从服务器搜索，可以调用 refreshDictData()
  }

  /**
   * 处理重置
   */
  const handleReset = () => {
    searchForm.value = {
      typeCode: undefined,
      typeName: undefined,
      typeStatus: undefined,
      dataLabel: undefined,
      dataValue: undefined,
      status: undefined
    }
    // 重置后不需要重新请求，computed 会自动显示所有数据
  }

  /**
   * 处理刷新
   * 从服务器刷新字典数据（带防抖）
   */
  const handleRefresh = () => {
    debouncedRefreshDictData()
  }

  /**
   * 处理新增
   */
  const handleAdd = () => {
    dialogType.value = 'add'
    editData.value = null
    presetTypeCode.value = undefined
    presetTypeName.value = undefined
    dialogVisible.value = true
  }

  /**
   * 处理为指定类型新增字典数据
   */
  const handleAddDictForType = (typeNode: DictTreeItem) => {
    dialogType.value = 'add'
    editData.value = null
    presetTypeCode.value = typeNode.typeCode
    presetTypeName.value = typeNode.typeName
    dialogVisible.value = true
  }

  /**
   * 处理编辑
   */
  const handleEdit = (row: DictData) => {
    dialogType.value = 'edit'
    editData.value = { ...row }
    dialogVisible.value = true
  }

  /**
   * 处理删除
   */
  const handleDelete = async (row: DictData) => {
    try {
      await ElMessageBox.confirm(`确定要删除字典 "${row.dataLabel}" 吗？`, '提示', {
        type: 'warning'
      })
      await fetchDeleteDict(row.id)
      ElMessage.success('删除成功')
      // 刷新 store 中的数据（带防抖）
      await debouncedRefreshDictData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(error instanceof Error ? error.message : '删除失败')
      }
    }
  }

  /**
   * 处理弹窗提交
   */
  const handleSubmit = async (
    formData: Api.SystemManage.CreateDictParams | Api.SystemManage.UpdateDictParams
  ) => {
    try {
      if (dialogType.value === 'add') {
        await fetchCreateDict(formData as Api.SystemManage.CreateDictParams)
        ElMessage.success('新增成功')
      } else {
        if (!editData.value) return
        await fetchUpdateDict(editData.value.id, formData as Api.SystemManage.UpdateDictParams)
        ElMessage.success('更新成功')
      }
      dialogVisible.value = false
      // 刷新 store 中的数据（带防抖）
      await debouncedRefreshDictData()
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '操作失败')
    }
  }

  /**
   * 处理编辑字典类型
   */
  const handleEditType = (row: DictTreeItem) => {
    typeDialogType.value = 'edit'
    editTypeData.value = { ...row }
    typeDialogVisible.value = true
  }

  /**
   * 处理删除字典类型
   */
  const handleDeleteType = async (row: DictTreeItem) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除字典类型 "${row.typeName}" 吗？删除后将删除该类型下的所有字典数据（共 ${row.dataCount || 0} 项）`,
        '提示',
        {
          type: 'warning'
        }
      )
      await fetchDeleteDictType(row.typeCode)
      ElMessage.success('删除成功')
      // 刷新 store 中的数据（带防抖）
      await debouncedRefreshDictData()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(error instanceof Error ? error.message : '删除失败')
      }
    }
  }

  /**
   * 处理字典类型弹窗提交
   */
  const handleTypeSubmit = async () => {
    // 刷新 store 中的数据（带防抖）
    await debouncedRefreshDictData()
  }

  onMounted(() => {
    // 如果 store 中没有数据，则刷新；否则直接使用 store 中的数据（带防抖）
    if (dictStore.treeData.length === 0) {
      debouncedRefreshDictData()
    }
  })
</script>
