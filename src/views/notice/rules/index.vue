<template>
  <div class="rules-page art-full-height">
    <!-- 搜索栏 -->
    <RulesSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></RulesSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElButton v-auth="'notice:rules:add'" @click="showDialog('add')" v-ripple>
            新增规则
          </ElButton>
          <ElButton
            v-if="selectedRows.length > 0"
            v-auth="'notice:rules:edit'"
            type="success"
            plain
            v-ripple
            :disabled="loading"
            @click="handleBatchToggleStatus(NoticeStatusEnum.OPEN)"
          >
            批量启用 ({{ selectedRows.length }})
          </ElButton>
          <ElButton
            v-if="selectedRows.length > 0"
            v-auth="'notice:rules:edit'"
            type="warning"
            plain
            v-ripple
            :disabled="loading"
            @click="handleBatchToggleStatus(NoticeStatusEnum.CLOSE)"
          >
            批量禁用 ({{ selectedRows.length }})
          </ElButton>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        table-layout="auto"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 规则弹窗 -->
      <RulesDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :rule-data="currentRuleData"
        @submit="handleDialogSubmit"
      />

      <!-- 测试弹窗 -->
      <RulesTestDialog v-model:visible="testDialogVisible" :rule-data="currentTestRuleData" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElButton, ElTag, ElSwitch, ElMessageBox, ElMessage } from 'element-plus'
  import { nextTick } from 'vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchRulesList, deleteRule as deleteRuleApi, batchToggleRuleStatus } from '@/api/notice'
  import type { NoticeRule } from '@/types/notice'
  import { NoticeStatusEnum, NoticeModeEnum, NoticeModeText } from '@/types/notice'
  import { DialogType } from '@/types'
  import RulesSearch from './modules/rules-search.vue'
  import RulesDialog from './modules/rules-dialog.vue'
  import RulesTestDialog from './modules/rules-test-dialog.vue'
  import { useAuth } from '@/hooks/core/useAuth'
  import { useDictStore } from '@/store/modules/dict'
  import { STATUS_SWITCH_CONFIG } from '@/constants/components'

  defineOptions({ name: 'NoticeRules' })

  const { hasAuth } = useAuth()
  const dictStore = useDictStore()

  const showSearchBar = ref(false)

  // 弹窗相关
  const dialogType = ref<DialogType>('add')
  const dialogVisible = ref(false)
  const currentRuleData = ref<Partial<NoticeRule>>({})

  // 测试弹窗相关
  const testDialogVisible = ref(false)
  const currentTestRuleData = ref<Partial<NoticeRule>>({})

  // 选中行
  const selectedRows = ref<NoticeRule[]>([])

  // 搜索表单
  const searchForm = ref({
    msgSource: undefined,
    msgType: undefined
  })

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getDataDebounced,
    searchParams,
    resetSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData
  } = useTable({
    core: {
      apiFn: fetchRulesList,
      apiParams: {
        current: 1,
        size: 10
      },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'ruleName',
          label: '规则名称',
          minWidth: 150
        },
        {
          prop: 'msgSource',
          label: '消息来源',
          minWidth: 120
        },
        {
          prop: 'msgType',
          label: '消息类型',
          minWidth: 120,
          formatter: (row: NoticeRule) => {
            const dictData = dictStore.getDictData('msg_type', row.msgType || '')
            const tagStyle = dictData?.tagStyle || 'info'
            const displayText = row.msgType || '-'
            return h(ElTag, { type: tagStyle as any }, () => displayText)
          }
        },
        {
          prop: 'noticeMode',
          label: '通知方式',
          minWidth: 100,
          formatter: (row: NoticeRule) => {
            return h(
              ElTag,
              { type: 'primary' },
              () => NoticeModeText[row.noticeMode as NoticeModeEnum]
            )
          }
        },
        {
          prop: 'noticeAddress',
          label: '通知地址',
          minWidth: 200,
          showOverflowTooltip: true
        },
        {
          prop: 'noticeStatus',
          label: '状态',
          minWidth: 100,
          formatter: (row: NoticeRule & { _statusLoading?: boolean }) => {
            return h(ElSwitch, {
              modelValue: row.noticeStatus === NoticeStatusEnum.OPEN,
              loading: row._statusLoading || false,
              ...STATUS_SWITCH_CONFIG,
              onChange: (value) => {
                handleToggleStatus(row, value as boolean)
              }
            })
          }
        },
        {
          prop: 'createTime',
          label: '创建时间',
          minWidth: 180
        },
        {
          prop: 'operation',
          label: '操作',
          minWidth: 200,
          fixed: 'right',
          formatter: (row: NoticeRule) =>
            h('div', { style: 'display: flex;' }, [
              h(ArtButtonTable, {
                icon: 'ri:send-plane-2-line',
                iconClass: 'bg-info/12 text-info',
                tooltipContent: '测试',
                show: hasAuth('notice:rules:edit'),
                onClick: () => showTestDialog(row)
              }),
              h(ArtButtonTable, {
                type: 'edit',
                show: hasAuth('notice:rules:edit'),
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                show: hasAuth('notice:rules:delete'),
                onClick: () => deleteRule(row)
              })
            ])
        }
      ]
    }
  })

  /**
   * 搜索处理
   */
  const handleSearch = (params: Record<string, any>) => {
    const searchParamsData: Record<string, any> = {}
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParamsData[key] = params[key]
      }
    })

    Object.keys(searchParams).forEach((key) => {
      if (!['current', 'size'].includes(key)) {
        delete (searchParams as Record<string, any>)[key]
      }
    })
    Object.assign(searchParams, searchParamsData)

    const paramsRecord = searchParams as Record<string, unknown>
    paramsRecord.current = 1
    getDataDebounced()
  }

  /**
   * 显示规则弹窗
   */
  const showDialog = (type: DialogType, row?: NoticeRule): void => {
    dialogType.value = type
    currentRuleData.value = type === 'edit' && row ? { ...row } : {}
    nextTick(() => {
      dialogVisible.value = true
    })
  }

  /**
   * 切换规则状态（单个）
   */
  const handleToggleStatus = async (
    row: NoticeRule & { _statusLoading?: boolean },
    enabled: boolean
  ): Promise<void> => {
    // 设置加载状态
    if (!row._statusLoading) {
      row._statusLoading = true
    }

    try {
      const newStatus = enabled ? NoticeStatusEnum.OPEN : NoticeStatusEnum.CLOSE
      await batchToggleRuleStatus([row.ruleId!], newStatus)
      ElMessage.success(enabled ? '已启用' : '已禁用')
      // 更新本地数据
      row.noticeStatus = newStatus
      // 刷新数据
      refreshData()
    } catch (error: any) {
      ElMessage.error(error.message || '状态切换失败')
      // 刷新数据以恢复原状态
      refreshData()
    } finally {
      row._statusLoading = false
    }
  }

  /**
   * 批量切换规则状态
   */
  const handleBatchToggleStatus = async (status: NoticeStatusEnum): Promise<void> => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要操作的规则')
      return
    }

    try {
      const action = status === NoticeStatusEnum.OPEN ? '启用' : '禁用'
      await ElMessageBox.confirm(
        `确定要${action}选中的 ${selectedRows.value.length} 个规则吗？`,
        `批量${action}`,
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      const ruleIds = selectedRows.value.map((row) => row.ruleId!)
      await batchToggleRuleStatus(ruleIds, status)
      ElMessage.success(`批量${action}成功`)
      selectedRows.value = []
      refreshData()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(
          error.message || `批量${status === NoticeStatusEnum.OPEN ? '启用' : '禁用'}失败`
        )
      }
    }
  }

  /**
   * 删除规则
   */
  const deleteRule = async (row: NoticeRule): Promise<void> => {
    try {
      await ElMessageBox.confirm('确定要删除该规则吗？', '删除规则', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await deleteRuleApi(row.ruleId!)
      ElMessage.success('删除成功')
      refreshData()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
      }
    }
  }

  /**
   * 处理弹窗提交事件
   */
  const handleDialogSubmit = async () => {
    try {
      dialogVisible.value = false
      currentRuleData.value = {}
      refreshData()
    } catch (error) {
      console.error('提交失败:', error)
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: NoticeRule[]): void => {
    selectedRows.value = selection
  }

  /**
   * 显示测试弹窗
   */
  const showTestDialog = (row: NoticeRule): void => {
    currentTestRuleData.value = { ...row }
    nextTick(() => {
      testDialogVisible.value = true
    })
  }
</script>
