/**
 * 组件公共配置常量
 *
 * 统一管理组件相关的公共配置，避免硬编码
 *
 * @module constants/components
 */

/**
 * 状态切换 Switch 组件的公共配置
 * 用于表格中状态列的 Switch 组件
 */
export const STATUS_SWITCH_CONFIG = {
  style: '--el-switch-on-color: var(--art-success);',
  activeText: '启用',
  inactiveText: '禁用',
  inlinePrompt: true
} as const
