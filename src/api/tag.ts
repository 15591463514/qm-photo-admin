import request from '@/utils/http'

/**
 * 获取标签树形结构
 * @param params 搜索参数
 * @returns 标签树
 */
export function fetchGetTagTree(params: Api.Tag.TagTreeSearchParams) {
  return request.get<Api.Tag.TagTreeItem[]>({
    url: '/api/tag/tree',
    params,
    showErrorMessage: false // 禁用自动错误提示，由调用方统一处理
  })
}

/**
 * 根据标签组获取标签数据
 * @param groupCode 标签组代码
 * @param status 状态（可选）
 * @returns 标签数据列表
 */
export function fetchGetTagsByGroup(groupCode: string, status?: number) {
  return request.get<Api.Tag.TagData[]>({
    url: `/api/tag/data/${groupCode}`,
    params: status ? { status } : undefined
  })
}

/**
 * 获取标签详情
 * @param id 标签ID
 * @returns 标签详情
 */
export function fetchGetTagDetail(id: number) {
  return request.get<Api.Tag.TagData>({
    url: `/api/tag/${id}`
  })
}

/**
 * 批量创建标签
 * @param params 批量创建标签参数
 * @returns 创建的标签信息列表
 */
export function fetchCreateTag(params: Api.Tag.BatchCreateTagParams) {
  return request.post<Api.Tag.TagData[]>({
    url: '/api/tag',
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/**
 * 更新标签
 * @param id 标签ID
 * @param params 更新标签参数
 * @returns 更新后的标签信息
 */
export function fetchUpdateTag(id: number, params: Api.Tag.UpdateTagParams) {
  return request.put<Api.Tag.TagData>({
    url: `/api/tag/${id}`,
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/**
 * 删除标签
 * @param id 标签ID
 * @returns 删除的标签信息
 */
export function fetchDeleteTag(id: number) {
  return request.del<Api.Tag.TagData>({
    url: `/api/tag/${id}`,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/**
 * 批量删除标签
 * @param ids 标签ID数组
 * @returns 删除结果
 */
export function fetchBatchDeleteTag(ids: number[]) {
  return request.del<{ count: number }>({
    url: '/api/tag/batch',
    data: { ids },
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/**
 * 更新标签组
 * @param groupCode 标签组代码
 * @param params 更新标签组参数
 * @returns 更新结果
 */
export function fetchUpdateTagGroup(groupCode: string, params: Api.Tag.UpdateTagGroupParams) {
  return request.put<{ count: number }>({
    url: `/api/tag/group/${groupCode}`,
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/**
 * 批量切换标签状态
 * @param ids 标签ID数组
 * @param status 状态（1-启用，0-禁用）
 * @returns 更新的标签数量
 */
export function fetchBatchToggleTagStatus(ids: number[], status: number) {
  return request.patch<{ count: number }>({
    url: '/api/tag/batch/status',
    params: { ids, status },
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}
