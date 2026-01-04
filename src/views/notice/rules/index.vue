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
  import { ElButton, ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import { nextTick } from 'vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchRulesList, deleteRule as deleteRuleApi, toggleRuleStatus } from '@/api/notice'
  import type { NoticeRule } from '@/types/notice'
  import { NoticeStatusEnum, NoticeModeEnum, NoticeModeText } from '@/types/notice'
  import { DialogType } from '@/types'
  import RulesSearch from './modules/rules-search.vue'
  import RulesDialog from './modules/rules-dialog.vue'
  import RulesTestDialog from './modules/rules-test-dialog.vue'
  import { useAuth } from '@/hooks/core/useAuth'
  import { useDictStore } from '@/store/modules/dict'

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
          formatter: (row: NoticeRule) => {
            const statusConfig =
              row.noticeStatus === NoticeStatusEnum.OPEN
                ? { type: 'success' as const, text: '启用' }
                : { type: 'info' as const, text: '禁用' }
            return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
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
            h('div', { style: 'display: flex; gap: 8px' }, [
              h(ArtButtonTable, {
                icon:
                  row.noticeStatus === NoticeStatusEnum.OPEN
                    ? 'ri:pause-circle-line'
                    : 'ri:play-circle-line',
                iconClass:
                  row.noticeStatus === NoticeStatusEnum.OPEN
                    ? 'bg-warning/12 text-warning'
                    : 'bg-success/12 text-success',
                tooltipContent: row.noticeStatus === NoticeStatusEnum.OPEN ? '禁用' : '启用',
                show: hasAuth('notice:rules:edit'),
                onClick: () => toggleStatus(row)
              }),
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
   * 切换规则状态
   */
  const toggleStatus = async (row: NoticeRule): Promise<void> => {
    try {
      const action = row.noticeStatus === NoticeStatusEnum.OPEN ? '禁用' : '启用'
      await ElMessageBox.confirm(`确定要${action}该规则吗？`, `${action}规则`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await toggleRuleStatus(row.ruleId!)
      ElMessage.success(`${action}成功`)
      refreshData()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('操作失败:', error)
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
