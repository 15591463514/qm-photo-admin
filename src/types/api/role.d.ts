/**
 * 角色管理类型定义
 *
 * 提供角色列表、权限分配等类型
 */

declare namespace Api {
  namespace SystemManage {
    /** 角色列表 */
    type RoleList = RoleListItem[]

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'>
    >

    /** 创建角色参数 */
    interface CreateRoleParams {
      roleName: string
      roleCode: string
      description?: string
      enabled?: boolean
    }

    /** 更新角色参数 */
    interface UpdateRoleParams {
      roleName?: string
      roleCode?: string
      description?: string
      enabled?: boolean
    }

    /** 角色权限项 */
    interface RolePermissionItem {
      menuId: number
      hasMenuPermission?: boolean // 是否有菜单权限，默认 false
      buttonIds?: number[]
    }

    /** 角色权限响应 */
    interface RolePermissionsResponse {
      menuId: number
      hasMenuPermission: boolean
      buttonIds: number[]
    }

    /** 分配角色权限参数 */
    interface AssignRolePermissionsParams {
      permissions: RolePermissionItem[]
    }
  }
}
