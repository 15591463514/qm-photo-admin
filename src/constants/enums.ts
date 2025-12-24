/**
 * 全局枚举常量
 *
 * 统一管理项目中使用的枚举值，避免硬编码
 *
 * @module constants/enums
 */

/**
 * 启用/禁用状态枚举
 */
export enum EnableStatus {
  /** 启用 */
  ENABLED = '1',
  /** 禁用 */
  DISABLED = '2'
}

/**
 * 启用/禁用状态配置
 * 用于显示状态标签和样式
 */
export const ENABLE_STATUS_CONFIG = {
  [EnableStatus.ENABLED]: {
    label: '启用',
    value: EnableStatus.ENABLED,
    type: 'success' as const,
    text: '启用'
  },
  [EnableStatus.DISABLED]: {
    label: '禁用',
    value: EnableStatus.DISABLED,
    type: 'danger' as const,
    text: '禁用'
  }
} as const

/**
 * 启用/禁用状态选项（用于下拉框、单选框等）
 */
export const ENABLE_STATUS_OPTIONS = [
  { label: '启用', value: EnableStatus.ENABLED },
  { label: '禁用', value: EnableStatus.DISABLED }
] as const
