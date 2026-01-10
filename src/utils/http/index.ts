/**
 * HTTP 请求封装模块
 * 基于 Axios 封装的 HTTP 请求工具，提供统一的请求/响应处理
 *
 * ## 主要功能
 *
 * - 请求/响应拦截器（自动添加 Token、统一错误处理）
 * - 401 未授权自动登出（带防抖机制）
 * - 请求失败自动重试（可配置）
 * - 统一的成功/错误消息提示
 * - 支持 GET/POST/PUT/DELETE 等常用方法
 *
 * @module utils/http
 * @author Art Design Pro Team
 */

import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useUserStore } from '@/store/modules/user'
import { ApiStatus } from './status'
import { HttpError, handleError, showError, showSuccess } from './error'
import { $t } from '@/locales'
import { BaseResponse } from '@/types'
import { fetchRefreshToken } from '@/api/auth'

/** 请求配置常量 */
const REQUEST_TIMEOUT = 15000
const LOGOUT_DELAY = 500
const MAX_RETRIES = 0
const RETRY_DELAY = 1000
const UNAUTHORIZED_DEBOUNCE_TIME = 3000

/** 401防抖状态 */
let isUnauthorizedErrorShown = false
let unauthorizedTimer: NodeJS.Timeout | null = null

/** Token 刷新相关状态 */
let isRefreshing = false // 是否正在刷新 Token
let failedQueue: Array<{
  resolve: (value?: any) => void
  reject: (error?: any) => void
  config: InternalAxiosRequestConfig
}> = [] // 刷新期间失败的请求队列

/** 扩展 AxiosRequestConfig */
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  showErrorMessage?: boolean
  showSuccessMessage?: boolean
}

const { VITE_API_URL, VITE_WITH_CREDENTIALS } = import.meta.env

/** Axios实例 */
const axiosInstance = axios.create({
  timeout: REQUEST_TIMEOUT,
  baseURL: VITE_API_URL,
  withCredentials: VITE_WITH_CREDENTIALS === 'true',
  validateStatus: (status) => status >= 200 && status < 300,
  transformResponse: [
    (data, headers) => {
      const contentType = headers['content-type']
      if (contentType?.includes('application/json')) {
        try {
          return JSON.parse(data)
        } catch {
          return data
        }
      }
      return data
    }
  ]
})

