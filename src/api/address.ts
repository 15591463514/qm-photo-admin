import request from '@/utils/http'

/**
 * 获取地址列表
 */
export function fetchGetAddressList(params: Api.Address.AddressListParams) {
  return request.get<Api.Address.AddressList>({
    url: '/api/address/list',
    params
  })
}

/**
 * 获取全部地址列表（不分页，用于地图视图）
 */
export function fetchGetAllAddressList(
  params?: Omit<Api.Address.AddressListParams, 'current' | 'size'>
) {
  return request.get<Api.Address.AddressList>({
    url: '/api/address/list',
    params: {
      ...params,
      current: 1,
      size: 1000 // 使用很大的值获取全部数据
    }
  })
}

/**
 * 获取地址详情
 */
export function fetchGetAddressDetail(id: number) {
  return request.get<Api.Address.AddressItem>({
    url: `/api/address/${id}`
  })
}

/**
 * 创建地址
 */
export function fetchCreateAddress(params: Api.Address.CreateAddressParams) {
  return request.post<Api.Address.AddressItem>({
    url: '/api/address',
    params
  })
}

/**
 * 更新地址
 */
export function fetchUpdateAddress(params: Api.Address.UpdateAddressParams) {
  return request.put<Api.Address.AddressItem>({
    url: `/api/address/${params.id}`,
    params
  })
}

/**
 * 删除地址
 */
export function fetchDeleteAddress(id: number) {
  return request.del<void>({
    url: `/api/address/${id}`
  })
}

/**
 * 批量删除地址
 */
export function fetchBatchDeleteAddress(ids: number[]) {
  return request.del<void>({
    url: '/api/address/batch',
    data: { ids }
  })
}

/**
 * 批量切换地址状态
 * @param ids 地址ID数组
 * @param status 状态（1-启用，0-禁用）
 */
export function fetchBatchToggleAddressStatus(ids: number[], status: number) {
  return request.patch<{ count: number }>({
    url: '/api/address/batch/status',
    params: { ids, status }
  })
}
