import {
  mockGetAddressList,
  mockGetAddressDetail,
  mockCreateAddress,
  mockUpdateAddress,
  mockDeleteAddress,
  mockBatchDeleteAddress
} from '@/mock/address'

/**
 * 获取地址列表
 */
export function fetchGetAddressList(
  params: Api.Address.AddressListParams
): Promise<Api.Address.AddressList> {
  return mockGetAddressList(params)
}

/**
 * 获取地址详情
 */
export function fetchGetAddressDetail(id: number): Promise<Api.Address.AddressItem> {
  return mockGetAddressDetail(id)
}

/**
 * 创建地址
 */
export function fetchCreateAddress(
  params: Api.Address.CreateAddressParams
): Promise<Api.Address.AddressItem> {
  return mockCreateAddress(params)
}

/**
 * 更新地址
 */
export function fetchUpdateAddress(
  params: Api.Address.UpdateAddressParams
): Promise<Api.Address.AddressItem> {
  return mockUpdateAddress(params)
}

/**
 * 删除地址
 */
export function fetchDeleteAddress(id: number): Promise<void> {
  return mockDeleteAddress(id)
}

/**
 * 批量删除地址
 */
export function fetchBatchDeleteAddress(ids: number[]): Promise<void> {
  return mockBatchDeleteAddress(ids)
}
