/**
 * 认证类型定义
 *
 * 提供登录、注册、用户信息等认证相关类型
 */

/// <reference path="./common.d.ts" />

declare namespace Api {
  namespace Auth {
    /** 登录参数 */
    interface LoginParams {
      account: string
      password: string
      captchaId: string
      captchaText: string
    }

    /** 验证码响应 */
    interface CaptchaResponse {
      captchaId: string
      svg: string
    }

    /** 登录响应 */
    interface LoginResponse {
      token: string
      refreshToken: string
    }

    /** 刷新 Token 响应 */
    interface RefreshTokenResponse {
      token: string
    }

    /** 注册参数 */
    interface RegisterParams {
      username: string
      password: string
      email: string
      verificationCode: string
    }

    /** 发送验证码参数 */
    interface SendVerificationCodeParams {
      email: string
    }

    /** 发送验证码响应 */
    interface SendVerificationCodeResponse {
      message: string
    }

    /** 注册响应 */
    interface RegisterResponse {
      userId: string
      userName: string
      message: string
      token: string
      refreshToken: string
    }

    /** 用户信息 */
    interface UserInfo {
      buttons: string[]
      roles: string[]
      userId: number
      userName: string
      nickName?: string | null
      email?: string | null
      avatar?: string | null
      userGender?: string | null
    }
  }
}
