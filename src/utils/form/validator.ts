/**
 * 表单验证工具模块
 *
 * 提供全面的表单字段验证功能
 *
 * ## 主要功能
 *
 * - 手机号码验证（中国大陆格式）
 * - 固定电话验证（支持区号格式）
 * - 用户账号验证（字母开头，支持数字和下划线）
 * - 密码强度验证（普通密码、强密码）
 * - 密码强度评估（弱、中、强）
 * - IPv4 地址验证
 * - 邮箱地址验证（RFC 5322 标准）
 * - URL 地址验证
 * - 身份证号码验证（18位，含校验码验证）
 * - 银行卡号验证（Luhn 算法）
 * - 字符串空格处理
 *
 * ## 验证规则
 *
 * - 手机号：1开头，第二位3-9，共11位
 * - 账号：字母开头，5-20位，支持字母数字下划线
 * - 普通密码：6-20位，必须包含字母和数字
 * - 强密码：8-20位，必须包含大小写字母、数字和特殊字符
 * - 身份证：18位，含出生日期和校验码验证
 * - 银行卡：13-19位，通过 Luhn 算法验证
 *
 * @module utils/validation/formValidator
 * @author Art Design Pro Team
 */

/**
 * 密码强度级别枚举
 */
export enum PasswordStrength {
  WEAK = '弱',
  MEDIUM = '中',
  STRONG = '强'
}

/**
 * 去除字符串首尾空格
 * @param value 待处理的字符串
 * @returns 返回去除首尾空格后的字符串
 */
export function trimSpaces(value: string): string {
  if (typeof value !== 'string') {
    return ''
  }
  return value.trim()
}

/**
 * 验证手机号码（中国大陆）
 * @param value 手机号码字符串
 * @returns 返回验证结果，true表示格式正确
 */
export function validatePhone(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  // 中国大陆手机号码：1开头，第二位为3-9，共11位数字
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(value.trim())
}

/**
 * 验证固定电话号码（中国大陆）
 * @param value 电话号码字符串
 * @returns 返回验证结果，true表示格式正确
 */
export function validateTelPhone(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  // 支持格式：区号-号码，如：010-12345678、0755-1234567
  const telRegex = /^0\d{2,3}-?\d{7,8}$/
  return telRegex.test(value.trim().replace(/\s+/g, ''))
}

/**
 * 验证用户账号
 * @param value 账号字符串
 * @returns 返回验证结果，true表示格式正确
 * @description 规则：字母开头，3-20位，支持字母、数字、下划线
 */
export function validateAccount(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  // 字母开头，3-20位，支持字母、数字、下划线
  const accountRegex = /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/
  return accountRegex.test(value.trim())
}

/**
 * 验证密码
 * @param value 密码字符串
 * @returns 返回验证结果，true表示格式正确
 * @description 规则：6-20位，必须包含字母和数字
 */
export function validatePassword(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()

  // 长度检查
  if (trimmedValue.length < 6 || trimmedValue.length > 20) {
    return false
  }

  // 必须包含字母和数字
  const hasLetter = /[a-zA-Z]/.test(trimmedValue)
  const hasNumber = /\d/.test(trimmedValue)

  return hasLetter && hasNumber
}

/**
 * 验证强密码
 * @param value 密码字符串
 * @returns 返回验证结果，true表示格式正确
 * @description 规则：8-20位，必须包含大写字母、小写字母、数字和特殊字符
 */
export function validateStrongPassword(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()

  // 长度检查
  if (trimmedValue.length < 8 || trimmedValue.length > 20) {
    return false
  }

  // 必须包含：大写字母、小写字母、数字、特殊字符
  const hasUpperCase = /[A-Z]/.test(trimmedValue)
  const hasLowerCase = /[a-z]/.test(trimmedValue)
  const hasNumber = /\d/.test(trimmedValue)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(trimmedValue)

  return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
}