/** 请求拦截器 */
axiosInstance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const { accessToken } = useUserStore()
    if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`)

    if (request.data && !(request.data instanceof FormData) && !request.headers['Content-Type']) {
      request.headers.set('Content-Type', 'application/json')
      request.data = JSON.stringify(request.data)
    }

    return request
  },
  (error) => {
    showError(createHttpError($t('httpMsg.requestConfigError'), ApiStatus.error))
    return Promise.reject(error)
  }
)

/** 响应拦截器 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    const { code, message } = response.data
    if (code === ApiStatus.success) return response
    if (code === ApiStatus.unauthorized) {
      // 异步处理 401，返回 Promise
      return handleUnauthorizedResponse(response.config, message)
    }
    throw createHttpError(message || $t('httpMsg.requestFailed'), code)
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 处理 401 错误
    if (
      error.response?.status === ApiStatus.unauthorized &&
      originalRequest &&
      !originalRequest._retry
    ) {
      return handleUnauthorizedResponse(originalRequest)
    }

    return Promise.reject(handleError(error))
  }
)

/** 统一创建HttpError */
function createHttpError(message: string, code: number) {
  return new HttpError(message, code)
}

/**
 * 处理 401 未授权响应
 * 尝试刷新 Token，如果刷新失败则退出登录
 */
async function handleUnauthorizedResponse(
  config: InternalAxiosRequestConfig,
  message?: string
): Promise<any> {
  const userStore = useUserStore()
  const { refreshToken } = userStore

  // 如果没有 refreshToken，直接退出登录
  if (!refreshToken) {
    return handleUnauthorizedError(message)
  }

  // 如果是刷新接口本身返回 401，直接退出登录（避免死循环）
  if (config.url?.includes('/api/auth/refresh')) {
    return handleUnauthorizedError(message || 'Refresh Token 无效或已过期')
  }

  // 如果正在刷新，将请求加入队列等待
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject, config })
    })
  }

  // 标记为正在刷新
  isRefreshing = true
  ;(config as any)._retry = true

  try {
    // 调用刷新接口
    const { token: newAccessToken } = await fetchRefreshToken(refreshToken)

    // 更新 AccessToken
    userStore.setToken(newAccessToken)

    // 更新请求头中的 Token
    config.headers.set('Authorization', `Bearer ${newAccessToken}`)

    // 重试原始请求
    const response = await axiosInstance.request<BaseResponse>(config)

    // 处理队列中的请求
    processQueue(newAccessToken)

    // 返回响应数据（与正常响应格式一致）
    return response
  } catch (error) {
    // 刷新失败，清空队列并退出登录
    processQueue(null, error)
    return handleUnauthorizedError(message || 'Token 刷新失败，请重新登录')
  } finally {
    isRefreshing = false
  }
}

/**
 * 处理请求队列
 * @param newAccessToken 新的 AccessToken（如果刷新成功）
 * @param error 错误对象（如果刷新失败）
 */
function processQueue(newAccessToken: string | null, error?: any) {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (newAccessToken) {
      // 刷新成功，更新 Token 并重试请求
      config.headers.set('Authorization', `Bearer ${newAccessToken}`)
      axiosInstance.request(config).then(resolve).catch(reject)
    } else {
      // 刷新失败，拒绝请求
      reject(error || createHttpError($t('httpMsg.unauthorized'), ApiStatus.unauthorized))
    }
  })

  // 清空队列
  failedQueue = []
}

/** 处理401错误（带防抖） */
function handleUnauthorizedError(message?: string): never {
  const error = createHttpError(message || $t('httpMsg.unauthorized'), ApiStatus.unauthorized)

  if (!isUnauthorizedErrorShown) {
    isUnauthorizedErrorShown = true
    logOut()

    unauthorizedTimer = setTimeout(resetUnauthorizedError, UNAUTHORIZED_DEBOUNCE_TIME)

    showError(error, true)
    throw error
  }

  throw error
}

/** 重置401防抖状态 */
function resetUnauthorizedError() {
  isUnauthorizedErrorShown = false
  if (unauthorizedTimer) clearTimeout(unauthorizedTimer)
  unauthorizedTimer = null
}

/** 退出登录函数 */
function logOut() {
  setTimeout(() => {
    useUserStore().logOut()
  }, LOGOUT_DELAY)
}

/** 是否需要重试 */
function shouldRetry(statusCode: number) {
  return [
    ApiStatus.requestTimeout,
    ApiStatus.internalServerError,
    ApiStatus.badGateway,
    ApiStatus.serviceUnavailable,
    ApiStatus.gatewayTimeout
  ].includes(statusCode)
}

/** 请求重试逻辑 */
async function retryRequest<T>(
  config: ExtendedAxiosRequestConfig,
  retries: number = MAX_RETRIES
): Promise<T> {
  try {
    return await request<T>(config)
  } catch (error) {
    if (retries > 0 && error instanceof HttpError && shouldRetry(error.code)) {
      await delay(RETRY_DELAY)
      return retryRequest<T>(config, retries - 1)
    }
    throw error
  }
}

/** 延迟函数 */
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 请求函数 */
async function request<T = any>(config: ExtendedAxiosRequestConfig): Promise<T> {
  // POST | PUT | PATCH 参数自动填充
  if (
    ['POST', 'PUT', 'PATCH'].includes(config.method?.toUpperCase() || '') &&
    config.params &&
    !config.data
  ) {
    config.data = config.params
    config.params = undefined
  }

  try {
    const res = await axiosInstance.request<BaseResponse<T>>(config)

    // 显示成功消息
    if (config.showSuccessMessage && res.data.message) {
      showSuccess(res.data.message)
    }

    return res.data.data as T
  } catch (error) {
    if (error instanceof HttpError && error.code !== ApiStatus.unauthorized) {
      const showMsg = config.showErrorMessage !== false
      showError(error, showMsg)
    }
    return Promise.reject(error)
  }
}

/** API方法集合 */
const api = {
  get<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'GET' })
  },
  post<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'POST' })
  },
  put<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PUT' })
  },
  patch<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'PATCH' })
  },
  del<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>({ ...config, method: 'DELETE' })
  },
  request<T>(config: ExtendedAxiosRequestConfig) {
    return retryRequest<T>(config)
  }
}

export default api
