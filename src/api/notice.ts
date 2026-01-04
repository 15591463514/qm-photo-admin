import request from '@/utils/http'

/**
 * 通知规则 API
 */

/**
 * 获取规则列表（分页）
 */
export function fetchRulesList(params: Api.Notice.RulesRequestParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Notice.Rule>>({
    url: '/api/notice/rules/list',
    params
  })
}

/**
 * 获取规则详情
 */
export function fetchRuleDetail(ruleId: number) {
  return request.get<Api.Notice.Rule>({
    url: `/api/notice/rules/${ruleId}`
  })
}

/**
 * 创建规则
 */
export function createRule(data: Api.Notice.CreateRuleParams) {
  return request.post<Api.Notice.Rule>({
    url: '/api/notice/rules',
    params: data,
    showSuccessMessage: true
  })
}

/**
 * 更新规则
 */
export function updateRule(ruleId: number, data: Api.Notice.UpdateRuleParams) {
  return request.put<Api.Notice.Rule>({
    url: `/api/notice/rules/${ruleId}`,
    params: data,
    showSuccessMessage: true
  })
}

/**
 * 删除规则
 */
export function deleteRule(ruleId: number) {
  return request.del<Api.Notice.Rule>({
    url: `/api/notice/rules/${ruleId}`,
    showSuccessMessage: true
  })
}

/**
 * 切换规则状态
 */
export function toggleRuleStatus(ruleId: number) {
  return request.put<Api.Notice.Rule>({
    url: `/api/notice/rules/${ruleId}/status`,
    showSuccessMessage: true
  })
}

/**
 * 通知信息 API
 */

/**
 * 获取通知信息列表（分页）
 */
export function fetchInfosList(params: Api.Notice.InfosRequestParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Notice.Info>>({
    url: '/api/notice/infos/list',
    params
  })
}

/**
 * 获取通知信息详情
 */
export function fetchInfoDetail(infoId: number) {
  return request.get<Api.Notice.Info>({
    url: `/api/notice/infos/${infoId}`
  })
}

/**
 * 删除通知信息
 */
export function deleteInfo(infoId: number) {
  return request.del<void>({
    url: `/api/notice/infos/${infoId}`,
    showSuccessMessage: true
  })
}

/**
 * 获取通知结果明细
 */
export function fetchNotificationLogs(infoId: number) {
  return request.get<Api.Notice.Log[]>({
    url: `/api/notice/infos/${infoId}/logs`
  })
}

/**
 * 触发通知事件（公开接口）
 */
export function triggerNoticeEvent(data: Api.Notice.TriggerEventParams) {
  return request.post<{ message: string }>({
    url: '/api/notice/trigger',
    params: data
  })
}

/**
 * 测试规则
 */
export function testRule(data: Api.Notice.TriggerEventParams) {
  return request.post<Api.Notice.TestRuleResponse>({
    url: '/api/notice/trigger',
    params: data,
    showSuccessMessage: false
  })
}
