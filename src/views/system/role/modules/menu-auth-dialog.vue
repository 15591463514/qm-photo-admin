<template>
  <ElDialog
    v-model="dialogVisible"
    title="绑定菜单按钮权限"
    width="800px"
    align-center
    @closed="handleClosed"
  >
    <div v-loading="loading" class="menu-auth-dialog">
      <div class="mb-4">
        <ElText type="info">角色：{{ roleData?.roleName }}</ElText>
      </div>

      <ElTree
        ref="treeRef"
        :data="menuTree"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-expand-all="true"
        :check-strictly="true"
        :check-on-click-node="false"
        @check="handleCheck"
      >
        <template #default="{ data }">
          <div class="flex items-center justify-between flex-1 pr-4">
            <div class="flex items-center gap-2">
              <ElIcon v-if="data.icon" :size="16">
                <ArtSvgIcon :icon="data.icon" />
              </ElIcon>
              <span>{{ data.title || data.name }}</span>
              <ElTag v-if="data.type === 'button'" size="small" type="warning">按钮</ElTag>
            </div>
            <div v-if="data.buttons && data.buttons.length > 0" class="flex items-center gap-1">
              <ElCheckbox
                v-for="button in data.buttons"
                :key="button.id"
                :model-value="isButtonChecked(data.id!, button.id!)"
                :label="button.title"
                size="small"
                @change="(val) => handleButtonCheck(data.id!, button.id!, !!val)"
                @click.stop
              />
            </div>
          </div>
        </template>
      </ElTree>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <ElButton @click="handleCancel">取 消</ElButton>
        <ElButton type="primary" @click="handleSubmit" :loading="saving">确 定</ElButton>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import { ElTree, ElCheckbox, ElText, ElIcon, ElMessage } from 'element-plus'
  import { fetchGetMenuTree } from '@/api/menu'
  import { fetchGetRolePermissions, fetchAssignRolePermissions } from '@/api/role'

  interface Props {
    visible: boolean
    roleData?: Api.SystemManage.RoleListItem | null
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'success'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: false,
    roleData: null
  })

  const emit = defineEmits<Emits>()

  const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
  })

  const loading = ref(false)
  const saving = ref(false)
  const treeRef = ref<InstanceType<typeof ElTree>>()
  const menuTree = ref<Api.SystemManage.MenuData[]>([])

  /** 存储选中的权限：{ menuId: { buttonIds: number[] } } */
  const selectedPermissions = ref<Map<number, { buttonIds: number[] }>>(new Map())

  const treeProps = {
    children: 'children',
    label: 'title'
  }

  /**
   * 加载菜单树
   */
  const loadMenuTree = async () => {
    try {
      loading.value = true
      const data = await fetchGetMenuTree()
      menuTree.value = data
    } catch (error) {
      console.error('加载菜单树失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 加载角色权限
   */
  const loadRolePermissions = async () => {
    if (!props.roleData?.roleId) return

    try {
      loading.value = true
      const permissions = await fetchGetRolePermissions(props.roleData.roleId)

      // 重置选中状态
      selectedPermissions.value.clear()

      // 设置选中的权限
      for (const perm of permissions) {
        // 只要有菜单权限或按钮权限，就添加到权限记录中
        if (perm.hasMenuPermission || (perm.buttonIds && perm.buttonIds.length > 0)) {
          selectedPermissions.value.set(perm.menuId, {
            buttonIds: perm.buttonIds || []
          })
        }
      }

      // 设置树节点的选中状态
      await nextTick()

      if (treeRef.value) {
        // 只勾选有菜单权限的菜单节点（不包括只有按钮权限的）
        for (const perm of permissions) {
          if (perm.hasMenuPermission && perm.menuId) {
            treeRef.value.setChecked(perm.menuId, true, false)
          }
        }
      }
    } catch (error) {
      console.error('加载角色权限失败:', error)
    } finally {
      loading.value = false
    }
  }

  /**
   * 检查按钮是否被选中
   */
  const isButtonChecked = (menuId: number, buttonId: number): boolean => {
    const perm = selectedPermissions.value.get(menuId)
    return perm ? perm.buttonIds.includes(buttonId) : false
  }

  /**
   * 递归查找菜单的所有子菜单ID
   */
  const getAllChildrenIds = (menu: Api.SystemManage.MenuData): number[] => {
    const childrenIds: number[] = []
    if (menu.children && menu.children.length > 0) {
      for (const child of menu.children) {
        if (child.id) {
          childrenIds.push(child.id)
          // 递归获取子菜单的子菜单
          childrenIds.push(...getAllChildrenIds(child))
        }
      }
    }
    return childrenIds
  }

  /**
   * 构建菜单ID到菜单对象的映射（扁平化）
   */
  const buildMenuMap = (
    menus: Api.SystemManage.MenuData[]
  ): Map<number, Api.SystemManage.MenuData> => {
    const menuMap = new Map<number, Api.SystemManage.MenuData>()

    const traverse = (menuList: Api.SystemManage.MenuData[]) => {
      for (const menu of menuList) {
        if (menu.id) {
          menuMap.set(menu.id, menu)
        }
        if (menu.children && menu.children.length > 0) {
          traverse(menu.children)
        }
      }
    }

    traverse(menus)
    return menuMap
  }

  /**
   * 递归查找菜单的所有父菜单ID（向上查找）
   */
  const getAllParentIds = (menuId: number, menus: Api.SystemManage.MenuData[]): number[] => {
    const parentIds: number[] = []
    const menuMap = buildMenuMap(menus)

    let currentMenuId: number | undefined = menuId

    // 向上查找所有父菜单
    while (currentMenuId) {
      const menu = menuMap.get(currentMenuId)
      if (!menu || !menu.parentId || menu.parentId === 0) {
        break
      }
      parentIds.push(menu.parentId)
      currentMenuId = menu.parentId
    }

    return parentIds
  }

  /**
   * 处理菜单节点勾选
   */
  const handleCheck = (data: Api.SystemManage.MenuData, checked: any) => {
    if (!data.id) return

    const checkedKeys = checked.checkedKeys || []
    const isChecked = checkedKeys.includes(data.id)

    if (isChecked) {
      // 选中菜单时，只设置菜单权限（不自动选中按钮权限）
      if (!selectedPermissions.value.has(data.id)) {
        selectedPermissions.value.set(data.id, {
          buttonIds: []
        })
      }

      // 递归向上勾选所有父菜单
      const parentIds = getAllParentIds(data.id, menuTree.value)
      if (parentIds.length > 0 && treeRef.value) {
        for (const parentId of parentIds) {
          treeRef.value.setChecked(parentId, true, false)
          // 同时设置父菜单的权限（如果没有按钮权限，只设置菜单权限）
          if (!selectedPermissions.value.has(parentId)) {
            selectedPermissions.value.set(parentId, {
              buttonIds: []
            })
          }
        }
      }
    } else {
      // 取消选中菜单时，只移除菜单权限（不自动移除按钮权限）
      const perm = selectedPermissions.value.get(data.id)
      if (perm) {
        if (perm.buttonIds.length === 0) {
          // 如果没有按钮权限，完全移除
          selectedPermissions.value.delete(data.id)
        } else {
          // 如果还有按钮权限，保留按钮权限（只移除菜单权限标记）
          // 注意：按钮权限和菜单权限独立，取消菜单不影响按钮权限
          // 但按钮权限需要菜单权限才能生效，所以这里保留按钮权限数据
          // 实际使用时，后端会检查菜单权限
        }
      }

      // 递归向下取消所有子菜单的选中
      const childrenIds = getAllChildrenIds(data)
      if (childrenIds.length > 0 && treeRef.value) {
        for (const childId of childrenIds) {
          treeRef.value.setChecked(childId, false, false)
          // 只移除菜单权限，保留按钮权限
          const childPerm = selectedPermissions.value.get(childId)
          if (childPerm) {
            if (childPerm.buttonIds.length === 0) {
              selectedPermissions.value.delete(childId)
            }
            // 如果有按钮权限，保留按钮权限数据
          }
        }
      }

      // 检查父菜单：如果父菜单下的所有子菜单都没有勾选（只判断菜单权限，不判断按钮权限），则取消父菜单
      if (data.parentId && data.parentId !== 0 && treeRef.value) {
        const parentMenu = findMenuById(data.parentId, menuTree.value)
        if (parentMenu) {
          const parentChildrenIds = getAllChildrenIds(parentMenu)
          // 检查所有子菜单是否都没有被勾选（只判断菜单权限）
          const hasAnyChildChecked = parentChildrenIds.some((childId) => {
            return treeRef.value?.getCheckedKeys().includes(childId)
          })

          // 如果所有子菜单都没有被勾选，且父菜单被勾选，则取消父菜单
          if (!hasAnyChildChecked) {
            const isParentChecked = treeRef.value.getCheckedKeys().includes(data.parentId)
            if (isParentChecked) {
              treeRef.value.setChecked(data.parentId, false, false)
              const parentPerm = selectedPermissions.value.get(data.parentId)
              if (parentPerm && parentPerm.buttonIds.length === 0) {
                selectedPermissions.value.delete(data.parentId)
              }
            }
          }
        }
      }
    }
  }

  /**
   * 在菜单树中查找指定ID的菜单
   */
  const findMenuById = (
    menuId: number,
    menus: Api.SystemManage.MenuData[]
  ): Api.SystemManage.MenuData | null => {
    for (const menu of menus) {
      if (menu.id === menuId) {
        return menu
      }
      if (menu.children && menu.children.length > 0) {
        const found = findMenuById(menuId, menu.children)
        if (found) return found
      }
    }
    return null
  }

  /**
   * 处理按钮勾选
   * 按钮权限和菜单权限独立，不进行联动
   */
  const handleButtonCheck = (menuId: number, buttonId: number, checked: boolean) => {
    // 获取或创建权限记录
    const existingPerm = selectedPermissions.value.get(menuId) || {
      buttonIds: []
    }

    // 更新按钮权限
    if (checked) {
      if (!existingPerm.buttonIds.includes(buttonId)) {
        existingPerm.buttonIds.push(buttonId)
      }
    } else {
      const index = existingPerm.buttonIds.indexOf(buttonId)
      if (index > -1) {
        existingPerm.buttonIds.splice(index, 1)
      }
    }

    // 更新权限记录（不联动菜单勾选状态）
    if (existingPerm.buttonIds.length > 0) {
      selectedPermissions.value.set(menuId, existingPerm)
    } else {
      // 如果所有按钮都取消，且没有菜单权限，则移除记录
      const menuChecked = treeRef.value?.getCheckedKeys().includes(menuId)
      if (!menuChecked) {
        selectedPermissions.value.delete(menuId)
      } else {
        // 如果菜单还选中着，保留记录但清空按钮权限
        selectedPermissions.value.set(menuId, {
          buttonIds: []
        })
      }
    }
  }

  /**
   * 收集所有选中的权限（包括子菜单）
   * 确保如果子菜单被选中，父菜单也被包含
   */
  const collectSelectedPermissions = (): Api.SystemManage.RolePermissionItem[] => {
    const permissions: Api.SystemManage.RolePermissionItem[] = []

    // 获取所有勾选的菜单ID（树节点选中状态）
    const checkedKeys = treeRef.value?.getCheckedKeys() || []
    const checkedMenuIds = new Set<number>(
      checkedKeys.filter((key): key is number => typeof key === 'number')
    )

    // 收集所有有权限记录的菜单ID（包括只有按钮权限的）
    const menuIdSet = new Set<number>()
    for (const [menuId] of selectedPermissions.value.entries()) {
      menuIdSet.add(menuId)
    }

    // 确保如果子菜单被选中，父菜单也被包含
    const finalMenuIds = new Set<number>(menuIdSet)
    for (const menuId of menuIdSet) {
      const parentIds = getAllParentIds(menuId, menuTree.value)
      for (const parentId of parentIds) {
        finalMenuIds.add(parentId)
      }
    }

    // 过滤父菜单：如果父菜单下的所有子菜单都没有勾选（只判断菜单权限，不判断按钮权限），则移除父菜单
    const filteredMenuIds = new Set<number>(finalMenuIds)
    for (const menuId of finalMenuIds) {
      const menu = findMenuById(menuId, menuTree.value)
      if (menu && menu.children && menu.children.length > 0) {
        // 检查所有子菜单是否都没有被勾选（只判断菜单权限）
        const childrenIds = getAllChildrenIds(menu)
        const hasAnyChildChecked = childrenIds.some((childId) => {
          return checkedMenuIds.has(childId)
        })

        // 如果所有子菜单都没有被勾选，且父菜单本身也没有按钮权限，则移除父菜单
        if (!hasAnyChildChecked) {
          const parentPerm = selectedPermissions.value.get(menuId)
          const hasParentButtonPermissions =
            parentPerm && parentPerm.buttonIds && parentPerm.buttonIds.length > 0
          const isParentChecked = checkedMenuIds.has(menuId)

          // 如果父菜单没有被勾选，且没有按钮权限，则移除
          if (!isParentChecked && !hasParentButtonPermissions) {
            filteredMenuIds.delete(menuId)
          }
        }
      }
    }

    // 构建权限列表
    for (const menuId of filteredMenuIds) {
      const perm = selectedPermissions.value.get(menuId)
      const hasMenuPermission = checkedMenuIds.has(menuId) // 树节点是否被勾选
      const hasButtonPermissions = perm && perm.buttonIds && perm.buttonIds.length > 0

      // 只有当有菜单权限或按钮权限时才添加到权限列表
      if (hasMenuPermission || hasButtonPermissions) {
        permissions.push({
          menuId,
          hasMenuPermission, // 明确标识是否有菜单权限
          buttonIds: hasButtonPermissions ? perm.buttonIds : undefined
        })
      }
    }

    return permissions
  }

  /**
   * 提交保存
   */
  const handleSubmit = async () => {
    if (!props.roleData?.roleId) return

    try {
      saving.value = true
      const permissions = collectSelectedPermissions()

      await fetchAssignRolePermissions(props.roleData.roleId, {
        permissions
      })

      ElMessage.success('权限分配成功')
      emit('success')
      dialogVisible.value = false
    } catch (error) {
      console.error('保存权限失败:', error)
    } finally {
      saving.value = false
    }
  }

  /**
   * 取消
   */
  const handleCancel = () => {
    dialogVisible.value = false
  }

  /**
   * 对话框关闭后重置
   */
  const handleClosed = () => {
    selectedPermissions.value.clear()
    if (treeRef.value) {
      treeRef.value.setCheckedKeys([])
    }
  }

  // 监听对话框显示，加载数据
  watch(
    () => props.visible,
    (visible) => {
      if (visible) {
        loadMenuTree().then(() => {
          loadRolePermissions()
        })
      }
    },
    { immediate: true }
  )
</script>

<style scoped lang="scss">
  .menu-auth-dialog {
    min-height: 400px;
    max-height: 600px;
    overflow-y: auto;

    :deep(.el-tree-node__content) {
      height: auto;
      min-height: 32px;
      padding: 4px 0;
    }

    :deep(.el-checkbox) {
      margin-right: 8px;
    }
  }
</style>
