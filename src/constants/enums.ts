/**
 * 全局枚举常量
 *
 * 统一管理项目中使用的枚举值，避免硬编码
 *
 * @module constants/enums
 */

import { enumToOptions } from '@/utils/type/enum'

/**
 * 启用/禁用状态枚举（字符串类型）
 */
export enum EnableStatus {
  /** 启用 */
  ENABLED = '1',
  /** 禁用 */
  DISABLED = '2'
}

/**
 * 启用/禁用状态文本映射
 */
export const EnableStatusText: Record<EnableStatus, string> = {
  [EnableStatus.ENABLED]: '启用',
  [EnableStatus.DISABLED]: '禁用'
}

/**
 * 启用/禁用状态配置
 * 用于显示状态标签和样式
 */
export const ENABLE_STATUS_CONFIG = {
  [EnableStatus.ENABLED]: {
    label: EnableStatusText[EnableStatus.ENABLED],
    value: EnableStatus.ENABLED,
    type: 'success' as const,
    text: EnableStatusText[EnableStatus.ENABLED]
  },
  [EnableStatus.DISABLED]: {
    label: EnableStatusText[EnableStatus.DISABLED],
    value: EnableStatus.DISABLED,
    type: 'danger' as const,
    text: EnableStatusText[EnableStatus.DISABLED]
  }
} as const

/**
 * 启用/禁用状态选项（用于下拉框、单选框等）
 */
export const ENABLE_STATUS_OPTIONS = enumToOptions(EnableStatus, EnableStatusText)

/**
 * 启用/禁用状态枚举（数字类型）
 * 用于 API 中 status 字段为数字的情况
 */
export enum StatusEnum {
  /** 禁用 */
  DISABLED = 0,
  /** 启用 */
  ENABLED = 1
}

/**
 * 状态文本映射（数字类型）
 */
export const StatusEnumText: Record<StatusEnum, string> = {
  [StatusEnum.DISABLED]: '禁用',
  [StatusEnum.ENABLED]: '启用'
}

/**
 * 状态配置（数字类型）
 * 用于显示状态标签和样式
 */
export const STATUS_CONFIG = {
  [StatusEnum.ENABLED]: {
    label: StatusEnumText[StatusEnum.ENABLED],
    value: StatusEnum.ENABLED,
    type: 'success' as const,
    text: StatusEnumText[StatusEnum.ENABLED]
  },
  [StatusEnum.DISABLED]: {
    label: StatusEnumText[StatusEnum.DISABLED],
    value: StatusEnum.DISABLED,
    type: 'info' as const,
    text: StatusEnumText[StatusEnum.DISABLED]
  }
} as const

/**
 * 状态选项（数字类型，用于下拉框、单选框等）
 */
export const STATUS_OPTIONS = enumToOptions(StatusEnum, StatusEnumText)
