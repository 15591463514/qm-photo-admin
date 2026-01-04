/**
 * 通知模块类型定义
 */

/**
 * 通知状态枚举
 */
export enum NoticeStatusEnum {
  /** 关闭 */
  CLOSE = 0,
  /** 打开 */
  OPEN = 1
}

/**
 * 通知方式枚举
 */
export enum NoticeModeEnum {
  /** 邮箱 */
  EMAIL = 3
}

/**
 * 通知方式文本映射
 */
export const NoticeModeText: Record<NoticeModeEnum, string> = {
  [NoticeModeEnum.EMAIL]: '邮箱'
}

/**
 * 规则类型
 */
export interface NoticeRule {
  ruleId?: number
  ruleName: string
  msgSource: string
  msgType: string
  noticeMode: NoticeModeEnum
  noticeAddress: string
  noticeAddressName?: string
  handlerScript?: string
  createUsername?: string
  updateUsername?: string
  noticeStatus: NoticeStatusEnum
  createTime?: string
  updateTime?: string
}

/**
 * 规则查询参数
 */
export interface RulesRequestParam {
  msgSource?: string
  msgType?: string
  pageSize?: number
  pageIndex?: number
}

/**
 * 通知信息类型
 */
export interface NoticeInfo {
  infoId?: number
  msgSource: string
  msgType: string
  noticeContent: string
  noticeMode: NoticeModeEnum
  noticeSuccess: number
  noticeTotal: number
  noticeTime: string
  createTime?: string
  updateTime?: string
}

/**
 * 通知信息查询参数
 */
export interface InfosRequestParam {
  msgSource?: string
  msgType?: string
  noticeTime?: [string, string]
  start?: string
  end?: string
  pageSize?: number
  pageIndex?: number
}

/**
 * 通知结果明细类型
 */
export interface NoticeResult {
  id: number
  noticeMode: NoticeModeEnum
  noticeAddress: string
  noticeResult: string
  noticeResultTime: string
  description?: string
}
