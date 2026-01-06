import request from '@/utils/http'

/**
 * 获取图片验证码
 * @returns 验证码响应
 */
export function fetchCaptcha() {
  return request.get<Api.Auth.CaptchaResponse>({
    url: '/api/auth/captcha'
  })
}

/**
 * 登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/login',
    params
    // showSuccessMessage: true // 显示成功消息
    // showErrorMessage: false // 不显示错误消息
  })
}

/**
 * 发送验证码
 * @param params 发送验证码参数
 * @returns 发送验证码响应
 */
export function fetchSendVerificationCode(params: Api.Auth.SendVerificationCodeParams) {
  return request.post<Api.Auth.SendVerificationCodeResponse>({
    url: '/api/auth/send-verification-code',
    params
  })
}

/**
 * 注册
 * @param params 注册参数
 * @returns 注册响应
 */
export function fetchRegister(params: Api.Auth.RegisterParams) {
  return request.post<Api.Auth.RegisterResponse>({
    url: '/api/auth/register',
    params
  })
}

/**
 * 获取用户信息
 * @returns 用户信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/api/user/info'
    // 自定义请求头
    // headers: {
    //   'X-Custom-Header': 'your-custom-value'
    // }
  })
}

/**
 * 获取当前用户有权限的菜单
 * @returns 用户可访问的菜单树
 */
export function fetchGetUserMenus() {
  return request.get<Api.SystemManage.MenuData[]>({
    url: '/api/user/menus'
  })
}

/**
 * 刷新 AccessToken
 * @param refreshToken Refresh Token
 * @returns 新的 Access Token
 */
export function fetchRefreshToken(refreshToken: string) {
  return request.post<Api.Auth.RefreshTokenResponse>({
    url: '/api/auth/refresh',
    params: { refreshToken },
    showErrorMessage: false // 刷新接口失败时不显示错误消息，由拦截器统一处理
  })
}
