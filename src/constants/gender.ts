/**
 * 性别枚举常量
 *
 * 统一管理性别枚举值，与后端保持一致
 *
 * @module constants/gender
 */

/**
 * 性别枚举
 */
export enum Gender {
  /** 男性 */
  MALE = 'male',
  /** 女性 */
  FEMALE = 'female',
  /** 未知 */
  UNKNOWN = 'unknown'
}

/**
 * 性别选项列表（用于下拉选择）
 */
export const GENDER_OPTIONS = [
  { label: '男', value: Gender.MALE },
  { label: '女', value: Gender.FEMALE },
  { label: '未知', value: Gender.UNKNOWN }
] as const

/**
 * 性别标签映射
 */
export const GENDER_LABEL_MAP: Record<Gender, string> = {
  [Gender.MALE]: '男',
  [Gender.FEMALE]: '女',
  [Gender.UNKNOWN]: '未知'
}
