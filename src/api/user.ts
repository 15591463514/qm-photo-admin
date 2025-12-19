import request from '@/utils/http'

/**
 * 获取用户列表
 * @param params 搜索参数
 * @returns 用户列表
 */
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/api/user/list',
    params
  })
}

/**
 * 创建用户
 * @param params 创建用户参数
 * @returns 创建的用户信息
 */
export function fetchCreateUser(params: Api.SystemManage.CreateUserParams) {
  return request.post<Api.SystemManage.UserListItem>({
    url: '/api/user',
    params
  })
}

/**
 * 更新用户
 * @param id 用户ID
 * @param params 更新用户参数
 * @returns 更新后的用户信息
 */
export function fetchUpdateUser(id: number, params: Api.SystemManage.UpdateUserParams) {
  return request.put<Api.SystemManage.UserListItem>({
    url: `/api/user/${id}`,
    params
  })
}

/**
 * 删除用户
 * @param id 用户ID
 * @returns 删除的用户信息
 */
export function fetchDeleteUser(id: number) {
  return request.del<Api.SystemManage.UserListItem>({
    url: `/api/user/${id}`
  })
}

/**
 * 更改密码
 * @param params 更改密码参数
 * @returns 更改密码响应
 */
export function fetchChangePassword(params: {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}) {
  return request.post<{ message: string }>({
    url: '/api/user/change-password',
    params
  })
}
