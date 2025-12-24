import request from '@/utils/http'

/**
 * 获取角色列表
 * @param params 搜索参数
 * @returns 角色列表
 */
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

/**
 * 获取角色详情
 * @param roleId 角色ID
 * @returns 角色详情
 */
export function fetchGetRoleDetail(roleId: number) {
  return request.get<Api.SystemManage.RoleListItem>({
    url: `/api/role/${roleId}`
  })
}

/**
 * 创建角色
 * @param params 创建角色参数
 * @returns 创建的角色信息
 */
export function fetchCreateRole(params: Api.SystemManage.CreateRoleParams) {
  return request.post<Api.SystemManage.RoleListItem>({
    url: '/api/role',
    params
  })
}

/**
 * 更新角色
 * @param roleId 角色ID
 * @param params 更新角色参数
 * @returns 更新后的角色信息
 */
export function fetchUpdateRole(roleId: number, params: Api.SystemManage.UpdateRoleParams) {
  return request.put<Api.SystemManage.RoleListItem>({
    url: `/api/role/${roleId}`,
    params
  })
}

/**
 * 删除角色
 * @param roleId 角色ID
 * @returns 删除的角色信息
 */
export function fetchDeleteRole(roleId: number) {
  return request.del<Api.SystemManage.RoleListItem>({
    url: `/api/role/${roleId}`
  })
}

/**
 * 获取角色权限
 * @param roleId 角色ID
 * @returns 角色权限列表
 */
export function fetchGetRolePermissions(roleId: number) {
  return request.get<Api.SystemManage.RolePermissionsResponse[]>({
    url: `/api/role/${roleId}/permissions`
  })
}

/**
 * 分配角色权限
 * @param roleId 角色ID
 * @param params 权限分配参数
 * @returns 分配结果
 */
export function fetchAssignRolePermissions(
  roleId: number,
  params: Api.SystemManage.AssignRolePermissionsParams
) {
  return request.post<{ message: string }>({
    url: `/api/role/${roleId}/permissions`,
    params
  })
}
