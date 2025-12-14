<!-- 菜单管理页面 -->
<template>
  <div class="menu-page art-full-height">
    <!-- 搜索栏 -->
    <ArtSearchBar
      v-show="showSearchBar"
      v-model="formFilters"
      :items="formItems"
      :showExpand="false"
      @reset="handleReset"
      @search="handleSearch"
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
          <ElButton v-auth="'menu:add'" @click="handleAddMenu" v-ripple> 添加菜单 </ElButton>
          <ElButton @click="toggleExpand" v-ripple>
            {{ isExpanded ? '收起' : '展开' }}
          </ElButton>
        </template>
      </ArtTableHeader>

      <ArtTable
        ref="tableRef"
        rowKey="path"
        :loading="loading"
        :columns="columns"
        :data="filteredTableData"
        :stripe="false"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
        @row-click="handleRowClick"
      />

      <!-- 菜单弹窗 -->
      <MenuDialog
        v-model:visible="dialogVisible"
        :type="dialogType"
        :editData="editData"
        :menuRow="menuRow"
        :lockType="lockMenuType"
        @submit="handleSubmit"
      />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { formatMenuTitle } from '@/utils/router'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTableColumns } from '@/hooks/core/useTableColumns'
  import type { AppRouteRecord } from '@/types/router'
  import MenuDialog from './modules/menu-dialog.vue'
  import {
    fetchGetMenuTree,
    fetchCreateMenu,
    fetchUpdateMenu,
    fetchDeleteMenu
  } from '@/api/system-manage'
  import { ElTag, ElMessageBox, ElMessage } from 'element-plus'
  import { useAuth } from '@/hooks/core/useAuth'
  import { omit } from 'es-toolkit'

  defineOptions({ name: 'Menus' })

  const { hasAuth } = useAuth()

  // 状态管理
  const loading = ref(false)
  const isExpanded = ref(false)
  const tableRef = ref()
  const menuRow = ref<AppRouteRecord | null>(null)
  const showSearchBar = ref(false)

  // 弹窗相关
  const dialogVisible = ref(false)
  const dialogType = ref<'menu' | 'button'>('menu')
  const editData = ref<AppRouteRecord | any>(null)
  const lockMenuType = ref(false)

  // 搜索相关
  const initialSearchState = {
    title: '',
    path: ''
  }

  const formFilters = reactive({ ...initialSearchState })
  const appliedFilters = reactive({ ...initialSearchState })

  const formItems = computed(() => [
    {
      label: '菜单名称',
      key: 'title',
      type: 'input',
      props: { clearable: true }
    },
    {
      label: '路由地址',
      key: 'path',
      type: 'input',
      props: { clearable: true }
    }
  ])

  onMounted(() => {
    getMenuList()
  })

  /**
   * 将API返回的菜单数据转换为AppRouteRecord格式
   */
  const convertMenuDataToRouteRecord = (menu: Api.SystemManage.MenuData): AppRouteRecord => {
    const routeRecord: AppRouteRecord = {
      id: menu.id,
      name: menu.name,
      path: menu.path,
      component: menu.component,
      meta: {
        ...omit(menu, ['id', 'name', 'path', 'component', 'buttons', 'children']),
        authList: menu.buttons
      }
    }

    if (menu.children && menu.children.length > 0) {
      routeRecord.children = menu.children.map(convertMenuDataToRouteRecord)
    }

    return routeRecord
  }

  /**
   * 获取菜单列表数据
   */
  const getMenuList = async (): Promise<void> => {
    loading.value = true

    try {
      const list = await fetchGetMenuTree({
        title: appliedFilters.title || undefined,
        path: appliedFilters.path || undefined
      })
      // 将API返回的数据转换为AppRouteRecord格式
      tableData.value = list.map(convertMenuDataToRouteRecord)
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '获取菜单失败')
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取菜单类型标签颜色
   * @param row 菜单行数据
   * @returns 标签颜色类型
   */
  const getMenuTypeTag = (
    row: AppRouteRecord
  ): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    if (row.meta?.isAuthButton) return 'danger'
    if (row.children?.length) return 'info'
    if (row.meta?.link && row.meta?.isIframe) return 'success'
    if (row.path) return 'primary'
    if (row.meta?.link) return 'warning'
    return 'info'
  }

  /**
   * 获取菜单类型文本
   * @param row 菜单行数据
   * @returns 菜单类型文本
   */
  const getMenuTypeText = (row: AppRouteRecord): string => {
    if (row.meta?.isAuthButton) return '按钮'
    if (row.children?.length) return '目录'
    if (row.meta?.link && row.meta?.isIframe) return '内嵌'
    if (row.path) return '菜单'
    if (row.meta?.link) return '外链'
    return '未知'
  }

  // 表格列配置
  const { columnChecks, columns } = useTableColumns(() => [
    {
      prop: 'meta.title',
      label: '菜单名称',
      minWidth: 120,
      formatter: (row: AppRouteRecord) => formatMenuTitle(row.meta?.title)
    },
    {
      prop: 'type',
      label: '菜单类型',
      formatter: (row: AppRouteRecord) => {
        return h(ElTag, { type: getMenuTypeTag(row) }, () => getMenuTypeText(row))
      }
    },
    {
      prop: 'path',
      label: '路由',
      formatter: (row: AppRouteRecord) => {
        if (row.meta?.isAuthButton) return ''
        return row.meta?.link || row.path || ''
      }
    },
    {
      prop: 'meta.authList',
      label: '权限标识',
      formatter: (row: AppRouteRecord) => {
        if (row.meta?.isAuthButton) {
          return row.meta?.authMark || ''
        }
        if (!row.meta?.authList?.length) return ''
        return `${row.meta.authList.length} 个权限标识`
      }
    },
    {
      prop: 'sortOrder',
      label: '排序',
      formatter: (row: AppRouteRecord) => {
        const len = row.path.split('/').length - 1
        const typeList = ['primary', 'success', 'warning', 'danger', 'info'] as const
        if (row.meta?.isAuthButton) {
          return h(ElTag, { type: 'info' }, () => row.meta.sortOrder)
        }
        return h(ElTag, { type: typeList[len] }, () => row.meta.sortOrder)
      }
    },
    {
      prop: 'status',
      label: '状态',
      formatter: () => h(ElTag, { type: 'success' }, () => '启用')
    },
    {
      prop: 'operation',
      label: '操作',
      width: 180,
      align: 'right',
      formatter: (row: AppRouteRecord) => {
        const buttonStyle = { style: 'text-align: right' }

        // 按钮权限标识
        if (row.meta?.isAuthButton) {
          return h('div', buttonStyle, [
            h(ArtButtonTable, {
              type: 'edit',
              tooltipContent: '编辑按钮',
              show: hasAuth('menu:edit'),
              onClick: () => handleEditAuth(row)
            }),
            h(ArtButtonTable, {
              type: 'delete',
              tooltipContent: '删除按钮',
              show: hasAuth('menu:delete'),
              onClick: () => handleDeleteAuth(row)
            })
          ])
        }

        // 菜单权限标识
        return h('div', buttonStyle, [
          h(ArtButtonTable, {
            type: 'add',
            tooltipContent: '新增权限',
            show: hasAuth('menu:add'),
            onClick: () => handleAddAuth(row)
          }),
          h(ArtButtonTable, {
            type: 'edit',
            tooltipContent: '编辑权限',
            show: hasAuth('menu:edit'),
            onClick: () => handleEditMenu(row)
          }),
          h(ArtButtonTable, {
            type: 'delete',
            tooltipContent: '删除权限',
            show: hasAuth('menu:delete'),
            onClick: () => handleDeleteMenu(row)
          })
        ])
      }
    }
  ])

  // 数据相关
  const tableData = ref<AppRouteRecord[]>([])

  /**
   * 重置搜索条件
   */
  const handleReset = (): void => {
    Object.assign(formFilters, { ...initialSearchState })
    Object.assign(appliedFilters, { ...initialSearchState })
    getMenuList()
  }

  /**
   * 执行搜索
   */
  const handleSearch = (): void => {
    Object.assign(appliedFilters, { ...formFilters })
    getMenuList()
  }

  /**
   * 刷新菜单列表
   */
  const handleRefresh = (): void => {
    getMenuList()
  }

  /**
   * 深度克隆对象
   * @param obj 要克隆的对象
   * @returns 克隆后的对象
   */
  const deepClone = <T,>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj) as T
    if (Array.isArray(obj)) return obj.map((item) => deepClone(item)) as T

    const cloned = {} as T
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key])
      }
    }
    return cloned
  }

  /**
   * 将权限列表转换为子节点
   * @param items 菜单项数组
   * @returns 转换后的菜单项数组
   */
  const convertAuthListToChildren = (items: AppRouteRecord[]): AppRouteRecord[] => {
    return items.map((item) => {
      const clonedItem = deepClone(item)

      if (clonedItem.children?.length) {
        clonedItem.children = convertAuthListToChildren(clonedItem.children)
      }

      if (item.meta?.authList?.length) {
        const authChildren: AppRouteRecord[] = item.meta.authList.map(
          (auth: Api.SystemManage.MenuButton) => ({
            path: `${item.path}_auth_${auth.authMark}`,
            name: `${String(item.name)}_auth_${auth.authMark}`,
            meta: {
              isAuthButton: true,
              parentPath: item.path, // 保留用于兼容
              parentId: item.id, // 设置父菜单ID，用于删除时准确查找父菜单
              ...auth
            }
          })
        )

        clonedItem.children = clonedItem.children?.length
          ? [...clonedItem.children, ...authChildren]
          : authChildren
      }

      return clonedItem
    })
  }

  /**
   * 搜索菜单
   * @param items 菜单项数组
   * @returns 搜索结果数组
   */
  const searchMenu = (items: AppRouteRecord[]): AppRouteRecord[] => {
    const results: AppRouteRecord[] = []

    for (const item of items) {
      const searchTitle = appliedFilters.title?.toLowerCase().trim() || ''
      const searchRoute = appliedFilters.path?.toLowerCase().trim() || ''
      const menuTitle = formatMenuTitle(item.meta?.title || '').toLowerCase()
      const menuPath = (item.path || '').toLowerCase()
      const nameMatch = !searchTitle || menuTitle.includes(searchTitle)
      const routeMatch = !searchRoute || menuPath.includes(searchRoute)

      if (item.children?.length) {
        const matchedChildren = searchMenu(item.children)
        if (matchedChildren.length > 0) {
          const clonedItem = deepClone(item)
          clonedItem.children = matchedChildren
          results.push(clonedItem)
          continue
        }
      }

      if (nameMatch && routeMatch) {
        results.push(deepClone(item))
      }
    }

    return results
  }

  // 过滤后的表格数据
  const filteredTableData = computed(() => {
    const searchedData = searchMenu(tableData.value)
    return convertAuthListToChildren(searchedData)
  })

  /**
   * 添加菜单或者按钮
   */
  const handleAddMenu = (): void => {
    dialogType.value = 'menu'
    editData.value = null
    lockMenuType.value = true
    dialogVisible.value = true
    menuRow.value = null
  }

  /**
   * 添加权限按钮
   * @param parentRow 父菜单行数据
   */
  const handleAddAuth = (parentRow?: AppRouteRecord): void => {
    dialogType.value = 'menu'
    editData.value = null
    lockMenuType.value = false
    dialogVisible.value = true
    menuRow.value = parentRow || null
  }

  /**
   * 编辑菜单
   * @param row 菜单行数据
   */
  const handleEditMenu = (row: AppRouteRecord): void => {
    dialogType.value = 'menu'
    editData.value = row
    lockMenuType.value = true
    dialogVisible.value = true
  }

  /**
   * 编辑权限按钮
   * @param row 权限行数据
   */
  const handleEditAuth = (row: AppRouteRecord): void => {
    dialogType.value = 'button'
    // 传递完整的行数据，包含parentPath等信息
    editData.value = row
    lockMenuType.value = false
    dialogVisible.value = true
  }

  /**
   * 将表单数据转换为API参数格式
   */
  const convertFormDataToApiParams = (
    formData: any
  ): Api.SystemManage.CreateMenuParams | Api.SystemManage.UpdateMenuParams => {
    const params: Api.SystemManage.CreateMenuParams = {
      name: formData.name, // 权限标识（路由名称）
      path: formData.path,
      title: formData.title, // 菜单名称（菜单标题）
      component: formData.component,
      icon: formData.icon,
      isHide: formData.isHide ?? false,
      isHideTab: formData.isHideTab ?? false,
      link: formData.link,
      isIframe: formData.isIframe ?? false,
      keepAlive: formData.keepAlive ?? false,
      isFirstLevel: formData.isFirstLevel ?? false,
      fixedTab: formData.fixedTab ?? false,
      activePath: formData.activePath,
      isFullPage: formData.isFullPage ?? false,
      sortOrder: formData.sort ?? 1,
      status: formData.isEnable !== false ? '1' : '2',
      roles: formData.roles
    }

    // 如果有parentId，添加到参数中
    if (formData.parentId !== undefined) {
      params.parentId = formData.parentId
    }

    return params
  }

  /**
   * 提交表单数据
   * @param formData 表单数据
   */
  const handleSubmit = async (formData: any): Promise<void> => {
    try {
      const isButton = formData.menuType === 'button'
      // 判断是否为编辑模式：按钮模式看是否有authMark，菜单模式看是否有id
      const isEdit = isButton ? !!editData.value?.meta?.authMark : !!editData.value?.id

      if (isButton) {
        // 按钮模式：需要更新父菜单的buttons
        let parentId: number | undefined

        if (editData.value?.meta?.parentPath) {
          // 从parentPath找到父菜单（编辑按钮时）
          const parentMenu = await fetchGetMenuTree()
          const parent = findMenuByPath(parentMenu, editData.value.meta.parentPath)
          if (!parent || !parent.id) {
            ElMessage.error('找不到父菜单')
            return
          }
          parentId = parent.id
        } else if (editData.value?.id) {
          // editData是父菜单（新增按钮时，通过editData传递）
          parentId = editData.value.id
        } else if (menuRow.value?.id) {
          // menuRow是父菜单（新增按钮时，通过menuRow传递）
          parentId = menuRow.value.id
        } else {
          ElMessage.error('无法确定父菜单')
          return
        }

        if (!parentId) {
          ElMessage.error('无法确定父菜单ID')
          return
        }

        // 获取父菜单详情
        const parentMenu = await fetchGetMenuTree()
        const parent = findMenuById(parentMenu, parentId)
        if (!parent) {
          ElMessage.error('找不到父菜单')
          return
        }

        const buttons = [...(parent.buttons || [])]
        if (isEdit && editData.value.meta?.authMark) {
          // 更新按钮
          const buttonIndex = buttons.findIndex(
            (btn) => btn.authMark === editData.value.meta.authMark
          )
          if (buttonIndex >= 0) {
            buttons[buttonIndex] = {
              ...buttons[buttonIndex],
              title: formData.authName,
              authMark: formData.authLabel,
              sortOrder: formData.sortOrder
            }
          } else {
            ElMessage.error('找不到要更新的按钮')
            return
          }
        } else {
          // 新增按钮：检查authMark是否已存在
          const existingButton = buttons.find((btn) => btn.authMark === formData.authLabel)
          if (existingButton) {
            ElMessage.error('权限标识已存在')
            return
          }
          buttons.push({
            title: formData.authName,
            authMark: formData.authLabel,
            sortOrder: formData.sortOrder
          })
        }

        await fetchUpdateMenu(parentId, { buttons })
        ElMessage.success(isEdit ? '更新成功' : '新增成功')
      } else {
        // 菜单模式
        const params = convertFormDataToApiParams(formData) as any
        if (isEdit) {
          await fetchUpdateMenu(editData.value.id, params)
          ElMessage.success('更新成功')
        } else {
          await fetchCreateMenu(params)
          ElMessage.success('新增成功')
        }
      }

      dialogVisible.value = false
      await getMenuList()
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : '操作失败')
    }
  }

  /**
   * 在菜单树中查找指定ID的菜单
   */
  const findMenuById = (
    menus: Api.SystemManage.MenuData[],
    id: number
  ): Api.SystemManage.MenuData | null => {
    for (const menu of menus) {
      if (menu.id === id) {
        return menu
      }
      if (menu.children) {
        const found = findMenuById(menu.children, id)
        if (found) return found
      }
    }
    return null
  }

  /**
   * 删除菜单
   * @param row 菜单行数据
   */
  const handleDeleteMenu = async (row: AppRouteRecord): Promise<void> => {
    if (!row.id) {
      ElMessage.error('菜单ID不存在')
      return
    }

    try {
      await ElMessageBox.confirm('确定要删除该菜单吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await fetchDeleteMenu(row.id)
      ElMessage.success('删除成功')
      await getMenuList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(error instanceof Error ? error.message : '删除失败')
      }
    }
  }

  /**
   * 删除权限按钮
   * @param row 权限按钮行数据
   */
  const handleDeleteAuth = async (row: AppRouteRecord): Promise<void> => {
    // 优先使用 parentId，如果没有则使用 parentPath（兼容旧数据）
    const parentId = row.meta?.parentId
    const parentPath = row.meta?.parentPath

    if (!parentId && !parentPath) {
      ElMessage.error('无法确定父菜单')
      return
    }

    try {
      await ElMessageBox.confirm('确定要删除该权限吗？删除后无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      let parent: Api.SystemManage.MenuData | null = null

      // 优先使用 parentId 查找（更准确）
      if (parentId && typeof parentId === 'number') {
        const parentMenu = await fetchGetMenuTree()
        parent = findMenuById(parentMenu, parentId)
      } else if (parentPath) {
        // 兼容：使用 parentPath 查找
        const parentMenu = await fetchGetMenuTree()
        parent = findMenuByPath(parentMenu, parentPath)
      }

      if (!parent || !parent.id) {
        ElMessage.error('找不到父菜单')
        return
      }

      // 确保使用正确的按钮数据源：从 API 返回的 buttons 字段获取
      const currentButtons = parent.buttons || []
      const targetAuthMark = row.meta?.authMark

      if (!targetAuthMark) {
        ElMessage.error('无法确定要删除的权限标识')
        return
      }

      // 过滤掉要删除的按钮（只删除匹配 authMark 的按钮）
      const buttons = currentButtons.filter((btn) => btn.authMark !== targetAuthMark)

      // 验证：确保至少删除了一个按钮
      if (buttons.length === currentButtons.length) {
        ElMessage.error('未找到要删除的权限按钮')
        return
      }

      await fetchUpdateMenu(parent.id, { buttons })
      ElMessage.success('删除成功')
      await getMenuList()
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error(error instanceof Error ? error.message : '删除失败')
      }
    }
  }

  /**
   * 在菜单树中查找指定路径的菜单
   */
  const findMenuByPath = (
    menus: Api.SystemManage.MenuData[],
    path: string
  ): Api.SystemManage.MenuData | null => {
    for (const menu of menus) {
      if (menu.path === path) {
        return menu
      }
      if (menu.children) {
        const found = findMenuByPath(menu.children, path)
        if (found) return found
      }
    }
    return null
  }

  /**
   * 切换展开/收起所有菜单
   */
  const toggleExpand = (): void => {
    isExpanded.value = !isExpanded.value
    nextTick(() => {
      if (tableRef.value?.elTableRef && filteredTableData.value) {
        const processRows = (rows: AppRouteRecord[]) => {
          rows.forEach((row) => {
            if (row.children?.length) {
              tableRef.value.elTableRef.toggleRowExpansion(row, isExpanded.value)
              processRows(row.children)
            }
          })
        }
        processRows(filteredTableData.value)
      }
    })
  }

  /**
   * 行点击事件
   */
  const handleRowClick = (row: AppRouteRecord, column: any): void => {
    // 如果点击的是操作列、操作按钮或其父元素，则不触发展开/折叠
    if (column?.property === 'operation') {
      return
    }

    // 判断是否为类型节点（父级行）
    if (row.children?.length && tableRef.value?.elTableRef) {
      // 切换该行的展开/折叠状态
      tableRef.value.elTableRef.toggleRowExpansion(row)
    }
  }
</script>
