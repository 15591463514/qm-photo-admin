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
  import {
    fetchGetMenuTree,
    fetchGetRolePermissions,
    fetchAssignRolePermissions
  } from '@/api/system-manage'

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
        if (perm.hasMenuPermission || (perm.buttonIds && perm.buttonIds.length > 0)) {
          selectedPermissions.value.set(perm.menuId, {
            buttonIds: perm.buttonIds || []
          })
        }
      }

      // 设置树节点的选中状态
      await nextTick()

      if (treeRef.value) {
        // 设置菜单节点选中状态（有菜单权限或按钮权限的都选中）
        for (const [menuId] of selectedPermissions.value.entries()) {
          if (menuId) {
            treeRef.value.setChecked(menuId, true, false)
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
   * 处理菜单节点勾选
   */
  const handleCheck = (data: Api.SystemManage.MenuData, checked: any) => {
    if (!data.id) return

    const checkedKeys = checked.checkedKeys || []
    const isChecked = checkedKeys.includes(data.id)

    if (isChecked) {
      // 选中菜单时，设置菜单权限，选中所有按钮权限
      selectedPermissions.value.set(data.id, {
        buttonIds: data.buttons?.map((button) => button.id!).filter((id) => id !== undefined) || []
      })
      // 只要勾选菜单，应该勾选父菜单
      if (data.parentId) {
        treeRef.value?.setChecked(data.parentId, true, false)
      }
    } else {
      // 取消选中菜单时，移除菜单权限和所有按钮权限
      selectedPermissions.value.delete(data.id)
    }
  }

  /**
   * 处理按钮勾选
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

    // 更新权限记录
    if (existingPerm.buttonIds.length > 0) {
      selectedPermissions.value.set(menuId, existingPerm)
      // 在树中选中菜单（因为按钮权限需要菜单权限）
      if (treeRef.value) {
        treeRef.value.setChecked(menuId, true, false)
      }
    } else {
      // 如果所有按钮都取消，移除记录
      selectedPermissions.value.delete(menuId)
      // 在树中取消选中菜单
      if (treeRef.value) {
        treeRef.value.setChecked(menuId, false, false)
      }
    }
  }

  /**
   * 收集所有选中的权限（包括子菜单）
   */
  const collectSelectedPermissions = (): Api.SystemManage.RolePermissionItem[] => {
    const permissions: Api.SystemManage.RolePermissionItem[] = []

    // 递归收集所有选中的菜单
    const collectMenus = (menus: Api.SystemManage.MenuData[]) => {
      for (const menu of menus) {
        // 如果菜单有权限记录（菜单权限或按钮权限）
        if (menu.id && selectedPermissions.value.has(menu.id)) {
          const perm = selectedPermissions.value.get(menu.id)!

          // 如果有按钮权限，添加到权限列表
          if (perm.buttonIds.length > 0) {
            permissions.push({
              menuId: menu.id,
              buttonIds: perm.buttonIds
            })
          } else {
            // 如果只有菜单权限（没有按钮权限），也添加到权限列表
            permissions.push({
              menuId: menu.id,
              buttonIds: undefined
            })
          }
        }

        // 递归处理子菜单
        if (menu.children && menu.children.length > 0) {
          collectMenus(menu.children)
        }
      }
    }

    collectMenus(menuTree.value)
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
