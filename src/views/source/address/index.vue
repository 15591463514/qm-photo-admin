<!-- 地址管理页面 -->
<template>
  <div class="art-full-height">
    <!-- 搜索栏 -->
    <AddressSearch
      ref="searchBarRef"
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    />

    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <!-- 表格头部 -->
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <div class="flex-c">
            <!-- 视图模式切换 -->
            <ElRadioGroup class="mr-3" v-model="viewMode" size="default">
              <ElRadioButton label="list">列表</ElRadioButton>
              <ElRadioButton label="map">地图</ElRadioButton>
            </ElRadioGroup>
            <ElButton @click="handleOpenAddDialog" v-ripple> 新增地址 </ElButton>
            <ElButton
              v-if="viewMode === 'list' && selectedRows.length > 0"
              type="success"
              plain
              v-ripple
              :disabled="loading"
              @click="handleBatchToggleStatus(StatusEnum.ENABLED)"
            >
              批量启用 ({{ selectedRows.length }})
            </ElButton>
            <ElButton
              v-if="viewMode === 'list' && selectedRows.length > 0"
              type="warning"
              plain
              v-ripple
              :disabled="loading"
              @click="handleBatchToggleStatus(StatusEnum.DISABLED)"
            >
              批量禁用 ({{ selectedRows.length }})
            </ElButton>
            <ElButton
              v-if="viewMode === 'list' && selectedRows.length > 0"
              type="danger"
              plain
              v-ripple
              :disabled="loading"
              @click="handleBatchDelete"
            >
              批量删除 ({{ selectedRows.length }})
            </ElButton>
          </div>
        </template>
      </ArtTableHeader>

      <!-- 列表视图 -->
      <ArtTable
        v-if="viewMode === 'list'"
        table-layout="auto"
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      >
      </ArtTable>

      <!-- 地图视图 -->
      <AddressMapBoard
        v-else-if="viewMode === 'map'"
        :address-list="mapAddressList"
        :loading="mapLoading"
      />
    </ElCard>

    <!-- 新增/编辑地址弹窗 -->
    <AddressFormDialog
      v-model="dialogVisible"
      :address-id="currentAddressId"
      @success="handleFormSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, h } from 'vue'
  import { StatusEnum } from '@/constants/enums'
  import { STATUS_SWITCH_CONFIG } from '@/constants/components'
  import {
    ElMessage,
    ElMessageBox,
    ElSwitch,
    ElButton,
    ElRadioGroup,
    ElRadioButton
  } from 'element-plus'
  import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import AddressSearch from './modules/address-search.vue'
  import AddressFormDialog from './modules/address-form-dialog.vue'
  import AddressMapBoard from './modules/address-map-board.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchGetAddressList,
    fetchGetAllAddressList,
    fetchDeleteAddress,
    fetchBatchDeleteAddress,
    fetchBatchToggleAddressStatus
  } from '@/api/address'

  defineOptions({ name: 'AddressManage' })

  // 搜索栏显示状态
  const showSearchBar = ref(true)
  const searchBarRef = ref()

  // 搜索表单数据
  const searchForm = ref<Record<string, any>>({
    keyword: '',
    province: undefined,
    city: undefined,
    district: undefined,
    status: undefined
  })

  // 视图模式：list-列表，map-地图
  const viewMode = ref<'list' | 'map'>('list')

  // 选中的行数据
  const selectedRows = ref<Api.Address.AddressItem[]>([])

  // 新增/编辑弹窗
  const dialogVisible = ref(false)
  const currentAddressId = ref<number | null>(null)

  // 地图视图数据
  const mapAddressList = ref<Api.Address.AddressItem[]>([])
  const mapLoading = ref(false)

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
    // 核心配置
    core: {
      apiFn: fetchGetAddressList,
      apiParams: {
        current: 1,
        size: 10
      },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'name',
          label: '地址名称',
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          prop: 'detail',
          label: '详细地址',
          minWidth: 250,
          showOverflowTooltip: true
        },
        {
          prop: 'province',
          label: '省',
          width: 100
        },
        {
          prop: 'city',
          label: '市',
          width: 100
        },
        {
          prop: 'district',
          label: '区/县',
          width: 100
        },
        {
          prop: 'longitude',
          label: '经度',
          width: 120,
          formatter: (row: Api.Address.AddressItem) => row.longitude?.toFixed(6) || '-'
        },
        {
          prop: 'latitude',
          label: '纬度',
          width: 120,
          formatter: (row: Api.Address.AddressItem) => row.latitude?.toFixed(6) || '-'
        },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: Api.Address.AddressItem & { _statusLoading?: boolean }) => {
            return h(ElSwitch, {
              modelValue: row.status === StatusEnum.ENABLED,
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
          width: 180
        },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: Api.Address.AddressItem) => {
            return h('div', { style: 'display: flex;' }, [
              h(ArtButtonTable, {
                type: 'edit',
                show: true,
                onClick: () => handleEdit(row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                show: true,
                onClick: () => handleDelete(row)
              })
            ])
          }
        }
      ]
    },
    // 生命周期钩子
    hooks: {
      onSuccess: (records) => {
        // 更新搜索栏的选项（从返回的地址中提取省市区）
        const provinces = new Set<string>()
        const cities = new Set<string>()
        const districts = new Set<string>()

        records.forEach((address: Api.Address.AddressItem) => {
          if (address.province) provinces.add(address.province)
          if (address.city) cities.add(address.city)
          if (address.district) districts.add(address.district)
        })

        if (searchBarRef.value?.updateOptions) {
          searchBarRef.value.updateOptions(
            Array.from(provinces),
            Array.from(cities),
            Array.from(districts)
          )
        }
      }
    }
  })

  /**
   * 搜索处理
   */
  const handleSearch = (params: Record<string, any>) => {
    // 构建搜索参数，过滤掉 undefined 值
    const searchParamsData: Record<string, any> = {}
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        searchParamsData[key] = params[key]
      }
    })

    // 搜索参数赋值（先清空再赋值，确保未选中的条件被清除）
    Object.keys(searchParams).forEach((key) => {
      if (!['current', 'size'].includes(key)) {
        delete (searchParams as Record<string, any>)[key]
      }
    })
    Object.assign(searchParams, searchParamsData)

    // 使用防抖版本重置到第一页并触发搜索
    const paramsRecord = searchParams as Record<string, unknown>
    paramsRecord.current = 1
    getDataDebounced()

    // 如果在地图模式，也需要刷新地图数据
    if (viewMode.value === 'map') {
      loadMapData()
    }
  }

  /**
   * 加载地图视图的全部数据
   */
  const loadMapData = async () => {
    if (viewMode.value !== 'map') return

    mapLoading.value = true
    try {
      // 构建搜索参数
      const params: Omit<Api.Address.AddressListParams, 'current' | 'size'> = {
        keyword: searchForm.value.keyword || undefined,
        province: searchForm.value.province,
        city: searchForm.value.city,
        district: searchForm.value.district,
        status: searchForm.value.status
      }

      const response = await fetchGetAllAddressList(params)
      mapAddressList.value = response.records || []
    } catch (error: any) {
      ElMessage.error(error.message || '加载地图数据失败')
    } finally {
      mapLoading.value = false
    }
  }

  /**
   * 监听视图模式切换，切换到地图时加载全部数据
   */
  watch(viewMode, (newMode) => {
    if (newMode === 'map') {
      loadMapData()
    }
  })

  /**
   * 监听搜索表单变化，地图模式下重新加载数据
   */
  watch(
    () => [
      searchForm.value.keyword,
      searchForm.value.province,
      searchForm.value.city,
      searchForm.value.district,
      searchForm.value.status
    ],
    () => {
      if (viewMode.value === 'map') {
        loadMapData()
      }
    }
  )

  /**
   * 打开新增弹窗
   */
  const handleOpenAddDialog = () => {
    currentAddressId.value = null
    dialogVisible.value = true
  }

  /**
   * 编辑地址
   */
  const handleEdit = (row: Api.Address.AddressItem) => {
    currentAddressId.value = row.id
    dialogVisible.value = true
  }

  /**
   * 删除地址
   */
  const handleDelete = async (row: Api.Address.AddressItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除地址 "${row.name}" 吗？`, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })

      await fetchDeleteAddress(row.id)
      ElMessage.success('删除成功')
      refreshData()
      // 如果在地图模式，也需要刷新地图数据
      if (viewMode.value === 'map') {
        loadMapData()
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败')
      }
    }
  }

  /**
   * 表单成功回调
   */
  const handleFormSuccess = () => {
    dialogVisible.value = false
    currentAddressId.value = null
    refreshData()
    // 如果在地图模式，也需要刷新地图数据
    if (viewMode.value === 'map') {
      loadMapData()
    }
  }

  /**
   * 处理表格行选择变化
   */
  const handleSelectionChange = (selection: Api.Address.AddressItem[]) => {
    selectedRows.value = selection
  }

  /**
   * 切换状态（单个）
   */
  const handleToggleStatus = async (
    row: Api.Address.AddressItem & { _statusLoading?: boolean },
    enabled: boolean
  ) => {
    // 设置加载状态
    if (!row._statusLoading) {
      row._statusLoading = true
    }

    try {
      const newStatus = enabled ? StatusEnum.ENABLED : StatusEnum.DISABLED
      await fetchBatchToggleAddressStatus([row.id], newStatus)
      ElMessage.success(enabled ? '已启用' : '已禁用')
      // 更新本地数据
      row.status = newStatus
      // 刷新数据
      refreshData()
      // 如果在地图模式，也需要刷新地图数据
      if (viewMode.value === 'map') {
        loadMapData()
      }
    } catch (error: any) {
      ElMessage.error(error.message || '状态切换失败')
      // 刷新数据以恢复原状态
      refreshData()
    } finally {
      row._statusLoading = false
    }
  }

  /**
   * 批量切换状态
   */
  const handleBatchToggleStatus = async (status: StatusEnum) => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要操作的地址')
      return
    }

    try {
      const action = status === StatusEnum.ENABLED ? '启用' : '禁用'
      await ElMessageBox.confirm(
        `确定要${action}选中的 ${selectedRows.value.length} 个地址吗？`,
        `批量${action}`,
        {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      )

      const ids = selectedRows.value.map((row) => row.id)
      await fetchBatchToggleAddressStatus(ids, status)
      ElMessage.success(`批量${action}成功`)
      selectedRows.value = []
      refreshData()
      // 如果在地图模式，也需要刷新地图数据
      if (viewMode.value === 'map') {
        loadMapData()
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(
          error.message || `批量${status === StatusEnum.ENABLED ? '启用' : '禁用'}失败`
        )
      }
    }
  }

  /**
   * 批量删除
   */
  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要删除的地址')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个地址吗？`,
        '提示',
        {
          type: 'warning',
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }
      )

      const ids = selectedRows.value.map((row) => row.id)
      await fetchBatchDeleteAddress(ids)
      ElMessage.success('批量删除成功')
      selectedRows.value = []
      refreshData()
      // 如果在地图模式，也需要刷新地图数据
      if (viewMode.value === 'map') {
        loadMapData()
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '批量删除失败')
      }
    }
  }
</script>