/**
 * 获取密码强度
 * @param value 密码字符串
 * @returns 返回密码强度：弱、中、强
 * @description 弱：纯数字/纯字母/纯特殊字符；中：两种组合；强：三种或以上组合
 */
export function getPasswordStrength(value: string): PasswordStrength {
  if (!value || typeof value !== 'string') {
    return PasswordStrength.WEAK
  }

  const trimmedValue = value.trim()

  if (trimmedValue.length < 6) {
    return PasswordStrength.WEAK
  }

  const hasUpperCase = /[A-Z]/.test(trimmedValue)
  const hasLowerCase = /[a-z]/.test(trimmedValue)
  const hasNumber = /\d/.test(trimmedValue)
  const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(trimmedValue)

  const typeCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length

  if (typeCount >= 3) {
    return PasswordStrength.STRONG
  } else if (typeCount >= 2) {
    return PasswordStrength.MEDIUM
  } else {
    return PasswordStrength.WEAK
  }
}

/**
 * 验证IPv4地址
 * @param value IP地址字符串
 * @returns 返回验证结果，true表示格式正确
 */
export function validateIPv4Address(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()
  const ipRegex = /^((25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(25[0-5]|2[0-4]\d|[01]?\d{1,2})$/

  if (!ipRegex.test(trimmedValue)) {
    return false
  }

  // 额外检查每个段是否在有效范围内
  const segments = trimmedValue.split('.')
  return segments.every((segment) => {
    const num = parseInt(segment, 10)
    return num >= 0 && num <= 255
  })
}

/**
 * 验证邮箱地址
 * @param value 邮箱地址字符串
 * @returns 返回验证结果，true表示格式正确
 */
export function validateEmail(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()

  // RFC 5322 标准的简化版邮箱正则
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  return emailRegex.test(trimmedValue) && trimmedValue.length <= 254
}

/**
 * 验证URL地址
 * @param value URL字符串
 * @returns 返回验证结果，true表示格式正确
 */
export function validateURL(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  try {
    new URL(value.trim())
    return true
  } catch {
    return false
  }
}

/**
 * 验证身份证号码（中国大陆）
 * @param value 身份证号码字符串
 * @returns 返回验证结果，true表示格式正确
 */
export function validateChineseIDCard(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()

  // 18位身份证号码正则
  const idCardRegex =
    /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/

  if (!idCardRegex.test(trimmedValue)) {
    return false
  }

  // 验证校验码
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(trimmedValue[i]) * weights[i]
  }

  const checkCode = checkCodes[sum % 11]
  return trimmedValue[17].toUpperCase() === checkCode
}

/**
 * 验证银行卡号
 * @param value 银行卡号字符串
 * @returns 返回验证结果，true表示格式正确
 */
export function validateBankCard(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim().replace(/\s+/g, '')

  // 银行卡号通常为13-19位数字
  if (!/^\d{13,19}$/.test(trimmedValue)) {
    return false
  }

  // Luhn算法验证
  let sum = 0
  let shouldDouble = false

  for (let i = trimmedValue.length - 1; i >= 0; i--) {
    let digit = parseInt(trimmedValue[i])

    if (shouldDouble) {
      digit *= 2
      if (digit > 9) {
        digit = (digit % 10) + 1
      }
    }

    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

/**
 * 验证字典编码/字典值格式
 * @param value 待验证的字符串
 * @returns 返回验证结果，true表示格式正确
 * @description 规则：只能包含小写字母和下划线，开头和结尾不能是下划线
 */
export function validateDictCode(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false
  }

  const trimmedValue = value.trim()

  // 只能包含小写字母和下划线
  if (!/^[a-z_]+$/.test(trimmedValue)) {
    return false
  }

  // 开头不能是下划线
  if (trimmedValue.startsWith('_')) {
    return false
  }

  // 结尾不能是下划线
  if (trimmedValue.endsWith('_')) {
    return false
  }

  return true
}

/**
 * 创建字典编码/字典值的 Element Plus 表单验证器
 * @param fieldName 字段名称，用于错误提示（如：'字典类型编码'、'字典值'）
 * @returns 返回 Element Plus 表单验证器函数
 */
export function createDictCodeValidator(
  fieldName: string = '字段',
  options?: { allowNumbers?: boolean }
) {
  /** 是否允许数字 */
  const allowNumbers = options?.allowNumbers ?? false
  /** 字母数字下划线 */
  const letterNumberUnderlineRegex = /^[a-z0-9_]+$/
  /** 字母下划线 */
  const letterUnderlineRegex = /^[a-z_]+$/
  /** 内容校验 */
  const contentRegex = allowNumbers ? letterNumberUnderlineRegex : letterUnderlineRegex

  return (_rule: any, value: string, callback: (error?: Error | string) => void) => {
    if (!value) {
      callback(new Error(`请输入${fieldName}`))
      return
    }

    // 只能包含小写字母和下划线以及数字
    if (!contentRegex.test(value)) {
      callback(new Error(`${fieldName}只能包含小写字母和下划线${allowNumbers ? '以及数字' : ''}`))
      return
    }

    // 开头不能是下划线
    if (value.startsWith('_')) {
      callback(new Error(`${fieldName}不能以下划线开头`))
      return
    }

    // 结尾不能是下划线
    if (value.endsWith('_')) {
      callback(new Error(`${fieldName}不能以下划线结尾`))
      return
    }

    callback()
  }
}

/**
 * 验证正则表达式集合
 */
export const ValidationRegex = {
  /** 账号：字母开头，3-20位，支持字母、数字、下划线 */
  account: /^[a-zA-Z][a-zA-Z0-9_]{2,19}$/,
  /** 小写字母：只能是小写字母 */
  lowercaseLetters: /^[a-z]+$/,
  /** 字母、数字、短横线、下划线 */
  alphanumericDashUnderscore: /^[a-zA-Z0-9_-]+$/,
  /** 字母、数字、短横线、下划线、冒号（支持大小写字母） */
  alphanumericDashUnderscoreLowercase: /^[a-zA-Z0-9_:-]+$/,
  /** 不允许特殊字符和emoji（允许中文、字母、数字、空格、常用标点） */
  noSpecialCharsOrEmoji:
    /^[\u4e00-\u9fa5a-zA-Z0-9\s，。！？、；：""''（）【】《》.,!?;:()[\]<>-]+$/,
  /** 不允许空格 */
  noSpaces: /^\S+$/,
  /** 路由路径：只能包含 /、字母、数字、下划线、横线 */
  routePath: /^[/a-zA-Z0-9_-]+$/
}

/**
 * 创建账号验证器（Element Plus 表单验证器）
 * @param fieldName 字段名称，用于错误提示
 * @returns 返回 Element Plus 表单验证器函数
 */
export function createAccountValidator(fieldName: string = '账号') {
  return (_rule: any, value: string, callback: (error?: Error | string) => void) => {
    if (!value) {
      callback(new Error(`请输入${fieldName}`))
      return
    }

    const trimmedValue = value.trim()

    // 检查长度（3-20个字符）
    if (trimmedValue.length < 3 || trimmedValue.length > 20) {
      callback(new Error(`${fieldName}长度为3-20个字符`))
      return
    }

    // 检查格式：字母开头，支持字母、数字、下划线
    if (!ValidationRegex.account.test(trimmedValue)) {
      callback(new Error(`${fieldName}必须以字母开头，只能包含字母、数字和下划线`))
      return
    }

    callback()
  }
}

/**
 * 创建昵称验证器（不能包含空格，最大16字符）
 * @param fieldName 字段名称，用于错误提示
 * @returns 返回 Element Plus 表单验证器函数
 */
export function createNicknameValidator(fieldName: string = '昵称') {
  return (_rule: any, value: string, callback: (error?: Error | string) => void) => {
    if (!value) {
      callback(new Error(`请输入${fieldName}`))
      return
    }

    // 检查是否包含空格
    if (/\s/.test(value)) {
      callback(new Error(`${fieldName}不能包含空格`))
      return
    }

    // 检查长度
    if (value.length > 16) {
      callback(new Error(`${fieldName}不能超过16个字符`))
      return
    }

    callback()
  }
}

/**
 * 创建角色编码验证器（只能是小写字母，最大16字符）
 * @param fieldName 字段名称，用于错误提示
 * @returns 返回 Element Plus 表单验证器函数
 */
export function createRoleCodeValidator(fieldName: string = '角色编码') {
  return (_rule: any, value: string, callback: (error?: Error | string) => void) => {
    if (!value) {
      callback(new Error(`请输入${fieldName}`))
      return
    }

    // 检查格式：只能是小写字母
    if (!ValidationRegex.lowercaseLetters.test(value)) {
      callback(new Error(`${fieldName}只能包含小写字母`))
      return
    }

    // 检查长度
    if (value.length > 16) {
      callback(new Error(`${fieldName}不能超过16个字符`))
      return
    }

    callback()
  }
}

/**
 * 创建字典类型名称/字典标签验证器（不可输入特殊字符和emoji，最大16字符）
 * @param fieldName 字段名称，用于错误提示
 * @returns 返回 Element Plus 表单验证器函数
 */
export function createDictNameValidator(fieldName: string = '名称') {
  return (_rule: any, value: string, callback: (error?: Error | string) => void) => {
    if (!value) {
      callback(new Error(`请输入${fieldName}`))
      return
    }

    // 检查是否包含特殊字符或emoji
    if (!ValidationRegex.noSpecialCharsOrEmoji.test(value)) {
      callback(new Error(`${fieldName}不能包含特殊字符和emoji`))
      return
    }

    // 检查长度
    if (value.length > 16) {
      callback(new Error(`${fieldName}不能超过16个字符`))
      return
    }

    callback()
  }
}

/**
 * 创建字典类型编码/字典值验证器（字母、短横线、下划线、数字、冒号，最大maxLength字符）
 * @param fieldName 字段名称，用于错误提示
 * @param maxLength 最大长度，默认16
 * @returns 返回 Element Plus 表单验证器函数
 */
export function createDictCodeValueValidator(fieldName: string = '编码', maxLength: number = 16) {
  return (_rule: any, value: string, callback: (error?: Error | string) => void) => {
    if (!value) {
      callback(new Error(`请输入${fieldName}`))
      return
    }

    // 检查格式：字母、短横线、下划线、数字、冒号
    if (!ValidationRegex.alphanumericDashUnderscoreLowercase.test(value)) {
      callback(new Error(`${fieldName}只能包含字母、短横线、下划线、数字和冒号`))
      return
    }

    // 检查长度
    if (value.length > maxLength) {
      callback(new Error(`${fieldName}不能超过16个字符`))
      return
    }

    callback()
  }
}

/**
 * 创建标签样式验证器（字母、短横线、下划线、数字，最大16字符）
 * @param fieldName 字段名称，用于错误提示
 * @returns 返回 Element Plus 表单验证器函数
 */
export function createTagStyleValidator(fieldName: string = '标签样式') {
  return createDictCodeValueValidator(fieldName)
}

/**
 * 创建路由路径验证器（只能包含 /、字母、数字、下划线、横线）
 * @param fieldName 字段名称，用于错误提示
 * @param required 是否必填，默认 false
 * @returns 返回 Element Plus 表单验证器函数
 */
export function createRoutePathValidator(fieldName: string = '路径', required: boolean = false) {
  return (_rule: any, value: string, callback: (error?: Error | string) => void) => {
    if (!value) {
      if (required) {
        callback(new Error(`请输入${fieldName}`))
        return
      }
      callback()
      return
    }

    // 检查格式：只能包含 /、字母、数字、下划线、横线
    if (!ValidationRegex.routePath.test(value)) {
      callback(new Error(`${fieldName}只能包含 /、字母、数字、下划线和横线`))
      return
    }

    callback()
  }
}
