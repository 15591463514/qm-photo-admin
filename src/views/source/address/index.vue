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
          <div class="flex-c gap-4">
            <!-- 视图模式切换 -->
            <ElRadioGroup v-model="viewMode" size="default">
              <ElRadioButton label="list">列表</ElRadioButton>
              <ElRadioButton label="map">地图</ElRadioButton>
            </ElRadioGroup>
            <ElButton type="primary" @click="handleOpenAddDialog">
              <ElIcon><Plus /></ElIcon>
              新增地址
            </ElButton>
            <ElButton
              v-if="viewMode === 'list' && selectedRows.length > 0"
              type="danger"
              @click="handleBatchDelete"
            >
              <ElIcon><Delete /></ElIcon>
              批量删除{{ selectedRows.length > 0 ? ` (${selectedRows.length})` : '' }}
            </ElButton>
          </div>
        </template>
      </ArtTableHeader>

      <!-- 列表视图 -->
      <ArtTable
        v-if="viewMode === 'list'"
        ref="tableRef"
        table-layout="auto"
        v-loading="loading"
        :columns="tableColumns"
        :data="addressList"
        :pagination="tablePagination"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @selection-change="handleSelectionChange"
      >
      </ArtTable>

      <!-- 地图视图 -->
      <AddressMapBoard
        v-else-if="viewMode === 'map'"
        :address-list="addressList"
        :loading="loading"
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
  import { ref, onMounted, computed, h } from 'vue'
  import { StatusEnum, STATUS_CONFIG } from '@/constants/enums'
  import {
    ElMessage,
    ElMessageBox,
    ElTag,
    ElButton,
    ElIcon,
    ElRadioGroup,
    ElRadioButton
  } from 'element-plus'
  import { Plus, Delete } from '@element-plus/icons-vue'
  import ArtTable from '@/components/core/tables/art-table/index.vue'
  import ArtTableHeader from '@/components/core/tables/art-table-header/index.vue'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import AddressSearch from './modules/address-search.vue'
  import AddressFormDialog from './modules/address-form-dialog.vue'
  import AddressMapBoard from './modules/address-map-board.vue'
  import { fetchGetAddressList, fetchDeleteAddress, fetchBatchDeleteAddress } from '@/api/address'
  import type { ColumnOption } from '@/types/component'

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

  // 表格列配置（用于列显示控制）
  const columnChecks = ref<ColumnOption[]>([])

  // 视图模式：list-列表，map-地图
  const viewMode = ref<'list' | 'map'>('list')

  // 表格引用
  const tableRef = ref<InstanceType<typeof ArtTable> | null>(null)

  // 选中的行数据
  const selectedRows = ref<Api.Address.AddressItem[]>([])

  // 地址列表相关
  const loading = ref(false)
  const addressList = ref<Api.Address.AddressItem[]>([])

  // 分页相关
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0
  })

  // 表格模式分页
  const tablePagination = computed(() => ({
    current: pagination.value.page,
    size: pagination.value.pageSize,
    total: pagination.value.total
  }))

  // 表格列配置
  const tableColumns = computed<ColumnOption[]>(() => {
    return [
      {
        type: 'selection',
        width: 55
      },
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
        formatter: (row: Api.Address.AddressItem) => row.longitude.toFixed(6)
      },
      {
        prop: 'latitude',
        label: '纬度',
        width: 120,
        formatter: (row: Api.Address.AddressItem) => row.latitude.toFixed(6)
      },
      {
        prop: 'status',
        label: '状态',
        width: 100,
        formatter: (row: Api.Address.AddressItem) => {
          const statusConfig = STATUS_CONFIG[row.status as StatusEnum]
          return h(
            ElTag,
            { type: statusConfig?.type || 'info' },
            () => statusConfig?.text || '未知'
          )
        }
      },
      {
        prop: 'createdAt',
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
  })

  // 新增/编辑弹窗
  const dialogVisible = ref(false)
  const currentAddressId = ref<number | null>(null)

  // 加载地址列表
  const loadAddressList = async () => {
    loading.value = true
    try {
      const params: Api.Address.AddressListParams = {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        keyword: searchForm.value.keyword || undefined,
        province: searchForm.value.province,
        city: searchForm.value.city,
        district: searchForm.value.district,
        status: searchForm.value.status
      }

      const response = await fetchGetAddressList(params)
      addressList.value = response.list
      pagination.value.total = response.total

      // 更新搜索栏的选项（从返回的地址中提取省市区）
      const provinces = new Set<string>()
      const cities = new Set<string>()
      const districts = new Set<string>()

      response.list.forEach((address) => {
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
    } catch (error: any) {
      ElMessage.error(error.message || '加载地址列表失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索
  const handleSearch = () => {
    pagination.value.page = 1
    loadAddressList()
  }

  // 重置搜索参数
  const resetSearchParams = () => {
    searchForm.value = {
      keyword: '',
      province: undefined,
      city: undefined,
      district: undefined,
      status: undefined
    }
    handleSearch()
  }

  // 刷新数据
  const refreshData = () => {
    loadAddressList()
  }

  // 分页变化
  const handlePageChange = (page: number) => {
    pagination.value.page = page
    loadAddressList()
  }

  // 每页数量变化
  const handleSizeChange = (size: number) => {
    pagination.value.pageSize = size
    pagination.value.page = 1
    loadAddressList()
  }

  // 打开新增弹窗
  const handleOpenAddDialog = () => {
    currentAddressId.value = null
    dialogVisible.value = true
  }

  // 编辑地址
  const handleEdit = (row: Api.Address.AddressItem) => {
    currentAddressId.value = row.id
    dialogVisible.value = true
  }

  // 删除地址
  const handleDelete = async (row: Api.Address.AddressItem) => {
    try {
      await ElMessageBox.confirm(`确定要删除地址 "${row.name}" 吗？`, '提示', {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })

      await fetchDeleteAddress(row.id)
      ElMessage.success('删除成功')
      loadAddressList()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '删除失败')
      }
    }
  }

  // 表单成功回调
  const handleFormSuccess = () => {
    dialogVisible.value = false
    currentAddressId.value = null
    loadAddressList()
  }

  // 表格选中变化
  const handleSelectionChange = (selection: Api.Address.AddressItem[]) => {
    selectedRows.value = selection
  }

  // 批量删除
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
      loadAddressList()
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || '批量删除失败')
      }
    }
  }

  // 初始化
  onMounted(() => {
    loadAddressList()
  })
</script>
