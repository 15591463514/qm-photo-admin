import request from '@/utils/http'

/**
 * 获取字典树形结构
 * @param params 搜索参数
 * @returns 字典树
 */
export function fetchGetDictTree(params: Api.SystemManage.DictTreeSearchParams) {
  return request.get<Api.SystemManage.DictTreeItem[]>({
    url: '/api/dict/tree',
    params,
    showErrorMessage: false // 禁用自动错误提示，由调用方统一处理
  })
}

/**
 * 根据字典类型获取字典数据
 * @param typeCode 字典类型编码
 * @param status 状态（可选）
 * @returns 字典数据列表
 */
export function fetchGetDictDataByType(typeCode: string, status?: string) {
  return request.get<Api.SystemManage.DictData[]>({
    url: `/api/dict/data/${typeCode}`,
    params: status ? { status } : undefined
  })
}

/**
 * 获取字典详情
 * @param id 字典ID
 * @returns 字典详情
 */
export function fetchGetDictDetail(id: number) {
  return request.get<Api.SystemManage.DictData>({
    url: `/api/dict/${id}`
  })
}

/**
 * 创建字典
 * @param params 创建字典参数
 * @returns 创建的字典信息
 */
export function fetchCreateDict(params: Api.SystemManage.CreateDictParams) {
  return request.post<Api.SystemManage.DictData>({
    url: '/api/dict',
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/**
 * 更新字典
 * @param id 字典ID
 * @param params 更新字典参数
 * @returns 更新后的字典信息
 */
export function fetchUpdateDict(id: number, params: Api.SystemManage.UpdateDictParams) {
  return request.put<Api.SystemManage.DictData>({
    url: `/api/dict/${id}`,
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/**
 * 删除字典
 * @param id 字典ID
 * @returns 删除的字典信息
 */
export function fetchDeleteDict(id: number) {
  return request.del<Api.SystemManage.DictData>({
    url: `/api/dict/${id}`,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/**
 * 更新字典类型
 * @param typeCode 字典类型编码
 * @param params 更新字典类型参数
 * @returns 更新结果
 */
export function fetchUpdateDictType(
  typeCode: string,
  params: Api.SystemManage.UpdateDictTypeParams
) {
  return request.put<{ count: number }>({
    url: `/api/dict/type/${typeCode}`,
    params,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}

/**
 * 删除字典类型
 * @param typeCode 字典类型编码
 * @returns 删除结果
 */
export function fetchDeleteDictType(typeCode: string) {
  return request.del<{ count: number }>({
    url: `/api/dict/type/${typeCode}`,
    showErrorMessage: false // 禁用自动错误提示，由组件统一处理
  })
}
