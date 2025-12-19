<!-- 角色管理页面 -->
<template>
  <div class="art-full-height">
    <RoleSearch
      v-show="showSearchBar"
      v-model="searchForm"
      @search="handleSearch"
      @reset="resetSearchParams"
    ></RoleSearch>

    <ElCard
      class="art-table-card"
      shadow="never"
      :style="{ 'margin-top': showSearchBar ? '12px' : '0' }"
    >
      <ArtTableHeader
        v-model:columns="columnChecks"
        v-model:showSearchBar="showSearchBar"
        :loading="loading"
        @refresh="refreshData"
      >
        <template #left>
          <ElSpace wrap>
            <ElButton v-auth="'role:add'" @click="showDialog('add')" v-ripple>新增角色</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <!-- 表格 -->
      <ArtTable :loading="loading" :data="data" :columns="columns"> </ArtTable>
    </ElCard>

    <!-- 角色编辑弹窗 -->
    <RoleEditDialog
      v-model="dialogVisible"
      :dialog-type="dialogType"
      :role-data="currentRoleData"
      @success="refreshData"
    />

    <!-- 菜单权限弹窗 -->
    <MenuAuthDialog v-model:visible="permissionDialogVisible" :role-data="currentRoleData" />
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetRoleList, fetchDeleteRole } from '@/api/role'
  import RoleSearch from './modules/role-search.vue'
  import RoleEditDialog from './modules/role-edit-dialog.vue'
  import MenuAuthDialog from './modules/menu-auth-dialog.vue'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import type { ColumnOption } from '@/types/component'
  import { useAuth } from '@/hooks/core/useAuth'

  defineOptions({ name: 'Role' })

  const { hasAuth } = useAuth()

  type RoleListItem = Api.SystemManage.RoleListItem

  // 搜索表单
  const searchForm = ref({
    roleName: undefined,
    roleCode: undefined,
    description: undefined,
    enabled: undefined,
    daterange: undefined
  })

  const showSearchBar = ref(false)

  const dialogVisible = ref(false)
  const permissionDialogVisible = ref(false)
  const currentRoleData = ref<RoleListItem | undefined>(undefined)

  const {
    columns,
    columnChecks,
    data,
    loading,
    getDataDebounced,
    searchParams,
    resetSearchParams,
    refreshData
  } = useTable({
    // 核心配置
    core: {
      apiFn: fetchGetRoleList,
      apiParams: {},
      // 排除 apiParams 中的属性（包括分页参数，因为角色列表不需要分页）
      excludeParams: ['daterange', 'current', 'size'],
      columnsFactory: (): ColumnOption<RoleListItem>[] => [
        {
          prop: 'roleId',
          label: '角色ID',
          width: 100
        },
        {
          prop: 'roleName',
          label: '角色名称',
          minWidth: 120
        },
        {
          prop: 'roleCode',
          label: '角色编码',
          minWidth: 120
        },
        {
          prop: 'description',
          label: '角色描述',
          minWidth: 150,
          showOverflowTooltip: true
        },
        {
          prop: 'enabled',
          label: '角色状态',
          width: 100,
          formatter: (row: RoleListItem) => {
            const statusConfig = row.enabled
              ? { type: 'success', text: '启用' }
              : { type: 'warning', text: '禁用' }
            return h(
              ElTag,
              { type: statusConfig.type as 'success' | 'warning' },
              () => statusConfig.text
            )
          }
        },
        {
          prop: 'createTime',
          label: '创建日期',
          width: 180,
          sortable: true
        },
        {
          prop: 'operation',
          label: '操作',
          width: 180,
          fixed: 'right',
          formatter: (row: RoleListItem) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'edit',
                show: hasAuth('role:edit'),
                tooltipContent: '编辑角色',
                onClick: () => showDialog('edit', row)
              }),
              h(ArtButtonTable, {
                type: 'delete',
                show: hasAuth('role:delete'),
                onClick: () => deleteRole(row)
              }),
              h(ArtButtonTable, {
                type: 'more',
                iconClass: 'bg-warning/12 text-warning',
                icon: 'ri:menu-add-line',
                show: hasAuth('role:auth'),
                tooltipContent: '绑定权限',
                onClick: () => showPermissionDialog(row)
              })
            ])
        }
      ]
    },
    // 数据处理：将数组响应转换为分页格式
    transform: {
      responseAdapter: (response: Api.SystemManage.RoleList) => {
        // 如果响应是数组，转换为分页格式
        if (Array.isArray(response)) {
          return {
            records: response,
            current: 1,
            size: response.length,
            total: response.length
          }
        }
        // 如果已经是分页格式，直接返回
        return response as any
      }
    }
  })

  const dialogType = ref<'add' | 'edit'>('add')

  const showDialog = (type: 'add' | 'edit', row?: RoleListItem) => {
    dialogVisible.value = true
    dialogType.value = type
    currentRoleData.value = row
  }

  /**
   * 搜索处理
   * @param params 搜索参数
   */
  const handleSearch = (params: Record<string, any>) => {
    // 处理日期区间参数，把 daterange 转换为 startTime 和 endTime
    const { daterange, ...filtersParams } = params
    const [startTime, endTime] = Array.isArray(daterange) ? daterange : [null, null]

    // 搜索参数赋值
    Object.assign(searchParams, { ...filtersParams, startTime, endTime })
    // 使用防抖版本触发搜索
    getDataDebounced()
  }

  const deleteRole = async (row: RoleListItem) => {
    try {
      await ElMessageBox.confirm(`确定删除角色"${row.roleName}"吗？此操作不可恢复！`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteRole(row.roleId)
      ElMessage.success('删除成功')
      refreshData()
    } catch (error: any) {
      if (error !== 'cancel') {
        // 错误已在拦截器中处理
        console.error('删除角色失败:', error)
      } else {
        ElMessage.info('已取消删除')
      }
    }
  }

  /**
   * 显示权限绑定对话框
   */
  const showPermissionDialog = (row: RoleListItem) => {
    permissionDialogVisible.value = true
    currentRoleData.value = row
  }
</script>
