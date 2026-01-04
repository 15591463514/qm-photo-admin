<template>
  <div class="infos-page art-full-height">
    <!-- 搜索栏 -->
    <InfosSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></InfosSearch>

    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable
        table-layout="auto"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 通知结果明细弹窗 -->
      <ResultsDialog v-model:visible="resultsDialogVisible" :info-id="currentInfoId" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import { h } from 'vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import InfosSearch from './modules/infos-search.vue'
  import ResultsDialog from './modules/results-dialog.vue'
  import { useAuth } from '@/hooks/core/useAuth'
  import { useDictStore } from '@/store/modules/dict'
  import { fetchInfosList, deleteInfo as deleteInfoApi } from '@/api/notice'
  import { getNoticeResultTagType, formatNoticeResult } from '@/utils/notice/notice-result-strategy'

  defineOptions({ name: 'NoticeInfos' })

  const showSearchBar = ref(true)
  const resultsDialogVisible = ref(false)
  const currentInfoId = ref<number>()
  const { hasAuth } = useAuth()
  const dictStore = useDictStore()

  // 搜索表单
  const searchForm = ref({
    msgSource: undefined,
    msgType: undefined,
    noticeTime: undefined
  })

  // API 请求适配器
  const fetchInfosListAdapter = async (
    params: Api.Notice.InfosRequestParams & { noticeTime?: [string, string] }
  ) => {
    // 处理时间范围参数
    const requestParams: Api.Notice.InfosRequestParams = {
      ...params
    }
    if (params.noticeTime && Array.isArray(params.noticeTime) && params.noticeTime.length === 2) {
      requestParams.start = params.noticeTime[0]
      requestParams.end = params.noticeTime[1]
      delete (requestParams as any).noticeTime
    }
    return fetchInfosList(requestParams)
  }

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
      apiFn: fetchInfosListAdapter,
      apiParams: {
        current: 1,
        size: 10
      },
      immediate: true,
      excludeParams: ['noticeTime'],
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'msgSource',
          label: '消息来源',
          minWidth: 120
        },
        {
          prop: 'msgType',
          label: '消息类型',
          minWidth: 120,
          formatter: (row: Api.Notice.Info) => {
            const dictData = dictStore.getDictData('msg_type', row.msgType || '')
            const tagStyle = dictData?.tagStyle || 'info'
            const displayText = row.msgType || '-'
            return h(ElTag, { type: tagStyle as any }, () => displayText)
          }
        },
        {
          prop: 'noticeContent',
          label: '通知内容',
          minWidth: 200,
          showOverflowTooltip: true,
          formatter: (row: Api.Notice.Info) => {
            // 移除 HTML 标签显示纯文本
            const text = (row.noticeContent || '').replace(/<[^>]*>/g, '')
            return h('span', { title: text }, text)
          }
        },
        {
          prop: 'noticeSuccess',
          label: '通知结果(成功/总数)',
          width: 180,
          formatter: (row: Api.Notice.Info) => {
            const success = row.noticeSuccess ?? 0
            const total = row.noticeTotal ?? 0
            const text = formatNoticeResult(success, total)
            const tagType = getNoticeResultTagType(success, total)

            return h(ElTag, { type: tagType }, () => text)
          }
        },
        {
          prop: 'noticeTime',
          label: '通知时间',
          minWidth: 180
        },
        {
          prop: 'operation',
          label: '操作',
          minWidth: 160,
          fixed: 'right',
          formatter: (row: Api.Notice.Info) =>
            h('div', { style: 'display: flex; gap: 8px' }, [
              h(ArtButtonTable, {
                type: 'view',
                show: hasAuth('notice:infos:view'),
                onClick: () => viewResults(row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                show: hasAuth('notice:infos:delete'),
                onClick: () => deleteInfoHandler(row)
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
    const { noticeTime, ...filtersParams } = params
    const [start, end] = Array.isArray(noticeTime) ? noticeTime : [null, null]

    const searchParamsData: Record<string, any> = {}
    Object.keys(filtersParams).forEach((key) => {
      if (
        filtersParams[key] !== undefined &&
        filtersParams[key] !== null &&
        filtersParams[key] !== ''
      ) {
        searchParamsData[key] = filtersParams[key]
      }
    })
    if (start) {
      searchParamsData.start = start
    }
    if (end) {
      searchParamsData.end = end
    }

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
   * 查看通知结果
   */
  const viewResults = (row: Api.Notice.Info) => {
    currentInfoId.value = row.infoId
    resultsDialogVisible.value = true
  }

  /**
   * 删除通知记录
   */
  const deleteInfoHandler = async (row: Api.Notice.Info): Promise<void> => {
    try {
      await ElMessageBox.confirm('确定要删除该通知记录吗？', '删除通知', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await deleteInfoApi(row.infoId)
      ElMessage.success('删除成功')
      refreshData()
    } catch (error: any) {
      if (error !== 'cancel') {
        console.error('删除失败:', error)
        ElMessage.error(error?.message || '删除失败')
      }
    }
  }
</script>
