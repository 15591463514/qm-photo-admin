import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

// 创建用户
export function fetchCreateUser(params: Api.SystemManage.CreateUserParams) {
  return request.post<Api.SystemManage.UserListItem>({
    url: '/api/user',
    params
  })
}

// 更新用户
export function fetchUpdateUser(id: number, params: Api.SystemManage.UpdateUserParams) {
  return request.put<Api.SystemManage.UserListItem>({
    url: `/api/user/${id}`,
    params
  })
}

// 删除用户
export function fetchDeleteUser(id: number) {
  return request.del<Api.SystemManage.UserListItem>({
    url: `/api/user/${id}`
  })
}

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

// 获取角色详情
export function fetchGetRoleDetail(roleId: number) {
  return request.get<Api.SystemManage.RoleListItem>({
    url: `/api/role/${roleId}`
  })
}

// 创建角色
export function fetchCreateRole(params: Api.SystemManage.CreateRoleParams) {
  return request.post<Api.SystemManage.RoleListItem>({
    url: '/api/role',
    params
  })
}

// 更新角色
export function fetchUpdateRole(roleId: number, params: Api.SystemManage.UpdateRoleParams) {
  return request.put<Api.SystemManage.RoleListItem>({
    url: `/api/role/${roleId}`,
    params
  })
}

// 删除角色
export function fetchDeleteRole(roleId: number) {
  return request.del<Api.SystemManage.RoleListItem>({
    url: `/api/role/${roleId}`
  })
}

// 获取菜单列表
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/v3/system/menus/simple'
  })
}
