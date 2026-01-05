/**
 * 通知管理 API 类型定义
 */

declare namespace Api {
  namespace Notice {
    /**
     * 通知规则
     */
    interface Rule {
      ruleId: number
      ruleName: string
      msgSource: string
      msgType: string
      noticeMode: number
      noticeAddress?: string
      noticeAddressName?: string
      handlerScript?: string
      eventDataExample?: string
      enableRecord?: boolean
      createUsername?: string
      updateUsername?: string
      noticeStatus: number
      createTime: string
      updateTime: string
    }

    /**
     * 创建规则参数
     */
    interface CreateRuleParams {
      ruleName: string
      msgSource: string
      msgType: string
      noticeMode: number
      noticeAddress?: string
      noticeAddressName?: string
      handlerScript?: string
      eventDataExample?: string
      enableRecord?: boolean
      noticeStatus?: number
    }

    /**
     * 更新规则参数
     */
    type UpdateRuleParams = Partial<CreateRuleParams>

    /**
     * 规则查询参数
     */
    interface RulesRequestParams extends Api.Common.CommonSearchParams {
      msgSource?: string
      msgType?: string
    }

    /**
     * 通知信息
     */
    interface Info {
      infoId: number
      msgSource: string
      msgType: string
      noticeContent?: string
      noticeMode: number
      noticeSuccess: number
      noticeTotal: number
      noticeTime: string
      createTime: string
      updateTime: string
    }

    /**
     * 通知信息查询参数
     */
    interface InfosRequestParams extends Api.Common.CommonSearchParams {
      msgSource?: string
      msgType?: string
      start?: string
      end?: string
    }

    /**
     * 通知日志
     */
    interface Log {
      id: number
      infoId: number
      ruleId?: number
      noticeMode: number
      noticeAddress: string
      noticeResult?: string
      noticeResultTime?: string
      description?: string
      createdAt: string
    }

    /**
     * 触发事件参数
     */
    interface TriggerEventParams {
      msgSource: string
      msgType: string
      eventData: Record<string, any>
      noticeAddress?: string
    }

    /**
     * 测试规则响应
     */
    interface TestRuleResponse {
      message: string
      success: number
      total: number
    }
  }
}
