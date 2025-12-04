import request from '@/utils/http'

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
