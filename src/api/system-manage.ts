import request from '@/utils/http'

/** 获取用户列表 */
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

/** 创建用户 */
export function fetchCreateUser(params: Api.SystemManage.CreateUserParams) {
  return request.post<Api.SystemManage.UserListItem>({
    url: '/api/user',
    params
  })
}

/** 更新用户 */
export function fetchUpdateUser(id: number, params: Api.SystemManage.UpdateUserParams) {
  return request.put<Api.SystemManage.UserListItem>({
    url: `/api/user/${id}`,
    params
  })
}

/** 删除用户 */
export function fetchDeleteUser(id: number) {
  return request.del<Api.SystemManage.UserListItem>({
    url: `/api/user/${id}`
  })
}

/** 获取角色列表 */
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

/** 获取角色详情 */
export function fetchGetRoleDetail(roleId: number) {
  return request.get<Api.SystemManage.RoleListItem>({
    url: `/api/role/${roleId}`
  })
}

/** 创建角色 */
export function fetchCreateRole(params: Api.SystemManage.CreateRoleParams) {
  return request.post<Api.SystemManage.RoleListItem>({
    url: '/api/role',
    params
  })
}

/** 更新角色 */
export function fetchUpdateRole(roleId: number, params: Api.SystemManage.UpdateRoleParams) {
  return request.put<Api.SystemManage.RoleListItem>({
    url: `/api/role/${roleId}`,
    params
  })
}

/** 删除角色 */
export function fetchDeleteRole(roleId: number) {
  return request.del<Api.SystemManage.RoleListItem>({
    url: `/api/role/${roleId}`
  })
}

/** 获取角色权限 */
export function fetchGetRolePermissions(roleId: number) {
  return request.get<Api.SystemManage.RolePermissionsResponse[]>({
    url: `/api/role/${roleId}/permissions`
  })
}

/** 分配角色权限 */
export function fetchAssignRolePermissions(
  roleId: number,
  params: Api.SystemManage.AssignRolePermissionsParams
) {
  return request.post<{ message: string }>({
    url: `/api/role/${roleId}/permissions`,
    params
  })
}

/** ==================== 菜单管理 ==================== */

/** 获取菜单树形结构 */
export function fetchGetMenuTree(params?: Api.SystemManage.MenuSearchParams) {
  return request.get<Api.SystemManage.MenuData[]>({
    url: '/api/menu/tree',
    params
  })
}

/** 获取菜单详情 */
export function fetchGetMenuDetail(id: number) {
  return request.get<Api.SystemManage.MenuData>({
    url: `/api/menu/${id}`
  })
}

/** 创建菜单 */
export function fetchCreateMenu(params: Api.SystemManage.CreateMenuParams) {
  return request.post<Api.SystemManage.MenuData>({
    url: '/api/menu',
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/** 更新菜单 */
export function fetchUpdateMenu(id: number, params: Api.SystemManage.UpdateMenuParams) {
  return request.put<Api.SystemManage.MenuData>({
    url: `/api/menu/${id}`,
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/** 删除菜单 */
export function fetchDeleteMenu(id: number) {
  return request.del<Api.SystemManage.MenuData>({
    url: `/api/menu/${id}`,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/** ==================== 字典管理 ==================== */

/** 获取字典树形结构 */
export function fetchGetDictTree(params: Api.SystemManage.DictTreeSearchParams) {
  return request.get<Api.SystemManage.DictTreeItem[]>({
    url: '/api/dict/tree',
    params
  })
}

/** 根据字典类型获取字典数据 */
export function fetchGetDictDataByType(typeCode: string, status?: string) {
  return request.get<Api.SystemManage.DictData[]>({
    url: `/api/dict/data/${typeCode}`,
    params: status ? { status } : undefined
  })
}

/** 获取字典详情 */
export function fetchGetDictDetail(id: number) {
  return request.get<Api.SystemManage.DictData>({
    url: `/api/dict/${id}`
  })
}

/** 创建字典 */
export function fetchCreateDict(params: Api.SystemManage.CreateDictParams) {
  return request.post<Api.SystemManage.DictData>({
    url: '/api/dict',
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/** 更新字典 */
export function fetchUpdateDict(id: number, params: Api.SystemManage.UpdateDictParams) {
  return request.put<Api.SystemManage.DictData>({
    url: `/api/dict/${id}`,
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/** 删除字典 */
export function fetchDeleteDict(id: number) {
  return request.del<Api.SystemManage.DictData>({
    url: `/api/dict/${id}`,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/** 更新字典类型 */
export function fetchUpdateDictType(
  typeCode: string,
  params: Api.SystemManage.UpdateDictTypeParams
) {
  return request.put<{ count: number }>({
    url: `/api/dict/type/${typeCode}`,
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/** 删除字典类型 */
export function fetchDeleteDictType(typeCode: string) {
  return request.del<{ count: number }>({
    url: `/api/dict/type/${typeCode}`,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}
